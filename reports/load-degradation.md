# Load test degradation-point analysis — motherlanguagelovers.com v1

**Date:** 2026-07-26
**Source:** load/results/raw.json (k6 `--out json`), bucketed into 10s windows
**Script:** [load/analyze-load-results.js](../load/analyze-load-results.js)
**Degradation threshold:** p95 >= 1500 ms, or >= 2x the first bucket's p95

**Degradation point:** none detected — p95 stayed under threshold for the whole run.

| Window start | Avg VUs | p95 (ms) | Requests |
|---|---|---|---|
| 0s | 5 | 144 | 49 |
| 10s | 13 | 143 | 124 |
| 20s | 21 | 92 | 204 |
| 30s | 30 | 60 | 280 |
| 40s | 38 | 75 | 356 |
| 50s | 46 | 60 | 439 |
| 60s | 50 | 56 | 473 |
| 70s | 50 | 57 | 477 |
| 80s | 50 | 60 | 474 |
| 90s | 50 | 56 | 474 |
| 100s | 50 | 66 | 471 |
| 110s | 50 | 69 | 479 |
| 120s | 50 | 57 | 469 |
| 130s | 50 | 58 | 483 |
| 140s | 50 | 59 | 467 |
| 150s | 50 | 65 | 483 |
| 160s | 50 | 60 | 467 |
| 170s | 50 | 57 | 481 |
| 180s | 44 | 61 | 410 |
| 190s | 27 | 78 | 256 |
| 200s | 11 | 56 | 97 |
| 210s | 2 | 48 | 1 |

