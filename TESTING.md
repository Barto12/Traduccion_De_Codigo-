# 🧪 Guía de Tests — Data Processor

> Documentación completa de la suite de tests del proyecto: qué se prueba, cómo ejecutarlos y cómo interpretarlos.

---

## ⚡ Comandos rápidos

```bash
# Instalar dependencias (incluye Jest y Supertest)
npm install

# Ejecutar todos los tests
npm test

# Ejecutar en modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Ejecutar solo los tests unitarios
npm test -- --testPathPattern=unit

# Ejecutar solo los tests de integración
npm test -- --testPathPattern=integration

# Ejecutar solo los tests E2E
npm test -- --testPathPattern=e2e
```

---

## 📁 Archivos de tests

| Archivo | Tipo | Descripción |
|---|---|---|
| [`data_processor.unit.test.js`](data_processor.unit.test.js) | Unitario | Prueba cada método de `DataProcessor` en aislamiento, sin I/O |
| [`data_processor.integration.test.js`](data_processor.integration.test.js) | Integración | Prueba el flujo completo con archivos CSV reales en disco |
| [`server.e2e.test.js`](server.e2e.test.js) | E2E | Prueba los endpoints HTTP del servidor Express vía Supertest |

---

## 🔬 Tests Unitarios — `data_processor.unit.test.js`

Prueban cada método de la clase [`DataProcessor`](data_processor.js) **sin tocar el sistema de archivos**. Los datos se inyectan directamente en el objeto para aislar la lógica pura.

### `constructor`

| Test | Qué verifica |
|---|---|
| Inicializa filename, data, stats y verbose | El estado inicial del objeto es correcto tras la construcción |
| Lanza `TypeError` si filename es cadena vacía | El guard de validación rechaza `""` con mensaje claro |
| Lanza `TypeError` si filename es un número | El guard rechaza tipos que no son string |
| Lanza `TypeError` si filename es null | El guard rechaza valores nulos |

### `_isNumeric(value)`

Método privado que determina si un valor puede tratarse como número. Usa `Number()` + `isFinite()` — más estricto que `parseFloat`.

| Test | Valor | Resultado esperado |
|---|---|---|
| Entero como string | `"25"` | `true` |
| Decimal como string | `"95.5"` | `true` |
| Número negativo | `"-12.3"` | `true` |
| Cero | `"0"` | `true` |
| Cadena vacía | `""` | `false` |
| Cadena de letras | `"abc"` | `false` |
| Número con unidad | `"25px"` | `false` (Number() lo rechaza, parseFloat no) |
| Infinito positivo | `"Infinity"` | `false` (isFinite() lo filtra) |
| Infinito negativo | `"-Infinity"` | `false` |
| null | `null` | `false` |
| undefined | `undefined` | `false` |
| Solo espacios | `"   "` | `false` |

### `calculateStatistics()`

| Test | Qué verifica |
|---|---|
| Retorna solo campos numéricos | `age` y `score` presentes; `name` y `grade` ausentes |
| Calcula el promedio (mean) | `age`: 26.2 · `score`: 90.96 |
| Calcula mínimo y máximo | `age.min` = 22, `age.max` = 30 |
| Calcula la suma | `age.sum` = 131 |
| Calcula el conteo | `age.count` = 5 |
| Calcula la mediana (impar) | `[22,25,26,28,30]` → mediana = 26 |
| Calcula la mediana (par) | `[10,20,30,40]` → mediana = (20+30)/2 = 25 |
| Calcula desviación estándar muestral (ddof=1) | serie `[2,4,4,4,5,5,7,9]` → std_dev ≈ 2.138 |
| Cuenta valores faltantes | `"N/A"` en el CSV → `missing` = 1 |
| Retorna `{}` si data está vacío | Sin datos cargados → objeto vacío sin error |
| Retorna `{}` si data no es un arreglo | Guard `Array.isArray` evita crash |
| Almacena las stats en `this.stats` | El estado interno queda actualizado |

### `getSummary()`

| Test | Qué verifica |
|---|---|
| Retorna las claves correctas | `filename`, `total_rows`, `total_fields`, `numeric_fields`, `processed_at` presentes |
| `total_fields` = 0 si data está vacío | No falla cuando no hay filas cargadas |

---

## 🔗 Tests de Integración — `data_processor.integration.test.js`

Prueban el flujo completo usando **archivos CSV reales** escritos en un directorio temporal (`/tmp/dp-integration-*/`). El directorio se crea antes de todos los tests y se elimina al finalizar.

### `loadData()`

| Test | Qué verifica |
|---|---|
| Carga las filas de un CSV válido | `data.length` = 2, columnas correctas, `_loaded` = true |
| Lanza error si el archivo no existe | Mensaje `"File not found: ..."` |
| Ignora líneas vacías | CSV con líneas en blanco → `data.length` = 2 (no 3) |

### Flujo completo: `loadData → calculateStatistics`

| Test | Qué verifica |
|---|---|
| Estadísticas correctas con el CSV de demostración | Reproduce los 5 registros de Alice/Bob/Charlie/Diana/Eve y valida mean, min, max, count, sum de `age` y `score` |
| Maneja valores faltantes sin lanzar error | `"N/A"` en el CSV → `count` = 2, `missing` = 1, `mean` = 20 |

### `exportResults(outputFile)`

| Test | Qué verifica |
|---|---|
| Escribe un JSON válido con `summary` y `statistics` | El archivo existe, es parseable, contiene las claves esperadas |
| No crea el archivo si las stats están vacías | Sin llamar a `calculateStatistics()`, no se genera ningún archivo |
| Lanza error si la ruta de salida es inválida | Ruta inexistente → error `"Error writing to file"` |

### `createSampleData(filename)`

| Test | Qué verifica |
|---|---|
| Crea un CSV con 5 filas de datos + encabezado | 6 líneas en total, encabezado `name,age,score,grade`, primera fila contiene `"Alice"` |

---

## 🌐 Tests E2E — `server.e2e.test.js`

Prueban el servidor Express usando **[Supertest](https://github.com/ladjs/supertest)**, que ejecuta peticiones HTTP reales contra `app` sin levantar un puerto de red. No es necesario iniciar el servidor manualmente.

### `GET /`

| Test | Qué verifica |
|---|---|
| Retorna 200 y HTML | El frontend se sirve correctamente |

### `POST /upload` — casos exitosos

| Test | Qué verifica |
|---|---|
| Retorna 200 con un CSV válido | El endpoint acepta el archivo y procesa sin error |
| `summary.total_rows` correcto | 3 filas en el CSV → `total_rows` = 3 |
| `summary.filename` es el nombre original | El nombre del archivo subido se conserva (no la ruta temporal) |
| Campos numéricos presentes en `statistics` | `age` y `score` presentes; `name` y `grade` ausentes |
| Promedio de `age` correcto | (25+30+22)/3 ≈ 25.667 |
| Funciona con una sola fila de datos | 1 fila → `count` = 1, `mean` = 42 |

### `POST /upload` — casos de error

| Test | Qué verifica |
|---|---|
| Retorna 400 si no se envía ningún archivo | Petición sin `csvfile` → `{ error: "..." }` |
| Retorna 400 si el archivo no es un CSV | Archivo HTML con `contentType: text/html` → `{ error: "..." }` |

---

## 🏗️ Configuración técnica

### Framework y herramientas

| Herramienta | Versión | Rol |
|---|---|---|
| [Jest](https://jestjs.io/) | 29+ | Framework de tests (runner, assertions, matchers) |
| [@jest/globals](https://jestjs.io/docs/api) | 29+ | Imports explícitos de `describe`, `it`, `expect` para ES modules |
| [Supertest](https://github.com/ladjs/supertest) | 7+ | Cliente HTTP para tests E2E del servidor Express |

### Compatibilidad con ES Modules

El proyecto usa `"type": "module"` en [`package.json`](package.json), lo que requiere una configuración especial para Jest:

```json
"scripts": {
  "test": "node --experimental-vm-modules node_modules/.bin/jest"
},
"jest": {
  "transform": {},
  "testEnvironment": "node"
}
```

El flag `--experimental-vm-modules` permite a Jest ejecutar archivos `.js` con sintaxis `import`/`export` sin transpilación.

---

*Hecho con IBM Bob* 🤖
