# NEXO PARK V34 — corrección de acceso y recorrido institucional

## Instalar sobre el proyecto existente

1. Cierre el servidor anterior con Ctrl+C. Si usa Docker, detenga ese contenedor antes de iniciar con Node.
2. Copie TODO el contenido de NEXO_PARK_V34 dentro de la carpeta de su proyecto. Conserve .git, backend/.env y su base de datos. No vuelva a importar el SQL completo sobre datos existentes.
3. Ejecute INICIAR_NEXO.cmd. Instala dependencias, verifica la versión del servidor, el frontend y el CAPTCHA, y abre el inicio institucional. Requiere Node.js y PostgreSQL configurado en backend/.env.
4. Si el puerto lo ocupa una versión anterior, el iniciador lo indica y no finaliza procesos ajenos automáticamente. Cierre esa terminal/contenedor y repita.
5. En el navegador, use Ctrl+F5. No abra HTML con Live Server.

Alternativa desde CMD:

```bat
cd /d C:\PARKIA_EMI_UALP_V3
npm --prefix backend ci
npm test
npm run test:captcha
npm start
```

Abra http://localhost:4000/ (o el puerto configurado). Para diagnóstico, en otra terminal ejecute `npm run diagnostico`. Si utiliza otro puerto, configure `set NEXO_URL=http://localhost:SU_PUERTO` antes del diagnóstico.

## Recorrido solicitado

Inicio institucional EMI → Infraestructura → Laboratorios / Aulas / Biblioteca / Áreas deportivas / Parqueos → NEXO PARK → Ingreso.

El inicio no contiene accesos directos a NEXO PARK ni al formulario. Laboratorios y otros espacios tienen páginas informativas y enlaces institucionales. No se ha inventado un inventario de equipos, disponibilidad ni horarios. La referencia es https://www.emi.edu.bo/, el enlace institucional enviado originalmente.

## CAPTCHA

- Se versionaron las entradas JavaScript y sus imports para evitar mezclas con scripts antiguos.
- El servidor entrega páginas y recursos sin caché; se retiran las cachés antiguas de PARKIA/NEXO PARK.
- CAPTCHA_EXPIRES_IN admite 300 (segundos), 5m o 1h. Los valores inválidos se normalizan a cinco minutos. Anteriormente un número guardado como texto podía interpretarse como milisegundos.
- Se conserva la verificación obligatoria en backend; no hay un CAPTCHA simulado ni una omisión del control.
- La captura del usuario mostraba textos del frontend anterior; no permite confirmar por sí sola qué error de servidor ocurría en su equipo. El iniciador verifica backend y frontend V34 antes de abrir la página.

## Alcance y pruebas

Pruebas unitarias de CAPTCHA, navegador Chromium, navegación hasta login, siete roles, ocho módulos web y PDF: aprobadas localmente con PGlite. El módulo móvil sigue fuera de la interfaz. No se modificó el esquema SQL.

El iniciador PowerShell está incluido pero debe comprobarse en Windows; este entorno de verificación es Linux. Cámaras físicas, Docker y restauración de respaldos requieren verificación en destino. Se mantienen los documentos históricos con sus versiones originales; este archivo describe los cambios V34.

## GitHub (después de copiar y comprobar)

```bat
git add -A
git diff --cached --stat
git status
git commit -m "Corrige CAPTCHA y recorrido institucional EMI en V34"
git push -u origin HEAD
```

Revise que no se incluyan .env, respaldos ni node_modules. No utilice push --force.
