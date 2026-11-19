/**
 * Tests de Integracion — DataProcessor
 *
 * Verifican el flujo completo loadData() → calculateStatistics() → exportResults()
 * usando archivos CSV reales en un directorio temporal.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DataProcessor, createSampleData } from './data_processor.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Directorio temporal compartido por todos los tests ──────────────────────

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dp-integration-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** Escribe un CSV en tmpDir y retorna su ruta absoluta */
function writeCsv(filename, content) {
  const filepath = path.join(tmpDir, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

// ─── loadData ─────────────────────────────────────────────────────────────────

describe('loadData()', () => {
  it('carga las filas de un CSV valido', async () => {
    const csv = 'name,age,score\nAlice,25,95.5\nBob,30,87.3\n';
    const file = writeCsv('valid.csv', csv);
    const dp = new DataProcessor(file, false);

    await dp.loadData();

    expect(dp.data.length).toBe(2);
    expect(dp.data[0]).toMatchObject({ name: 'Alice', age: '25', score: '95.5' });
    expect(dp._loaded).toBe(true);
  });

  it('lanza un error si el archivo no existe', async () => {
    const dp = new DataProcessor('/tmp/archivo_inexistente_xyz.csv', false);
    await expect(dp.loadData()).rejects.toThrow('File not found');
  });

  it('ignora las lineas vacias', async () => {
    const csv = 'name,age\nAlice,25\n\nBob,30\n';
    const file = writeCsv('empty-lines.csv', csv);
    const dp = new DataProcessor(file, false);

    await dp.loadData();

    expect(dp.data.length).toBe(2);
  });
});

// ─── Flujo completo ───────────────────────────────────────────────────────────

describe('flujo completo: loadData → calculateStatistics', () => {
  it('produce las estadisticas correctas con el CSV de demostracion', async () => {
    // Datos identicos al CSV de demostracion de Python
    const csv = [
      'name,age,score,grade',
      'Alice,25,95.5,A',
      'Bob,30,87.3,B',
      'Charlie,22,92.1,A',
      'Diana,28,88.7,B',
      'Eve,26,91.2,A',
    ].join('\n');

    const file = writeCsv('demo.csv', csv);
    const dp = new DataProcessor(file, false);

    await dp.loadData();
    const stats = dp.calculateStatistics();

    expect(stats.age.mean).toBeCloseTo(26.2, 10);
    expect(stats.age.min).toBe(22);
    expect(stats.age.max).toBe(30);
    expect(stats.age.count).toBe(5);
    expect(stats.age.sum).toBeCloseTo(131, 10);

    expect(stats.score.mean).toBeCloseTo(90.96, 5);
    expect(stats.score.min).toBeCloseTo(87.3, 5);
    expect(stats.score.max).toBeCloseTo(95.5, 5);

    // Los campos no numericos no deben aparecer en las stats
    expect(stats).not.toHaveProperty('name');
    expect(stats).not.toHaveProperty('grade');
  });

  it('maneja valores faltantes sin lanzar error', async () => {
    const csv = 'val\n10\nN/A\n30\n';
    const file = writeCsv('missing.csv', csv);
    const dp = new DataProcessor(file, false);

    await dp.loadData();
    const stats = dp.calculateStatistics();

    expect(stats.val.count).toBe(2);
    expect(stats.val.missing).toBe(1);
    expect(stats.val.mean).toBeCloseTo(20, 10);
  });
});

// ─── exportResults ────────────────────────────────────────────────────────────

describe('exportResults()', () => {
  it('escribe un JSON valido con summary y statistics', async () => {
    const csv = 'age,score\n25,95.5\n30,87.3\n';
    const csvFile = writeCsv('export-src.csv', csv);
    const outputFile = path.join(tmpDir, 'output.json');

    const dp = new DataProcessor(csvFile, false);
    await dp.loadData();
    dp.calculateStatistics();
    await dp.exportResults(outputFile);

    const raw = fs.readFileSync(outputFile, 'utf-8');
    const parsed = JSON.parse(raw);

    expect(parsed).toHaveProperty('summary');
    expect(parsed).toHaveProperty('statistics');
    expect(parsed.summary.total_rows).toBe(2);
    expect(parsed.statistics).toHaveProperty('age');
    expect(parsed.statistics).toHaveProperty('score');
  });

  it('no crea el archivo si las stats estan vacias', async () => {
    const dp = new DataProcessor('dummy.csv', false);
    const outputFile = path.join(tmpDir, 'should-not-exist.json');

    await dp.exportResults(outputFile);

    expect(fs.existsSync(outputFile)).toBe(false);
  });

  it('lanza un error si la ruta de salida es invalida', async () => {
    const csv = 'age\n25\n';
    const csvFile = writeCsv('err-src.csv', csv);
    const dp = new DataProcessor(csvFile, false);

    await dp.loadData();
    dp.calculateStatistics();

    await expect(
      dp.exportResults('/ruta/que/no/existe/output.json')
    ).rejects.toThrow('Error writing to file');
  });
});

// ─── createSampleData ─────────────────────────────────────────────────────────

describe('createSampleData()', () => {
  it('crea un CSV con 5 filas de datos mas el encabezado', async () => {
    const file = path.join(tmpDir, 'sample.csv');
    await createSampleData(file);

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.trim().split('\n');

    // encabezado + 5 filas de datos
    expect(lines.length).toBe(6);
    expect(lines[0]).toBe('name,age,score,grade');
    expect(lines[1]).toContain('Alice');
  });
});
