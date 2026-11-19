/**
 * Data Processor - Analyzes CSV files and generates statistics
 *
 * This JavaScript script demonstrates various JS features:
 * - ES2020+ class syntax
 * - async/await for I/O (fs.promises)
 * - Array methods: map, filter, reduce (equivalent to Python list comprehensions)
 * - Object destructuring and spread
 * - CSV parsing with csv-parse
 * - JSON serialization with JSON.stringify
 *
 * Improvements applied (see mejoras.md):
 * - J-C3: _isNumeric uses Number() — stricter than parseFloat (rejects "25px")
 * - J-C2: _isNumeric excludes NaN and Infinity (finite numbers only)
 * - J-E1: loadData reads directly and handles ENOENT/EACCES by error code
 * - J-E2: exportResults wrapped in try/catch with descriptive error
 * - J-E3: calculateStatistics guards with Array.isArray
 * - J-D1: _loaded state flag prevents out-of-order calls
 * - O-2:  verbose parameter controls console output
 * - E-S1: std_dev (standard deviation) added
 * - E-S2: median added
 * - E-S4: missing count added per field
 */

import { parse } from 'csv-parse/sync';
import fs from 'fs';

/**
 * @typedef {Object} FieldStats
 * @property {number} mean
 * @property {number} median
 * @property {number} std_dev
 * @property {number} min
 * @property {number} max
 * @property {number} count
 * @property {number} sum
 * @property {number} missing
 */

class DataProcessor {
  /**
   * Initialize the DataProcessor with a CSV filename.
   * @param {string} filename - Path to the CSV file to process
   * @param {boolean} [verbose=true] - If false, suppresses all console output (O-2)
   */
  constructor(filename, verbose = true) {
    if (typeof filename !== 'string' || filename.trim() === '') {
      throw new TypeError('filename must be a non-empty string');
    }
    this.filename = filename;
    this.data = [];
    this.stats = {};
    this.verbose = verbose;
    this._loaded = false; // J-D1: state flag to detect out-of-order calls
  }

  /** @private */
  _log(...args) {
    if (this.verbose) console.log(...args); // O-2: respects verbose flag
  }

  /**
   * Check if a string value is a finite number.
   * J-C3: uses Number() which is stricter than parseFloat ("25px" → NaN).
   * J-C2: isFinite() excludes NaN and Infinity.
   * @param {string} value
   * @returns {boolean}
   */
  _isNumeric(value) {
    if (value === null || value === undefined || String(value).trim() === '') return false;
    return isFinite(Number(String(value).trim()));
  }

  /**
   * Load data from the CSV file.
   * J-E1: reads directly with fs.promises.readFile and handles errors by code,
   * catching both ENOENT (not found) and EACCES (permission denied).
   *
   * @throws {Error} If the CSV file doesn't exist, is unreadable, or is malformed
   */
  async loadData() {
    let content;
    try {
      content = await fs.promises.readFile(this.filename, { encoding: 'utf-8' });
    } catch (err) {
      if (err.code === 'ENOENT') throw new Error(`File not found: ${this.filename}`);
      if (err.code === 'EACCES') throw new Error(`Permission denied: ${this.filename}`);
      throw new Error(`Could not read file: ${err.message}`);
    }

    // { columns: true } makes csv-parse produce objects keyed by column name
    // — identical behavior to Python's csv.DictReader
    this.data = parse(content, { columns: true, skip_empty_lines: true });
    this._loaded = true; // J-D1: mark as loaded

    this._log(`✅ Loaded ${this.data.length} rows from ${this.filename}`);
  }

  /**
   * Calculate statistics for numeric fields in the data.
   * J-E3: guards with Array.isArray before accessing .length.
   * J-D1: warns if loadData() was not called first.
   * E-S1: adds std_dev (standard deviation).
   * E-S2: adds median.
   * E-S4: adds missing count per field.
   *
   * @returns {Object.<string, FieldStats>}
   */
  calculateStatistics() {
    // J-E3: guard against non-array data
    if (!Array.isArray(this.data) || this.data.length === 0) {
      this._log('⚠️  No data loaded. Call loadData() first.');
      return {};
    }

    // J-D1: warn if called before loadData()
    if (!this._loaded) {
      this._log('⚠️  loadData() was not called. Data may be incomplete.');
    }

    const numericFields = Object.keys(this.data[0]).filter(
      (key) => this._isNumeric(this.data[0][key])
    );

    this._log(`📊 Found ${numericFields.length} numeric fields: ${numericFields.join(', ')}`);

    const stats = {};

    for (const field of numericFields) {
      const values = this.data
        .filter((row) => this._isNumeric(row[field]))
        .map((row) => Number(row[field]));

      const missing = this.data.filter((row) => !this._isNumeric(row[field])).length; // E-S4

      if (values.length > 0) {
        const sum = values.reduce((acc, v) => acc + v, 0);
        const mean = sum / values.length;

        // E-S2: median — sort a copy to avoid mutating values array
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;

        // E-S1: sample standard deviation (ddof=1, same as Python statistics.stdev)
        const variance = values.length > 1
          ? values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1)
          : 0;
        const std_dev = Math.sqrt(variance);

        // J-P1: use reduce for min/max to avoid spread stack overflow on large arrays
        const min = values.reduce((a, b) => Math.min(a, b));
        const max = values.reduce((a, b) => Math.max(a, b));

        stats[field] = { mean, median, std_dev, min, max, count: values.length, sum, missing };
      }
    }

    this.stats = stats;
    return stats;
  }

  /**
   * Get a summary of the processed data.
   * @returns {Object}
   */
  getSummary() {
    return {
      filename: this.filename,
      total_rows: this.data.length,
      total_fields: this.data.length > 0 ? Object.keys(this.data[0]).length : 0,
      numeric_fields: Object.keys(this.stats).length,
      processed_at: new Date().toISOString(),
    };
  }

  /**
   * Export statistics to a JSON file.
   * J-E2: wrapped in try/catch — write errors are now caught and re-thrown with context.
   *
   * @param {string} outputFile - Path to the output JSON file
   * @throws {Error} If unable to write to the output file
   */
  async exportResults(outputFile) {
    if (Object.keys(this.stats).length === 0) {
      this._log('⚠️  No statistics calculated. Call calculateStatistics() first.');
      return;
    }

    const outputData = {
      summary: this.getSummary(),
      statistics: this.stats,
    };

    const json = JSON.stringify(outputData, null, 2);

    // J-E2: explicit try/catch — write failures no longer produce unhandled stack traces
    try {
      await fs.promises.writeFile(outputFile, json, { encoding: 'utf-8' });
    } catch (err) {
      throw new Error(`Error writing to file "${outputFile}": ${err.message}`);
    }

    this._log(`✅ Results exported to ${outputFile}`);
  }

  /**
   * Print statistics to the console in a readable format.
   * Now also shows median, std_dev, and missing count.
   */
  printStatistics() {
    if (Object.keys(this.stats).length === 0) {
      this._log('⚠️  No statistics available.');
      return;
    }

    this._log('\n' + '='.repeat(50));
    this._log('STATISTICS SUMMARY');
    this._log('='.repeat(50));

    for (const [field, s] of Object.entries(this.stats)) {
      this._log(`\n${field}:`);
      this._log(`  Mean:    ${s.mean.toFixed(2)}`);
      this._log(`  Median:  ${s.median.toFixed(2)}`);
      this._log(`  Std Dev: ${s.std_dev.toFixed(2)}`);
      this._log(`  Min:     ${s.min.toFixed(2)}`);
      this._log(`  Max:     ${s.max.toFixed(2)}`);
      this._log(`  Count:   ${s.count}`);
      this._log(`  Sum:     ${s.sum.toFixed(2)}`);
      this._log(`  Missing: ${s.missing}`);
    }

    this._log('\n' + '='.repeat(50));
  }
}

/**
 * Create a sample CSV file for testing.
 * Equivalent to Python's create_sample_data().
 * @param {string} filename
 */
async function createSampleData(filename = 'sample_data.csv') {
  const rows = [
    ['Alice', '25', '95.5', 'A'],
    ['Bob', '30', '87.3', 'B'],
    ['Charlie', '22', '92.1', 'A'],
    ['Diana', '28', '88.7', 'B'],
    ['Eve', '26', '91.2', 'A'],
  ];

  const header = 'name,age,score,grade';
  const lines = rows.map((r) => r.join(','));
  const csv = [header, ...lines].join('\n');

  await fs.promises.writeFile(filename, csv, { encoding: 'utf-8' });
  console.log(`✅ Created sample data file: ${filename}`);
}

/**
 * Main function to demonstrate the DataProcessor usage.
 * Equivalent to Python's main().
 * Wrapped in async because Node.js I/O is asynchronous.
 */
async function main() {
  console.log('🚀 Data Processor - JavaScript Version');
  console.log('='.repeat(50));

  const csvFile = 'sample_data.csv';

  // Equivalent to: if not os.path.exists(csv_file): create_sample_data(csv_file)
  try {
    await fs.promises.access(csvFile);
  } catch {
    await createSampleData(csvFile);
  }

  try {
    // Equivalent to the sequential Python calls in main()
    const processor = new DataProcessor(csvFile);

    await processor.loadData();
    processor.calculateStatistics();
    processor.printStatistics();
    await processor.exportResults('statistics.json');

    console.log('\n✅ Processing complete!');
  } catch (e) {
    // J-E4: use err.code or message prefix — both paths produce clear output
    console.error(`❌ ${e.message}`);
  }
}

// Export class and helpers for use by the Express server
export { DataProcessor, createSampleData };

// Equivalent to: if __name__ == '__main__'
// Only run main() when this file is executed directly, not when imported.
// process.argv[1] contains the path of the script being run.
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

// Made with Bob
