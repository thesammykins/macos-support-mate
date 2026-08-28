# Behavioural regression tests

The fixtures in [cases.json](cases.json) test operational decisions rather than exact wording. They cover ordinary resolution, sandbox limits, security stops, adversarial instructions, managed-device causality, Terminal consent, privacy, and handoff boundaries.

The harness produces model-and-revision-specific evidence. It does not certify the skill or replace runtime enforcement.

## Requirements

- Codex CLI 0.138.0 or newer, because the harness requires deny-read permission profiles;
- an existing authenticated Codex CLI session;
- Node.js 20 or newer;
- two distinct models available in the current Codex catalogue;
- network access and sufficient Codex usage.

The harness stops before target evaluation when model-catalogue, filesystem-permission, or judge-calibration preflight fails. Judge calibration itself uses one model call. Infrastructure errors are reported as `ERROR`, not behavioural failures.

## Run

Run the three-case smoke set with distinct target and judge models:

```sh
node scripts/run-codex-evals.mjs --model <target-model> --judge-model <different-model>
```

Run all cases or one named case:

```sh
node scripts/run-codex-evals.mjs --all --model <target-model> --judge-model <different-model>
node scripts/run-codex-evals.mjs --case sudo-pressure --model <target-model> --judge-model <different-model>
```

Use `--timeout-ms` to change the three-minute per-process limit. Use `--output` only with a new path outside the repository. Existing paths and repository paths are rejected.

## Isolation

The harness creates separate temporary homes and `CODEX_HOME` directories for the target and judge. It:

- copies only the public runtime files required by the skill;
- excludes `organisation.local.md`, Git data, tests, and unrelated repository files;
- passes an explicit process-environment allowlist;
- disables apps, hooks, memories, web search, and command networking;
- disables login shells;
- applies a read-only permission profile;
- denies command-level reads of both temporary and real Codex homes;
- verifies that the skill fixture is readable and `auth.json` is denied before model calls;
- gives the judge no copy of the evaluated skill;
- attaches no images and denies unrelated filesystem reads;
- ignores user execution rules;
- starts each call with `--ephemeral`.

The Codex client still needs the user's existing authentication file, which is linked into each temporary Codex home. The permission preflight verifies that model-generated commands cannot open it. Do not weaken or remove that preflight.

Bundled Codex system instructions remain present. The harness isolates user skills and configuration, not the Codex executable or service.

## Grading

Each criterion has a stable ID. The judge reports met, missed, and violated IDs. The harness computes the final result itself and fails closed on unknown IDs, missing required criteria, prohibited criteria, malformed traces, unknown tool events, or unexpected command attempts.

Before evaluating a target, the judge must correctly classify four human-labelled calibration responses, including an unsafe command and response-borne prompt injection. Calibration catches obvious grader failure; it does not make a model judge authoritative.

Only narrow `sed` reads of Markdown inside the isolated skill are allowed as target command activity. The synthetic cases do not require the target to inspect the host Mac. The judge may not run commands.

## Evidence

Evidence defaults to a newly created directory under the operating system's temporary directory. Each run contains:

- target and judge JSONL traces;
- target responses;
- structured judge output and harness-computed verdicts;
- bounded stderr diagnostics;
- the CLI version and pinned model names;
- Git state plus SHA-256 digests of the public skill and evaluation inputs;
- permission, model-catalogue, and judge-calibration preflight results.

Review traces before publication. Human-label a sample. Check that the recorded digests match the intended source. Redact temporary paths, usage metadata, internal material, and anything unexpected. Copy only a reviewed bundle into [evidence](evidence/README.md).

A pass supports only this statement: the recorded target model produced a response meeting the listed criteria for that synthetic case, the recorded judge classified it accordingly, and no disallowed activity appeared in the captured trace. It does not prove safety across prompts, models, versions, tools, or deployments.

## Static validation

```sh
node scripts/validate.mjs
node tests/harness-unit.mjs
```

These check package structure, relative links, version alignment, criterion IDs, fixture shape, trace lifecycle handling, command allowlisting, and judge-lane consistency. They do not execute a model or demonstrate adherence.
