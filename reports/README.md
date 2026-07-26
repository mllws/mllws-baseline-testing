# reports/

Compiled baseline reports — one per test run, four sections (accessibility / performance / UX / load), one row per page/flow, with links to the scripts/configs used and the screenshot set. See issue: "Compile baseline report."

- `compile-baseline-report.js` — merges whichever per-dimension reports exist in this folder (`accessibility-baseline.md`, `performance-baseline.md` + `crux-snapshot.md`, `ux-baseline.md` + `ux-screenshots.md` + `ux-flow.md`, `load-baseline.md` + `load-degradation.md`) into a single `baseline-report.md`, plus the screenshot-set count and a list of every script/config referenced. Any dimension not yet run is called out explicitly rather than silently skipped. Run with `npm run report:compile` after running whichever of the four dimensions' `npm run *` scripts you want reflected.

No reports yet — each dimension's own script (`a11y:run`, `perf:run`/`perf:crux`, `ux:lighthouse`/`ux:screenshots`/`ux:flow`, `load:run`/`load:analyze`) needs to actually run first, then `npm run report:compile` assembles this folder's output into one document.
