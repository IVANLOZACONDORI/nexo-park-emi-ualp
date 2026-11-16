# Diagramas V36 — M03, M06 y análisis de la situación actual

Diagramas de la documentación del Capítulo III, alineados con **NEXO PARK V36.4**
(commit `c891478`). Sustituyen a los de `docs/diagramas_v30/modulos/`, que usaban
la identidad anterior (PARKIA) y la numeración antigua (Módulo 4/5).

- **SVG**: vectorial, para insertar en Word o ampliar sin pérdida.
- **PNG**: 2× la resolución del vectorial, listo para imprimir.

## Análisis de la situación actual (3.1.2)

| Archivo | Contenido |
|---|---|
| `analisis/ASI-1a.svg` / `.png` | Flujo AS-IS del parqueo — actividad UML |
| `analisis/ASI-1b.svg` / `.png` | Flujo AS-IS del parqueo — BPMN 2.0 |

## M03 — Registro de propietarios (3.5.3)

| Archivo | Contenido | Sección |
|---|---|---|
| `modulos/propietarios/DCU-3` | Casos de uso del módulo | 3.5.3.1 |
| `modulos/propietarios/DS-3` | Secuencia: registrar un propietario | 3.5.3.1 |
| `modulos/propietarios/DE-3` | Estados: ciclo de vida del propietario | 3.5.3.2 |
| `modulos/propietarios/DA-3a` | Actividad UML: registro y actualización | 3.5.3.2 |
| `modulos/propietarios/DA-3b` | Proceso BPMN 2.0: registro y actualización | 3.5.3.2 |
| `modulos/propietarios/ADV-3` | Modelo de interfaz abstracta | 3.5.3.3 |
| `modulos/propietarios/MOCK-3` | Mockup del registro de propietarios | 3.5.3.3 |
| `modulos/propietarios/DN-3` | Diagrama navegacional | 3.5.3.4 |

## M06 — Control de ingreso y salida (3.5.6)

| Archivo | Contenido | Sección |
|---|---|---|
| `modulos/control/DCU-1` | Casos de uso del control por placa | 3.5.6.1 |
| `modulos/control/DS-6` | Secuencia: registrar un evento de acceso | 3.5.6.1 |
| `modulos/control/DE-6` | Estados: evento de acceso | 3.5.6.2 |
| `modulos/control/DPR-1a` | Actividad UML: acceso por placa | 3.5.6.2 |
| `modulos/control/DPR-1b` | Proceso BPMN 2.0: acceso por placa | 3.5.6.2 |
| `modulos/control/DPR-3a` | Actividad UML: validación manual | 3.5.6.2 |
| `modulos/control/DPR-3b` | Proceso BPMN 2.0: validación manual | 3.5.6.2 |
| `modulos/control/ADV-6` | Modelo de interfaz abstracta | 3.5.6.3 |
| `modulos/control/MOCK-6` | Mockup del control de acceso | 3.5.6.3 |
| `modulos/control/DN-6` | Diagrama navegacional | 3.5.6.4 |

## Validación

La geometría de los 15 diagramas nuevos se comprobó con el validador del
proyecto (solapes, conectores que atraviesan nodos, textos fuera de forma):
**sin problemas**. Los PNG se regeneraron a escala 2 después de la última
corrección.

Los diagramas de control `DCU-1`, `DPR-1a/1b` y `DPR-3a/3b` provienen de la
entrega anterior y se conservan porque los documentos de M06 los citan.

## Convenciones

- Identidad y textos: **NEXO PARK**.
- Numeración: **M03** propietarios, **M06** control.
- Requisitos: RF-05 a RF-07 y RNF-04/05 (M03); RF-14 a RF-19, RF-37,
  RF-40 a RF-42 y RF-46 (M06).
