#!/usr/bin/env node
// Scripted Playwright walkthrough of the conversion-flow proxy locked in docs/PLAN.md
// Phase 1 (Contact + Volunteer — the site has no functional form anywhere). Records
// step-by-step timing + pass/fail to ux/results/flow-run.json and writes the log to
// reports/ux-flow.md. Reused verbatim for v2 once a real conversion flow exists.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const CONFIG_PATH = path.join(__dirname, 'ux-config.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'ux-flow.md');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const CONTACT_URL = config.urls.find((u) => u.includes('/Home/contact'));
const VOLUNTEER_URL = config.urls.find((u) => u.includes('/Home/volunteer'));

async function timedStep(name, fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    return { name, status: 'pass', durationMs: Date.now() - start, detail: detail || null };
  } catch (err) {
    return { name, status: 'fail', durationMs: Date.now() - start, detail: err.message };
  }
}

async function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const steps = [];

  try {
    steps.push(
      await timedStep('load contact page', async () => {
        const response = await page.goto(CONTACT_URL, { waitUntil: 'networkidle' });
        if (!response || !response.ok()) throw new Error(`non-ok response: ${response && response.status()}`);
        return `HTTP ${response.status()}`;
      })
    );

    steps.push(
      await timedStep('mailto: link present', async () => {
        const href = await page.locator('a[href^="mailto:"]').first().getAttribute('href');
        if (!href) throw new Error('no mailto: link found');
        return href;
      })
    );

    steps.push(
      await timedStep('tel: link present', async () => {
        const href = await page.locator('a[href^="tel:"]').first().getAttribute('href');
        if (!href) throw new Error('no tel: link found');
        return href;
      })
    );

    steps.push(
      await timedStep('load volunteer page', async () => {
        const response = await page.goto(VOLUNTEER_URL, { waitUntil: 'networkidle' });
        if (!response || !response.ok()) throw new Error(`non-ok response: ${response && response.status()}`);
        return `HTTP ${response.status()}`;
      })
    );

    steps.push(
      await timedStep('"Join us!" button visible', async () => {
        const locator = page.locator('a.join-us');
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        return await locator.textContent();
      })
    );

    steps.push(
      await timedStep('"Join us!" click does not submit/navigate (known gap)', async () => {
        const stripHash = (url) => url.split('#')[0];
        const before = stripHash(page.url());
        await page.locator('a.join-us').click();
        await page.waitForTimeout(500);
        const after = stripHash(page.url());
        if (after !== before) throw new Error(`unexpectedly navigated to ${after}`);
        return 'stayed on volunteer page (href="#" only appends a hash) — confirms dead link, no functional conversion flow';
      })
    );
  } finally {
    await browser.close();
  }

  const date = new Date().toISOString().slice(0, 10);
  const passed = steps.filter((s) => s.status === 'pass').length;
  const runResult = { date, contactUrl: CONTACT_URL, volunteerUrl: VOLUNTEER_URL, steps };
  fs.writeFileSync(path.join(RESULTS_DIR, 'flow-run.json'), JSON.stringify(runResult, null, 2));

  const lines = [];
  lines.push('# UX conversion-flow walkthrough — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push(`**Tool:** Playwright ${require('playwright/package.json').version}`);
  lines.push(`**Config:** [ux/ux-config.json](../ux/ux-config.json)`);
  lines.push(`**Script:** [ux/run-flow.js](../ux/run-flow.js)`);
  lines.push('');
  lines.push(
    '**Context (from docs/PLAN.md Phase 1):** the site has no `<form>` anywhere. Contact + Volunteer are locked in as the conversion-flow proxy so the gap is measured, not skipped — the final step below is expected to "pass" by confirming the dead link, not by completing a real conversion.'
  );
  lines.push('');
  lines.push(`**Result:** ${passed}/${steps.length} steps passed`);
  lines.push('');
  lines.push('| Step | Status | Duration | Detail |');
  lines.push('|---|---|---|---|');
  for (const step of steps) {
    lines.push(`| ${step.name} | ${step.status === 'pass' ? 'pass' : 'FAIL'} | ${step.durationMs} ms | ${step.detail} |`);
  }
  lines.push('');
  lines.push('Raw run JSON: `ux/results/flow-run.json`.');
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n');
  process.stdout.write(`\n${passed}/${steps.length} steps passed. Report written to ${REPORT_PATH}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
