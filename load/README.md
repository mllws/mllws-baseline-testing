# load/

k6 load test script ramping virtual users against the homepage + conversion flow. See issue: "Set up load testing baseline."

- `load-config.json` — base URL, conversion-flow paths (Contact + Volunteer, same proxy locked in `docs/PLAN.md` Phase 1), default ramp profile (0→50 VUs over 1m, hold 2m, ramp down 30s), degradation threshold (p95 >= 1500ms).
- `load-test.js` — k6 script: ramps VUs per the profile in `load-config.json` (overridable via `LOAD_TEST_MAX_VUS` / `LOAD_TEST_RAMP_UP` / `LOAD_TEST_HOLD` / `LOAD_TEST_RAMP_DOWN` / `LOAD_TEST_BASE_URL` env vars), each VU loops homepage → Contact → Volunteer. Tracks per-page duration Trends plus k6's built-in `http_req_duration` (p50/p95/p99 via `med`/`p(95)`/`p(99)`), `http_req_failed` (error rate), and `http_reqs` (throughput). `handleSummary()` writes `results/summary.json` and `../reports/load-baseline.md`. Run with `npm run load:run`.
- `analyze-load-results.js` — reads a k6 raw JSON-lines output (`k6 run --out json=load/results/raw.json`), buckets `http_req_duration` into 10s windows, and flags the first window where p95 crosses the configured threshold (or doubles vs. the first window) as the degradation point. Writes `../reports/load-degradation.md`. Run with `npm run load:analyze -- load/results/raw.json`.

**Requires the k6 binary** (`brew install k6` on macOS) — it isn't an npm package, so it's not in `package.json` devDependencies.

**This hits the live production site.** The full default profile (50 VUs) is a real load test, not a page load — per the issue, it should run during low-traffic hours or against a staging clone, not casually. Use small env-var overrides (e.g. `LOAD_TEST_MAX_VUS=2 LOAD_TEST_RAMP_UP=5s LOAD_TEST_HOLD=5s LOAD_TEST_RAMP_DOWN=2s`) for smoke-testing the script itself.

Tooling only — no baseline has been run yet. `results/` and `../reports/load-baseline.md` / `../reports/load-degradation.md` are generated when the actual baseline pass happens.
