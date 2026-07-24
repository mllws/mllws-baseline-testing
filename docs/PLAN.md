# Project Plan

Source of truth: [`baseline-testing-plan.md`](../baseline-testing-plan.md), copied from `mllws-website`. This document turns that plan into repo phases and deliverables.

## Goal

Produce a documented, repeatable baseline (accessibility, performance, UX, load) for `www.motherlanguagelovers.com` v1, using automated/scriptable tools only, so v2 can be diffed against fixed numbers instead of impressions.

## Out of scope (this pass)

- Manual/heuristic UX review
- Testing `mllws-website.vercel.app` (excluded as an incidental preview build, unless it becomes v2 staging)
- Writing any test scripts/configs — this phase is scaffold + plan only, no code

## Phases

### Phase 0 — Repo scaffold (this pass)
- Folder structure for each dimension (`accessibility/`, `performance/`, `ux/`, `load/`, `reports/`)
- `docs/PLAN.md`, `docs/STACK.md`, `docs/ISSUES.md`
- GitHub issues opened for every phase below

### Phase 1 — Lock scope
- Confirm final URL list: homepage, 2–3 top content pages, 1 conversion flow, 404 page
- Record the list in `docs/PLAN.md` (append once confirmed) so every later run targets identical URLs

**Locked 2026-07-20** — verified live (curl status codes + fetched HTML) against `www.motherlanguagelovers.com`:

| Role | URL | Notes |
|---|---|---|
| Homepage | `https://www.motherlanguagelovers.com/` | |
| Content page 1 | `https://www.motherlanguagelovers.com/Home/about` | About Us |
| Content page 2 | `https://www.motherlanguagelovers.com/Home/blog` | Blog listing (3 posts + sidebar recent posts) |
| Content page 3 | `https://www.motherlanguagelovers.com/Home/directors` | Our Team |
| Conversion flow (part 1) | `https://www.motherlanguagelovers.com/Home/contact` | Static contact info only — address, email (`mailto:`), phone, social links |
| Conversion flow (part 2) | `https://www.motherlanguagelovers.com/Home/volunteer` | Has a "Join us!" button but it links to `href="#"` |
| 404 page | `https://www.motherlanguagelovers.com/Home/<any-invalid-slug>` | Returns real HTTP 404 (verified via curl), default ASP.NET "resource cannot be found" error page — not a custom-designed 404 |

**Finding — no functional conversion flow exists on the site.** Checked raw HTML of the homepage, Contact, and Volunteer pages: there are zero `<form>` tags anywhere on the site. No signup, checkout, donation, or newsletter mechanism exists. The only conversion-adjacent elements are:
- Contact page: a `mailto:contact@motherlanguagelovers.com` link and a phone number — no form.
- Volunteer page: a "Join us!" button (`<a href="#" class="join-us">`) that goes nowhere — a dead link.

Both pages are locked into scope as the conversion-flow proxy so this gap is captured rather than papered over. The Phase 4 Playwright "flow script" (see below) should assert the actual current behavior — page loads, `mailto:`/`tel:` links present and correct, "Join us!" click does not navigate/submit anything — and this absence of a working flow should be called out as the headline finding in the Phase 6 baseline report, since it blocks any real signup/contact/checkout/newsletter UX or load testing until v2 adds one.

### Phase 2 — Accessibility baseline
- `pa11y-ci` config (axe or HTML_CodeSniffer runner, WCAG2AA) across scoped URLs, JSON output per page
- Lighthouse accessibility audit per page as cross-check
- Record: pa11y issue counts by severity, Lighthouse accessibility score

**Tooling set up 2026-07-24** — `accessibility/pa11y-ci.json` (pa11y 7.0.0, axe-core 4.12.1 runner, WCAG2AA) + `accessibility/run-accessibility.js` (adds Lighthouse 11.7.1 accessibility category as cross-check) committed, covering the 7 URLs scoped for this baseline: homepage, About, Blog, Our Team, Contact, Volunteer, and a 404 page. Verified runnable (`npm run a11y:pa11y-ci` for the config alone, `npm run a11y:run` for the full pa11y + Lighthouse pass, which saves per-page JSON to `accessibility/results/` and writes `reports/accessibility-baseline.md`) — this phase is scaffolding only, the actual baseline run and recorded results are a separate pass.

### Phase 3 — Performance baseline
- Lighthouse CLI/CI, 3 runs per page per device preset (mobile/desktop throttled), take median
- PageSpeed Insights API pull for CrUX field data (if available)
- Record: LCP, INP, CLS, TTFB, FCP, page weight, request count per page/device

**Tooling set up 2026-07-24** — `performance/lighthouse-config.json` (same 7 locked URLs, 3 runs/page/device, mobile + desktop) + `performance/run-performance.js` (Lighthouse 11.7.1 `performance` category; mobile uses Lighthouse's default throttled-mobile preset, desktop uses its bundled `desktop-config.js`; captures score, LCP, INP, CLS, TTFB, FCP, page weight, request count; medians across 3 runs) + `performance/run-crux.js` (PageSpeed Insights v5 pull for CrUX field data per URL/device, no API key required) committed. Verified runnable locally (`npm run perf:run`, `npm run perf:crux`) — this phase is scaffolding only, no baseline numbers were saved. WebPageTest cross-check deferred pending an API key (see `performance/README.md`).

### Phase 4 — UX baseline (automated proxies only)
- Lighthouse Best Practices + SEO scores per page
- Playwright script: screenshots at 375px / 768px / 1440px per scoped page
- Playwright script: scripted run of the conversion flow (step timing + pass/fail)

**Tooling set up 2026-07-24** — `ux/ux-config.json` (same 7 locked URLs, screenshot widths) + `ux/run-screenshots.js` (Playwright 1.61.1 full-page screenshot per URL per width, saved to `ux/screenshots/`) + `ux/run-flow.js` (Playwright walkthrough of the Contact + Volunteer conversion-flow proxy — loads each page, checks `mailto:`/`tel:` links, clicks "Join us!" and asserts it doesn't navigate, confirming the known dead-link gap — step timing + pass/fail to `ux/results/flow-run.json`) + `ux/run-lighthouse-bp-seo.js` (Lighthouse 11.7.1 best-practices + seo categories per URL) committed. Verified runnable locally (`npm run ux:screenshots`, `npm run ux:flow`, `npm run ux:lighthouse`) — this phase is scaffolding only, no screenshots or baseline numbers were saved.

### Phase 5 — Load testing baseline
- k6 or Artillery script: ramp 0→N virtual users hitting homepage + conversion flow
- Run during low-traffic hours or against a staging clone
- Record: p50/p95/p99 response time, error rate, throughput, degradation point

### Phase 6 — Baseline report
- Single report, one section per dimension, one row per page/flow
- Attach all scripts/configs used (reused verbatim for v2) and the screenshot archive

### Phase 7 — v2 comparison (future)
- Rerun the same scripts against v2
- Delta table baseline vs. v2 per metric per page
- Pixel-diff the screenshot sets
- Flag regressions before calling v2 done

## Cadence

Full baseline once now. Performance + accessibility re-run at any major pre-v2 milestone.

## Deliverables checklist

- [x] Scope URL list locked
- [x] Accessibility baseline report
- [ ] Performance baseline report
- [ ] UX baseline report + screenshot archive
- [ ] Load test baseline report
- [ ] Combined baseline report (all 4 dimensions)
- [ ] All scripts/configs committed for verbatim v2 reuse
