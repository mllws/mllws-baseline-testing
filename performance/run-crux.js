#!/usr/bin/env node
// Pulls PageSpeed Insights (which wraps CrUX field data) for every URL in
// lighthouse-config.json, per device strategy, and saves the raw JSON response
// under performance/results/. CrUX only reports for origins/URLs with enough
// real-user traffic in the last 28 days — pages without a `loadingExperience`
// or `originLoadingExperience` block in the response have no CrUX data and are
// recorded as "no CrUX data" rather than failing the run.
//
// Works without an API key (low, shared rate limit). Set PSI_API_KEY to use a
// key and raise the rate limit: https://developers.google.com/speed/docs/insights/v5/get-started

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_PATH = path.join(__dirname, 'lighthouse-config.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'crux-snapshot.md');
const API_KEY = process.env.PSI_API_KEY;

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { urls, devices } = config;

function slugFor(url) {
  const u = new URL(url);
  if (u.pathname === '/' || u.pathname === '') return 'homepage';
  return u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-').toLowerCase();
}

function fetchPSI(url, strategy) {
  const params = new URLSearchParams({ url, strategy, category: 'performance' });
  if (API_KEY) params.set('key', API_KEY);
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  return new Promise((resolve, reject) => {
    https
      .get(endpoint, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (res.statusCode !== 200) {
              reject(new Error(`PSI ${res.statusCode} for ${url} (${strategy}): ${json.error ? json.error.message : body}`));
              return;
            }
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function summarizeCrux(psiResult) {
  const experience = psiResult.loadingExperience || psiResult.originLoadingExperience;
  if (!experience || experience.metrics === undefined) return null;
  const metrics = experience.metrics;
  const pct = (m) => (m ? m.percentile : null);
  return {
    overallCategory: experience.overall_category || null,
    lcp: pct(metrics.LARGEST_CONTENTFUL_PAINT_MS),
    inp: pct(metrics.INTERACTION_TO_NEXT_PAINT),
    cls: pct(metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE),
    ttfb: pct(metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE) || pct(metrics.FIRST_INPUT_DELAY_MS) || null,
    fcp: pct(metrics.FIRST_CONTENTFUL_PAINT_MS),
  };
}

async function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const rows = [];

  for (const url of urls) {
    const slug = slugFor(url);
    for (const device of devices) {
      const strategy = device === 'desktop' ? 'desktop' : 'mobile';
      process.stdout.write(`Fetching PSI/CrUX (${strategy}): ${url}\n`);
      try {
        const result = await fetchPSI(url, strategy);
        const resultPath = path.join(RESULTS_DIR, `${slug}.${strategy}.psi.json`);
        fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
        const crux = summarizeCrux(result);
        rows.push({ url, slug, device: strategy, crux });
      } catch (err) {
        process.stderr.write(`  failed: ${err.message}\n`);
        rows.push({ url, slug, device: strategy, crux: null, error: err.message });
      }
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const fmt = (v, unit) => (v === null || v === undefined ? 'N/A' : `${v}${unit}`);

  const lines = [];
  lines.push('# CrUX field data snapshot — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push('**Source:** PageSpeed Insights v5 API (`loadingExperience` / `originLoadingExperience`, CrUX-backed)');
  lines.push(`**Script:** [performance/run-crux.js](../performance/run-crux.js)`);
  lines.push('');
  lines.push('| Page | Device | Overall | LCP (p75) | INP (p75) | CLS (p75) | FCP (p75) |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const row of rows) {
    if (!row.crux) {
      lines.push(`| ${row.slug} | ${row.device} | no CrUX data${row.error ? ` (${row.error})` : ''} | — | — | — | — |`);
      continue;
    }
    lines.push(
      `| ${row.slug} | ${row.device} | ${row.crux.overallCategory || 'N/A'} | ${fmt(row.crux.lcp, ' ms')} | ${fmt(row.crux.inp, ' ms')} | ${row.crux.cls === null ? 'N/A' : row.crux.cls} | ${fmt(row.crux.fcp, ' ms')} |`
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
