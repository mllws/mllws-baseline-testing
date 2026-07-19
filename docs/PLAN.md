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

### Phase 2 — Accessibility baseline
- `pa11y-ci` config (axe or HTML_CodeSniffer runner, WCAG2AA) across scoped URLs, JSON output per page
- Lighthouse accessibility audit per page as cross-check
- Record: pa11y issue counts by severity, Lighthouse accessibility score

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

- [ ] Scope URL list locked
- [ ] Accessibility baseline report
- [ ] Performance baseline report
- [ ] UX baseline report + screenshot archive
- [ ] Load test baseline report
- [ ] Combined baseline report (all 4 dimensions)
- [ ] All scripts/configs committed for verbatim v2 reuse
