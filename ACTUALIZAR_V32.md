# NEXO PARK EMI UALP V32

Proyecto completo: portal EMI, acceso y sistema interno, con nueve módulos y siete actores.

## Instalar sobre una versión existente

1. Detenga el servidor anterior con Ctrl+C en su terminal.
2. Haga una copia de su carpeta actual. Extraiga este ZIP y copie su contenido sobre la carpeta del proyecto que ya utiliza.
3. Conserve `backend/.env`, su base PostgreSQL y sus respaldos. No borre volúmenes de Docker ni ejecute de nuevo el esquema sobre una base con datos.
4. En CMD, desde la raíz del proyecto, ejecute:

```bat
npm --prefix backend ci
npm start
```

Abra **http://localhost:4000/login** cuando la terminal confirme el arranque. Si su archivo `.env` usa otro puerto, abra el que indica la terminal. Mantenga esa ventana abierta. Actualice el navegador con Ctrl+F5.

También puede ejecutar `INICIAR_NODE_WINDOWS.cmd`; instala dependencias si faltan y conserva el `.env` existente. PostgreSQL debe estar iniciado, con una base inicializada y una `DATABASE_URL` válida. Este iniciador no crea ni borra bases de datos.

Si ya usa Docker Compose, ejecute `docker compose up --build` dentro de la misma carpeta que utilizaba anteriormente; mover el proyecto a otra carpeta puede cambiar el nombre del proyecto Compose y seleccionar otro volumen. `INICIAR_WINDOWS.cmd` mantiene este modo de arranque. Docker Desktop debe estar iniciado.

## CAPTCHA y conexión

La captura recibida mostraba el diseño PARKIA y un error al obtener el desafío. No identifica por sí sola la causa local. V32 corrige la resolución de la carpeta frontend en Windows y distingue fallos de red de respuestas HTML de un servidor estático.

El CAPTCHA se solicita al backend y se valida en el servidor. La pantalla espera una verificación válida antes de habilitar el acceso. Incluye tiempo límite, un reintento de carga ante fallos transitorios, recarga manual, aviso de vencimiento y ayuda para abrir el servidor correcto. Un campo vacío no se acepta como respuesta cero. Un CAPTCHA incorrecto o vencido mantiene el acceso bloqueado.

No abra `login.html` directamente ni mediante Live Server. Si se muestra un error, deje el servidor iniciado y ejecute en una segunda terminal:

```bat
npm run diagnostico
```

Para un puerto distinto:

```bat
set NEXO_URL=http://localhost:5000
npm run diagnostico
```

El diagnóstico comprueba el servidor y el endpoint CAPTCHA. Si el servidor no arranca, revise el error de PostgreSQL o de configuración en la primera terminal. El botón de recarga no puede iniciar un backend detenido.

## Interfaz interna

- Identidad NEXO PARK con URL nueva para el logo de acceso y del sistema.
- Bienvenida con nombre y rol, fotografía del campus y fecha de Bolivia.
- Accesos rápidos limitados a los módulos autorizados del usuario.
- Navegación lateral, búsqueda con Ctrl+K y ubicación actual accesible.
- Supervisión con indicadores, distribución de disponibilidad calculada desde la API y selección inicial de una zona.
- Mapa de plazas con estados escritos y colores; desplazamiento contenido en móvil.
- Tablas, formularios, pestañas y diálogos con estilo uniforme; modo claro y oscuro.
- Los datos del panel son los que devuelve su base: una instalación demo mostrará datos de demostración.

## Organización conservada

Frontend y backend mantienen carpetas para `usuarios`, `reportes`, `propietarios`, `vehiculos`, `lugares`, `control`, `alertas`, `auditoria` y `movil`. La autenticación está en el núcleo compartido. Los actores siguen siendo Administrador, Operadores, Soporte, Recursos Humanos, Director, Guardia y Propietario; Propietario comprende estudiante o docente.

El portal EMI de V31 permanece incluido. Los documentos previos conservan su versión histórica; los diagramas expandidos corregidos se incorporan en `docs/NEXO_PARK_Casos_de_Uso_Expandidos_Corregidos.docx`.

## Comprobaciones

```bat
npm test
npm run test:captcha
npm run test:integration
```

Las pruebas de integración requieren servidor iniciado y cuentas de demostración habilitadas. Ejecútelas sobre una base de pruebas: crean un propietario de prueba y registros de auditoría.

En la verificación de V32 se utilizó Chromium y un motor PostgreSQL compatible PGlite con datos demo: carga y recuperación del CAPTCHA, rechazo de respuesta incorrecta y vencida, respuesta HTML inesperada, inicio de sesión, nueve módulos, búsqueda, PDF, siete roles, revocación, modo oscuro y ancho móvil. No se ejecutó Windows nativo ni Docker en este entorno; las cámaras físicas, OCR externo y copias con pg_dump requieren verificación en su instalación.
