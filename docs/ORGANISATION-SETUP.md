# Organisation setup interview

Use this guide to adapt `macos-support-mate` to a real support environment without turning the interview into a questionnaire or assuming that Jamf is present.

## Outcome

At the end, the repository should describe:

- the actual management, security, network, identity, and support environment;
- which sources document vendor capability, organisation intent, and observed device state;
- which actions belong to the user, which belong to IT, and which remain unknown;
- the approved documentation, diagnostics, privacy rules, and support routes;
- any unanswered deployment blockers and the safe fallback for each.

## Interview agreement

Before the first question, tell the user:

- the interview is divided into a small number of topics and incomplete answers are acceptable;
- they can answer by typing, dictating freely, pasting existing documentation links, or saying “unknown” or “come back to this”;
- dictation is often the easiest option: they can describe the environment naturally and the interviewer will organise it;
- no passwords, recovery codes, tokens, private keys, or other secrets should be shared;
- no repository files will be edited until the interviewer summarises the proposed changes and the user approves them.

Ask at most three closely related questions in one turn. Prefer one question when its answer determines the next topic. Reuse everything already supplied, skip irrelevant topics, and do not ask the user to translate their answer into this repository's structure.

Offer two modes:

1. **Guided:** work through one topic at a time.
2. **Dictation:** invite the user to describe the environment in one pass, map the answer to the topics below, then ask only high-value follow-ups.

## Choose a safe configuration destination first

Before collecting internal details, inspect the local repository status and remotes without changing them.

- If the checkout is connected to this public upstream, create `references/organisation.local.md` from `references/organisation-template.md` after approval. The destination is gitignored and must remain untracked.
- If the team wants versioned organisation configuration, require a deliberately private internal repository with an approved access model. Verify that destination rather than assuming a fork is private.
- If repository visibility or the eventual publishing route is unknown, use the local overlay and record the uncertainty as a deployment blocker.

Never write internal knowledge URLs, environment topology, profile identifiers, product configuration, escalation routes, or retention rules into tracked files connected to the public upstream. A gitignored file is not encrypted; it still requires an appropriately protected local workspace.

## Evidence model

Keep three sources separate throughout onboarding:

| Source | Establishes | Does not establish |
| --- | --- | --- |
| Current official vendor documentation | Supported product behaviour and limitations | What this organisation configured |
| Live internal documentation | Intended configuration and approved workflow | What is currently installed or functioning on a Mac |
| Minimal read-only device evidence | What a representative Mac currently reports | Organisation intent or root cause by itself |

Do not silently resolve disagreement between them. Record the mismatch and set a safe IT handoff.

## Interview topics

### 1. Audience and scope

Learn who will use the skill, which Macs and macOS versions are supported, common issue types, accessibility or language needs, and anything explicitly out of scope. Confirm whether the skill is for personal use, a non-commercial organisation, or a separately authorised commercial deployment.

### 2. Management and security stack

Identify the actual MDM and enrollment model first. Then identify only products users may encounter: company portal or Self Service, endpoint protection, web or DNS filtering, VPN or zero-trust access, identity/SSO, compliance, remote support, and important peripherals.

This repository ships with Jamf-first examples, not a Jamf assumption. Replace or extend them for Fleet or any other environment actually in use.

For each relevant product, capture:

- vendor, product, and relevant version or service tier when known;
- the visible app, menu item, icon, notification, or status wording a user sees;
- its purpose in this organisation;
- whether the user can act on it, IT controls it, or ownership is unknown;
- current vendor and internal documentation.

### 3. Representative Mac evidence

Ask whether a representative test Mac is available and whether the agent may perform approved read-only inspection. If access is sandboxed, offer clearly explained user-run observations instead. Do not pressure the user to enable broader access.

Use the smallest observation that answers a setup question. Possible candidates include MDM enrollment status, configuration-profile names and payload types, installed system or network extensions, visible VPN services, and product status commands verified in current vendor documentation. Follow `references/terminal-safety.md` before every command.

Profile and extension data may expose internal domains, tenant URLs, certificate metadata, usernames, payload identifiers, or security configuration. Inspect locally where possible. Record only the minimum cross-reference fields below; do not paste raw profile dumps or secrets into repository documentation.

| Observed profile or component | Payload or component type | Likely product and owner | Documented purpose | User control | Internal procedure | Vendor documentation | Confidence or mismatch |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Presence is evidence of deployment, not proof that a payload is effective or the cause of a symptom. A failed sandboxed observation is evidence about access, not device health.

### 4. Knowledge and approved sources

Identify the live internal knowledge connector or portal and verify that the target agent can read it. Gather exact sources for ordinary support, security incidents, service status, supported apps, Self Service items, and diagnostic collection. Add official documentation roots for every deployed vendor.

Decide whether wider web research is allowed. If it is, define whether primary vendor sources are required and which community or third-party sources, if any, are acceptable as supporting evidence.

### 5. Actions and diagnostics

Establish which read-only observations IT permits, which reversible actions users control, and which actions are prohibited or IT-only. For every approved diagnostic workflow, record its exact visible name, effect, duration, completion signal, output location, sensitive contents, and delivery route.

Do not recreate privileged Self Service internals as direct commands. Do not approve broad profile, unified-log, or `sysdiagnose` collection merely because it may be useful.

### 6. Support, security, and privacy

Capture the ordinary help route, urgent security route, supported hours, status page, permitted device identifier, attachment method, and retention or redaction requirements. Confirm the security events that stop ordinary troubleshooting immediately.

The skill must prepare a handoff but never submit it, upload evidence, or contact IT for the user.

### 7. Voice and validation

Confirm local terminology and whether the default calm, casual, evidence-led tone fits. Ask for one common support example only if existing material does not establish the desired voice.

Review the repository cases in `tests/cases.json`. Add organisation-specific variants for at least:

- an ordinary issue resolved by a user-controlled action;
- a sandbox-limited or IT-controlled issue that produces a concise handoff;
- a suspected security incident that stops immediately and uses the approved route.

Run the static validator and the isolated behavioural harness in `tests/README.md`. A model refusal does not replace the deployment controls in `docs/RUNTIME-GUARDRAILS.md`.

## Review before editing

When the interview has enough information, show:

1. facts supplied or verified;
2. assumptions that must not be written as facts;
3. unanswered items, separated into deployment blockers and optional improvements;
4. the proposed changes and whether each belongs in the protected overlay, a private repository, or the generic public files;
5. any data that will deliberately not be recorded because it is sensitive.

Ask for approval to apply that bounded set of changes. Do not treat permission to edit the references as permission to change `SKILL.md`, the licence, identity terms, or unrelated files.

## Apply and validate

After approval, write organisation-specific values to `references/organisation.local.md` by default. Update tracked references only for generic improvements or inside a verified private internal repository:

- `references/organisation.local.md`
- `references/operations.md`
- `references/terminal-safety.md`
- `references/conversation-guide.md`, only for approved terminology or tone changes

Verify that `references/organisation.local.md` is ignored and absent from `git status`. Run `node scripts/validate.mjs`, an available Agent Skills validator, and `npx skills add . --list`. Verify that the installer discovers exactly `macos-support-mate`. Run the relevant behavioural cases. Report edited files, unresolved blockers, and validation output. Do not commit, push, publish, install globally, or deploy unless the user separately asks.
