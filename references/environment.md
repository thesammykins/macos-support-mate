# Environment discovery

Read this when management, networking, identity, filtering, VPN, or endpoint security may affect the issue.

## Evidence order

1. Reuse facts the user has already provided.
2. Read current vendor documentation for supported product behaviour.
3. Search connected live internal documentation for the organisation's intended configuration and workflow.
4. Use minimal read-only local observation when access permits.
5. Guide the user through a visible check when local access is sandboxed.
6. Mark anything else as unverified.

Do not front-load all checks. Discover only what could change the next troubleshooting decision.

Keep these evidence classes separate:

- **Vendor capability:** what current official documentation says the product supports.
- **Organisation intent:** what live internal documentation says IT configured.
- **Observed device state:** what this Mac currently reports through read-only evidence.

An installed profile or component is evidence of deployment, not proof that it is effective, healthy, or causing the issue. If these sources disagree, record the mismatch and use the safe support route.

## Management baseline

Establish, as relevant:

- macOS version and hardware model;
- whether MDM enrollment is visible and which organisation manages the Mac;
- whether Jamf Self Service or another company portal is installed;
- whether Jamf Protect or another endpoint product is visibly present;
- the organisation's VPN, DNS/filtering, identity, and device-compliance products;
- whether the user is on an office network, home network, hotspot, or another location.

Do not infer MDM enrollment merely because a Jamf-branded app exists. Do not infer that Jamf Protect provides DNS, filtering, firewall, or VPN functions in this environment; those capabilities and integrations vary by configuration.

## Safe observation examples

These are candidates, not a mandatory bundle. Confirm availability and explain them before use:

- `sw_vers` reads the installed macOS version.
- `system_profiler SPHardwareDataType` reads hardware details and includes the serial number.
- `profiles status -type enrollment` reports Apple enrollment status; its output and availability vary by macOS version and permissions.
- `scutil --nc list` lists configured network connection services and may reveal VPN names.
- a product's documented status or info command may be used only after verifying the product and exact command in current vendor or internal documentation.

Prefer the smallest command that answers the current question. Do not collect a general system inventory by default.

If a command fails under sandboxing, report the access limitation rather than diagnosing the Mac from the failure. Offer a user-run step only if its output is necessary.

Profile data may expose internal domains, tenant URLs, certificate metadata, usernames, identifiers, and security configuration. Inspect locally when possible, extract only the fields needed for the current decision, and do not ask the user to paste a complete profile dump into chat.

## Managed-control cross-reference

Maintainers should populate this from internal documentation and, when authorised, minimal evidence from a representative Mac:

| Observed profile or component | Type | Product and owner | Intended purpose | User control | Internal procedure | Vendor documentation | Confidence or mismatch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Not configured | Not configured | Not configured | Not configured | Unknown | Not configured | Not configured | Requires onboarding |

At runtime, classify the next action as **user-controlled**, **IT-controlled**, or **unknown**. If it is IT-controlled, explain the relationship in user language, collect only useful evidence, and prepare a handoff. Do not give the end user administrator instructions they cannot perform.

## Organisation-maintained values

Maintainers should keep these in live internal documentation and the protected local overlay or a deliberately private internal repository. Do not write internal values into this public fallback file:

- visible company portal or Self Service name;
- VPN product, icon, connected-state wording, and approved reconnect flow;
- endpoint protection and filtering product names;
- approved device-management verification steps;
- known limitations for sandboxed agents;
- support status page and outage source.

If this fallback is not populated, ask the user what they see and avoid product-specific instructions.
