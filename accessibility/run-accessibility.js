#!/usr/bin/env node
// Runs pa11y (axe, WCAG2AA) + Lighthouse (accessibility category) against every
// URL in pa11y-ci.json, saves one JSON file per page per tool under
// accessibility/results/, and writes the aggregated table to
// reports/accessibility-baseline.md. Reused verbatim for the v2 comparison.

const fs = require('fs');
const path = require('path');
const pa11y = require('pa11y');
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CONFIG_PATH = path.join(__dirname, 'pa11y-ci.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'accessibility-baseline.md');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const urls = config.urls;

function slugFor(url) {
  const u = new URL(url);
  if (u.pathname === '/' || u.pathname === '') return 'homepage';
  return u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-').toLowerCase();
}

function countBySeverity(issues) {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    },
    { error: 0, warning: 0, notice: 0 }
  );
}

async function runPa11y(url) {
  return pa11y(url, {
    standard: config.defaults.standard,
    runners: config.defaults.runners,
    timeout: config.defaults.timeout,
    wait: config.defaults.wait,
    chromeLaunchConfig: config.defaults.chromeLaunchConfig,
  });
}

async function runLighthouseAccessibility(url) {
  const chrome = await chromeLauncher.launch({
    chromePath: CHROME_PATH,
    chromeFlags: ['--headless=new', '--no-sandbox'],
  });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['accessibility'],
      output: 'json',
    });
    return result.lhr;
  } finally {
    await chrome.kill();
  }
}

async function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const rows = [];

  for (const url of urls) {
    const slug = slugFor(url);
    process.stdout.write(`Running: ${url}\n`);

    const pa11yResult = await runPa11y(url);
    const pa11yPath = path.join(RESULTS_DIR, `${slug}.pa11y.json`);
    fs.writeFileSync(pa11yPath, JSON.stringify(pa11yResult, null, 2));
    const severity = countBySeverity(pa11yResult.issues);

    const lhr = await runLighthouseAccessibility(url);
    const lighthousePath = path.join(RESULTS_DIR, `${slug}.lighthouse.json`);
    fs.writeFileSync(lighthousePath, JSON.stringify(lhr, null, 2));
    const rawScore = lhr.categories.accessibility.score;
    const score =
      rawScore === null
        ? `N/A (${lhr.runtimeError ? lhr.runtimeError.code : 'no score'})`
        : `${Math.round(rawScore * 100)}/100`;

    rows.push({ url, slug, severity, score });
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('# Accessibility baseline — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push(
    `**Tools:** pa11y ${require('pa11y/package.json').version} (axe-core ${require('axe-core/package.json').version} runner, WCAG2AA) · Lighthouse ${require('lighthouse/package.json').version} (accessibility category)`
  );
  lines.push(`**Config:** [accessibility/pa11y-ci.json](../accessibility/pa11y-ci.json)`);
  lines.push(`**Script:** [accessibility/run-accessibility.js](../accessibility/run-accessibility.js)`);
  lines.push('');
  lines.push('| Page | URL | pa11y errors | pa11y warnings | pa11y notices | Lighthouse a11y score | Raw results |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const row of rows) {
    lines.push(
      `| ${row.slug} | ${row.url} | ${row.severity.error} | ${row.severity.warning} | ${row.severity.notice} | ${row.score} | [pa11y](../accessibility/results/${row.slug}.pa11y.json) / [lighthouse](../accessibility/results/${row.slug}.lighthouse.json) |`
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
