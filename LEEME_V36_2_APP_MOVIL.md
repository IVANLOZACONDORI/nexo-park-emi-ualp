# NEXO PARK V36.2 · App móvil y movilidad personal

## Correcciones incorporadas

### 1. Presentación de la app en el portal
La sección `Infraestructura > Parqueos` ya no muestra lenguaje técnico como “Módulo 9”.
Ahora comunica el beneficio del servicio:

- **Tu parqueo, siempre contigo.**
- disponibilidad en tiempo real para auto o moto;
- historial personal de ingresos y salidas;
- acceso con la cuenta institucional;
- botón **Instalar NEXO PARK**;
- código QR de descarga;
- acceso de prueba desde navegador.

### 2. Movilidad personal para cualquier cuenta con vehículo
Una cuenta activa que tenga uno o más vehículos vinculados puede consultar su propia movilidad, sin importar si además tiene un rol administrativo u operativo.

La vista **Mi movilidad** muestra:
- vehículos activos vinculados a la cuenta;
- autorización vigente;
- cantidad de plazas compatibles;
- plazas libres, ocupadas y fuera de servicio;
- lugares libres concretos por zona;
- compatibilidad auto/motocicleta;
- mensaje visible **NO HAY ESPACIOS DISPONIBLES** cuando corresponde;
- últimos 100 ingresos y salidas de los vehículos de la cuenta;
- actualización automática cada 5 segundos.

La información personal nunca devuelve movimientos de vehículos de otros usuarios.

### 3. Herramientas por rol
La experiencia móvil mantiene las herramientas institucionales según permisos:
- Guardia: control, vehículos, alertas e historial según permisos.
- Operaciones: supervisión, control, vehículos, reportes y alertas.
- Director: panel, disponibilidad, reportes e historial autorizado.
- Soporte: usuarios, parqueos, dispositivos, alertas, auditoría y continuidad según permisos.
- RR.HH.: vehículos, historial, reportes y funciones autorizadas.
- Administrador: accesos completos autorizados.
- Propietario/titular: su movilidad personal y las funciones que tenga asignadas.

### 4. Titular del vehículo
El registro de vehículos ahora permite seleccionar **cualquier cuenta institucional activa** como titular. Esto posibilita que un administrador, guardia, director u otro actor vea su propia movilidad si la institución le registra un vehículo.

### 5. Android
La carpeta `mobile/android-app` contiene un proyecto Android funcional tipo WebView.
En el primer inicio solicita la dirección del servidor NEXO PARK, por ejemplo:

`http://192.168.1.25:4000`

Después abre el login y la experiencia móvil.
Mantener presionada la pantalla permite cambiar la dirección del servidor.

## Generar APK desde GitHub

1. Sube la versión al repositorio.
2. En GitHub abre **Actions**.
3. Ejecuta **Publicar APK NEXO PARK**.
4. El workflow genera `NEXO_PARK.apk`.
5. También publica el APK en el release fijo `app-movil`, que es el enlace utilizado por el botón y el QR del portal.

## Iniciar el sistema

```bat
docker compose down
docker compose up --build
```

Después abre:

- Portal institucional: `http://localhost:4000`
- Sistema: `http://localhost:4000/sistema`
- Experiencia móvil en navegador: `http://localhost:4000/movil`
