# 🏆 Bob Lab — Desafío de Traducción de Código

> **Competencia por equipos · Python → JavaScript (Node.js)**

---

## ¿En qué consiste el desafío?

Tienen en sus manos un script de Python que procesa datos desde un archivo CSV, calcula estadísticas y exporta resultados a JSON. Su misión como equipo es **traducirlo a JavaScript (Node.js)** usando Bob como asistente principal, manteniendo la funcionalidad completa y aplicando las mejores prácticas de cada lenguaje.

El equipo que entregue la mejor traducción **y** la mejor presentación se lleva la victoria.

---

## 📁 Estructura del proyecto

```
lab2/
├── source/
│   ├── data_processor.py     ← código fuente original Python
│   └── sample_data.csv       ← datos de prueba compartidos
├── public/
│   └── index.html            ← frontend web (drag & drop + visualización)
├── data_processor.js         ← traducción JavaScript
├── server.js                 ← backend Express (API REST)
├── compare.js                ← script de verificación Python vs JS
├── package.json              ← dependencias npm
└── README.md                 ← este archivo
```

---

## ✅ Criterios de evaluación

Para ganar, su entrega debe demostrar:

- Uso correcto de los tres modos de Bob (Ask → Plan → Agent)
- Funcionalidad idéntica entre ambas versiones (mismo output ante el mismo input)
- Aplicación de mejores prácticas en Python **y** en JavaScript
- Manejo correcto de las diferencias entre lenguajes
- Claridad y calidad de la presentación final

---

## 🛠️ Prerequisitos — Instalación

### Python 3.8+

| Sistema | Comando / Instrucción |
|---|---|
| **Windows** | Descarga el instalador en [python.org/downloads](https://www.python.org/downloads/) y ejecuta el `.exe`. Marca la opción *"Add Python to PATH"*. Verifica: `python --version` |
| **macOS** | `brew install python` (requiere Homebrew) o descarga desde [python.org](https://www.python.org/downloads/). Verifica: `python3 --version` |
| **Linux (Debian/Ubuntu)** | `sudo apt update && sudo apt install python3 python3-pip`. Verifica: `python3 --version` |

### Node.js 14+

| Sistema | Comando / Instrucción |
|---|---|
| **Windows** | Descarga el instalador LTS en [nodejs.org](https://nodejs.org/) y ejecuta el `.msi`. Verifica: `node --version` |
| **macOS** | `brew install node` o descarga desde [nodejs.org](https://nodejs.org/). Verifica: `node --version` |
| **Linux (Debian/Ubuntu)** | `curl -fsSL https://deb.nodesource.com/setup_lts.x \| sudo -E bash - && sudo apt install -y nodejs`. Verifica: `node --version` |

### Bob

Asegúrense de tener Bob instalado y en ejecución antes de comenzar el desafío.

---

## 🤖 Los tres modos de Bob que usarán

Bob tiene modos especializados. Cada uno tiene un propósito distinto:

### ❓ Modo Ask
Para **entender** sin modificar. Úsenlo para analizar el código fuente, hacer preguntas técnicas y comprender patrones del lenguaje. No genera cambios en archivos.

### 🎯 Modo Plan
Para **planificar** antes de actuar. Úsenlo para diseñar la estrategia de traducción, decidir qué paquetes usar, y definir la estructura del código JavaScript antes de escribir una sola línea.

### 🤖 Modo Agent
Para **implementar**. Úsenlo para escribir, crear y modificar archivos. Aquí es donde ocurre la traducción real.

> **Tip**: El flujo natural es Ask → Plan → Agent. Entiendan primero, planifiquen después, implementen al final.

---

## 🗺️ Proceso de desarrollo (Ask → Plan → Agent)

### Fase 1 — Ask: Análisis del código fuente

Usamos **modo Ask** para entender el script Python antes de tocar nada.

**Hallazgos clave:**
- El script implementa una clase `DataProcessor` con 7 métodos públicos
- Lee un CSV con `csv.DictReader`, detecta campos numéricos automáticamente y calcula estadísticas
- Exporta los resultados a `statistics.json` con `json.dump(..., indent=2)`
- Usa I/O sincrónico con context managers (`with open(...)`)

**Patrones Python identificados a traducir:**

| Patrón Python | Equivalente JavaScript |
|---|---|
| `csv.DictReader` | `csv-parse` con `{ columns: true }` |
| `[x for x in lista if cond]` | `.filter().map()` |
| `float(value)` en try/except | `isFinite(Number(value))` |
| `sum(values) / len(values)` | `.reduce((a,b) => a+b, 0) / length` |
| `min(values)`, `max(values)` | `.reduce((a,b) => Math.min(a,b))` |
| `datetime.now().isoformat()` | `new Date().toISOString()` |
| `json.dump(data, f, indent=2)` | `JSON.stringify(data, null, 2)` |
| `if __name__ == '__main__'` | `main().catch(console.error)` al final |
| I/O sincrónico (`with open`) | `async/await` + `fs.promises` |

---

### Fase 2 — Plan: Diseño de la arquitectura

Usamos **modo Plan** para diseñar la solución antes de escribir código.

**Decisiones de diseño tomadas:**

| Decisión | Opción elegida | Razón |
|---|---|---|
| Manejo de I/O | `async/await` + `fs.promises` | Más idiomático en Node.js moderno |
| Parser CSV | `csv-parse` v5 | API compatible con ES modules, produce objetos con claves por columna igual que `DictReader` |
| Formato de módulos | ES Modules (`import`/`export`) | Estándar moderno, requerido por `"type": "module"` en `package.json` |

**Plan de sub-tareas generado:**
1. Crear `package.json` con dependencias
2. Implementar clase `DataProcessor` método por método
3. Implementar `createSampleData()` y `main()`
4. Verificar output idéntico entre ambas versiones

---

### Fase 3 — Agent: Implementación

Usamos **modo Agent** para escribir todos los archivos.

#### 3.1 — Traducción base (`data_processor.js`)

Traducción 1:1 de todos los métodos de la clase Python:

```
DataProcessor.__init__         →  constructor(filename)
DataProcessor.load_data        →  async loadData()
DataProcessor.calculate_stats  →  calculateStatistics()
DataProcessor._is_numeric      →  _isNumeric(value)
DataProcessor.get_summary      →  getSummary()
DataProcessor.export_results   →  async exportResults(outputFile)
DataProcessor.print_statistics →  printStatistics()
create_sample_data()           →  async createSampleData()
main()                         →  async main()
```

#### 3.2 — Frontend web (`server.js` + `public/index.html`)

Se agregó una capa web sobre la clase:
- **`server.js`**: servidor Express con endpoint `POST /upload` que recibe un CSV, lo procesa con `DataProcessor` y devuelve el JSON de estadísticas
- **`public/index.html`**: interfaz con drag & drop, muestra resumen y tabla de estadísticas por campo

#### 3.3 — Mejoras aplicadas (`mejoras.md`)

Después de la traducción base se aplicaron mejoras de robustez y calidad:

| ID | Mejora |
|---|---|
| J-C3 / J-C2 | `_isNumeric` usa `Number()` + `isFinite()` — rechaza `"NaN"`, `"Infinity"`, `"25px"` |
| J-E1 | `loadData` detecta `ENOENT` y `EACCES` por código de error |
| J-E2 | `exportResults` con `try/catch` explícito — errores de disco controlados |
| J-E3 | `calculateStatistics` con guard `Array.isArray` |
| J-D1 | Flag `_loaded` en el constructor — detecta llamadas fuera de orden |
| O-2 | Parámetro `verbose` en constructor — permite silenciar logs al usar como módulo |
| E-S1 | Desviación estándar (`std_dev`) por campo |
| E-S2 | Mediana (`median`) por campo |
| E-S4 | Conteo de valores faltantes (`missing`) por campo |
| J-P1 | `min`/`max` con `.reduce()` — evita desbordamiento de stack en arrays grandes |

#### 3.4 — Script de verificación (`compare.js`)

Script que carga ambos `statistics.json` (Python y JS) y compara todos los valores numéricos campo por campo con tolerancia de `1e-9`.

**Resultado de verificación:**
```
RESULT: 16 passed, 0 failed
✅ Python and JavaScript outputs are identical!
```

---

## ⚡ Comandos de referencia rápida

```bash
# Instalar dependencias
npm install

# Ejecutar versión Python
cd source
python data_processor.py

# Ejecutar versión JavaScript (CLI)
cd ..
node data_processor.js

# Iniciar servidor web
node server.js
# → abrir http://localhost:3000

# Verificar equivalencia Python vs JavaScript
node compare.js
```

---

## 📊 Output generado (`statistics.json`)

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
      "mean": 26.2,
      "median": 26,
      "std_dev": 3.033,
      "min": 22,
      "max": 30,
      "count": 5,
      "sum": 131,
      "missing": 0
    },
    "score": {
      "mean": 90.96,
      "median": 91.2,
      "std_dev": 3.181,
      "min": 87.3,
      "max": 95.5,
      "count": 5,
      "sum": 454.8,
      "missing": 0
    }
  }
}
```

> Los campos `median`, `std_dev` y `missing` son mejoras adicionales no presentes en el Python original.

---

## 🚫 Reglas del desafío

- **Permitido**: usar Bob en cualquiera de sus modos, documentación oficial de Python/Node.js, npm registry.
- **No permitido**: copiar código de soluciones existentes, usar el código de otro equipo, omitir el uso de Bob en el proceso.
- El proceso importa tanto como el resultado. Estén preparados para explicar cada decisión.

---

*Hecho con IBM Bob* 🤖
