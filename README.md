# macOS Support Mate

A calm, safety-bounded Agent Skill for everyday macOS troubleshooting before a help desk ticket is needed.

It helps an agent isolate ordinary Mac problems, distinguish evidence from assumptions, use documented self-service workflows, stop for security incidents, and prepare concise user-submitted handoffs.

The repository is named `not-sammy-skill` to make its identity boundary explicit. The installable skill and public display name are consistently `macos-support-mate` and **macOS Support Mate**.

## Install with the Skills CLI

```sh
npx skills add thesammykins/not-sammy-skill
```

The installer discovers `macos-support-mate` from the root `SKILL.md`.

## Install directly

If the destination does not already exist:

```sh
mkdir -p ~/.agents/skills && git clone https://github.com/thesammykins/not-sammy-skill.git ~/.agents/skills/macos-support-mate
```

The command creates the skills directory and clones the repository into its own folder. It does not overwrite an existing installation. Restart or reload the agent if it does not discover the skill automatically.

## What the skill cannot enforce

`SKILL.md` guides model behaviour. It cannot prevent a model or connected tool from attempting an unsafe action.

Deployers must enforce read-only access, deny privilege escalation and system mutation, isolate evidence writes, constrain documentation access, and disable autonomous ticketing or uploads. Read [runtime guardrails](docs/RUNTIME-GUARDRAILS.md) before deployment.

## Organisation setup

The generic skill works for personal, non-commercial troubleshooting. Managed environments should use the [organisation setup interview](docs/ORGANISATION-SETUP.md).

Give an agent this prompt:

```text
Set up macOS Support Mate for my environment. If the current directory contains the not-sammy-skill repository, use it. Otherwise clone https://github.com/thesammykins/not-sammy-skill.git into a new not-sammy-skill folder in the current workspace without overwriting anything. Read docs/ORGANISATION-SETUP.md completely and follow it.

Offer a guided interview or a dictation-friendly pass. Partial answers and “unknown” are fine. Ask no more than three closely related questions at once. Do not ask for secrets. Inspect repository remotes before collecting internal details. In a checkout connected to the public repository, write organisation configuration only to the gitignored references/organisation.local.md overlay. Summarise proposed edits and wait for approval. Do not commit, push, publish, install, or deploy unless separately asked.
```

Before deployment:

- apply the [runtime guardrails](docs/RUNTIME-GUARDRAILS.md);
- connect and verify live internal knowledge sources;
- create `references/organisation.local.md` from [the template](references/organisation-template.md);
- populate actual products, approved sources, user-visible states, support routes, and diagnostics;
- keep private URLs, topology, profile identifiers, escalation details, and retention rules out of the public repository;
- review [operations](references/operations.md), [Terminal safety](references/terminal-safety.md), and the [conversation guide](references/conversation-guide.md);
- run the static validator and behavioural regression cases in [tests](tests/README.md);
- obtain written permission if the intended use is not licensed by PolyForm Noncommercial.

`references/organisation.local.md` is gitignored, not encrypted. Store it only in an appropriately protected workspace.

## Validate changes

Run dependency-free repository checks:

```sh
node scripts/validate.mjs
node tests/harness-unit.mjs
```

Then run the isolated Codex behavioural harness described in [tests/README.md](tests/README.md). It requires distinct pinned target and judge models, fresh ephemeral sessions, permission preflights, and reviewed JSONL evidence outside the repository by default.

Static checks validate structure and fixtures. Behavioural runs provide evidence about a particular model and CLI version. Neither replaces runtime enforcement.

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Licence and identity

This project is source-available, not open source. It uses the [PolyForm Noncommercial License 1.0.0](LICENSE).

SPDX identifier: `PolyForm-Noncommercial-1.0.0`

Commercial use is not licensed by default. This includes selling the skill, charging for access, incorporating it into paid support, or offering a monetised derivative.

A for-profit organisation seeking internal-only use can [open an internal-use permission request](https://github.com/thesammykins/not-sammy-skill/issues/new?template=internal-use-request.yml). Keep the issue non-confidential. Opening an issue is only a request; permission exists only after the copyright holder replies in writing with an explicit scope.

This project does not grant rights to use the author's name, likeness, voice, identity, or endorsement. See [PERSONA.md](PERSONA.md).
