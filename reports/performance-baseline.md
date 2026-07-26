# Performance baseline — motherlanguagelovers.com v1

**Date:** 2026-07-26
**Tool:** Lighthouse 11.7.1 (performance category, median of 3 runs, mobile throttled + desktop throttled presets)
**Config:** [performance/lighthouse-config.json](../performance/lighthouse-config.json)
**Script:** [performance/run-performance.js](../performance/run-performance.js)

| Page | Device | Score | LCP | INP | CLS | TTFB | FCP | Page weight | Requests |
|---|---|---|---|---|---|---|---|---|---|
| homepage | mobile | 54/100 | 41791 ms | N/A | 0.001 | 58 ms | 8023 ms | 10097 KB | 89 |
| homepage | desktop | 50/100 | 7436 ms | N/A | 0.210 | 60 ms | 1848 ms | 10098 KB | 89 |
| home-about | mobile | 54/100 | 35521 ms | N/A | 0.001 | 54 ms | 9959 ms | 6287 KB | 189 |
| home-about | desktop | 66/100 | 3995 ms | N/A | 0.076 | 53 ms | 1660 ms | 5994 KB | 168 |
| home-blog | mobile | 59/100 | 7763 ms | N/A | 0.001 | 50 ms | 4838 ms | 1942 KB | 64 |
| home-blog | desktop | 94/100 | 1058 ms | N/A | 0.076 | 51 ms | 908 ms | 1923 KB | 64 |
| home-directors | mobile | 60/100 | 7642 ms | N/A | 0.001 | 49 ms | 4362 ms | 2279 KB | 70 |
| home-directors | desktop | 93/100 | 1096 ms | N/A | 0.076 | 50 ms | 967 ms | 2279 KB | 70 |
| home-contact | mobile | 59/100 | 8940 ms | N/A | 0.001 | 50 ms | 4240 ms | 2214 KB | 121 |
| home-contact | desktop | 82/100 | 2436 ms | N/A | 0.076 | 51 ms | 887 ms | 2179 KB | 125 |
| home-volunteer | mobile | 61/100 | 7366 ms | N/A | 0.001 | 50 ms | 4435 ms | 1785 KB | 57 |
| home-volunteer | desktop | 95/100 | 1010 ms | N/A | 0.076 | 49 ms | 891 ms | 1785 KB | 57 |
| home-not-a-real-page-baseline-404-check | mobile | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| home-not-a-real-page-baseline-404-check | desktop | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

Raw per-run Lighthouse JSON for every page/device/run is saved under `performance/results/`.
INP is Lighthouse's lab-simulated `interaction-to-next-paint` audit — it requires a scripted interaction to produce a real value; expect `N/A` on a plain navigation and treat the CrUX field snapshot (see `performance/run-crux.js`) as the real INP source.

