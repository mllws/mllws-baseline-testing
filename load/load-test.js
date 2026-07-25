// k6 load test: ramps 0 -> N virtual users hitting the homepage + the conversion-flow
// proxy locked in docs/PLAN.md Phase 1 (Contact + Volunteer), then ramps back down.
// Reads load-config.json for the base URL / paths / default ramp profile.
//
// Run the full baseline profile:
//   npm run load:run
// Override the ramp profile (e.g. for a quick local smoke test — keep this small,
// this hits the live production site):
//   LOAD_TEST_MAX_VUS=2 LOAD_TEST_RAMP_UP=5s LOAD_TEST_HOLD=5s LOAD_TEST_RAMP_DOWN=2s npm run load:run
// Capture the raw per-request timeline for degradation-point analysis:
//   npm run load:run -- --out json=load/results/raw.json
//   npm run load:analyze -- load/results/raw.json

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const config = JSON.parse(open('./load-config.json'));

const BASE_URL = __ENV.LOAD_TEST_BASE_URL || config.baseUrl;
const MAX_VUS = Number(__ENV.LOAD_TEST_MAX_VUS || config.defaultProfile.maxVUs);
const RAMP_UP = __ENV.LOAD_TEST_RAMP_UP || config.defaultProfile.rampUp;
const HOLD = __ENV.LOAD_TEST_HOLD || config.defaultProfile.hold;
const RAMP_DOWN = __ENV.LOAD_TEST_RAMP_DOWN || config.defaultProfile.rampDown;

const homepageDuration = new Trend('homepage_duration', true);
const contactDuration = new Trend('contact_duration', true);
const volunteerDuration = new Trend('volunteer_duration', true);

export const options = {
  stages: [
    { duration: RAMP_UP, target: MAX_VUS },
    { duration: HOLD, target: MAX_VUS },
    { duration: RAMP_DOWN, target: 0 },
  ],
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

function visit(name, url, trend) {
  const res = http.get(url, { tags: { page: name } });
  trend.add(res.timings.duration);
  check(res, { [`${name} status is 200`]: (r) => r.status === 200 });
  return res;
}

export default function () {
  visit('homepage', `${BASE_URL}/`, homepageDuration);
  sleep(1);
  visit('contact', `${BASE_URL}${config.conversionFlowPaths.contact}`, contactDuration);
  sleep(1);
  visit('volunteer', `${BASE_URL}${config.conversionFlowPaths.volunteer}`, volunteerDuration);
  sleep(1);
}

function fmtMs(v) {
  return v === undefined || v === null ? 'N/A' : `${Math.round(v)} ms`;
}

export function handleSummary(data) {
  const date = new Date().toISOString().slice(0, 10);
  const m = data.metrics;
  const overall = m.http_req_duration ? m.http_req_duration.values : {};
  const errorRate = m.http_req_failed ? m.http_req_failed.values.rate : null;
  const throughput = m.http_reqs ? m.http_reqs.values.rate : null;

  const rows = [
    ['overall', overall],
    ['homepage', m.homepage_duration && m.homepage_duration.values],
    ['contact', m.contact_duration && m.contact_duration.values],
    ['volunteer', m.volunteer_duration && m.volunteer_duration.values],
  ];

  const lines = [];
  lines.push('# Load test baseline — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Date:** ${date}`);
  lines.push('**Tool:** k6');
  lines.push(`**Profile:** ramp 0→${MAX_VUS} VUs over ${RAMP_UP}, hold ${HOLD}, ramp down ${RAMP_DOWN}`);
  lines.push('**Pages:** homepage + Contact/Volunteer (conversion-flow proxy, see docs/PLAN.md Phase 1)');
  lines.push('**Config:** [load/load-config.json](../load/load-config.json)');
  lines.push('**Script:** [load/load-test.js](../load/load-test.js)');
  lines.push('');
  lines.push(`**Error rate (http_req_failed):** ${errorRate === null ? 'N/A' : `${(errorRate * 100).toFixed(2)}%`}`);
  lines.push(`**Throughput:** ${throughput === null ? 'N/A' : `${throughput.toFixed(2)} req/s`}`);
  lines.push('');
  lines.push('| Page | p50 | p95 | p99 | max |');
  lines.push('|---|---|---|---|---|');
  for (const [name, v] of rows) {
    if (!v) continue;
    lines.push(`| ${name} | ${fmtMs(v.med)} | ${fmtMs(v['p(95)'])} | ${fmtMs(v['p(99)'])} | ${fmtMs(v.max)} |`);
  }
  lines.push('');
  lines.push(
    'Degradation point (when latency starts climbing under load) needs the raw per-request timeline, not just this end-of-test summary — re-run with `--out json=load/results/raw.json` and then `npm run load:analyze -- load/results/raw.json`.'
  );
  lines.push('');

  return {
    'load/results/summary.json': JSON.stringify(data, null, 2),
    'reports/load-baseline.md': lines.join('\n') + '\n',
    stdout: `${JSON.stringify(
      { errorRatePct: errorRate === null ? null : +(errorRate * 100).toFixed(2), throughputPerSec: throughput, p95Ms: overall['p(95)'] },
      null,
      2
    )}\n`,
  };
}
