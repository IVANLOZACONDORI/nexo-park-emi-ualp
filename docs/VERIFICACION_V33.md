# Verificación V33 — 13 de octubre de 2026

- Estructura: nueve carpetas de módulos en frontend y backend; ocho módulos expuestos en web; imports relativos válidos.
- CAPTCHA: tres pruebas unitarias aprobadas (respuesta válida e inválida, vacío, vencimiento y token alterado).
- Navegador Chromium: Inicio EMI → Infraestructura → Parqueos → Ingreso; menú responsive a 390 px, sin desbordamiento horizontal.
- Inicio de sesión probado con CAPTCHA válido, rechazo de respuesta incorrecta y recuperación tras fallo de conexión.
- Ocho módulos web de administrador comprobados, búsqueda y accesos rápidos, modo oscuro y vista previa PDF.
- API con base PostgreSQL compatible PGlite: permisos de los siete roles, revocación de sesiones y PDF válido.
- Propietario: entrada en Control de ingreso y salida; el componente móvil no aparece en navegación ni accesos rápidos ni búsqueda. Enlaces a módulos no disponibles se normalizan al módulo activo.

Se conserva el código base V32 y su documentación histórica. Esta entrega no valida cámaras físicas, Docker ni restauración real de respaldos.
