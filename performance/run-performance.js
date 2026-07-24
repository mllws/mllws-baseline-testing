#!/usr/bin/env node
// Runs Lighthouse (performance category) against every URL in lighthouse-config.json,
// 3x per page per device (mobile throttled via Lighthouse's default mobileSlow4G preset,
// desktop throttled via Lighthouse's bundled desktop-config.js), takes the median run,
// saves every raw run JSON under performance/results/, and writes the aggregated
// median table to reports/performance-baseline.md. Reused verbatim for the v2 comparison.

const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse').default;
const desktopConfig = require('lighthouse/core/config/desktop-config.js').default;
const chromeLauncher = require('chrome-launcher');

const CONFIG_PATH = path.join(__dirname, 'lighthouse-config.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'performance-baseline.md');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { urls, devices, runsPerPage, chromeLaunchConfig } = config;

function slugFor(url) {
  const u = new URL(url);
  if (u.pathname === '/' || u.pathname === '') return 'homepage';
  return u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-').toLowerCase();
}

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function metricsFromLhr(lhr) {
  const audits = lhr.audits;
  const requests = audits['network-requests'] && audits['network-requests'].details
    ? audits['network-requests'].details.items.length
    : null;
  return {
    performanceScore: lhr.categories.performance.score,
    lcp: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].numericValue : null,
    inp: audits['interaction-to-next-paint'] ? audits['interaction-to-next-paint'].numericValue : null,
    cls: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].numericValue : null,
    ttfb: audits['server-response-time'] ? audits['server-response-time'].numericValue : null,
    fcp: audits['first-contentful-paint'] ? audits['first-contentful-paint'].numericValue : null,
    pageWeight: audits['total-byte-weight'] ? audits['total-byte-weight'].numericValue : null,
    requests,
  };
}

function medianOf(runs, key) {
  const values = runs.map((r) => r[key]).filter((v) => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return median(values);
}

async function runLighthouse(url, device) {
  const chrome = await chromeLauncher.launch({
    chromePath: chromeLaunchConfig.chromePath,
    chromeFlags: chromeLaunchConfig.chromeFlags,
  });
  try {
    const lhConfig = device === 'desktop' ? desktopConfig : undefined;
    const result = await lighthouse(
      url,
      { port: chrome.port, onlyCategories: ['performance'], output: 'json' },
      lhConfig
    );
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
    for (const device of devices) {
      process.stdout.write(`Running (${device}): ${url}\n`);
      const runs = [];
      for (let i = 1; i <= runsPerPage; i++) {
        const lhr = await runLighthouse(url, device);
        const runPath = path.join(RESULTS_DIR, `${slug}.${device}.run${i}.json`);
        fs.writeFileSync(runPath, JSON.stringify(lhr, null, 2));
        runs.push(metricsFromLhr(lhr));
      }

      rows.push({
        url,
        slug,
        device,
        performanceScore: medianOf(runs, 'performanceScore'),
        lcp: medianOf(runs, 'lcp'),
        inp: medianOf(runs, 'inp'),
        cls: medianOf(runs, 'cls'),
        ttfb: medianOf(runs, 'ttfb'),
        fcp: medianOf(runs, 'fcp'),
        pageWeight: medianOf(runs, 'pageWeight'),
        requests: medianOf(runs, 'requests'),
      });
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const fmtScore = (v) => (v === null ? 'N/A' : `${Math.round(v * 100)}/100`);
  const fmtMs = (v) => (v === null ? 'N/A' : `${Math.round(v)} ms`);
  const fmtCls = (v) => (v === null ? 'N/A' : v.toFixed(3));
  const fmtKb = (v) => (v === null ? 'N/A' : `${Math.round(v / 1024)} KB`);
  const fmtCount = (v) => (v === null ? 'N/A' : Math.round(v));

  const lines = [];
  lines.push('# Performance baseline — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push(
    `**Tool:** Lighthouse ${require('lighthouse/package.json').version} (performance category, median of ${runsPerPage} runs, mobile throttled + desktop throttled presets)`
  );
  lines.push(`**Config:** [performance/lighthouse-config.json](../performance/lighthouse-config.json)`);
  lines.push(`**Script:** [performance/run-performance.js](../performance/run-performance.js)`);
  lines.push('');
  lines.push(
    '| Page | Device | Score | LCP | INP | CLS | TTFB | FCP | Page weight | Requests |'
  );
  lines.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const row of rows) {
    lines.push(
      `| ${row.slug} | ${row.device} | ${fmtScore(row.performanceScore)} | ${fmtMs(row.lcp)} | ${fmtMs(row.inp)} | ${fmtCls(row.cls)} | ${fmtMs(row.ttfb)} | ${fmtMs(row.fcp)} | ${fmtKb(row.pageWeight)} | ${fmtCount(row.requests)} |`
    );
  }
  lines.push('');
  lines.push(
    'Raw per-run Lighthouse JSON for every page/device/run is saved under `performance/results/`.'
  );
  lines.push(
    'INP is Lighthouse\'s lab-simulated `interaction-to-next-paint` audit — it requires a scripted interaction to produce a real value; expect `N/A` on a plain navigation and treat the CrUX field snapshot (see `performance/run-crux.js`) as the real INP source.'
  );
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n');
  process.stdout.write(`\nReport written to ${REPORT_PATH}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
