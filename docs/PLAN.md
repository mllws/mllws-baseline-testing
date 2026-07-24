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

**Baseline captured 2026-07-24** — `accessibility/pa11y-ci.json` (pa11y 7.0.0, axe-core 4.12.1 runner, WCAG2AA) + `accessibility/run-accessibility.js` (adds Lighthouse 11.7.1 accessibility category as cross-check) built and run live against the 7 URLs scoped for this baseline: homepage, About, Blog, Our Team, Contact, Volunteer, and a 404 page. Run with `npm run a11y:pa11y-ci` (config only) or `npm run a11y:run` (full pa11y + Lighthouse pass, writes results + this table). Full results: [`reports/accessibility-baseline.md`](../reports/accessibility-baseline.md); raw JSON per page per tool in `accessibility/results/`.

| Page | pa11y errors | Lighthouse a11y |
|---|---|---|
| Homepage | 37 | 43/100 |
| About | 38 | 46/100 |
| Blog | 70 | 43/100 |
| Our Team | 132 | 46/100 |
| Contact | 56 | 66/100 |
| Volunteer | 38 | 46/100 |
| 404 page | 1 | N/A — `ERRORED_DOCUMENT_REQUEST` |

Findings:
- **404 page — Lighthouse can't score it.** pa11y handles the 404 page fine (1 error). Lighthouse can't: by default it treats any non-2xx main document response as fatal (`ERRORED_DOCUMENT_REQUEST`) and returns a null accessibility score rather than actually scoring the page. The report records this as `N/A`, not a misleading `0/100`. This will stay `N/A` on every future run unless the 404 target is swapped for a URL that returns 200 with 404-styled content.
- **Dominant issue categories.** Aggregate axe rule counts across all 7 pages (`accessibility/results/*.pa11y.json`): `color-contrast` 112, `listitem` (`<li>` not inside `<ul>`/`<ol>`) 109, `link-name` (links with no discernible text) 92, `link-in-text-block` 29, `button-name` 7, `html-has-lang` 7, `list` 7, `meta-viewport` 6. Color-contrast, listitem, and link-name together are ~90% of all errors — the headline issue for the Phase 6 report, not the smaller (but real) `html-has-lang`/`meta-viewport` findings.
- **Site-wide:** every page's `<html>` element is missing a `lang` attribute (WCAG 3.1.1), and 6 of 7 pages (all but the 404 template) disable pinch-zoom via `user-scalable=0`/`maximum-scale=1.0` in their viewport meta (WCAG 1.4.4).
- **Reproducibility check:** rerunning the script on a different day against the same 7 URLs produced identical error counts and scores — confirms the tooling is stable enough for the v2 diff this baseline exists for.

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
