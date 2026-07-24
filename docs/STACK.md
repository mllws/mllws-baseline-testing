# Stack

Tooling choices per baseline dimension, straight from `baseline-testing-plan.md`. No code is written yet — this documents what each folder will eventually contain.

## Runtime

- Node.js (LTS) — required by pa11y-ci, Lighthouse CI, Playwright
- Python — optional, only if Locust is chosen over k6/Artillery for load testing

## Accessibility (`accessibility/`)

- `pa11y-ci` — primary; axe or HTML_CodeSniffer runner, WCAG2AA target, JSON output per page
- Lighthouse CLI/CI (accessibility category) — cross-check, 0–100 score
- *Future, post-baseline:* `playwright-axe` inside the E2E suite for PR-time regression checks

## Performance (`performance/`)

- Lighthouse CLI (11.7.1, `performance` category) — lab data, median of 3 runs, mobile + desktop throttled presets. `performance/lighthouse-config.json` + `performance/run-performance.js`, run via `npm run perf:run`.
- PageSpeed Insights API — CrUX field data (if the site has enough traffic). `performance/run-crux.js`, run via `npm run perf:crux`.
- WebPageTest API — third-party waterfall cross-check. Deferred — needs a personal API key not yet provisioned; not required by the issue's acceptance criteria.

## UX (`ux/`)

- Lighthouse (Best Practices + SEO categories) — per page
- Playwright — scripted screenshot capture at 375px / 768px / 1440px breakpoints
- Playwright — scripted conversion-flow walkthrough (step timing, pass/fail)
- BackstopJS or Percy — pixel-diff tool, used later when comparing to v2 screenshots (not needed for baseline capture itself)

## Load (`load/`)

- k6 or Artillery — primary; scriptable, repeatable, CI-friendly
- Locust — alternative if Python is preferred over JS

## CI (proposal, not yet decided)

GitHub Actions is the natural fit for re-running Lighthouse CI / pa11y-ci on a schedule and for wiring `playwright-axe` into PR checks later. No workflow files added yet — open question, see `docs/ISSUES.md`.

## Reports (`reports/`)

Plain Markdown (or a small static HTML template) per the "Baseline report structure" section of the plan — one file per test run, four sections, one row per page/flow, with links to the scripts/configs and screenshot set used.
