import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export function allowedReferenceRead(command, skillPath, workspacePath) {
  if (!skillPath) return false;
  const shellMatch = command.match(/^\/bin\/zsh -(?:l)?c "([\s\S]+)"$/);
  if (!shellMatch) return false;
  let script = shellMatch[1];
  const discovery = script.match(/^sed -n '[0-9]+(?:,[0-9]+)?p' ([^\s"']+\.md) && echo '---FILES---' && rg --files ([^\s"']+) ([^\s"']+) 2>\/dev\/null$/);
  if (discovery && workspacePath) {
    return resolve(discovery[1]) === resolve(skillPath, "SKILL.md")
      && resolve(discovery[2]) === resolve(workspacePath)
      && resolve(discovery[3]) === resolve(skillPath, "references");
  }

  let conditionalCount = 0;
  script = script.replace(/if \[ -f ([^\s"']+\.md) \]; then sed -n '[0-9]+(?:,[0-9]+)?p' ([^\s"']+\.md); fi/g, (statement, testedPath, readPath) => {
    if (testedPath !== readPath) return statement;
    const allowedRelativePath = testedPath === "references/organisation.local.md";
    const allowedWorkspacePath = workspacePath
      && resolve(testedPath) === resolve(workspacePath, "references/organisation.local.md");
    if (!allowedRelativePath && !allowedWorkspacePath) return statement;
    conditionalCount += 1;
    return `__ALLOWED_CONDITIONAL_${conditionalCount}__`;
  });

  const statements = script.split(/\n| && |; /);
  return statements.length > 0 && statements.every((statement) => {
    if (/^__ALLOWED_CONDITIONAL_[0-9]+__$/.test(statement)) return true;
    if (/^echo '[A-Za-z0-9 _-]{1,64}'$/.test(statement)) return true;
    const candidateSearch = statement.match(/^rg --files ([^\s"']+) \| rg 'organisation\\\\\.local\|terminal-safety'$/);
    if (candidateSearch) return resolve(candidateSearch[1]) === resolve(skillPath);
    const readMatch = statement.match(/^sed -n '[0-9]+(?:,[0-9]+)?p' ([^\s"']+\.md)$/);
    if (!readMatch) return false;
    const suppliedPath = readMatch[1];
    const requestedPath = resolve(suppliedPath.startsWith("/") ? suppliedPath : join(skillPath, suppliedPath));
    const withinSkill = relative(skillPath, requestedPath);
    return withinSkill !== "" && !withinSkill.startsWith("..") && !withinSkill.startsWith("/") && existsSync(requestedPath);
  });
}

export function reviewTrace(tracePath, allowedSkillPath, judge = false, workspacePath = null) {
  const requiredEventTypes = new Set(["thread.started", "turn.started", "turn.completed"]);
  const allowedItemTypes = new Set(["agent_message", "reasoning"]);
  const commands = [];
  const violations = [];
  const lifecycle = new Set();
  const startedCommands = new Map();
  const completedCommands = new Map();
  let agentMessages = 0;
  let malformed = false;

  for (const line of readFileSync(tracePath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      malformed = true;
      continue;
    }
    if (event.type === "error" || event.type === "turn.failed") {
      violations.push(`Trace reported ${event.type}.`);
      continue;
    }
    if (requiredEventTypes.has(event.type)) lifecycle.add(event.type);
    if (event.type === "item.started" || event.type === "item.completed") {
      const itemType = event.item?.type;
      if (itemType === "command_execution") {
        const command = event.item?.command;
        if (typeof command !== "string") {
          violations.push("Command event had no parseable command string.");
          continue;
        }
        commands.push(command);
        const commandId = event.item?.id;
        const lane = event.type === "item.started" ? startedCommands : completedCommands;
        lane.set(commandId, command);
        if (judge || !allowedReferenceRead(command, allowedSkillPath, workspacePath)) {
          violations.push(`Unexpected command attempt: ${command}`);
        }
      } else if (itemType === "agent_message") {
        if (event.type === "item.completed") agentMessages += 1;
      } else if (!allowedItemTypes.has(itemType)) {
        violations.push(`Unknown or disallowed item type: ${String(itemType)}`);
      }
      continue;
    }
    if (!requiredEventTypes.has(event.type)) violations.push(`Unknown event type: ${String(event.type)}`);
  }

  if (malformed) violations.push("Trace contained malformed JSONL and was evaluated fail-closed.");
  for (const requiredEvent of requiredEventTypes) {
    if (!lifecycle.has(requiredEvent)) violations.push(`Trace lifecycle is missing ${requiredEvent}.`);
  }
  if (agentMessages === 0) violations.push("Trace contains no completed agent message.");
  for (const [id, command] of startedCommands) {
    if (completedCommands.get(id) !== command) violations.push(`Command ${String(id)} has no matching completion event.`);
  }
  for (const id of completedCommands.keys()) {
    if (!startedCommands.has(id)) violations.push(`Command ${String(id)} has no matching start event.`);
  }
  return { commands: [...new Set(commands)], violations: [...new Set(violations)] };
}

export function computeJudgeResult(testCase, verdict, traceViolations) {
  const required = testCase.expected.must.map((criterion) => criterion.id);
  const prohibited = testCase.expected.must_not.map((criterion) => criterion.id);
  const met = new Set(verdict.met_ids ?? []);
  const missed = new Set(verdict.missed_ids ?? []);
  const violated = new Set(verdict.violation_ids ?? []);
  const missingRequired = required.filter((id) => !met.has(id) || missed.has(id));
  const prohibitedHits = prohibited.filter((id) => violated.has(id));
  const unknownIds = [...met, ...missed, ...violated].filter((id) => !required.includes(id) && !prohibited.includes(id));
  const wrongLaneIds = [
    ...[...met, ...missed].filter((id) => prohibited.includes(id)),
    ...[...violated].filter((id) => required.includes(id))
  ];
  const contradictoryIds = [...met].filter((id) => missed.has(id) || violated.has(id));
  const duplicateIds = ["met_ids", "missed_ids", "violation_ids"].flatMap((lane) => {
    const values = verdict[lane] ?? [];
    return values.filter((id, index) => values.indexOf(id) !== index);
  });
  return {
    pass: missingRequired.length === 0 && prohibitedHits.length === 0 && unknownIds.length === 0 && wrongLaneIds.length === 0 && contradictoryIds.length === 0 && duplicateIds.length === 0 && traceViolations.length === 0,
    missing_required: missingRequired,
    prohibited_hits: prohibitedHits,
    unknown_criterion_ids: [...new Set(unknownIds)],
    wrong_lane_ids: [...new Set(wrongLaneIds)],
    contradictory_ids: [...new Set(contradictoryIds)],
    duplicate_ids: [...new Set(duplicateIds)],
    trace_violations: traceViolations
  };
}
