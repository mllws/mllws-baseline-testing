# UX conversion-flow walkthrough — motherlanguagelovers.com v1

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

