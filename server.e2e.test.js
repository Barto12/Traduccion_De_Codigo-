/**
 * Tests E2E — Servidor Express (server.js)
 *
 * Verifican los endpoints HTTP mediante Supertest,
 * sin levantar un servidor real en un puerto de red.
 *
 * Endpoints cubiertos:
 *   GET  /        → sirve el HTML del frontend
 *   POST /upload  → recibe un CSV, retorna las estadisticas en JSON
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from './server.js';

// ─── CSV de prueba ────────────────────────────────────────────────────────────

const CSV_VALIDO = [
  'name,age,score,grade',
  'Alice,25,95.5,A',
  'Bob,30,87.3,B',
  'Charlie,22,92.1,A',
].join('\n');

const CSV_UNA_FILA = 'val\n42\n';

// ─── GET / ────────────────────────────────────────────────────────────────────

describe('GET /', () => {
  it('retorna 200 y HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});

// ─── POST /upload — casos exitosos ───────────────────────────────────────────

describe('POST /upload — exito', () => {
  it('retorna 200 con un CSV valido', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from(CSV_VALIDO), { filename: 'test.csv', contentType: 'text/csv' });

    expect(res.status).toBe(200);
  });

  it('retorna summary.total_rows correcto', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from(CSV_VALIDO), { filename: 'test.csv', contentType: 'text/csv' });

    expect(res.body.summary.total_rows).toBe(3);
  });

  it('retorna el nombre del archivo original en summary.filename', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from(CSV_VALIDO), { filename: 'mi_archivo.csv', contentType: 'text/csv' });

    expect(res.body.summary.filename).toBe('mi_archivo.csv');
  });

  it('retorna los campos numericos en statistics', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from(CSV_VALIDO), { filename: 'test.csv', contentType: 'text/csv' });

    expect(res.body.statistics).toHaveProperty('age');
    expect(res.body.statistics).toHaveProperty('score');
    expect(res.body.statistics).not.toHaveProperty('name');
    expect(res.body.statistics).not.toHaveProperty('grade');
  });

  it('calcula el promedio de age correctamente', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from(CSV_VALIDO), { filename: 'test.csv', contentType: 'text/csv' });

    // (25+30+22)/3 = 25.666...
    expect(res.body.statistics.age.mean).toBeCloseTo(25.667, 2);
  });

  it('funciona con un CSV de una sola fila de datos', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from(CSV_UNA_FILA), { filename: 'single.csv', contentType: 'text/csv' });

    expect(res.status).toBe(200);
    expect(res.body.statistics.val.count).toBe(1);
    expect(res.body.statistics.val.mean).toBe(42);
  });
});

// ─── POST /upload — casos de error ───────────────────────────────────────────

describe('POST /upload — errores', () => {
  it('retorna 400 si no se envia ningun archivo', async () => {
    const res = await request(app).post('/upload');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('retorna 400 si el archivo no es un CSV', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('csvfile', Buffer.from('<html>not a csv</html>'), {
        filename: 'pagina.html',
        contentType: 'text/html',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
