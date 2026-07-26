# Load test baseline — motherlanguagelovers.com v1

**Date:** 2026-07-26
**Tool:** k6
**Profile:** ramp 0→50 VUs over 1m, hold 2m, ramp down 30s
**Pages:** homepage + Contact/Volunteer (conversion-flow proxy, see docs/PLAN.md Phase 1)
**Config:** [load/load-config.json](../load/load-config.json)
**Script:** [load/load-test.js](../load/load-test.js)

**Error rate (http_req_failed):** 0.00%
**Throughput:** 37.41 req/s

| Page | p50 | p95 | p99 | max |
|---|---|---|---|---|
| overall | 51 ms | 61 ms | 102 ms | 292 ms |
| homepage | 54 ms | 94 ms | 145 ms | 292 ms |
| contact | 48 ms | 56 ms | 68 ms | 273 ms |
| volunteer | 48 ms | 56 ms | 70 ms | 279 ms |

Degradation point (when latency starts climbing under load) needs the raw per-request timeline, not just this end-of-test summary — re-run with `--out json=load/results/raw.json` and then `npm run load:analyze -- load/results/raw.json`.

