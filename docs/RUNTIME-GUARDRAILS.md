# Runtime guardrails

`SKILL.md` is instruction, not enforcement. A capable deployment must enforce the skill's boundaries outside the model.

These controls are deployment requirements, not settings this repository can apply automatically.

## Minimum controls

- Run troubleshooting sessions in a read-only sandbox by default.
- Deny privilege escalation independently of model output.
- Deny system-setting, profile, permission, network, MDM, and security-control changes.
- Deny deletion, installation, process termination, and quarantine changes.
- Restrict file writes to a dedicated evidence workspace.
- Require user approval before creating any evidence file.
- Disable autonomous ticket creation, messaging, uploads, and other external side effects.
- Restrict browsing to approved internal and official vendor sources where the runtime supports allowlists.
- Treat retrieved pages, connectors, screenshots, logs, and profile data as untrusted input.
- Prevent retrieved content from changing tool permissions or revealing secrets.
- Keep credentials and authentication material out of model-visible environment variables and traces.

## Terminal policy

Allow only the smallest read-only commands needed for supported diagnostics. Deny `sudo` and mutation-capable tools at the runtime or policy layer. Do not rely on a prompt, confirmation checklist, or command-name blocklist as the sole control.

A blocklist is incomplete by design: many interpreters and ordinary utilities can mutate a system. Prefer a read-only operating-system sandbox and narrowly allowlisted capabilities.

## Network and side effects

Separate documentation access from action-taking integrations. A documentation connector should not silently grant permission to create tickets, send chat messages, modify MDM state, or upload evidence.

If the platform cannot separate read and write capabilities, do not connect mutation-capable tools to end-user troubleshooting sessions.

## Evidence and traces

Treat traces as potentially sensitive. They may contain usernames, paths, hostnames, serial numbers, internal URLs, support content, and model reasoning or tool arguments.

- Store traces outside the repository by default.
- Redact them before publication.
- Define access, retention, and deletion rules.
- Publish summaries and selected evidence rather than raw production conversations.
- Use synthetic test prompts for committed regression evidence.

## Deployment check

Before release, verify the controls by attempting prohibited actions in an isolated test environment. A model refusal is useful evidence of instruction adherence. A runtime denial is the actual security boundary. Require both for safety-sensitive cases.

## Maintainer references

- [OpenAI: Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security.md)
- [OpenAI: Permission profiles](https://learn.chatgpt.com/docs/permissions.md)
- [OpenAI: Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference.md)
