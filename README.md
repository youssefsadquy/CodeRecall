# CodeRecall

**Relearn faster. Remember longer.**

CodeRecall is a small, offline-first Windows app for rebuilding software engineering knowledge after time away. It combines short active-recall sessions, spaced repetition, plan-aware progress analytics, and an optional free AI tutor — with no account, no ads, and no telemetry.

![CodeRecall Today dashboard](assets/screenshot.png)

## Why another flashcard app?

Because relearning is not the same as learning for the first time. CodeRecall is built around a forty-second setup instead of a 214-card wall:

- **A plan, not a library dump.** Five questions about your background, freshness, goal and interests produce a focused set of decks. Everything else stays in the library, out of your queue.
- **Only relevant cards surface.** Today, Study, Progress, weak topics and forecasts all respect your active plan.
- **You can change your mind.** Hidden decks remain searchable and selectable. Editing your plan never deletes progress.
- **No setup ceremony.** No account, no cloud, no subscription. The app opens straight into a session.

![Personal plan setup](assets/setup.png)

## Features

- **Personal plan wizard** — background, freshness, goal, interests and daily pace, with an explainable recommendation and a written analysis of your plan.
- **Guided tour** — a seven-step spotlight tour of Today, Study, Library, Progress, the AI tutor and Settings. Available from Settings or the shortcut sheet.
- **214 hand-written cards across 8 areas** — JavaScript/TypeScript, Python, Java/C#, CS core, DSA and interviews, system design, full-stack web, and Git/testing/craft.
- **SM-2-flavoured scheduling** — Again/Hard/Good/Easy grading, lapses, ease clamping, daily new-card limits and cram sessions that leave your schedule alone.
- **Plan-aware analytics** — accuracy, maturity, 14-day activity, a 16-week heatmap, forecast, and the topics that keep slipping.
- **Fast searchable library** — search your plan by default or switch to the full library; duplicate built-in cards to make them yours.
- **Free AI tutor by default** — explain a card, generate new cards, or get quizzed. Optional OpenRouter, Groq, Gemini, Ollama or any OpenAI-compatible endpoint.
- **Local-first data** — JSON state on disk, DPAPI-encrypted API keys, and one-click export/import backups.
- **Keyboard-first** — `Space` to reveal, `1`–`4` to grade, `Ctrl+K` to search, `?` for every shortcut.

## Install

1. Download `CodeRecall.exe` from the [latest release](../../releases/latest).
2. Run it. There is no installer — it is a single self-contained executable.
3. Windows may show a SmartScreen warning because the build is unsigned. Choose **More info → Run anyway**.

Requirements:

- Windows 10 or 11, x64.
- The Microsoft Edge WebView2 runtime. It ships with Windows 11 and recent Windows 10 installs; if the app cannot start, install the [Evergreen WebView2 runtime](https://developer.microsoft.com/microsoft-edge/webview2/).

Your progress is stored at `%LOCALAPPDATA%\CodeRecall\state.json`. Use **Settings → Export backup** before moving to another PC.

## First run

The wizard asks five questions (and an optional name):

1. Where are you now — studying, recent graduate, returning after a break, working engineer, or self-taught?
2. How fresh does it feel — mostly gone, rusty, or mostly current?
3. What are you optimising for — interviews, fundamentals, a new role/stack, depth, or a daily habit?
4. Which areas do you actually care about?
5. How much time can you give it — light, steady or intense?

CodeRecall scores the eight decks locally (no AI, no network) and recommends a starting set. You can accept it, pick individual areas, or select everything. The final step shows your focus order, card count and daily pace.

Skipping setup keeps the full library visible. You can rerun the wizard at any time from **Settings → Redo setup**.

## Study loop

1. Open **Today** and press **Start session**, or build a custom session in **Study**.
2. Read the question and answer it out loud before revealing.
3. Grade it **Again**, **Hard**, **Good** or **Easy**.

Modes include due + new, due only, new only, weak spots and cram. A light plan starts at 8 new cards/day, steady at 12, intense at 20; the daily goal scales with it. Reviews never pile up because new cards are capped.

## Card library

| Area | Cards | Focus |
| --- | ---: | --- |
| JavaScript & TypeScript | 30 | closures, event loop, types, React |
| Python | 25 | data model, generators, idioms |
| Java & C# | 24 | OOP, generics, collections, GC, async |
| CS Core | 29 | operating systems, databases, networks, HTTP |
| DSA & Interviews | 29 | complexity, data structures, patterns |
| System Design | 26 | scale, caching, queues, trade-offs |
| Full-stack & Web | 26 | HTTP, APIs, auth, security, React |
| Git, Testing & Craft | 25 | Git, tests, CI/CD, debugging |

Built-in cards are read-only. **Duplicate & edit** creates a personal copy, and new cards can be added from the library or generated with the AI tutor.

## AI tutor

The default provider is **Free AI — no key**, using a public Pollinations endpoint. It works out of the box, can be rate-limited at busy times, and needs an internet connection.

The rest of the app is completely usable with AI set to **Offline only**. Optional providers:

- OpenRouter (including free models)
- Groq
- Google Gemini
- Ollama (fully local)
- Any OpenAI-compatible endpoint

The tutor receives your background, freshness and active areas, so explanations fit the plan instead of assuming a generic computer-science graduate.

API keys are encrypted with Windows DPAPI in `%LOCALAPPDATA%\CodeRecall\secrets.dat` and are never written to `state.json`.

## Your data

- Progress, settings and custom cards live in `%LOCALAPPDATA%\CodeRecall\state.json`.
- The app makes no telemetry or analytics requests.
- Network access happens only when you use the AI tutor or choose a remote AI provider.
- **Settings → Export backup** writes a portable JSON file; **Import backup** replaces scheduling history and custom cards.
- **Settings → Reset progress** clears scheduling, streaks and review history while keeping your settings and custom cards.

## Build from source

Prerequisites: Windows, the [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0) or newer, and the WebView2 runtime. Node.js is only needed for the browser preview and JavaScript syntax checks.

```powershell
git clone https://github.com/<your-account>/CodeRecall.git
cd CodeRecall
.\scripts\build.ps1
```

The script publishes a self-contained single file to `publish\CodeRecall.exe`.

Manual publish:

```powershell
dotnet publish CodeRecall.csproj -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true `
  -p:EnableCompressionInSingleFile=true -o publish
```

### UI-only preview

```powershell
node scripts\serve.js
```

Open <http://localhost:8765>. The preview uses a mock bridge, so AI calls return canned text but every screen, the setup wizard and the tour work.

## Project layout

```text
CodeRecall/
├─ assets/
│  ├─ core.js          state, bridge, scheduler, stats, personalisation
│  ├─ ui-profile.js    setup wizard and guided tour
│  ├─ ui-today.js      Today dashboard
│  ├─ ui-study.js      session setup and review loop
│  ├─ ui-library.js    search, card viewer, editor
│  ├─ ui-stats.js      progress analytics
│  ├─ ui-ai.js         AI tutor
│  ├─ ui-settings.js   settings, plan, backups
│  ├─ data-*.js        deck definitions and 214 cards
│  ├─ index.html
│  └─ styles.css
├─ MainForm.cs         borderless WebView2 host
├─ Bridge.cs           JS ↔ C# commands
├─ AiClient.cs         provider calls and retries
├─ scripts/            preview server and build helper
└─ .github/workflows/  CI and tagged Windows releases
```

## Contributing

Bug reports, card corrections and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and see [CHANGELOG.md](CHANGELOG.md) for what changed.

Please do not open a public issue for a security problem. Follow [SECURITY.md](SECURITY.md) instead.

## License

[MIT](LICENSE) © 2026 CodeRecall contributors

CodeRecall is an independent project. Microsoft, WebView2, and the names of the optional AI providers are trademarks of their respective owners.
