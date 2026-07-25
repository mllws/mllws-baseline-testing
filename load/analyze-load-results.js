#!/usr/bin/env node
// Reads a k6 raw JSON-lines output file (produced with `k6 run --out json=<file>`)
// and buckets http_req_duration by 10s time windows to find the degradation point —
// the first window where p95 latency crosses load-config.json's degradationThresholdMs
// (or, if it never does, doubles relative to the first window's p95). Writes
// reports/load-degradation.md. Usage:
//   npm run load:analyze -- load/results/raw.json

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'load-config.json');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'load-degradation.md');
const BUCKET_MS = 10000;

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node analyze-load-results.js <path-to-k6-raw-json-output>');
  process.exit(1);
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function main() {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split('\n').filter(Boolean);

  let testStart = null;
  const durationsByBucket = new Map();
  const vusByBucket = new Map();

  for (const line of lines) {
    let point;
    try {
      point = JSON.parse(line);
    } catch {
      continue;
    }
    if (point.type !== 'Point') continue;
    const time = new Date(point.data.time).getTime();
    if (testStart === null || time < testStart) testStart = time;
  }

  for (const line of lines) {
    let point;
    try {
      point = JSON.parse(line);
    } catch {
      continue;
    }
    if (point.type !== 'Point') continue;
    const time = new Date(point.data.time).getTime();
    const bucket = Math.floor((time - testStart) / BUCKET_MS) * (BUCKET_MS / 1000);

    if (point.metric === 'http_req_duration') {
      if (!durationsByBucket.has(bucket)) durationsByBucket.set(bucket, []);
      durationsByBucket.get(bucket).push(point.data.value);
    } else if (point.metric === 'vus') {
      if (!vusByBucket.has(bucket)) vusByBucket.set(bucket, []);
      vusByBucket.get(bucket).push(point.data.value);
    }
  }

  const buckets = [...durationsByBucket.keys()].sort((a, b) => a - b);
  const rows = buckets.map((bucket) => {
    const durations = durationsByBucket.get(bucket).sort((a, b) => a - b);
    const vusValues = vusByBucket.get(bucket) || [0];
    const avgVus = vusValues.reduce((a, b) => a + b, 0) / vusValues.length;
    return {
      bucketStartSec: bucket,
      avgVus: Math.round(avgVus),
      p95: percentile(durations, 95),
      count: durations.length,
    };
  });

  const baselineP95 = rows.length ? rows[0].p95 : null;
  let degradationRow = null;
  for (const row of rows) {
    const overThreshold = row.p95 !== null && row.p95 >= config.degradationThresholdMs;
    const overBaseline = baselineP95 && row.p95 !== null && row.p95 >= baselineP95 * 2;
    if (overThreshold || overBaseline) {
      degradationRow = row;
      break;
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines2 = [];
  lines2.push('# Load test degradation-point analysis — motherlanguagelovers.com v1');
  lines2.push('');
  lines2.push(`**Date:** ${date}`);
  lines2.push(`**Source:** ${path.relative(path.join(__dirname, '..'), inputPath)} (k6 \`--out json\`), bucketed into ${BUCKET_MS / 1000}s windows`);
  lines2.push(`**Script:** [load/analyze-load-results.js](../load/analyze-load-results.js)`);
  lines2.push(`**Degradation threshold:** p95 >= ${config.degradationThresholdMs} ms, or >= 2x the first bucket's p95`);
  lines2.push('');
  if (degradationRow) {
    lines2.push(
      `**Degradation point:** ~${degradationRow.bucketStartSec}s into the run, at ~${degradationRow.avgVus} VUs — p95 hit ${Math.round(degradationRow.p95)} ms.`
    );
  } else {
    lines2.push('**Degradation point:** none detected — p95 stayed under threshold for the whole run.');
  }
  lines2.push('');
  lines2.push('| Window start | Avg VUs | p95 (ms) | Requests |');
  lines2.push('|---|---|---|---|');
  for (const row of rows) {
    lines2.push(`| ${row.bucketStartSec}s | ${row.avgVus} | ${row.p95 === null ? 'N/A' : Math.round(row.p95)} | ${row.count} |`);
  }
  lines2.push('');

  fs.writeFileSync(REPORT_PATH, lines2.join('\n') + '\n');
  process.stdout.write(`Report written to ${REPORT_PATH}\n`);
}

main();
