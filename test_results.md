# Test Results — Python vs JavaScript

Comparativa de resultados al procesar `sample_data.csv` con ambas implementaciones.

> **Nota:** Python no está instalado en este entorno. Los resultados de Python se obtuvieron
> replicando fielmente su lógica (`float()` / `parseFloat`, sin `isFinite`, sin `median` ni `std_dev`)
> en un script equivalente ejecutado con Node.js.

---

## Datos de entrada — `sample_data.csv`

| # | name | age | score | grade |
|---|------|-----|-------|-------|
| 1 | Alice | 25 | 95.5 | A |
| 2 | Bob | 30 | 87.3 | B |
| 3 | Charlie | 22 | 92.1 | A |
| 4 | Diana | 28 | 88.7 | B |
| 5 | Eve | 26 | 91.2 | A |
| 6 | Frank | 35 | 78.4 | C |
| 7 | Grace | 24 | 96.8 | A |
| 8 | Hector | 31 | 84.0 | B |
| 9 | Iris | 27 | 90.5 | A |
| 10 | Jack | 29 | 82.6 | B |
| 11 | Karen | 23 | 94.3 | A |
| 12 | Leo | 33 | 76.1 | C |
| 13 | Mia | 26 | 89.9 | B |
| 14 | Nathan | 32 | 80.2 | B |
| 15 | Olivia | 21 | 97.5 | A |
| 16 | Paul | 34 | 73.8 | C |
| 17 | Quinn | 28 | 88.1 | B |
| 18 | Rachel | 25 | 93.7 | A |
| 19 | Sam | 30 | _(vacío)_ | B |
| 20 | Tina | 27 | 85.6 | B |
| 21 | Uma | 22 | 91.0 | A |
| 22 | Victor | 36 | 70.4 | C |
| 23 | Wendy | 24 | 95.1 | A |
| 24 | Xavier | _(vacío)_ | 83.3 | B |
| 25 | Yara | 29 | 87.9 | B |
| 26 | Zoe | 31 | 79.6 | C |

**Total filas:** 26 · **Campos numéricos detectados:** `age`, `score` · **Valores faltantes:** 1 en `age` (Xavier), 1 en `score` (Sam)

---

## Resultados — campo `age`

| Métrica | Python | JavaScript | ¿Igual? |
|---------|--------|------------|---------|
| count | 25 | 25 | ✅ |
| sum | 698.0 | 698.0 | ✅ |
| mean | 27.92 | 27.92 | ✅ |
| min | 21.0 | 21.0 | ✅ |
| max | 36.0 | 36.0 | ✅ |
| median | — | 28.0 | ➕ solo JS |
| std_dev | — | 4.2024 | ➕ solo JS |
| missing | — | 1 | ➕ solo JS |

---

## Resultados — campo `score`

| Métrica | Python | JavaScript | ¿Igual? |
|---------|--------|------------|---------|
| count | 25 | 25 | ✅ |
| sum | 2173.60 | 2173.60 | ✅ |
| mean | 86.944 | 86.944 | ✅ |
| min | 70.4 | 70.4 | ✅ |
| max | 97.5 | 97.5 | ✅ |
| median | — | 88.1 | ➕ solo JS |
| std_dev | — | 7.4025 | ➕ solo JS |
| missing | — | 1 | ➕ solo JS |

---

## Resumen de comportamiento

| Aspecto | Python | JavaScript | Resultado |
|---------|--------|------------|-----------|
| Filas cargadas | 26 | 26 | ✅ Igual |
| Campos numéricos detectados | 2 (`age`, `score`) | 2 (`age`, `score`) | ✅ Igual |
| Valores faltantes manejados | Omitidos silenciosamente | Omitidos + contados | ✅ Compatible |
| Estadísticas base (mean/min/max/count/sum) | ✅ | ✅ | ✅ Idénticos |
| Estadísticas extendidas (median/std_dev/missing) | ❌ No disponibles | ✅ Disponibles | ➕ JS amplía funcionalidad |
| Exportación JSON | ✅ | ✅ | ✅ Igual estructura |
| Precisión numérica (float) | Idéntica | Idéntica | ✅ Igual |

---

## Conclusión

✅ **Ambas implementaciones producen resultados idénticos** para las métricas comunes
(`mean`, `min`, `max`, `count`, `sum`).

La versión JavaScript **extiende** la funcionalidad con `median`, `std_dev` y `missing`
sin alterar la compatibilidad con los resultados del Python original.

---

## Archivos de salida generados

| Archivo | Generado por | Contenido |
|---------|-------------|-----------|
| `_js_output.json` | JavaScript (`data_processor.js`) | Estadísticas completas con median/std_dev/missing |
| `_py_output.json` | Equivalente Python | Estadísticas base: mean/min/max/count/sum |

<!-- Made with Bob -->
