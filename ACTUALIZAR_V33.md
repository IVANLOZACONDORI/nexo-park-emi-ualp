# NEXO PARK EMI UALP — V33

## Cambios de esta entrega

- Inicio institucional con la línea visual EMI: azul, amarillo, cabecera y navegación académica; enlaces externos al portal oficial https://www.emi.edu.bo/.
- Infraestructura abre directamente la propuesta visual de V30 mejorada: portada azul marino/turquesa, fotografías, tarjetas del campus y acceso a NEXO PARK.
- Se mantiene el sistema interno V32, sus correcciones de CAPTCHA y rutas Windows.
- Ocho módulos visibles en la web según permisos. El noveno, componente móvil, permanece en la estructura técnica como trabajo futuro, sin menú, acceso rápido ni resultados de búsqueda. Los siete actores se conservan.
- Propietario inicia en Control de ingreso y salida, con sus propios movimientos.
- No se cambió el esquema de datos. Los documentos anteriores incluidos conservan sus números de versión y describen la arquitectura de nueve módulos; esta nota actualiza el alcance visible de la V33.

## Actualización en Windows (CMD)

1. Detener el servidor con Ctrl+C. Realizar una copia de seguridad del proyecto y de la base de datos.
2. Copiar el contenido de NEXO_PARK_V33 dentro de C:\PARKIA_EMI_UALP_V3, reemplazando los archivos. Conservar .git, backend\.env y los respaldos/datos locales. No importar otra vez el SQL completo sobre la base existente.
3. Ejecutar desde CMD:

```bat
cd /d C:\PARKIA_EMI_UALP_V3
npm --prefix backend ci
npm test
npm run test:captcha
npm start
```

Abrir http://localhost:4000 y pulsar Ctrl+F5. Dejar la terminal abierta. Si el CAPTCHA falla, ejecutar `npm run diagnostico` desde otra terminal. No abrir los HTML con Live Server.

## Publicar los cambios en GitHub

Estos comandos actualizan el repositorio existente. El nombre nexo-park-emi-ualp debe estar ya creado/renombrado en GitHub (Settings > Repository name > Rename).

```bat
cd /d C:\PARKIA_EMI_UALP_V3
git remote set-url origin https://github.com/IVANLOZACONDORI/nexo-park-emi-ualp.git
git remote -v
git status
git add -A
git diff --cached --stat
git diff --cached --name-only
```

Revisar que no se estén incluyendo archivos .env, contraseñas, respaldos ni node_modules. Los .env.example son plantillas y sí pueden incluirse. Después:

```bat
git commit -m "Actualiza NEXO PARK V33: portal EMI e infraestructura; modulo movil diferido"
git push -u origin HEAD
```

No usar push --force. Si Git informa cambios remotos o conflictos, conservar los archivos y resolver el error antes de continuar. No se necesita GitHub CLI.

## Límites de validación

Las comprobaciones automatizadas locales usan una base PostgreSQL embebida de prueba. Cámaras físicas, Docker y recuperación de respaldos requieren validación en el equipo de destino. La portada es una adaptación académica, no una copia sincronizada del sitio EMI.
