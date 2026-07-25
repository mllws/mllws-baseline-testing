#!/usr/bin/env node
// Compiles the four per-dimension baseline reports (accessibility, performance, UX,
// load — each written by that dimension's own `npm run *` scripts) into a single
// reports/baseline-report.md: one document, four sections, date/tool/links per
// dimension. Any dimension that hasn't been run yet is called out as such rather
// than silently omitted. Run with `npm run report:compile` after running whichever
// dimension scripts you want reflected.

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = __dirname;
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(REPORTS_DIR, 'baseline-report.md');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'ux', 'screenshots');

const DIMENSIONS = [
  {
    key: 'accessibility',
    title: 'Accessibility',
    files: ['accessibility-baseline.md'],
    scripts: ['accessibility/pa11y-ci.json', 'accessibility/run-accessibility.js'],
    notRunHint: '`npm run a11y:pa11y-ci` / `npm run a11y:run` — see accessibility/README.md',
  },
  {
    key: 'performance',
    title: 'Performance',
    files: ['performance-baseline.md', 'crux-snapshot.md'],
    scripts: ['performance/lighthouse-config.json', 'performance/run-performance.js', 'performance/run-crux.js'],
    notRunHint: '`npm run perf:run` / `npm run perf:crux` — see performance/README.md',
  },
  {
    key: 'ux',
    title: 'UX',
    files: ['ux-baseline.md', 'ux-screenshots.md', 'ux-flow.md'],
    scripts: ['ux/ux-config.json', 'ux/run-lighthouse-bp-seo.js', 'ux/run-screenshots.js', 'ux/run-flow.js'],
    notRunHint: '`npm run ux:lighthouse` / `npm run ux:screenshots` / `npm run ux:flow` — see ux/README.md',
  },
  {
    key: 'load',
    title: 'Load',
    files: ['load-baseline.md', 'load-degradation.md'],
    scripts: ['load/load-config.json', 'load/load-test.js', 'load/analyze-load-results.js'],
    notRunHint: '`npm run load:run` / `npm run load:analyze` — see load/README.md',
  },
];

function stripTitle(markdown) {
  const lines = markdown.split('\n');
  if (lines[0].startsWith('# ')) lines.shift();
  return lines.join('\n').trim();
}

function countScreenshots(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countScreenshots(full);
    else if (entry.name.endsWith('.png')) count += 1;
  }
  return count;
}

function main() {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('# Baseline report — motherlanguagelovers.com v1');
  lines.push('');
  lines.push(`**Compiled:** ${date}`);
  lines.push(
    '**Scope:** 7 locked URLs (docs/PLAN.md Phase 1) — homepage, About, Blog, Our Team, Contact, Volunteer, 404 page'
  );
  lines.push(
    '**Headline finding:** the site has no functional conversion flow — zero `<form>` tags anywhere. Contact (`mailto:`/`tel:` links only) and Volunteer (dead "Join us!" button, `href="#"`) are locked in as the conversion-flow proxy so this gap is measured rather than skipped. See docs/PLAN.md Phase 1.'
  );
  lines.push('');

  let sectionNum = 1;
  const missingDimensions = [];

  for (const dim of DIMENSIONS) {
    lines.push(`## ${sectionNum}. ${dim.title}`);
    lines.push('');

    const foundFiles = dim.files.filter((f) => fs.existsSync(path.join(REPORTS_DIR, f)));

    if (foundFiles.length === 0) {
      lines.push(`**Not yet run.** Generate with ${dim.notRunHint}`);
      missingDimensions.push(dim.title);
    } else {
      for (const file of dim.files) {
        const filePath = path.join(REPORTS_DIR, file);
        if (!fs.existsSync(filePath)) {
          lines.push(`_${file} not yet generated — ${dim.notRunHint}_`);
          lines.push('');
          continue;
        }
        lines.push(stripTitle(fs.readFileSync(filePath, 'utf8')));
        lines.push('');
      }
    }

    lines.push('');
    sectionNum += 1;
  }

  lines.push('## Screenshot set');
  lines.push('');
  const screenshotCount = countScreenshots(SCREENSHOTS_DIR);
  if (screenshotCount > 0) {
    lines.push(`${screenshotCount} screenshots captured under \`ux/screenshots/\` (375px / 768px / 1440px per page, run \`npm run ux:screenshots\` to regenerate).`);
  } else {
    lines.push('Not yet captured. Generate with `npm run ux:screenshots` — see ux/README.md.');
  }
  lines.push('');

  lines.push('## Scripts & configs (reused verbatim for v2)');
  lines.push('');
  for (const dim of DIMENSIONS) {
    for (const script of dim.scripts) {
      lines.push(`- [${script}](../${script})`);
    }
  }
  lines.push('');

  if (missingDimensions.length > 0) {
    lines.push(
      `**Note:** this compile ran with ${missingDimensions.length}/${DIMENSIONS.length} dimensions not yet baselined (${missingDimensions.join(', ')}). Re-run \`npm run report:compile\` once every dimension's baseline has been run to get the complete Phase 6 report.`
    );
    lines.push('');
  }

  fs.writeFileSync(OUTPUT_PATH, lines.join('\n'));
  process.stdout.write(`Report written to ${OUTPUT_PATH}\n`);
  if (missingDimensions.length > 0) {
    process.stdout.write(`Note: ${missingDimensions.join(', ')} not yet run — see notes in the report.\n`);
  }
}

main();
