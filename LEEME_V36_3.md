# NEXO PARK V36.3 · Navegación de formularios y parqueos para estudiantes

## Cambios principales

1. **Editar y registrar ya no aparece debajo de las listas.**
   - Registro de propietarios: al pulsar **Registrar propietario** o **Editar**, la lista se reemplaza por una vista independiente.
   - Registro de vehículos: **Registrar**, **Editar**, **Autorizar** y **Autorizaciones** se abren como vistas independientes.
   - Cada vista incorpora **← Volver a propietarios / vehículos** y **Cancelar**.
   - Al guardar, el sistema regresa automáticamente al listado actualizado.

2. **Parqueos disponibles para estudiantes/propietarios.**
   - Las cuentas con rol `PROPIETARIO` muestran un módulo visible **Parqueos disponibles**.
   - La pantalla muestra zona asignada, cantidad de plazas, libres, ocupadas, fuera de servicio y sin datos.
   - Se visualizan las plazas de la zona en tiempo real.
   - Si no existen plazas libres se muestra **NO HAY ESPACIOS DISPONIBLES**.
   - Si además la cuenta tiene auto o moto registrado, conserva **Mi movilidad**, donde ve espacios compatibles e historial personal.

3. **Interfaz V36.3.**
   - Formularios con mayor separación y jerarquía.
   - Botón de retorno visible al inicio de las vistas de edición.
   - Estados presentados con etiquetas visuales.
   - Versión del sistema actualizada a **36.3**.

## Base de datos

No se requiere una migración adicional para estos cambios. Se reutilizan las tablas y endpoints existentes de V36.2.

## Inicio

```bat
docker compose down
docker compose up --build
```

Luego abrir:

```text
http://localhost:4000
```
