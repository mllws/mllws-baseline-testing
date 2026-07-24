#!/usr/bin/env node
// Captures a full-page Playwright screenshot of every URL in ux-config.json at each
// scoped viewport width (375/768/1440), saves them under ux/screenshots/<slug>/, and
// writes an index of every image to reports/ux-screenshots.md. Reused verbatim for the
// v2 comparison (pixel-diff each matching page/width pair).

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const CONFIG_PATH = path.join(__dirname, 'ux-config.json');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'ux-screenshots.md');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { urls, screenshotWidths } = config;

function slugFor(url) {
  const u = new URL(url);
  if (u.pathname === '/' || u.pathname === '') return 'homepage';
  return u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-').toLowerCase();
}

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const browser = await chromium.launch();
  const rows = [];

  try {
    for (const url of urls) {
      const slug = slugFor(url);
      const pageDir = path.join(SCREENSHOTS_DIR, slug);
      fs.mkdirSync(pageDir, { recursive: true });

      for (const width of screenshotWidths) {
        process.stdout.write(`Screenshotting (${width}px): ${url}\n`);
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.goto(url, { waitUntil: 'networkidle' });
        const filePath = path.join(pageDir, `${width}px.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        await page.close();
        rows.push({ slug, url, width, filePath: path.relative(path.join(__dirname, '..'), filePath) });
      }
    }
  } finally {
    await browser.close();
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('# UX screenshot archive — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push(`**Tool:** Playwright ${require('playwright/package.json').version}, full-page screenshots at ${screenshotWidths.join('px / ')}px`);
  lines.push(`**Config:** [ux/ux-config.json](../ux/ux-config.json)`);
  lines.push(`**Script:** [ux/run-screenshots.js](../ux/run-screenshots.js)`);
  lines.push('');
  lines.push('| Page | Width | Screenshot |');
  lines.push('|---|---|---|');
  for (const row of rows) {
    lines.push(`| ${row.slug} | ${row.width}px | [${path.basename(row.filePath)}](../${row.filePath}) |`);
  }
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n');
  process.stdout.write(`\nReport written to ${REPORT_PATH}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
