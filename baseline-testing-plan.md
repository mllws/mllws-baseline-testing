# Baseline Testing Plan — motherlanguagelovers.com

**Target:** https://www.motherlanguagelovers.com/ (production, v1)
**Purpose:** Establish a documented baseline across accessibility, performance, UX, and load, so v2 can be measured against fixed, repeatable numbers rather than a vague "it feels faster/better."
**Note on the vercel URL:** mllws-website.vercel.app is treated as incidental (preview build) and excluded from the baseline. If it later becomes v2's staging URL, run the identical suite against it and diff against this baseline.
**Method note:** every dimension below uses automated, scriptable tools only — no manual review, no human judgment calls during the baseline run. Each tool produces a script/config file that gets rerun verbatim against v2, and the numbers do the comparing.

## 1. Scope — pages and flows to test

Testing every dimension against every page is wasteful. Fix a small, representative set up front and reuse it for every future run:

- Homepage (`/`)
- 2–3 highest-traffic or highest-value content pages (blog/article, product/course page, about — whichever exist)
- 1 conversion-critical flow (signup, contact form, checkout, newsletter — whatever the site's primary CTA is)
- 404 page (cheap signal for template/error handling quality)

Lock this list before running anything. Same URLs every time, or the comparison to v2 breaks.

## 2. Accessibility baseline

**Tools:** pa11y / pa11y-ci (primary), Lighthouse accessibility category (cross-check).

- Run `pa11y-ci` with a config file listing all scoped URLs, axe or HTML_CodeSniffer runner, targeting WCAG2AA. Save JSON output per page.
- Run Lighthouse's accessibility audit (via `lighthouse` CLI or Lighthouse CI) on the same pages — it flags some things pa11y doesn't (and vice versa), and gives a 0–100 score pa11y doesn't produce.

**Record:** pa11y issue count by type (error/warning/notice) per page, Lighthouse accessibility score per page.

**Future (post-baseline, during development):** once E2E tests exist, add `playwright-axe` (axe-core via Playwright) for per-component/per-page checks inside the test suite itself — this complements the pa11y-ci baseline rather than replacing it, catching regressions at PR time instead of only at baseline/v2 comparison time.

## 3. Performance baseline

**Tools:** Lighthouse CLI / Lighthouse CI (lab data), PageSpeed Insights API (field data / CrUX), WebPageTest API (third-party waterfall).

**Core Web Vitals to capture per page:**
- LCP (Largest Contentful Paint)
- INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
- FCP (First Contentful Paint)
- Total page weight and request count

**Method:** Run each page 3× via the Lighthouse CLI (lab data is noisy — take the median) on both throttled mobile and desktop presets. Pull CrUX field data via the PageSpeed Insights API for a real-user data point, if the site has enough traffic for CrUX to report.

**Record:** median lab scores + CWV values per page, per device profile, plus the PSI field-data snapshot if available.

## 4. UX baseline (automated proxies only)

Human heuristic review is out of scope per this pass — everything here is captured by script.

- **Lighthouse Best Practices + SEO scores** per page, including its automated checks for tap-target sizing, viewport configuration, and legible font sizes.
- **Scripted responsive screenshot capture:** a Playwright (or Puppeteer) script that visits each scoped page at 3 fixed breakpoints (375px, 768px, 1440px) and saves a screenshot. This is the visual baseline archive — comparison against v2's screenshots later can run through an automated pixel-diff tool (BackstopJS or Percy) rather than manual eyeballing.
- **Scripted flow execution:** a Playwright script that walks the conversion flow end-to-end programmatically, recording step count, per-step load time, and pass/fail (did the form submit, did the expected confirmation render). This replaces a manual timed walkthrough with a synthetic-monitoring-style run that's identical every time.

**Record:** Lighthouse Best Practices/SEO scores per page, tap-target/viewport audit pass-fail, the breakpoint screenshot set (image files, kept for later diffing), and the flow script's execution time + step-by-step pass/fail log.

## 5. Load testing baseline

**Tools:** k6 or Artillery (scriptable, repeatable CI-style runs) — Locust as an alternative if Python is preferred.

**Method:**
- Define a realistic scenario: ramp from 0 to N concurrent virtual users over a fixed period (e.g., 0→100 over 2 minutes, hold 100 for 3 minutes) hitting the homepage + conversion flow.
- Capture: p50/p95/p99 response time, error rate, requests/sec sustained, and the point at which response time or error rate degrades noticeably (breaking point, if reachable without real risk to production).
- Run against production during low-traffic hours to avoid skewing real users' experience, or against a staging clone if one exists.

**Record:** the k6/Artillery script itself (so v2 gets the exact same load pattern), plus the summary report (response time percentiles, error rate, throughput).

## 6. Baseline report structure

One document, four sections (accessibility / performance / UX / load), each page/flow gets its own row of metrics. Store:

- Date of test run
- Tool + version used
- Raw scores/metrics per page
- All four scripts/configs used to generate the numbers (pa11y-ci config, Lighthouse CI config, Playwright screenshot + flow scripts, k6/Artillery script) — reused verbatim for v2
- Screenshot set (UX visual archive)

## 7. Comparing against v2

When v2 ships: rerun the exact same scripts (pa11y-ci config, Lighthouse CI config, Playwright scripts, k6/Artillery script) against v2, then produce a delta table — baseline vs. v2, per metric, per page. Run the screenshot sets through an automated pixel-diff tool for the visual comparison. Flag any regression (lower Lighthouse score, higher LCP, new accessibility violations, failed flow script, slower load-test p95) for follow-up before calling v2 "done."

## Suggested cadence

Run the full automated baseline once now. Re-run performance + accessibility (the fastest, cheapest scripts) at any major pre-v2 milestone, so drift gets caught early rather than discovered all at once at launch.

---
_Source: [mllws-website/baseline-testing-plan.md](https://github.com/mllws/mllws-website/blob/main/baseline-testing-plan.md)_
