# Documentos V36 — Carlos Alanoca

Documentos de las secciones asignadas en el Capítulo III. Cada uno va en
**DOCX** (editable) y **PDF** (entrega), generados desde el mismo contenido.

| Archivo | Sección | Contenido |
|---|---|---|
| `3.1.2-Analisis-Situacion-Actual` | 3.1.2 | Propósito, contexto, método, flujo AS-IS, problemas P-01…P-10, oportunidades O-01…O-08 y trazabilidad |
| `M03-Registro-de-Propietarios` | 3.5.3.1–3.5.3.8 | Análisis, diseño, interfaz, navegación, desarrollo, codificación, pruebas y retrospectiva |
| `M06-Control-de-Ingreso-y-Salida` | 3.5.6.1–3.5.6.8 | Mismas ocho subsecciones para el control por placa |
| `3.6.3-Prueba-de-sistema-funcional` | 3.6.3 | Diseño de pruebas, resultados automatizados, checklist de interfaz y evidencias |

## Base

- Código y reglas verificadas sobre **NEXO PARK V36.4** (`c891478`).
- Los resultados automatizados provienen de `tests/resultados-integracion.json`
  (11 pruebas aprobadas).
- En **3.6.3** se separa explícitamente lo ejecutado de lo que queda pendiente de
  captura: las verificaciones visuales están marcadas como tales, sin inventar
  resultados.

## Diagramas

Las figuras insertadas corresponden a `docs/diagramas_v36/` y usan la estética
de Enterprise Architect. Los documentos se pueden regenerar desde
`docs/diagramas_v36/` si se actualizan los SVG/PNG.

## Evidencias de pruebas

La corrida local del 17/11/2026 está en `docs/evidencias_v36/`:
11/11 pruebas de integración, 7/7 de perfil V36, 4/4 de CAPTCHA y verificación
de estructura aprobada. El detalle del entorno está en el `LEEME.md` de esa
carpeta.

