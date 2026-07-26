# Baseline report — motherlanguagelovers.com v1

**Compiled:** 2026-07-26
**Scope:** 7 locked URLs (docs/PLAN.md Phase 1) — homepage, About, Blog, Our Team, Contact, Volunteer, 404 page
**Headline finding:** the site has no functional conversion flow — zero `<form>` tags anywhere. Contact (`mailto:`/`tel:` links only) and Volunteer (dead "Join us!" button, `href="#"`) are locked in as the conversion-flow proxy so this gap is measured rather than skipped. See docs/PLAN.md Phase 1.

## 1. Accessibility

**Date:** 2026-07-26
**Tools:** pa11y 7.0.0 (axe-core 4.12.1 runner, WCAG2AA) · Lighthouse 11.7.1 (accessibility category)
**Config:** [accessibility/pa11y-ci.json](../accessibility/pa11y-ci.json)
**Script:** [accessibility/run-accessibility.js](../accessibility/run-accessibility.js)

| Page | URL | pa11y errors | pa11y warnings | pa11y notices | Lighthouse a11y score | Raw results |
|---|---|---|---|---|---|---|
| homepage | https://www.motherlanguagelovers.com/ | 37 | 0 | 0 | 43/100 | [pa11y](../accessibility/results/homepage.pa11y.json) / [lighthouse](../accessibility/results/homepage.lighthouse.json) |
| home-about | https://www.motherlanguagelovers.com/Home/about | 38 | 0 | 0 | 46/100 | [pa11y](../accessibility/results/home-about.pa11y.json) / [lighthouse](../accessibility/results/home-about.lighthouse.json) |
| home-blog | https://www.motherlanguagelovers.com/Home/blog | 70 | 0 | 0 | 43/100 | [pa11y](../accessibility/results/home-blog.pa11y.json) / [lighthouse](../accessibility/results/home-blog.lighthouse.json) |
| home-directors | https://www.motherlanguagelovers.com/Home/directors | 132 | 0 | 0 | 46/100 | [pa11y](../accessibility/results/home-directors.pa11y.json) / [lighthouse](../accessibility/results/home-directors.lighthouse.json) |
| home-contact | https://www.motherlanguagelovers.com/Home/contact | 56 | 0 | 0 | 66/100 | [pa11y](../accessibility/results/home-contact.pa11y.json) / [lighthouse](../accessibility/results/home-contact.lighthouse.json) |
| home-volunteer | https://www.motherlanguagelovers.com/Home/volunteer | 38 | 0 | 0 | 46/100 | [pa11y](../accessibility/results/home-volunteer.pa11y.json) / [lighthouse](../accessibility/results/home-volunteer.lighthouse.json) |
| home-not-a-real-page-baseline-404-check | https://www.motherlanguagelovers.com/Home/not-a-real-page-baseline-404-check | 1 | 0 | 0 | N/A (ERRORED_DOCUMENT_REQUEST) | [pa11y](../accessibility/results/home-not-a-real-page-baseline-404-check.pa11y.json) / [lighthouse](../accessibility/results/home-not-a-real-page-baseline-404-check.lighthouse.json) |


## 2. Performance

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

**Date:** 2026-07-26
**Source:** PageSpeed Insights v5 API (`loadingExperience` / `originLoadingExperience`, CrUX-backed)
**Script:** [performance/run-crux.js](../performance/run-crux.js)

| Page | Device | Overall | LCP (p75) | INP (p75) | CLS (p75) | FCP (p75) |
|---|---|---|---|---|---|---|
| homepage | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/ (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| homepage | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/ (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-about | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/about (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-about | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/about (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-blog | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/blog (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-blog | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/blog (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-directors | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/directors (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-directors | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/directors (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-contact | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/contact (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-contact | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/contact (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-volunteer | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/volunteer (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-volunteer | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/volunteer (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-not-a-real-page-baseline-404-check | mobile | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/not-a-real-page-baseline-404-check (mobile): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |
| home-not-a-real-page-baseline-404-check | desktop | no CrUX data (PSI 429 for https://www.motherlanguagelovers.com/Home/not-a-real-page-baseline-404-check (desktop): Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.) | — | — | — | — |


## 3. UX

**Date:** 2026-07-26
**Tool:** Lighthouse 11.7.1 (best-practices + seo categories)
**Config:** [ux/ux-config.json](../ux/ux-config.json)
**Script:** [ux/run-lighthouse-bp-seo.js](../ux/run-lighthouse-bp-seo.js)

| Page | URL | Best Practices | SEO | Raw results |
|---|---|---|---|---|
| homepage | https://www.motherlanguagelovers.com/ | 78/100 | 90/100 | [lighthouse](../ux/results/homepage.lighthouse.json) |
| home-about | https://www.motherlanguagelovers.com/Home/about | 78/100 | 100/100 | [lighthouse](../ux/results/home-about.lighthouse.json) |
| home-blog | https://www.motherlanguagelovers.com/Home/blog | 100/100 | 93/100 | [lighthouse](../ux/results/home-blog.lighthouse.json) |
| home-directors | https://www.motherlanguagelovers.com/Home/directors | 96/100 | 100/100 | [lighthouse](../ux/results/home-directors.lighthouse.json) |
| home-contact | https://www.motherlanguagelovers.com/Home/contact | 96/100 | 99/100 | [lighthouse](../ux/results/home-contact.lighthouse.json) |
| home-volunteer | https://www.motherlanguagelovers.com/Home/volunteer | 100/100 | 93/100 | [lighthouse](../ux/results/home-volunteer.lighthouse.json) |
| home-not-a-real-page-baseline-404-check | https://www.motherlanguagelovers.com/Home/not-a-real-page-baseline-404-check | N/A | N/A | [lighthouse](../ux/results/home-not-a-real-page-baseline-404-check.lighthouse.json) |

**Date:** 2026-07-26
**Tool:** Playwright 1.61.1, full-page screenshots at 375px / 768px / 1440px
**Config:** [ux/ux-config.json](../ux/ux-config.json)
**Script:** [ux/run-screenshots.js](../ux/run-screenshots.js)

| Page | Width | Screenshot |
|---|---|---|
| homepage | 375px | [375px.png](../ux/screenshots/homepage/375px.png) |
| homepage | 768px | [768px.png](../ux/screenshots/homepage/768px.png) |
| homepage | 1440px | [1440px.png](../ux/screenshots/homepage/1440px.png) |
| home-about | 375px | [375px.png](../ux/screenshots/home-about/375px.png) |
| home-about | 768px | [768px.png](../ux/screenshots/home-about/768px.png) |
| home-about | 1440px | [1440px.png](../ux/screenshots/home-about/1440px.png) |
| home-blog | 375px | [375px.png](../ux/screenshots/home-blog/375px.png) |
| home-blog | 768px | [768px.png](../ux/screenshots/home-blog/768px.png) |
| home-blog | 1440px | [1440px.png](../ux/screenshots/home-blog/1440px.png) |
| home-directors | 375px | [375px.png](../ux/screenshots/home-directors/375px.png) |
| home-directors | 768px | [768px.png](../ux/screenshots/home-directors/768px.png) |
| home-directors | 1440px | [1440px.png](../ux/screenshots/home-directors/1440px.png) |
| home-contact | 375px | [375px.png](../ux/screenshots/home-contact/375px.png) |
| home-contact | 768px | [768px.png](../ux/screenshots/home-contact/768px.png) |
| home-contact | 1440px | [1440px.png](../ux/screenshots/home-contact/1440px.png) |
| home-volunteer | 375px | [375px.png](../ux/screenshots/home-volunteer/375px.png) |
| home-volunteer | 768px | [768px.png](../ux/screenshots/home-volunteer/768px.png) |
| home-volunteer | 1440px | [1440px.png](../ux/screenshots/home-volunteer/1440px.png) |
| home-not-a-real-page-baseline-404-check | 375px | [375px.png](../ux/screenshots/home-not-a-real-page-baseline-404-check/375px.png) |
| home-not-a-real-page-baseline-404-check | 768px | [768px.png](../ux/screenshots/home-not-a-real-page-baseline-404-check/768px.png) |
| home-not-a-real-page-baseline-404-check | 1440px | [1440px.png](../ux/screenshots/home-not-a-real-page-baseline-404-check/1440px.png) |

**Date:** 2026-07-26
**Tool:** Playwright 1.61.1
**Config:** [ux/ux-config.json](../ux/ux-config.json)
**Script:** [ux/run-flow.js](../ux/run-flow.js)

**Context (from docs/PLAN.md Phase 1):** the site has no `<form>` anywhere. Contact + Volunteer are locked in as the conversion-flow proxy so the gap is measured, not skipped — the final step below is expected to "pass" by confirming the dead link, not by completing a real conversion.

**Result:** 6/6 steps passed

| Step | Status | Duration | Detail |
|---|---|---|---|
| load contact page | pass | 1943 ms | HTTP 200 |
| mailto: link present | pass | 31 ms | mailto:contact@motherlanguagelovers.com |
| tel: link present | pass | 2 ms | tel:+17789874084 |
| load volunteer page | pass | 1434 ms | HTTP 200 |
| "Join us!" button visible | pass | 26 ms | Join us! |
| "Join us!" click does not submit/navigate (known gap) | pass | 1515 ms | stayed on volunteer page (href="#" only appends a hash) — confirms dead link, no functional conversion flow |

Raw run JSON: `ux/results/flow-run.json`.


## 4. Load

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


## Screenshot set

21 screenshots captured under `ux/screenshots/` (375px / 768px / 1440px per page, run `npm run ux:screenshots` to regenerate).

## Scripts & configs (reused verbatim for v2)

- [accessibility/pa11y-ci.json](../accessibility/pa11y-ci.json)
- [accessibility/run-accessibility.js](../accessibility/run-accessibility.js)
- [performance/lighthouse-config.json](../performance/lighthouse-config.json)
- [performance/run-performance.js](../performance/run-performance.js)
- [performance/run-crux.js](../performance/run-crux.js)
- [ux/ux-config.json](../ux/ux-config.json)
- [ux/run-lighthouse-bp-seo.js](../ux/run-lighthouse-bp-seo.js)
- [ux/run-screenshots.js](../ux/run-screenshots.js)
- [ux/run-flow.js](../ux/run-flow.js)
- [load/load-config.json](../load/load-config.json)
- [load/load-test.js](../load/load-test.js)
- [load/analyze-load-results.js](../load/analyze-load-results.js)
