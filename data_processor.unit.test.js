/**
 * Tests Unitarios — DataProcessor
 *
 * Verifican cada metodo de la clase DataProcessor de forma aislada,
 * sin tocar el sistema de archivos.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { DataProcessor } from './data_processor.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Crea un DataProcessor con verbose=false (sin console.log) */
function makeProcessor(filename = 'dummy.csv') {
  return new DataProcessor(filename, false);
}

/** Inyecta datos directamente en el procesador sin I/O */
function injectData(processor, rows) {
  processor.data = rows;
  processor._loaded = true;
}

// ─── constructor ──────────────────────────────────────────────────────────────

describe('constructor', () => {
  it('inicializa filename, data, stats y verbose', () => {
    const dp = makeProcessor('test.csv');
    expect(dp.filename).toBe('test.csv');
    expect(dp.data).toEqual([]);
    expect(dp.stats).toEqual({});
    expect(dp.verbose).toBe(false);
    expect(dp._loaded).toBe(false);
  });

  it('lanza TypeError si filename es una cadena vacia', () => {
    expect(() => new DataProcessor('')).toThrow(TypeError);
    expect(() => new DataProcessor('')).toThrow('filename must be a non-empty string');
  });

  it('lanza TypeError si filename es un numero', () => {
    expect(() => new DataProcessor(42)).toThrow(TypeError);
  });

  it('lanza TypeError si filename es null', () => {
    expect(() => new DataProcessor(null)).toThrow(TypeError);
  });
});

// ─── _isNumeric ───────────────────────────────────────────────────────────────

describe('_isNumeric', () => {
  let dp;
  beforeEach(() => { dp = makeProcessor(); });

  it('acepta un entero como string', () => expect(dp._isNumeric('25')).toBe(true));
  it('acepta un decimal como string', () => expect(dp._isNumeric('95.5')).toBe(true));
  it('acepta un numero negativo', () => expect(dp._isNumeric('-12.3')).toBe(true));
  it('acepta cero', () => expect(dp._isNumeric('0')).toBe(true));

  it('rechaza una cadena vacia', () => expect(dp._isNumeric('')).toBe(false));
  it('rechaza una cadena de letras', () => expect(dp._isNumeric('abc')).toBe(false));
  it('rechaza "25px" (Number() es mas estricto que parseFloat)', () => expect(dp._isNumeric('25px')).toBe(false));
  it('rechaza "Infinity"', () => expect(dp._isNumeric('Infinity')).toBe(false));
  it('rechaza "-Infinity"', () => expect(dp._isNumeric('-Infinity')).toBe(false));
  it('rechaza null', () => expect(dp._isNumeric(null)).toBe(false));
  it('rechaza undefined', () => expect(dp._isNumeric(undefined)).toBe(false));
  it('rechaza una cadena de espacios', () => expect(dp._isNumeric('   ')).toBe(false));
});

// ─── calculateStatistics ──────────────────────────────────────────────────────

describe('calculateStatistics', () => {
  let dp;

  beforeEach(() => {
    dp = makeProcessor();
    injectData(dp, [
      { name: 'Alice',   age: '25', score: '95.5', grade: 'A' },
      { name: 'Bob',     age: '30', score: '87.3', grade: 'B' },
      { name: 'Charlie', age: '22', score: '92.1', grade: 'A' },
      { name: 'Diana',   age: '28', score: '88.7', grade: 'B' },
      { name: 'Eve',     age: '26', score: '91.2', grade: 'A' },
    ]);
  });

  it('retorna un objeto con los campos numericos', () => {
    const stats = dp.calculateStatistics();
    expect(stats).toHaveProperty('age');
    expect(stats).toHaveProperty('score');
    expect(stats).not.toHaveProperty('name');
    expect(stats).not.toHaveProperty('grade');
  });

  it('calcula el promedio correctamente', () => {
    const stats = dp.calculateStatistics();
    // age: (25+30+22+28+26)/5 = 131/5 = 26.2
    expect(stats.age.mean).toBeCloseTo(26.2, 10);
    // score: (95.5+87.3+92.1+88.7+91.2)/5 = 454.8/5 = 90.96
    expect(stats.score.mean).toBeCloseTo(90.96, 10);
  });

  it('calcula el minimo y el maximo', () => {
    const stats = dp.calculateStatistics();
    expect(stats.age.min).toBe(22);
    expect(stats.age.max).toBe(30);
    expect(stats.score.min).toBeCloseTo(87.3, 5);
    expect(stats.score.max).toBeCloseTo(95.5, 5);
  });

  it('calcula la suma', () => {
    const stats = dp.calculateStatistics();
    expect(stats.age.sum).toBeCloseTo(131, 10);
  });

  it('calcula el conteo', () => {
    const stats = dp.calculateStatistics();
    expect(stats.age.count).toBe(5);
  });

  it('calcula la mediana con numero impar de valores', () => {
    const stats = dp.calculateStatistics();
    // age ordenado: [22, 25, 26, 28, 30] → mediana = 26
    expect(stats.age.median).toBe(26);
  });

  it('calcula la mediana con numero par de valores', () => {
    const dp2 = makeProcessor();
    injectData(dp2, [
      { val: '10' },
      { val: '20' },
      { val: '30' },
      { val: '40' },
    ]);
    const stats = dp2.calculateStatistics();
    // ordenado: [10, 20, 30, 40] → mediana = (20+30)/2 = 25
    expect(stats.val.median).toBe(25);
  });

  it('calcula la desviacion estandar muestral (ddof=1)', () => {
    const dp2 = makeProcessor();
    injectData(dp2, [{ v: '2' }, { v: '4' }, { v: '4' }, { v: '4' }, { v: '5' }, { v: '5' }, { v: '7' }, { v: '9' }]);
    const stats = dp2.calculateStatistics();
    // stdDev muestral (ddof=1) para [2,4,4,4,5,5,7,9] = sqrt(32.5/7) ≈ 2.1381
    expect(stats.v.std_dev).toBeCloseTo(2.1381, 3);
  });

  it('cuenta los valores faltantes', () => {
    const dp2 = makeProcessor();
    injectData(dp2, [
      { val: '10' },
      { val: 'N/A' },
      { val: '30' },
    ]);
    const stats = dp2.calculateStatistics();
    expect(stats.val.missing).toBe(1);
  });

  it('retorna {} si data esta vacio', () => {
    const dp2 = makeProcessor();
    expect(dp2.calculateStatistics()).toEqual({});
  });

  it('retorna {} si data no es un arreglo', () => {
    const dp2 = makeProcessor();
    dp2.data = null;
    expect(dp2.calculateStatistics()).toEqual({});
  });

  it('almacena las stats en this.stats', () => {
    dp.calculateStatistics();
    expect(dp.stats).toHaveProperty('age');
  });
});

// ─── getSummary ───────────────────────────────────────────────────────────────

describe('getSummary', () => {
  it('retorna las claves correctas', () => {
    const dp = makeProcessor('myfile.csv');
    injectData(dp, [{ a: '1', b: '2' }]);
    dp.calculateStatistics();
    const summary = dp.getSummary();

    expect(summary.filename).toBe('myfile.csv');
    expect(summary.total_rows).toBe(1);
    expect(summary.total_fields).toBe(2);
    expect(summary.numeric_fields).toBe(2);
    expect(typeof summary.processed_at).toBe('string');
  });

  it('retorna total_fields=0 si data esta vacio', () => {
    const dp = makeProcessor();
    const summary = dp.getSummary();
    expect(summary.total_fields).toBe(0);
    expect(summary.total_rows).toBe(0);
  });
});
