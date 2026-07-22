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

**Test cases drafted 2026-07-22** — checked live markup (curl) against the 7 Phase 1 URLs ahead of writing `accessibility/pa11y-ci.json`, so config coverage and expected findings are pinned down before the tooling is built. Runner: axe. Standard: WCAG2AA.

Coverage matrix — every locked URL gets both tools:

| # | Page | pa11y-ci (axe, WCAG2AA) | Lighthouse a11y |
|---|---|---|---|
| 1 | Homepage `/` | ✓ | ✓ |
| 2 | About `/Home/about` | ✓ | ✓ |
| 3 | Blog `/Home/blog` | ✓ | ✓ |
| 4 | Our Team `/Home/directors` | ✓ | ✓ |
| 5 | Contact `/Home/contact` | ✓ | ✓ |
| 6 | Volunteer `/Home/volunteer` | ✓ | ✓ |
| 7 | 404 page | ✓ | ✓ |

Tooling-setup test cases:

| ID | Test case | Pass criteria |
|---|---|---|
| TC-A01 | `accessibility/pa11y-ci.json` lists all 7 URLs above, runner `axe`, standard `WCAG2AA` | `pa11y-ci` exits and produces one result block per URL |
| TC-A02 | Each pa11y-ci run's JSON output is saved per page | 7 files in `accessibility/results/`, each valid JSON with an `issues` array |
| TC-A03 | Lighthouse CLI accessibility category run executes per URL | 7 Lighthouse JSON reports saved to `accessibility/results/`, each with a 0–100 `accessibility` score |
| TC-A04 | 404 page is included in both tool runs despite returning HTTP 404 | Neither tool treats the 404 status as a hard failure/skip — config explicitly allows testing error-status pages |
| TC-A05 | Aggregated results written to `reports/` | One row per page: pa11y issue counts by severity (error/warning/notice) + Lighthouse score — matches Issue 2 acceptance criteria |

Known-findings test cases — verified manually via curl, expected to be reproduced once the tooling runs (treat as regression checks, and as the first real content for the Phase 6 report rather than surprises):

| ID | Test case | Verified finding | Expected tool result |
|---|---|---|---|
| TC-A06 | `<html>` element declares a `lang` attribute | All 7 pages (homepage, About, Blog, Directors, Contact, Volunteer, 404) render `<html>` with no `lang` attribute at all | pa11y-ci reports a WCAG 3.1.1 (Level A) `html-has-lang` error on every page |
| TC-A07 | Viewport meta does not disable pinch-zoom | Homepage and the 6 template-sharing pages set `user-scalable=0` and `maximum-scale=1.0`; the 404 page (IIS default error template) uses a plain `width=device-width` viewport and does **not** have this problem | axe's `meta-viewport` rule fails under WCAG 2AA (1.4.4 Resize Text) on the 6 templated pages; the 404 page should pass this specific rule |
| TC-A08 | `<img>` elements carry meaningful alt text | All 15 `<img>` tags on the homepage have an `alt` attribute present (not empty-checked — curl can't judge text quality) | pa11y won't flag missing-alt on the homepage; empty/non-descriptive alt text needs a manual spot-check once axe results are in — not a predicted pass or fail |

TC-A01–A05 confirm the tooling itself works once built; TC-A06–A07 are known defects the config should surface, not new discoveries; TC-A08 is a flagged manual follow-up, not an automated pass/fail.

**Baseline captured 2026-07-22** — `accessibility/pa11y-ci.json` + `accessibility/run-accessibility.js` built and run live against all 7 URLs (pa11y 7.0.0 / axe-core 4.12.1, Lighthouse 11.7.1). Full results: [`reports/accessibility-baseline.md`](../reports/accessibility-baseline.md); raw JSON per page per tool in `accessibility/results/`.

| Page | pa11y errors | Lighthouse a11y |
|---|---|---|
| Homepage | 37 | 43/100 |
| About | 38 | 46/100 |
| Blog | 70 | 43/100 |
| Our Team | 132 | 46/100 |
| Contact | 56 | 66/100 |
| Volunteer | 38 | 46/100 |
| 404 page | 1 | N/A — `ERRORED_DOCUMENT_REQUEST` |

Test case outcomes:
- **TC-A01–A03, A05 — pass as designed.** Config runs, 14 JSON files (7 pages × 2 tools) saved to `accessibility/results/`, `reports/accessibility-baseline.md` aggregates severity counts + scores.
- **TC-A04 — partially wrong, corrected.** pa11y handles the 404 page fine (1 error). Lighthouse does **not**: by default it treats any non-2xx main document response as fatal (`ERRORED_DOCUMENT_REQUEST`) and returns a null accessibility score instead of scoring the page. This is real Lighthouse behavior, not a script bug — the report records it as `N/A` rather than a misleading `0/100`. Note for Phase 6: the 404 page will always be Lighthouse-`N/A` unless the target URL is swapped for one that returns 200 with 404-styled content.
- **TC-A06 — confirmed.** `html-has-lang` fires on every one of the 7 pages, exactly as predicted.
- **TC-A07 — confirmed.** `meta-viewport` (zoom disabled) fires on the 6 templated pages; the 404 page's default IIS viewport meta doesn't trigger it.
- **New finding, not predicted.** Aggregate rule counts across all 7 pages (`accessibility/results/*.pa11y.json`): `color-contrast` 112, `listitem` (`<li>` not inside `<ul>`/`<ol>`) 109, `link-name` (links with no discernible text) 92, `link-in-text-block` 29, `button-name` 7, `html-has-lang` 7, `list` 7, `meta-viewport` 6. The predicted lang/viewport issues (TC-A06/A07) are real but minor — color-contrast, listitem, and link-name together are ~90% of all errors and are the dominant issue category for the Phase 6 report.
- **TC-A08 — still open.** Not re-verified this pass; axe doesn't flag missing alt text on the homepage's 15 images, but text quality wasn't spot-checked.

### Phase 3 — Performance baseline
- Lighthouse CLI/CI, 3 runs per page per device preset (mobile/desktop throttled), take median
- PageSpeed Insights API pull for CrUX field data (if available)
- Record: LCP, INP, CLS, TTFB, FCP, page weight, request count per page/device

### Phase 4 — UX baseline (automated proxies only)
- Lighthouse Best Practices + SEO scores per page
- Playwright script: screenshots at 375px / 768px / 1440px per scoped page
- Playwright script: scripted run of the conversion flow (step timing + pass/fail)

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
