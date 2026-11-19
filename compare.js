/**
 * compare.js — Compares Python and JavaScript statistics.json outputs
 *
 * Usage:
 *   1. Run Python:     cd source && python data_processor.py
 *   2. Run JavaScript: node data_processor.js
 *   3. Run this:       node compare.js
 */

import { readFileSync } from 'fs';

const TOLERANCE = 1e-9; // floating-point tolerance for numeric comparisons

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    console.error(`❌ Could not read "${path}": ${err.message}`);
    process.exit(1);
  }
}

const py = loadJson('source/statistics.json');
const js = loadJson('statistics.json');

let passed = 0;
let failed = 0;

function check(label, pyVal, jsVal, isNumeric = true) {
  if (isNumeric) {
    const match = Math.abs(pyVal - jsVal) < TOLERANCE;
    const status = match ? '✅' : '❌';
    console.log(`  ${status} ${label}: Python=${pyVal}  JS=${jsVal}`);
    match ? passed++ : failed++;
  } else {
    const match = pyVal === jsVal;
    const status = match ? '✅' : '❌';
    console.log(`  ${status} ${label}: Python="${pyVal}"  JS="${jsVal}"`);
    match ? passed++ : failed++;
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n📋 SUMMARY');
console.log('─'.repeat(50));
check('total_rows',     py.summary.total_rows,     js.summary.total_rows);
check('total_fields',  py.summary.total_fields,   js.summary.total_fields);
check('numeric_fields',py.summary.numeric_fields, js.summary.numeric_fields);
check('filename',      py.summary.filename,       js.summary.filename, false);
console.log(`  ⏭  processed_at: (skipped — always differs)`);

// ── Statistics per field ──────────────────────────────────────────────────────
const pyFields = Object.keys(py.statistics);
const jsFields = Object.keys(js.statistics);

console.log('\n📊 FIELDS PRESENT');
console.log('─'.repeat(50));
const allFields = new Set([...pyFields, ...jsFields]);
for (const field of allFields) {
  const inPy = pyFields.includes(field);
  const inJs = jsFields.includes(field);
  const status = inPy && inJs ? '✅' : '❌';
  console.log(`  ${status} "${field}": Python=${inPy}  JS=${inJs}`);
  inPy && inJs ? passed++ : failed++;
}

// ── Numeric values per field ──────────────────────────────────────────────────
const NUMERIC_KEYS = ['mean', 'min', 'max', 'count', 'sum'];

for (const field of pyFields) {
  if (!js.statistics[field]) continue;

  const p = py.statistics[field];
  const j = js.statistics[field];

  console.log(`\n📈 ${field.toUpperCase()}`);
  console.log('─'.repeat(50));

  for (const key of NUMERIC_KEYS) {
    if (p[key] !== undefined && j[key] !== undefined) {
      check(key, p[key], j[key]);
    }
  }

  // JS-only fields (no Python equivalent) — just report them
  const jsOnlyKeys = ['median', 'std_dev', 'missing'];
  for (const key of jsOnlyKeys) {
    if (j[key] !== undefined) {
      console.log(`  ℹ️  ${key} (JS only): ${j[key].toFixed ? j[key].toFixed(4) : j[key]}`);
    }
  }
}

// ── Result ────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(50));
console.log(`RESULT: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ Python and JavaScript outputs are identical!\n');
} else {
  console.log('❌ There are differences between outputs.\n');
  process.exit(1);
}
