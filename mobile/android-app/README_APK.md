# NEXO PARK Android · V36.2

Aplicación Android WebView para el servicio institucional NEXO PARK.

## Qué ve el usuario
- Cualquier cuenta con un vehículo activo vinculado: disponibilidad compatible para auto/moto y sus últimos ingresos/salidas.
- Las herramientas institucionales aparecen según los permisos del rol autenticado.
- Si no hay espacios libres compatibles, la app muestra claramente **NO HAY ESPACIOS DISPONIBLES**.

## Conexión
En el primer inicio, la app solicita la dirección del servidor NEXO PARK, por ejemplo:

`http://192.168.1.25:4000`

El celular y la computadora deben estar en la misma red si se usa un servidor local.
Mantén presionada la app para cambiar la dirección guardada.

## Compilar
Desde GitHub Actions usa el workflow de publicación incluido en la raíz del proyecto.
También puede compilarse con Android SDK + Gradle 8.9:

`gradle assembleDebug`
