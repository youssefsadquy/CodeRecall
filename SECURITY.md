# Security policy

## Supported versions

CodeRecall is currently a 1.x project. Security fixes are applied to the latest release.

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Please **do not** open a public issue for a security problem.

Use the repository's **Security → Report a vulnerability** flow (GitHub private security advisories). If that is unavailable, contact the maintainer through the profile listed on the repository.

Include:

- the CodeRecall version and Windows version;
- a description of the issue and its impact;
- exact reproduction steps or a proof of concept;
- any relevant log lines from `%LOCALAPPDATA%\CodeRecall\error.log`.

You can expect an acknowledgement within a few days and a coordinated disclosure once a fix is available. Please give the project reasonable time to ship a patch before publishing details.

## Scope

Relevant areas include:

- the WebView2 bridge command surface (`Bridge.cs`);
- path handling for state, backups and imported files;
- API-key storage and DPAPI usage;
- injection through imported card content or AI-generated content;
- unsafe handling of remote AI responses.

## Out of scope

- SmartScreen warnings caused by the unsigned executable.
- Rate limits, outages, or content quality of third-party AI providers.
- Vulnerabilities that require an already-compromised local account or physical access to the machine.
- Issues in the Microsoft Edge WebView2 runtime itself; report those to Microsoft.

## Data and network behaviour

- Progress is stored locally at `%LOCALAPPDATA%\CodeRecall\state.json`.
- API keys are encrypted with Windows DPAPI for the current user in `secrets.dat`.
- CodeRecall does not include telemetry or analytics.
- Network requests occur only when the AI tutor is used or an optional remote provider is configured.

## Dependency updates

Dependency and runtime updates are welcome as focused pull requests. Please include the reason for the update and any behaviour changes.
