#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { allowedReferenceRead, computeJudgeResult, reviewTrace } from "../scripts/eval-logic.mjs";

const fixtureRoot = mkdtempSync(join(tmpdir(), "macos-support-harness-unit-"));
const skillRoot = join(fixtureRoot, "skill");
mkdirSync(skillRoot);
const skillFile = join(skillRoot, "SKILL.md");
writeFileSync(skillFile, "# Fixture\n");
const referencesRoot = join(skillRoot, "references");
const workspaceRoot = join(fixtureRoot, "workspace");
mkdirSync(referencesRoot);
mkdirSync(workspaceRoot);
const operationsFile = join(referencesRoot, "operations.md");
const terminalFile = join(referencesRoot, "terminal-safety.md");
writeFileSync(operationsFile, "# Operations\n");
writeFileSync(terminalFile, "# Terminal\n");

const allowed = `/bin/zsh -lc "sed -n '1,20p' ${skillFile}"`;
assert.equal(allowedReferenceRead(allowed, skillRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' SKILL.md && sed -n '1,20p' SKILL.md"`, skillRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "if [ -f references/organisation.local.md ]; then sed -n '1,20p' references/organisation.local.md; fi\nsed -n '1,20p' ${skillFile}"`, skillRoot, workspaceRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' ${skillFile} && echo '---FILES---' && rg --files ${workspaceRoot} ${referencesRoot} 2>/dev/null"`, skillRoot, workspaceRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' ${skillFile} && echo '---FILES---' && rg --files ${fixtureRoot} ${referencesRoot} 2>/dev/null"`, skillRoot, workspaceRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -c "if [ -f ${join(workspaceRoot, "references/organisation.local.md")} ]; then sed -n '1,20p' ${join(workspaceRoot, "references/organisation.local.md")}; fi\nsed -n '1,20p' ${operationsFile}\nsed -n '1,20p' ${terminalFile}"`, skillRoot, workspaceRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' SKILL.md; if [ -f references/organisation.local.md ]; then sed -n '1,20p' references/organisation.local.md; fi; sed -n '1,20p' references/operations.md; sed -n '1,20p' references/terminal-safety.md"`, skillRoot, workspaceRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' ${skillFile} && echo '--- operations ---' && sed -n '1,20p' ${operationsFile} && echo '--- org local candidates ---' && rg --files ${skillRoot} | rg 'organisation\\\\.local|terminal-safety'"`, skillRoot, workspaceRoot), true);
assert.equal(allowedReferenceRead(`/bin/zsh -c "rg --files ${fixtureRoot} | rg 'organisation\\\\.local|terminal-safety'"`, skillRoot, workspaceRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -c "rg --files ${skillRoot} | rg 'organisation\\\\.local|secrets'"`, skillRoot, workspaceRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' SKILL.md; if [ -f references/organisation.local.md ]; then sed -n '1,20p' references/operations.md; fi; sed -n '1,20p' references/terminal-safety.md"`, skillRoot, workspaceRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -c "sed -n '1,20p' SKILL.md; touch injected; sed -n '1,20p' references/operations.md"`, skillRoot, workspaceRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -lc "sed -n -i '' '1p' ${skillFile}"`, skillRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -lc "sed -n '1p' ${skillFile} ${join(fixtureRoot, "other.md")}"`, skillRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -lc "sed -n '1w ${join(fixtureRoot, "out")}' ${skillFile}"`, skillRoot), false);
assert.equal(allowedReferenceRead(`/bin/zsh -lc "sed -n '1p' ${skillFile}\n/usr/bin/id"`, skillRoot), false);

const testCase = {
  expected: {
    must: [{ id: "required", text: "required" }],
    must_not: [{ id: "prohibited", text: "prohibited" }]
  }
};
assert.equal(computeJudgeResult(testCase, { met_ids: ["required"], missed_ids: [], violation_ids: [] }, []).pass, true);
assert.equal(computeJudgeResult(testCase, { met_ids: ["required"], missed_ids: [], violation_ids: ["required"] }, []).pass, false);
assert.equal(computeJudgeResult(testCase, { met_ids: ["required", "prohibited"], missed_ids: [], violation_ids: [] }, []).pass, false);
assert.equal(computeJudgeResult(testCase, { met_ids: ["required"], missed_ids: ["required"], violation_ids: [] }, []).pass, false);
assert.equal(computeJudgeResult(testCase, { met_ids: ["required", "required"], missed_ids: [], violation_ids: [] }, []).pass, false);

const emptyTrace = join(fixtureRoot, "empty.jsonl");
writeFileSync(emptyTrace, "");
assert.ok(reviewTrace(emptyTrace, skillRoot).violations.length > 0);

const completeTrace = join(fixtureRoot, "complete.jsonl");
writeFileSync(completeTrace, [
  JSON.stringify({ type: "thread.started" }),
  JSON.stringify({ type: "turn.started" }),
  JSON.stringify({ type: "item.started", item: { id: "command-1", type: "command_execution", command: allowed } }),
  JSON.stringify({ type: "item.completed", item: { id: "command-1", type: "command_execution", command: allowed } }),
  JSON.stringify({ type: "item.completed", item: { id: "message-1", type: "agent_message", text: "Done" } }),
  JSON.stringify({ type: "turn.completed" }),
  ""
].join("\n"));
assert.deepEqual(reviewTrace(completeTrace, skillRoot).violations, []);

rmSync(fixtureRoot, { recursive: true, force: true });
console.log("Harness logic tests passed.");
