# Not Sammy

A calm, safety-bounded macOS support skill for everyday troubleshooting before a help desk ticket is needed.

It helps an agent:

- work out what the user was trying to do;
- distinguish verified facts from user reports and sandbox limitations;
- use small, read-only checks and documented self-service workflows;
- adapt its language to the user's technical comfort;
- stop and direct suspected security incidents to the approved human support route;
- prepare a concise, attachment-ready handoff without contacting IT for the user.

The skill never authorises deletion, configuration changes, disabled security controls, privileged commands, or automatic ticket submission.

## Install with the Skills CLI

Run the interactive installer and select the agent and installation scope you want:

```sh
npx skills add thesammykins/not-sammy-skill
```

The installer discovers `macos-support-mate` from the repository's root `SKILL.md`.

## Install directly into `~/.agents/skills`

If `~/.agents/skills/macos-support-mate` does not already exist, copy and paste:

```sh
mkdir -p ~/.agents/skills && git clone https://github.com/thesammykins/not-sammy-skill.git ~/.agents/skills/macos-support-mate
```

This command creates the skills directory if needed and clones this repository into its own skill folder. It does not overwrite an existing installation; `git clone` stops if the destination already exists.

Restart or reload your agent if it does not discover newly installed skills automatically. Then ask it to use `$macos-support-mate` for a macOS support problem.

## Organisation setup

The generic skill is usable for personal, non-commercial troubleshooting as-is. For a managed environment, use the [organisation setup interview](docs/ORGANISATION-SETUP.md) rather than editing the references from guesswork.

Give an agent this prompt:

```text
Set up macOS Support Mate for my environment. If the current directory already contains the not-sammy-skill repository, use it. Otherwise clone https://github.com/thesammykins/not-sammy-skill.git into a new not-sammy-skill folder in the current workspace without overwriting any existing path. Read docs/ORGANISATION-SETUP.md completely and follow it.

Start by offering a guided interview or a dictation-friendly pass. Tell me that partial answers and “unknown” are fine, ask no more than three closely related questions at once, and reuse information I have already supplied. Do not ask for secrets. Before collecting internal details, inspect the repository remotes and choose a safe configuration destination. For a checkout connected to this public repository, use only the gitignored references/organisation.local.md overlay created from references/organisation-template.md. Do not edit files until you have summarised the proposed changes and I have approved them. Do not commit, push, publish, install globally, or deploy anything unless I separately ask.
```

Dictation is often the lowest-effort way to complete the first pass: describe the environment naturally, then let the agent organise it and ask only for gaps that affect safety or support routing.

Before an IT team deploys or reuses the configured skill internally, confirm this checklist:

- confirm that the intended use is permitted by the non-commercial licence or obtain written permission;
- choose either the gitignored local overlay or a deliberately private internal repository for organisation-specific configuration; never place internal operational details in files connected to the public upstream;
- connect the agent to the organisation's live knowledge source and verify that it can read the relevant pages;
- create `references/organisation.local.md` from [`references/organisation-template.md`](references/organisation-template.md) and record the exact internal documentation, products, support routes, security procedures, and diagnostic workflows there;
- leave the tracked generic references free of private URLs, environment topology, profile identifiers, escalation details, and retention rules unless working in an approved private repository;
- review [`references/approved-actions.md`](references/approved-actions.md) against local policy and record stricter organisation-specific action boundaries in the protected overlay; change the tracked reference only for a generic public improvement or in an approved private repository;
- review [`references/conversation-guide.md`](references/conversation-guide.md) for local terminology, accessibility needs, and tone;
- test at least one ordinary resolution, one sandbox-limited handoff, and one security-stop scenario before making the skill available to users.

The editable references are:

- [`references/organisation-template.md`](references/organisation-template.md) for creating the protected local environment overlay;
- [`references/environment.md`](references/environment.md) for visible MDM, VPN, filtering, and endpoint products;
- [`references/approved-sources.md`](references/approved-sources.md) for Apple, vendor, and organisation-approved documentation;
- [`references/support-routing.md`](references/support-routing.md) for approved help channels, security procedures, status pages, and diagnostic collection;
- [`references/approved-actions.md`](references/approved-actions.md) for local command and action boundaries;
- [`references/conversation-guide.md`](references/conversation-guide.md) for tone and tested support flows.

Internal documentation governs organisation-specific workflow, while current official vendor documentation governs documented product behaviour. Neither expands the skill's safety or authorisation boundaries.

`references/organisation.local.md` is excluded by `.gitignore`. That reduces accidental publication risk, but it is not encryption or access control. Store it only in an appropriately protected workspace and review repository status and remotes before any commit or push.

## Licence and identity

This project is **source-available, not open source**. It uses the [PolyForm Noncommercial License 1.0.0](LICENSE).

SPDX identifier: `PolyForm-Noncommercial-1.0.0`

Personal, educational, charitable, public-sector, and other non-commercial uses covered by that licence are allowed. Commercial use is not licensed. That includes selling the skill, charging for access to it, incorporating it into paid support or a commercial product or service, or offering a monetised derivative without separate written permission from the copyright holder.

The licence allows permitted users to adapt the skill, including customising the environment references for their organisation. A for-profit organisation considering deployment should obtain written permission rather than assuming its internal use is non-commercial.

This skill is informed by a real person's support practice, but it is not that person. The repository does not grant rights to use the author's name, likeness, voice, identity, or endorsement. See [PERSONA.md](PERSONA.md) for the identity and responsible-use notice.
