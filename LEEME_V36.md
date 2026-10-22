# NEXO PARK V36 · EMI UALP

Versión integral mejorada de NEXO PARK.

## Cambios principales
- Nuevo logotipo vectorial NEXO PARK V36, más amplio y moderno.
- Logo más grande en login, cabecera del sistema y servicio de parqueos.
- Títulos de módulos con mayor jerarquía y tamaño visual.
- Ficha profesional ampliada con: domicilio, celular, correo personal, fecha de nacimiento, edad calculada, número de referencia, profesión y grado/especialidad.
- Currículum vitae PDF (máximo 5 MB), almacenado en PostgreSQL y descargable desde el perfil del propio usuario.
- Fotografía de perfil mejorada hasta 512×512 WebP.
- Migración aditiva `11_perfil_profesional_v36.sql`: conserva los datos existentes.
- El administrador mantiene el alta mínima de cuentas; cada usuario completa su ficha al ingresar.

## Inicio con Docker
```bat
docker compose up --build
```
Abrir: `http://localhost:4000`

## Validación rápida
```bat
npm test
```

## Base de datos
La migración V36 se ejecuta automáticamente al iniciar el backend.
