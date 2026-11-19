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
 */

import { parse } from 'csv-parse/sync';
import fs from 'fs';

class DataProcessor {
  /**
   * Initialize the DataProcessor with a CSV filename.
   * @param {string} filename - Path to the CSV file to process
   */
  constructor(filename) {
    this.filename = filename;
    this.data = [];   // equivalent to List[Dict[str, str]] in Python
    this.stats = {};  // equivalent to Dict[str, Dict[str, float]] in Python
  }

  /**
   * Check if a string value can be converted to a number.
   * Equivalent to Python's _is_numeric using try/except float(value).
   * @param {string} value
   * @returns {boolean}
   */
  _isNumeric(value) {
    if (value === null || value === undefined || String(value).trim() === '') return false;
    return !isNaN(parseFloat(String(value)));
  }

  /**
   * Load data from the CSV file.
   * Uses fs.promises (async) + csv-parse/sync for parsing.
   * Equivalent to Python's load_data() using csv.DictReader.
   *
   * @throws {Error} If the CSV file doesn't exist or is malformed
   */
  async loadData() {
    // Equivalent to: if not os.path.exists(self.filename)
    try {
      await fs.promises.access(this.filename);
    } catch {
      throw new Error(`File not found: ${this.filename}`);
    }

    // Equivalent to: with open(filename, 'r') as file: csv.DictReader(file)
    const content = await fs.promises.readFile(this.filename, { encoding: 'utf-8' });

    // { columns: true } makes csv-parse produce objects keyed by column name
    // — identical behavior to Python's csv.DictReader
    this.data = parse(content, { columns: true, skip_empty_lines: true });

    console.log(`✅ Loaded ${this.data.length} rows from ${this.filename}`);
  }

  /**
   * Calculate basic statistics for numeric fields in the data.
   * Equivalent to Python's calculate_statistics().
   *
   * Uses Array methods instead of Python list comprehensions:
   *   Python: [key for key in row.keys() if self._is_numeric(row[key])]
   *   JS:     Object.keys(row).filter(key => this._isNumeric(row[key]))
   *
   * @returns {Object} Dictionary with statistics for each numeric field
   */
  calculateStatistics() {
    if (this.data.length === 0) {
      console.log('⚠️  No data loaded. Call loadData() first.');
      return {};
    }

    // Equivalent to Python list comprehension to find numeric fields
    const numericFields = Object.keys(this.data[0]).filter(
      (key) => this._isNumeric(this.data[0][key])
    );

    console.log(`📊 Found ${numericFields.length} numeric fields: ${numericFields.join(', ')}`);

    const stats = {};

    for (const field of numericFields) {
      // Equivalent to: [float(row[field]) for row in self.data if self._is_numeric(row[field])]
      const values = this.data
        .filter((row) => this._isNumeric(row[field]))
        .map((row) => parseFloat(row[field]));

      if (values.length > 0) {
        const sum = values.reduce((acc, v) => acc + v, 0);  // equivalent to sum(values)
        stats[field] = {
          mean: sum / values.length,                         // equivalent to sum(values) / len(values)
          min: Math.min(...values),                          // equivalent to min(values)
          max: Math.max(...values),                          // equivalent to max(values)
          count: values.length,                              // equivalent to len(values)
          sum: sum,                                          // equivalent to sum(values)
        };
      }
    }

    this.stats = stats;
    return stats;
  }

  /**
   * Get a summary of the processed data.
   * Equivalent to Python's get_summary().
   * @returns {Object}
   */
  getSummary() {
    return {
      filename: this.filename,
      total_rows: this.data.length,
      total_fields: this.data.length > 0 ? Object.keys(this.data[0]).length : 0,
      numeric_fields: Object.keys(this.stats).length,
      processed_at: new Date().toISOString(),   // equivalent to datetime.now().isoformat()
    };
  }

  /**
   * Export statistics to a JSON file.
   * Equivalent to Python's export_results() using json.dump(..., indent=2).
   *
   * @param {string} outputFile - Path to the output JSON file
   * @throws {Error} If unable to write to the output file
   */
  async exportResults(outputFile) {
    if (Object.keys(this.stats).length === 0) {
      console.log('⚠️  No statistics calculated. Call calculateStatistics() first.');
      return;
    }

    const outputData = {
      summary: this.getSummary(),
      statistics: this.stats,
    };

    // Equivalent to: json.dump(output_data, file, indent=2)
    const json = JSON.stringify(outputData, null, 2);
    await fs.promises.writeFile(outputFile, json, { encoding: 'utf-8' });

    console.log(`✅ Results exported to ${outputFile}`);
  }

  /**
   * Print statistics to the console in a readable format.
   * Equivalent to Python's print_statistics().
   * Uses .toFixed(2) instead of Python's :.2f format specifier.
   */
  printStatistics() {
    if (Object.keys(this.stats).length === 0) {
      console.log('⚠️  No statistics available.');
      return;
    }

    console.log('\n' + '='.repeat(50));
    console.log('STATISTICS SUMMARY');
    console.log('='.repeat(50));

    for (const [field, stats] of Object.entries(this.stats)) {
      console.log(`\n${field}:`);
      console.log(`  Mean:  ${stats.mean.toFixed(2)}`);   // equivalent to f"  Mean:  {stats['mean']:.2f}"
      console.log(`  Min:   ${stats.min.toFixed(2)}`);
      console.log(`  Max:   ${stats.max.toFixed(2)}`);
      console.log(`  Count: ${stats.count}`);
      console.log(`  Sum:   ${stats.sum.toFixed(2)}`);
    }

    console.log('\n' + '='.repeat(50));
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
    if (e.message && e.message.startsWith('File not found')) {
      console.error(`❌ Error: ${e.message}`);
    } else {
      console.error(`❌ Unexpected error: ${e.message}`);
    }
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
