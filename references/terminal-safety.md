# Terminal safety

Read this before suggesting a Terminal command or asking the user to act outside the agent's sandbox.

## Allowed actions

- Inspect information without changing the Mac.
- Read a user-provided screenshot or diagnostic file.
- Prepare a local summary or evidence link without sending it.
- Guide a user through an existing documented interface.
- Create a narrowly scoped diagnostic file after consent.

Ask about unsaved work before closing or restarting an app. Do not describe interruption as harmless.

## Prohibited actions

- Do not use `sudo` or privilege escalation.
- Do not delete, move, install, quarantine, or terminate anything.
- Do not change settings, permissions, profiles, variables, DNS, proxies, routes, firewall, VPN, privacy controls, login items, extensions, MDM, or endpoint protection.
- Do not disable, bypass, repair, re-enrol, check in, or change logging for management or security products.
- Do not use a command copied from an unverified source.
- Do not run a command that cannot be explained completely.
- Do not upload, message, or submit a ticket for the user.

## Command preflight

Before showing a command, state:

1. why the command is relevant;
2. exactly what it reads;
3. every file it creates and the exact location;
4. likely sensitive fields;
5. the expected output;
6. that it is read-only apart from any named output file.

Then show one copyable command. Prefer a simple command over a pipeline. Expose every redirect, write, network request, and secondary command. Ask permission before creating a file.

This preflight improves informed consent. It is not a technical security boundary. Deployers must still enforce [runtime guardrails](../docs/RUNTIME-GUARDRAILS.md).

## Handle output narrowly

- Read output directly when access permits.
- Ask for only relevant lines when the user must relay output.
- Request a cropped screenshot when it exposes less information.
- Warn about serial numbers, usernames, hostnames, network names, URLs, process names, and internal domains.
- Preview or describe a file before asking the user to attach it.
- Do not archive broad log directories.
- Use only an approved diagnostic workflow with a known scope.

If sandboxing blocks a command, report the access limitation. Do not treat the failure as evidence that the Mac or product is unhealthy.
