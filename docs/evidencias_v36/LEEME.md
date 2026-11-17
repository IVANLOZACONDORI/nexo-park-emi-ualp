# Evidencias de pruebas — V36.4

Corrida local del **17 de noviembre de 2026** sobre un clon limpio de
`c891478` (NEXO PARK V36.4), con API Express y base PostgreSQL compatible
**PGlite por socket TCP** (`127.0.0.1:5432`). No se usaron cámaras físicas.

| Evidencia | Comando | Resultado |
|---|---|---|
| `resultados-integracion.json` | `npm run test:integration` | 11 de 11 aprobadas |
| `resultados-perfil-v36.json` | `npm run test:profile` | 7 de 7 aprobadas |
| `perfil-v36.txt` | salida de `tests/profile-v36.mjs` | 7 PASS |
| `captcha.txt` | `node --test tests/captcha.test.mjs` | 4 de 4 aprobadas |
| `estructura.txt` | `node tests/structure.mjs` (copia adaptada a Windows) | aprobada |

## Entorno

- Node.js v24.16.0, npm 11.13.0, Windows 11.
- Backend con dependencias instaladas (`npm install`).
- PGlite con `@electric-sql/pglite-socket`, esquema y datos de
  `backend/sql/NEXO_PARK_BD_COMPLETA.sql`.
- Usuarios de demostración creados con `SEED_DEMO=true`.
- `tests/structure.mjs` tiene un defecto de ruta en Windows
  (`new URL(...).pathname`); se ejecutó una copia con `fileURLToPath` sin
  modificar el repositorio.

## Nota

Las pruebas de integración crean un propietario de prueba (`qa_<timestamp>`) y
deben ejecutarse solo contra una base de pruebas. No se probaron cámaras,
barreras ni OCR con hardware real.
