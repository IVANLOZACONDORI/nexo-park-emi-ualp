# NEXO PARK V36.4 · Currículum por tipo de cuenta

## Cambio solicitado

Los usuarios con rol **PROPIETARIO** (estudiantes y docentes propietarios) ya no ven ni pueden cargar currículum vitae al completar o editar su perfil.

El currículum PDF queda habilitado únicamente para cuentas institucionales de personal administrativo, militar y autoridades, representadas por los roles operativos del sistema: administrador, operaciones, soporte, RR.HH., dirección y guardia.

## Cambios aplicados

- El formulario de perfil oculta por completo la sección **Currículum vitae** para propietarios.
- El menú superior ahora muestra **Editar mi perfil** en lugar de mencionar CV para todos los usuarios.
- La API informa `cv_habilitado` según el rol.
- Un propietario no puede subir ni abrir un CV por llamada directa a la API; el backend responde 403.
- Los CV existentes no se borran automáticamente de la base de datos; quedan ocultos mientras la cuenta sea propietaria, para no eliminar información sin autorización.
- Si una cuenta institucional autorizada tiene CV, conserva las opciones Ver / Reemplazar / Quitar.
- Se mantienen sin cambios los módulos, parqueos disponibles, historial y navegación V36.3.
