# Approved actions and Terminal guidance

Use this reference before suggesting a command or asking the user to perform an action outside the agent's sandbox.

## Action classes

### Agent-safe

- Read-only inspection within current access.
- Reading user-provided screenshots or diagnostic files.
- Searching approved live documentation.
- Preparing a summary or local evidence link without sending it.

### User-controlled

- Retrying the exact task.
- Closing and reopening an affected app when no unsaved work will be lost.
- Connecting through an existing, documented VPN interface.
- Running an exact organisation-approved Self Service item after its effects are explained.
- Creating a diagnostic output file after consent and a privacy warning.

Ask about unsaved work before closing or restarting anything. Do not present a restart as harmless when it could interrupt work.

### Prohibited

- `sudo` or privilege escalation.
- Deletion, cleanup, quarantine removal, permission changes, package installation, or process termination.
- Changes to preferences, profiles, environment variables, DNS, proxies, routes, firewall, VPN configuration, privacy permissions, login items, extensions, MDM, or endpoint protection.
- Disabling, bypassing, repairing, re-enrolling, checking in, or changing diagnostic/log levels for Jamf or security products.
- Commands copied from an unverified forum, generated speculatively, or not understood well enough to explain.
- Uploading, messaging, or ticket submission on the user's behalf.

## Before showing a Terminal command

State, briefly:

1. why this command is relevant;
2. exactly what it reads;
3. whether it creates a file and its exact location;
4. likely sensitive fields, such as serial number, username, hostname, network name, URLs, or process names;
5. what output or file the user should expect;
6. that the command is read-only apart from the explicitly named output file.

Then show one copyable command. Avoid dense pipelines and command substitution when a simpler form works. Never hide a write, redirect, network request, or secondary command inside an opaque one-liner.

AI fallibility is not a useful substitute for an explanation. Give the user enough information to make an informed choice.

## Handling output

- Prefer reading output directly when the environment allows it.
- If the user must relay output, ask for only the relevant lines or a screenshot with secrets and personal content removed.
- If a file is necessary, ask consent before creating it, choose a clear filename, and tell the user where it will appear.
- Do not create archives containing broad log directories. Use an approved collection workflow with a known scope.
- Preview or describe the contents before asking the user to attach anything.
