#!/usr/bin/env node
// Runs Lighthouse (Best Practices + SEO categories) against every URL in
// ux-config.json, saves one JSON file per page under ux/results/, and writes the
// aggregated score table to reports/ux-baseline.md. Reused verbatim for the v2
// comparison.

const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

const CONFIG_PATH = path.join(__dirname, 'ux-config.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'ux-baseline.md');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { urls, chromeLaunchConfig } = config;

function slugFor(url) {
  const u = new URL(url);
  if (u.pathname === '/' || u.pathname === '') return 'homepage';
  return u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-').toLowerCase();
}

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromePath: chromeLaunchConfig.executablePath,
    chromeFlags: ['--headless=new', ...chromeLaunchConfig.args],
  });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['best-practices', 'seo'],
      output: 'json',
    });
    return result.lhr;
  } finally {
    await chrome.kill();
  }
}

function fmtScore(category) {
  return category && category.score !== null ? `${Math.round(category.score * 100)}/100` : 'N/A';
}

async function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const rows = [];

  for (const url of urls) {
    const slug = slugFor(url);
    process.stdout.write(`Running: ${url}\n`);
    const lhr = await runLighthouse(url);
    const resultPath = path.join(RESULTS_DIR, `${slug}.lighthouse.json`);
    fs.writeFileSync(resultPath, JSON.stringify(lhr, null, 2));
    rows.push({
      url,
      slug,
      bestPractices: fmtScore(lhr.categories['best-practices']),
      seo: fmtScore(lhr.categories.seo),
    });
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('# UX baseline (Lighthouse Best Practices + SEO) — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push(`**Tool:** Lighthouse ${require('lighthouse/package.json').version} (best-practices + seo categories)`);
  lines.push(`**Config:** [ux/ux-config.json](../ux/ux-config.json)`);
  lines.push(`**Script:** [ux/run-lighthouse-bp-seo.js](../ux/run-lighthouse-bp-seo.js)`);
  lines.push('');
  lines.push('| Page | URL | Best Practices | SEO | Raw results |');
  lines.push('|---|---|---|---|---|');
  for (const row of rows) {
    lines.push(
      `| ${row.slug} | ${row.url} | ${row.bestPractices} | ${row.seo} | [lighthouse](../ux/results/${row.slug}.lighthouse.json) |`
    );
  }
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n');
  process.stdout.write(`\nReport written to ${REPORT_PATH}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
