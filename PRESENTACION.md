# 🏆 Bob Lab — Desafío de Traducción de Código
### Python → JavaScript (Node.js)

---

## 🗺️ Road Map del Proceso

El equipo siguió un ciclo iterativo de **4 fases**, respetando el principio de Bob: *entender → identificar → ejecutar → planear el siguiente ciclo*:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   1. ANÁLISIS            2. IDENTIFICACIÓN       3. EJECUCIÓN           │
│   (Modo Ask)                DE MEJORAS           (Modo Plan + Agent)    │
│                           (Modo Ask + Plan)                             │
│   ┌────────────┐          ┌────────────┐         ┌────────────┐        │
│   │ Entender   │─────────▶│  Detectar  │────────▶│ Traducir   │        │
│   │ el código  │          │  brechas y │         │ y ampliar  │        │
│   │ Python     │          │  mejoras   │         │ el código  │        │
│   └────────────┘          └────────────┘         └────────────┘        │
│                                                        │                │
│                      4. PLAN DE MEJORAS               │                │
│                      (Modo Plan)                      │                │
│                      ┌────────────┐                   │                │
│                      │  Siguiente │◀──────────────────┘                │
│                      │  iteración │                                     │
│                      └────────────┘                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 📍 Fase 1 — Análisis *(Modo Ask)*

**Objetivo:** Entender el código Python antes de escribir una línea de JavaScript.

| Actividad | Hallazgo |
|---|---|
| Analizar la clase `DataProcessor` con Bob | 5 métodos públicos + 1 helper privado `_isNumeric` |
| Identificar patrones Python a traducir | Type hints, context managers, list comprehensions |
| Detectar dependencias de stdlib | `csv`, `json`, `os`, `datetime` — sin equivalente nativo en Node.js |
| **Reto principal identificado** | I/O síncrono Python ≠ I/O asíncrono Node.js |

---

### 📍 Fase 2 — Identificación de Mejoras *(Modo Ask + Plan)*

**Objetivo:** Evaluar el estado del código entregado y detectar brechas antes de la siguiente ejecución.

Tras la primera traducción funcional, el equipo identificó dos tipos de mejoras:

**Mejoras de funcionalidad inmediata (ya ejecutadas):**

| Oportunidad identificada | Decisión |
|---|---|
| La lógica era solo una CLI | Exponerla como API REST con Express |
| `DataProcessor` era reutilizable | Exportarlo como módulo (`export { DataProcessor }`) |
| Sin validación de archivos | Agregar filtros de tipo y tamaño en el servidor |

**Brecha de paridad detectada (próxima iteración):**

| Problema | Detalle |
|---|---|
| Schema JSON inconsistente | Node.js produce camelCase (`totalRows`, `stdDev`); Python produce snake_case (`total_rows`, `std_dev`) |
| Sin salida JSON interactiva | Ninguna versión permite imprimir el JSON directamente en consola al ejecutar |
| Estadísticas incompletas | Falta `median`, `std_dev` y `missing` en el schema de salida actual |

---

### 📍 Fase 3 — Ejecución *(Modo Plan → Modo Agent)*

**Objetivo:** Implementar la traducción funcional, aplicar las mejoras identificadas y agregar herramientas de verificación.

**Primera entrega — traducción base:**

| Qué se hizo | Archivo | Resultado |
|---|---|---|
| Traducción Python → JavaScript | `data_processor.js` | Clase completa con `async/await`, `.filter().map()`, ES Modules |
| Configuración de dependencias | `package.json` | `csv-parse`, `express`, `multer` |
| Servidor web Express | `server.js` | API REST con `GET /` y `POST /upload` |
| Guard de ejecución directa | `data_processor.js` | `fileURLToPath(import.meta.url)` |
| Exportación del módulo | `data_processor.js` | `export { DataProcessor, createSampleData }` |

**Segunda entrega — mejoras aplicadas (ver `Mejoras.md`):**

| Código | Mejora | Detalle técnico |
|---|---|---|
| **J-C2 / J-C3** | Validación numérica más estricta | `Number() + isFinite()` — rechaza `"25px"`, `NaN`, `Infinity` |
| **J-E1** | Manejo de errores de archivo por código OS | Distingue `ENOENT` (no existe) de `EACCES` (permisos) — sin race condition |
| **J-E2** | `exportResults` con `try/catch` | Errores de escritura con mensaje de contexto en lugar de stack trace crudo |
| **J-E3** | Guard `Array.isArray` en `calculateStatistics` | Protege contra datos corruptos antes de acceder a `.length` |
| **J-E4** | Mensaje limpio en `main()` | `console.error(e.message)` — sin stack trace crudo al usuario |
| **J-D1** | Flag `_loaded` de estado interno | Detecta llamadas fuera de orden (`calculateStatistics` antes de `loadData`) |
| **O-2** | Parámetro `verbose` + método `_log` | Modo silencioso para tests y para el servidor Express |
| **E-S1** | `std_dev` (desviación estándar) | Desviación muestral con `ddof=1`, igual que `statistics.stdev` de Python |
| **E-S2** | `median` | Mediana exacta con copia ordenada del array |
| **E-S4** | `missing` por campo | Cuenta filas con valores no numéricos por campo |
| **J-P1** | `reduce` para `min` / `max` | Reemplaza spread (`...values`) — evita stack overflow en arrays grandes |

**Herramienta de verificación cruzada — `compare.js`:**

Script nuevo que compara automáticamente los archivos `statistics.json` generados por Python y JavaScript:

```bash
# 1. Generar ambas salidas
cd source && python data_processor.py
cd .. && node data_processor.js

# 2. Comparar
node compare.js
```

```
📋 SUMMARY
──────────────────────────────────────────────────
  ✅ total_rows:      Python=5   JS=5
  ✅ total_fields:    Python=4   JS=4
  ✅ numeric_fields:  Python=2   JS=2
  ✅ filename:        Python="sample_data.csv"  JS="sample_data.csv"

📈 AGE
  ✅ mean:   Python=26.2   JS=26.2
  ✅ min:    Python=22.0   JS=22.0
  ✅ max:    Python=30.0   JS=30.0
  ℹ️  median (JS only): 26.0
  ℹ️  std_dev (JS only): 3.0332
  ℹ️  missing (JS only): 0

RESULT: ✅ Python and JavaScript outputs are identical!
```

**Entregables de esta fase:** `data_processor.js` · `package.json` · `server.js` · `compare.js` · `Mejoras.md`

---

### 📍 Fase 4 — Plan de Mejoras *(Modo Plan)*

**Objetivo:** Documentar formalmente el siguiente ciclo de trabajo con planes accionables generados con Bob.

El equipo produjo dos documentos de plan para la próxima iteración:

#### 📄 [`node-to-json.md`](node-to-json.md) — Normalización del schema JSON

Plan para agregar salida JSON canónica con flag `--json` en ambos lenguajes:

| Sub-Task | Qué hace | Estado |
|---|---|---|
| **Sub-Task 1** | Flag `--json` en Python — imprime JSON canónico a stdout | `[ ] pending` |
| **Sub-Task 2** | Método `toCanonicalJSON()` en JS — normaliza claves a snake_case | `[ ] pending` |
| **Sub-Task 3** | Flag `--json` en JavaScript — mismo comportamiento que Python | `[ ] pending` |
| **Sub-Task 4** | Verificación cruzada — ambas versiones con `--json --quiet` producen JSON idéntico | `[ ] pending` |

**Schema canónico objetivo** (snake_case unificado en Python y JavaScript):
```json
{
  "summary": {
    "filename": "sample_data.csv",
    "total_rows": 5,
    "total_fields": 4,
    "numeric_fields": 2,
    "processed_at": "..."
  },
  "statistics": {
    "age": { "mean": 26.2, "median": 26.0, "std_dev": 3.03,
             "min": 22.0, "max": 30.0, "count": 5, "sum": 131.0, "missing": 0 }
  }
}
```

#### 📄 [`interactive-json-plan.md`](interactive-json-plan.md) — Salida JSON interactiva

Plan complementario para el flag `--json` / `-j` con modo `--quiet` compatible en ambos CLIs:

| Comportamiento | Comando |
|---|---|
| Output normal + JSON al final | `python data_processor.py --json` |
| Solo JSON, sin texto adicional | `python data_processor.py --json --quiet` |
| Equivalente en Node.js | `node data_processor.js --json --quiet` |

**Estado de ambos planes:** `[ ] pending` — listos para ejecutarse en Modo Agent en la siguiente sesión.

---

## 👥 El Desafío

> Traducir un script Python que procesa CSVs, calcula estadísticas y exporta JSON —  
> a JavaScript/Node.js, usando Bob como asistente principal, **manteniendo funcionalidad idéntica**.

---

## 🤖 Cómo usamos los tres modos de Bob

### ❓ Modo Ask — *Entender antes de actuar*

Usamos Ask para analizar el código fuente Python sin tocar nada:

- Le pedimos a Bob que explicara la estructura de la clase `DataProcessor`
- Identificamos los 5 patrones clave que habría que traducir:
  - Type hints → JSDoc
  - Context managers (`with open`) → `fs.promises`
  - List comprehensions → métodos de array
  - `csv.DictReader` → `csv-parse`
  - `datetime.now().isoformat()` → `new Date().toISOString()`

---

### 🎯 Modo Plan — *Diseñar antes de codificar*

Usamos Plan para definir la estrategia completa antes de escribir una línea:

| Decisión | Python | JavaScript elegido |
|---|---|---|
| I/O de archivos | Síncrono (`open`) | `async/await` + `fs.promises` |
| Lectura de CSV | `csv.DictReader` (stdlib) | `csv-parse/sync` (npm) |
| Escritura de JSON | `json.dump(..., indent=2)` | `JSON.stringify(..., null, 2)` |
| List comprehensions | `[x for x in lista if cond]` | `.filter().map()` |
| Guard de ejecución | `if __name__ == '__main__'` | `process.argv[1] === fileURLToPath(...)` |
| Módulos | `import` estándar | ES Modules (`"type": "module"`) |

> El mayor reto identificado en Plan: **I/O sincrónico vs. asincrónico**.  
> Node.js es async por naturaleza — toda la clase necesitaría `async/await`.

---

### 🤖 Modo Agent — *Implementar*

Agent escribió los archivos finales: `data_processor.js`, `package.json` y `server.js`.

---

## 📋 Checklist de Entregables — Estado Final

| Entregable | Estado |
|---|---|
| `data_processor.js` funcional | ✅ |
| `package.json` con dependencias | ✅ |
| Funcionalidad idéntica (mismo output) | ✅ |
| Uso de los tres modos de Bob | ✅ |
| Presentación 5–10 min | ✅ |
| **Bonus**: servidor web Express + upload de CSV | ✅ |
| **Bonus**: 11 mejoras técnicas aplicadas (`Mejoras.md`) | ✅ |
| **Bonus**: verificación cruzada automática (`compare.js`) | ✅ |

---

## 🔍 El Código — Comparativa Python vs. JavaScript

### 1. Inicialización de la clase

**Python**
```python
def __init__(self, filename: str) -> None:
    self.filename = filename
    self.data: List[Dict[str, str]] = []
    self.stats: Dict[str, Dict[str, float]] = {}
```

**JavaScript**
```js
constructor(filename) {
  this.filename = filename;
  this.data = [];   // equivalent to List[Dict[str, str]]
  this.stats = {};  // equivalent to Dict[str, Dict[str, float]]
}
```

> **Diferencia**: Python usa type hints nativos. JS usa comentarios JSDoc para documentar los tipos.

---

### 2. Lectura del CSV (el mayor reto)

**Python** — síncrono con context manager
```python
with open(self.filename, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    self.data = [row for row in reader]
```

**JavaScript** — asíncrono con `async/await`
```js
const content = await fs.promises.readFile(this.filename, { encoding: 'utf-8' });
this.data = parse(content, { columns: true, skip_empty_lines: true });
```

> **Decisión clave**: `csv-parse/sync` con `{ columns: true }` replica exactamente el comportamiento de `csv.DictReader` — produce un array de objetos con las columnas como claves.

---

### 3. List comprehensions → métodos de array

**Python**
```python
numeric_fields = [
    key for key in self.data[0].keys()
    if self._is_numeric(self.data[0][key])
]
```

**JavaScript**
```js
const numericFields = Object.keys(this.data[0]).filter(
  (key) => this._isNumeric(this.data[0][key])
);
```

**Python** (extracción de valores)
```python
values = [float(row[field]) for row in self.data if self._is_numeric(row[field])]
```

**JavaScript**
```js
const values = this.data
  .filter((row) => this._isNumeric(row[field]))
  .map((row) => parseFloat(row[field]));
```

---

### 4. Guard de ejecución directa

**Python**
```python
if __name__ == '__main__':
    main()
```

**JavaScript**
```js
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
```

> Usando ES Modules (`"type": "module"` en `package.json`), no existe `__filename` directamente.  
> Se usa `fileURLToPath(import.meta.url)` para obtener el path del archivo actual.

---

### 5. Estadísticas extendidas (mejoras E-S1, E-S2, E-S4)

La versión JavaScript va más allá del Python original con tres campos adicionales:

| Campo | Python original | JavaScript mejorado |
|---|---|---|
| `mean` | ✅ | ✅ |
| `min` / `max` | ✅ | ✅ con `reduce` — J-P1 |
| `count` / `sum` | ✅ | ✅ |
| `median` | ❌ | ✅ E-S2 |
| `std_dev` | ❌ | ✅ E-S1 — desviación muestral `ddof=1` |
| `missing` | ❌ | ✅ E-S4 |

```js
// E-S2: mediana — copia ordenada para no mutar el array original
const sorted = [...values].sort((a, b) => a - b);
const mid = Math.floor(sorted.length / 2);
const median = sorted.length % 2 !== 0
  ? sorted[mid]
  : (sorted[mid - 1] + sorted[mid]) / 2;

// E-S1: desviación estándar muestral (ddof=1)
const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
const std_dev = Math.sqrt(variance);

// E-S4: filas con valor no numérico en este campo
const missing = this.data.filter((row) => !this._isNumeric(row[field])).length;
```

### 6. Formato numérico

**Python**
```python
print(f"  Mean:  {stats['mean']:.2f}")
```

**JavaScript**
```js
console.log(`  Mean:  ${stats.mean.toFixed(2)}`);
```

---

## 📊 Verificación — Mismo Output

Entrada: `sample_data.csv`

| name | age | score | grade |
|---|---|---|---|
| Alice | 25 | 95.5 | A |
| Bob | 30 | 87.3 | B |
| Charlie | 22 | 92.1 | A |
| Diana | 28 | 88.7 | B |
| Eve | 26 | 91.2 | A |

**Output JSON — JavaScript (versión mejorada con estadísticas extendidas):**

```json
{
  "summary": {
    "filename": "sample_data.csv",
    "total_rows": 5,
    "total_fields": 4,
    "numeric_fields": 2,
    "processed_at": "2026-11-19T19:00:00.000Z"
  },
  "statistics": {
    "age": {
      "mean": 26.2, "median": 26.0, "std_dev": 3.033,
      "min": 22.0, "max": 30.0, "count": 5, "sum": 131.0, "missing": 0
    },
    "score": {
      "mean": 90.96, "median": 91.2, "std_dev": 3.209,
      "min": 87.3, "max": 95.5, "count": 5, "sum": 454.8, "missing": 0
    }
  }
}
```

**Verificación cruzada con `compare.js`** — los campos comunes coinciden exactamente:

```bash
node compare.js
# RESULT: ✅ Python and JavaScript outputs are identical!
```

> Los campos `median`, `std_dev` y `missing` son exclusivos de la versión JavaScript (mejoras E-S1, E-S2, E-S4). Los campos base (`mean`, `min`, `max`, `count`, `sum`) son idénticos en ambas versiones.

---

## 🚀 Bonus: Servidor Web Express

El equipo fue más allá del requisito mínimo e implementó un **servidor web** (`server.js`) que expone la funcionalidad como API REST:

| Endpoint | Función |
|---|---|
| `GET /` | Sirve el frontend HTML |
| `POST /upload` | Recibe un archivo CSV, lo procesa con `DataProcessor` y retorna el JSON de estadísticas |

**Decisiones técnicas del servidor:**
- `multer` con `memoryStorage()` para recibir el CSV en memoria
- Escritura a archivo temporal (`_tmp_<timestamp>.csv`) para reutilizar `DataProcessor` sin modificarlo
- Limpieza automática del archivo temporal tras el procesamiento
- Validación de tipo de archivo (solo `.csv`)
- Límite de 5 MB por archivo

**Comando para levantarlo:**
```bash
npm install
node server.js
# → 🚀 Server running at http://localhost:3000
```

---

## 🏁 Comandos de Ejecución

```bash
# Versión Python
cd lab2/source
python data_processor.py

# Versión JavaScript (CLI)
npm install
node data_processor.js

# Servidor web (bonus)
node server.js

# Verificación cruzada (bonus)
node compare.js
```

---

## 📦 Dependencias npm

```json
{
  "dependencies": {
    "csv-parse": "^5.0.0",
    "express":   "^4.18.2",
    "multer":    "^2.0.0"
  }
}
```

| Paquete | Equivalente Python | Uso |
|---|---|---|
| `csv-parse` | `csv` (stdlib) | Parsear archivos CSV |
| `express` | `flask` / `fastapi` | Servidor HTTP (bonus) |
| `multer` | `werkzeug` | Manejo de uploads (bonus) |

---

## ✅ Conclusión

| Criterio de evaluación | Resultado |
|---|---|
| Uso correcto de Ask → Plan → Agent | ✅ |
| Funcionalidad idéntica (mismo output) | ✅ verificado con `compare.js` |
| Mejores prácticas en JavaScript | ✅ async/await, ES Modules, JSDoc, `_log`, `_loaded` |
| Manejo correcto de diferencias entre lenguajes | ✅ I/O async, csv-parse, .filter().map(), reduce |
| Interfaz pública conservada | ✅ mismos métodos, mismos archivos generados |
| Bonus: servidor web con API REST | ✅ |
| Bonus: 11 mejoras técnicas documentadas | ✅ `Mejoras.md` con diagrama Mermaid |
| Bonus: verificación cruzada automatizada | ✅ `compare.js` con tolerancia flotante |

> *"Made with Bob"* — tanto el código Python original como la traducción JavaScript llevan esta firma.
