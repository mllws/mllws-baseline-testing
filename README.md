# mllws-baseline-testing

Automated baseline testing (accessibility, performance, UX, load) for `www.motherlanguagelovers.com` v1 — establishing fixed, repeatable numbers so v2 can be measured against them.

Source plan: [`baseline-testing-plan.md`](./baseline-testing-plan.md) (copied from `mllws-website`).

## Docs

- [`docs/PLAN.md`](./docs/PLAN.md) — phased project plan
- [`docs/STACK.md`](./docs/STACK.md) — tooling per dimension
- [`docs/ISSUES.md`](./docs/ISSUES.md) — issue tracker mirror

## Layout

```
accessibility/   pa11y-ci + Lighthouse accessibility runs
performance/     Lighthouse CI, PSI/CrUX, WebPageTest
ux/              Lighthouse BP/SEO, Playwright screenshots + flow script
load/            k6/Artillery load test scripts
reports/         Compiled baseline reports
docs/            Plan, stack, issues
```

Status: scaffold only — no test scripts committed yet. See open issues for phased build-out.
