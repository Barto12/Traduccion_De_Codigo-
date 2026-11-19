# 🏆 Bob Lab — Desafío de Traducción de Código

> **Competencia por equipos · Python → JavaScript (Node.js)**

---

## ¿En qué consiste el desafío?

Tienen en sus manos un script de Python que procesa datos desde un archivo CSV, calcula estadísticas y exporta resultados a JSON. Su misión como equipo es **traducirlo a JavaScript (Node.js)** usando Bob como asistente principal, manteniendo la funcionalidad completa y aplicando las mejores prácticas de cada lenguaje.

El equipo que entregue la mejor traducción **y** la mejor presentación se lleva la victoria.

---

## 📁 Estructura del laboratorio

```
lab3/
├── source/
│   └── data_processor.py   ← código fuente a traducir
└── README.md               ← estas instrucciones
```

El archivo que deben traducir es [`source/data_processor.py`](source/data_processor.py).

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

Bob incluso tiene más modos, incluyendo los modos de los paquetes Premium. Para este ejercicio solo usaremos los modos estándar.

---

## 💡 Tips para el equipo

A continuación encontrarán algunas pistas. Son genéricas a propósito; el resto lo tienen que descubrir ustedes.

### Tip 1 — Empiecen analizando, no codificando
Antes de escribir JavaScript, pidan a Bob que les explique el código Python. Pregunten por la estructura, los patrones usados y los posibles desafíos de traducción.

### Tip 2 — El mayor reto: sincrónico vs asincrónico
Python usa I/O sincrónico por defecto. Node.js es asincrónico. Piensen cómo resolverán esto antes de escribir código. Hay un modo de Bob que puede ayudar aquí.

### Tip 3 — Las librerías no son iguales
Python tiene `csv` y `json` en su librería estándar. JavaScript necesita paquetes externos para algunas de estas funciones. Investiguen qué necesitarán con npm (Node Package Manager).

### Tip 4 — Las list comprehensions no existen en JavaScript
`[x for x in lista if condición]` es idiomático en Python. JavaScript tiene su propia forma de expresar lo mismo con métodos de array. Descubran cuáles.

### Tip 5 — Conserven la misma interfaz pública
La clase, sus métodos y los archivos que genera deben producir resultados equivalentes. Pueden cambiar cómo funciona por dentro, pero no qué hace.

### Tip 6 — Verifiquen con datos reales
Ejecuten ambas versiones con el mismo archivo CSV y comparen los JSON resultantes. Si los números coinciden, van por buen camino.

### Tip 7 - Ciclo de vida del desarrollo de SW

Pueden utilizar a Bob para realizar la planeación a través de todo el ciclo de vida del desarrollo de SW. Bob puede ayudar a crear un plan de ejecución a través de distintas fases: Observar, Descubrir, Planear, Diseñar, Codificar, Probar, Asegurar y Documentar.

---

## 🏁 Entregables

Al finalizar, cada equipo debe presentar:

1. **El código JavaScript funcional** (`data_processor.js` + `package.json`)
2. **Demostración en vivo**: ejecutar ambas versiones y mostrar que producen el mismo output
3. **Presentación** (5–10 min) explicando:
   - Cómo usaron cada modo de Bob
   - Los desafíos de traducción que encontraron y cómo los resolvieron
   - Las diferencias clave entre el código Python y el JavaScript resultante

---

## ⚡ Comandos de referencia rápida

```bash
# Ejecutar la versión Python
cd lab3/source
python data_processor.py          # macOS/Linux
python3 data_processor.py         # macOS/Linux (alternativo)

# Instalar dependencias y ejecutar la versión JavaScript (una vez que la creen)
cd lab3
npm install
node data_processor.js
```

---

## 🚫 Reglas del desafío

- **Permitido**: usar Bob en cualquiera de sus modos, documentación oficial de Python/Node.js, npm registry.
- **No permitido**: copiar código de soluciones existentes, usar el código de otro equipo, omitir el uso de Bob en el proceso.
- El proceso importa tanto como el resultado. Estén preparados para explicar cada decisión.

---

*¡Buena suerte a todos los equipos! Que gane el mejor.* 🚀
