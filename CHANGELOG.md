# Changelog

All notable changes to CodeRecall are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-06

### Added

- Personal plan wizard asking about background, freshness, goal, interests and daily pace.
- Local, explainable deck recommendation engine with a written analysis of the resulting plan.
- Plan-aware Today dashboard with plan strip, active deck grid and plan statistics.
- Plan-aware Study setup, review queues, cram and weak-spot sessions.
- Plan-scoped Library counts/search plus an "All decks" scope and an outside-plan deck group.
- Plan-scoped Progress analytics, weak topics and review forecast.
- Settings plan panel with Edit plan, Take the tour and Redo setup.
- Seven-step guided spotlight tour with keyboard navigation, launched from Settings or the shortcut sheet.
- AI tutor context built from the learner's background, freshness and active plan areas.
- Light, steady and intense pace presets that adjust the daily goal and new-card budget.
- Public README, MIT license, contributing and security guides, CI and tagged release workflows.

### Changed

- Onboarding is now the setup wizard rather than a single name/goal dialog.
- Deck statistics, due/new queues, weak topics and forecasts default to the active plan.
- Hidden decks keep their progress and remain explicitly selectable.

### Fixed

- Tour tooltip placement now moves below or above wide targets instead of overlapping them.
- Wizard focus order now matches the recommendation order described in the analysis text.

## 0.9.0 - 2026-10-20

### Added

- Initial single-file Windows build with 214 cards across 8 decks.
- SM-2-flavoured scheduler, daily limits, cram mode and weak-spot drills.
- Searchable library, custom cards, bookmarks and card editor.
- Progress dashboard with activity heatmap, maturity and forecast.
- Free AI tutor with optional OpenRouter, Groq, Gemini, Ollama and custom providers.
- Local state, DPAPI-encrypted keys and JSON backup/import.

[Unreleased]: ../../compare/v1.0.0...HEAD
[1.0.0]: ../../releases/tag/v1.0.0
