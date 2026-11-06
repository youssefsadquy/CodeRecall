# Contributing to CodeRecall

Thanks for taking the time to improve CodeRecall. This project is intentionally small: a vanilla JavaScript front end inside a single WebView2 window, with no front-end build step.

## Good first contributions

- Correct or clarify a card (wrong fact, stale API, ambiguous wording).
- Improve keyboard accessibility or screen-reader labels.
- Fix a layout issue at small window sizes.
- Add a focused test or a small developer script.
- Report a reproducible bug with the exact steps and the app version.

## Before you start

For anything larger than a typo or a single card fix, open an issue first. Describe the problem, the proposed behaviour, and whether it changes the personal-plan model, scheduling, or stored state. Changes to the state schema need a migration path.

## Development setup

Requirements:

- Windows 10/11 x64
- .NET 6 SDK or newer
- WebView2 runtime
- Node.js (optional, for the browser preview and syntax checks)

Fast UI loop:

```powershell
node scripts\serve.js
# open http://localhost:8765
```

Native build:

```powershell
.\scripts\build.ps1
# publish\CodeRecall.exe
```

Before opening a pull request:

```powershell
Get-ChildItem assets\*.js | ForEach-Object { node --check $_.FullName }
dotnet build CodeRecall.csproj -c Release
```

Then run the app and check the pages you touched. The browser preview uses a mock bridge; AI calls return canned text there.

## Code style

- Keep the front end dependency-free. Plain ES2018+, no framework, no bundler.
- Match the surrounding style: two-space indent, single quotes, semicolons, `const`/`let`.
- Escape user or card content with `CR.esc()` before inserting it into HTML.
- Keep personalisation local and explainable. Do not add a network call or an AI dependency to deck selection.
- Treat `CR.state` as the single source of truth and call `CR.save()` after mutations.
- Never write API keys into `state.json`; use the bridge secret commands.
- Prefer extending an existing `ui-*.js` module over adding a new global.

## Card content rules

A good CodeRecall card:

- tests one fact or one decision, not a paragraph;
- has a question that can be answered out loud in a few seconds;
- has 2–5 short answer points, with an optional code example;
- explains *why* the answer matters, not only *what* it is;
- avoids trivia that a working engineer would look up rather than recall.

Decks are defined in `assets/data-decks.js`; cards live in `assets/data-<deck>.js`. Keep card IDs stable once released.

## Pull request checklist

- [ ] The change is focused and described in the PR.
- [ ] JavaScript passes `node --check`.
- [ ] `dotnet build` succeeds.
- [ ] I tested the affected page in the preview and, when relevant, the native app.
- [ ] New strings are escaped and the UI still works with a hidden/subset plan.
- [ ] No telemetry, tracking, or new required network dependency was added.

## Commit messages

Use short imperative subjects, for example:

```text
Add plan-aware study queues
Fix tour placement on wide targets
Correct closure card wording
```

## License

By contributing, you agree that your contribution is licensed under the project's MIT license.
