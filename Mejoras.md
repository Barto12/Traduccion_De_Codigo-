%% Mejoras aplicadas en la traducción de Python a JavaScript
%% Comparativa: data_processor.py → data_processor.js

graph LR
    subgraph Python
        P1[float + try/except\nValidación numérica básica]
        P2[mean, min, max, count, sum]
        P3[os.path.exists\nVerificación previa de archivo]
        P4[Sin control de estado\norden de llamadas no validado]
        P5[Siempre verbose\nprint directo a consola]
        P6[spread para min/max\nriesgo de stack overflow]
    end

    subgraph JavaScript - Mejoras aplicadas
        J1["J-C2 / J-C3: Number + isFinite\nmás estricto — rechaza NaN, Infinity, 25px"]
        J2["E-S1 / E-S2 / E-S4: + median, stdDev, missing\nestadísticas extendidas"]
        J3["J-E1: ENOENT / EACCES por código OS\nsin race condition, distingue permisos"]
        J4["J-D1: _loaded flag\ndetecta llamadas fuera de orden"]
        J5["O-2: verbose param + _log\nmodo silencioso para tests y servidor"]
        J6["J-P1: reduce para min/max\nseguro con arrays grandes"]
    end

    P1 -->|J-C2 / J-C3| J1
    P2 -->|E-S1 / E-S2 / E-S4| J2
    P3 -->|J-E1| J3
    P4 -->|J-D1| J4
    P5 -->|O-2| J5
    P6 -->|J-P1| J6

    subgraph Manejo de errores adicional
        E1["J-E2: exportResults con try/catch\nerrores de escritura con contexto"]
        E2["J-E3: Array.isArray guard\nen calculateStatistics"]
        E3["J-E4: mensaje limpio en main\nsin stack trace crudo"]
    end

    J3 --- E1
    J3 --- E2
    J3 --- E3
