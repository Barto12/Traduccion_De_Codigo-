/**
 * server.js — Express backend for the Data Processor frontend
 *
 * Endpoints:
 *   GET  /           → serves the frontend HTML
 *   POST /upload     → receives a CSV file, processes it, returns JSON statistics
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataProcessor } from './data_processor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// multer: store uploaded files in memory (no disk I/O needed)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Serve the frontend
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

/**
 * POST /upload
 * Accepts a multipart CSV file, runs DataProcessor on the in-memory content,
 * and returns the statistics JSON.
 */
app.post('/upload', upload.single('csvfile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded.' });
  }

  try {
    // Write the uploaded buffer to a temp file so DataProcessor can read it
    const tmpPath = path.join(__dirname, `_tmp_${Date.now()}.csv`);
    await import('fs').then((fs) => fs.promises.writeFile(tmpPath, req.file.buffer));

    const processor = new DataProcessor(tmpPath);
    await processor.loadData();
    processor.calculateStatistics();
    const result = {
      summary: processor.getSummary(),
      statistics: processor.stats,
    };

    // Clean up temp file
    await import('fs').then((fs) => fs.promises.unlink(tmpPath));

    // Return the original filename in the summary instead of the temp path
    result.summary.filename = req.file.originalname;

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler for multer errors (e.g. wrong file type)
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
