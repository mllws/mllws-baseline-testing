# Issues

Tracked 1:1 in GitHub Issues on `mllws/mllws-baseline-testing`. Each maps to a phase in `docs/PLAN.md`.

---

### 1. Lock baseline testing scope (pages & flows)
**Labels:** scope
Confirm and record the fixed URL list: homepage, 2–3 highest-value content pages, 1 conversion-critical flow, 404 page. Must be locked before any tooling runs — same URLs every time or the v2 comparison breaks.

**Acceptance criteria**
- [x] Final URL list agreed and written into `docs/PLAN.md`
- [x] Conversion flow identified (signup / contact / checkout / newsletter — whichever is primary) — see `docs/PLAN.md` Phase 1: site has no functional form anywhere; Contact + Volunteer pages locked as the flow proxy and the gap recorded as a baseline finding

---

### 2. Set up accessibility baseline tooling
**Labels:** accessibility
Add `pa11y-ci` config (axe or HTML_CodeSniffer runner, WCAG2AA) for all scoped URLs, plus a Lighthouse accessibility run as cross-check. Save JSON output per page.

**Acceptance criteria**
- [x] `pa11y-ci` config committed and runnable — `accessibility/pa11y-ci.json`, run via `npm run a11y:pa11y-ci`
- [x] Lighthouse accessibility score captured per page — `accessibility/run-accessibility.js`, run via `npm run a11y:run`; 404 page is a known `N/A` (Lighthouse treats non-2xx as fatal), see `docs/PLAN.md` Phase 2
- [x] Results recorded (issue counts by severity + Lighthouse score) in `reports/` — `reports/accessibility-baseline.md`

---

### 3. Set up performance baseline tooling
**Labels:** performance
Lighthouse CLI/CI (median of 3 runs, mobile + desktop throttled), PageSpeed Insights API pull for CrUX field data, WebPageTest API cross-check.

**Acceptance criteria**
- [ ] Lighthouse CI config committed
- [ ] LCP, INP, CLS, TTFB, FCP, page weight, request count captured per page/device
- [ ] CrUX snapshot captured if available

---

### 4. Set up UX baseline tooling
**Labels:** ux
Lighthouse Best Practices + SEO scores; Playwright script for responsive screenshots (375/768/1440px); Playwright script for scripted conversion-flow walkthrough.

**Acceptance criteria**
- [ ] Screenshot script committed, screenshot archive saved
- [ ] Flow script committed, step timing + pass/fail log captured
- [ ] Lighthouse BP/SEO scores recorded per page

---

### 5. Set up load testing baseline
**Labels:** load
k6 or Artillery script: ramp 0→N virtual users over a fixed period against homepage + conversion flow, run during low-traffic hours or against a staging clone.

**Acceptance criteria**
- [ ] Load script committed
- [ ] p50/p95/p99, error rate, throughput, degradation point recorded

---

### 6. Compile baseline report
**Labels:** reporting
One report, four sections (accessibility / performance / UX / load), one row per page/flow. Include date, tool + version, raw scores, links to every script/config used, and the screenshot set.

**Acceptance criteria**
- [ ] Report published in `reports/`
- [ ] All scripts/configs referenced are committed and reusable verbatim for v2

---

### 7. Decide CI / re-run cadence
**Labels:** ci, question
Decide whether Lighthouse CI / pa11y-ci should run on a schedule (e.g. GitHub Actions) ahead of v2 milestones, per the plan's suggested cadence (performance + accessibility re-run at major pre-v2 milestones).

**Acceptance criteria**
- [ ] Decision recorded in `docs/STACK.md`
- [ ] Workflow added if the answer is yes

---

### 8. (Future) Add playwright-axe to E2E suite
**Labels:** future, accessibility
Once E2E tests exist, add `playwright-axe` (axe-core via Playwright) for per-component/per-page checks at PR time, complementing (not replacing) the `pa11y-ci` baseline.

**Acceptance criteria**
- [ ] Tracked as backlog — not blocking the baseline pass
