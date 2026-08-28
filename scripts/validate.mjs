#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    fail(`Missing required file: ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

const requiredFiles = [
  "SKILL.md",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "PERSONA.md",
  "agents/openai.yaml",
  "docs/ORGANISATION-SETUP.md",
  "docs/RUNTIME-GUARDRAILS.md",
  "references/operations.md",
  "references/terminal-safety.md",
  "references/conversation-guide.md",
  "references/organisation-template.md",
  "tests/cases.json",
  "tests/judge-schema.json",
  "tests/judge-calibration.json",
  "tests/judge-calibration-schema.json",
  "tests/harness-unit.mjs",
  "scripts/eval-logic.mjs",
  ".github/ISSUE_TEMPLATE/internal-use-request.yml"
];

for (const file of requiredFiles) read(file);

const skill = read("SKILL.md");
const versionMatch = skill.match(/^\s{2}version:\s*["']([^"']+)["']\s*$/m);
const skillVersion = versionMatch?.[1];
if (!skillVersion) fail("SKILL.md must declare metadata.version.");

const changelog = read("CHANGELOG.md");
if (skillVersion && !changelog.includes(`## [${skillVersion}]`)) {
  fail(`CHANGELOG.md has no entry for skill version ${skillVersion}.`);
}

const legacyReferences = [
  "references/approved-actions.md",
  "references/approved-sources.md",
  "references/environment.md",
  "references/support-routing.md"
];
for (const file of legacyReferences) {
  if (existsSync(join(root, file))) fail(`Legacy reference still exists: ${file}`);
}

function markdownFiles(directory) {
  const results = [];
  for (const entry of readdirSync(directory)) {
    if (entry === ".git" || entry === ".artifacts") continue;
    const absolutePath = join(directory, entry);
    if (statSync(absolutePath).isDirectory()) results.push(...markdownFiles(absolutePath));
    if (absolutePath.endsWith(".md")) results.push(absolutePath);
  }
  return results;
}

for (const markdownPath of markdownFiles(root)) {
  const content = readFileSync(markdownPath, "utf8");
  const links = content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of links) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const pathOnly = decodeURIComponent(target.split("#")[0]);
    if (!existsSync(resolve(dirname(markdownPath), pathOnly))) {
      fail(`Broken relative link in ${markdownPath.slice(root.length + 1)}: ${target}`);
    }
  }
}

let suite;
try {
  suite = JSON.parse(read("tests/cases.json"));
} catch (error) {
  fail(`tests/cases.json is not valid JSON: ${error.message}`);
}

for (const file of ["tests/judge-schema.json", "tests/judge-calibration-schema.json"]) {
  try {
    JSON.parse(read(file));
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`);
  }
}

try {
  const calibration = JSON.parse(read("tests/judge-calibration.json"));
  if (!Array.isArray(calibration.cases) || calibration.cases.length < 4) {
    fail("Judge calibration must contain at least four human-labelled cases.");
  } else {
    const calibrationIds = new Set();
    for (const item of calibration.cases) {
      if (!item.id || calibrationIds.has(item.id)) fail(`Missing or duplicate calibration id: ${item.id}`);
      calibrationIds.add(item.id);
      if (typeof item.expected_pass !== "boolean" || !item.criteria || !item.response) {
        fail(`Calibration case ${item.id} is incomplete.`);
      }
    }
  }
} catch (error) {
  fail(`tests/judge-calibration.json is not valid JSON: ${error.message}`);
}

if (suite) {
  if (suite.skill_version !== skillVersion) {
    fail(`Test suite version ${suite.skill_version} does not match SKILL.md ${skillVersion}.`);
  }
  if (!Array.isArray(suite.cases) || suite.cases.length < 8) {
    fail("The behavioural suite must contain at least eight cases.");
  } else {
    const ids = new Set();
    for (const testCase of suite.cases) {
      if (!testCase.id || ids.has(testCase.id)) fail(`Missing or duplicate case id: ${testCase.id}`);
      ids.add(testCase.id);
      if (!testCase.category || !testCase.prompt) fail(`Case ${testCase.id} needs category and prompt.`);
      if (!Array.isArray(testCase.expected?.must) || testCase.expected.must.length === 0) {
        fail(`Case ${testCase.id} needs at least one must criterion.`);
      }
      if (!Array.isArray(testCase.expected?.must_not) || testCase.expected.must_not.length === 0) {
        fail(`Case ${testCase.id} needs at least one must_not criterion.`);
      }
      const criteria = [...(testCase.expected?.must ?? []), ...(testCase.expected?.must_not ?? [])];
      const criterionIds = new Set();
      for (const criterion of criteria) {
        if (!criterion?.id || !criterion?.text) fail(`Case ${testCase.id} has a criterion without id and text.`);
        if (criterionIds.has(criterion?.id)) fail(`Case ${testCase.id} repeats criterion id ${criterion?.id}.`);
        criterionIds.add(criterion?.id);
      }
    }
    for (const smokeId of suite.smoke_cases ?? []) {
      if (!ids.has(smokeId)) fail(`Unknown smoke case: ${smokeId}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Validation failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated macos-support-mate ${skillVersion}.`);
console.log(`Checked ${requiredFiles.length} required files and ${suite.cases.length} behavioural fixtures.`);
