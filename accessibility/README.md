# accessibility/

`pa11y-ci` config (axe runner, WCAG2AA) plus a Lighthouse accessibility cross-check for the 7 scoped URLs locked in `docs/PLAN.md` Phase 1.

- `pa11y-ci.json` — pa11y-ci config: defaults (standard, runner, Chrome launch config) + the locked URL list. Run directly with `npm run a11y:pa11y-ci`.
- `run-accessibility.js` — runs pa11y and Lighthouse (accessibility category) per URL, saves one JSON file per page per tool to `results/`, and writes the aggregated table to `../reports/accessibility-baseline.md`. Run with `npm run a11y:run`. Reused verbatim for v2 — same config, same script.
- `results/` — raw JSON output, one `<page>.pa11y.json` and one `<page>.lighthouse.json` per scoped URL.

See `../reports/accessibility-baseline.md` for the current baseline numbers and `docs/PLAN.md` Phase 2 for the test cases this tooling was built against.
