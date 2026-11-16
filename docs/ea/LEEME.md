# Modelo de Enterprise Architect — M03 y M06

`NEXO_PARK_M03_M06.qea` es un modelo de **Enterprise Architect** con las formas
nativas (elementos y conectores editables, no imágenes pegadas).

## Contenido

- **15 diagramas nuevos**: ASI-1a, ASI-1b, DCU-3, DS-3, DE-3, DA-3a, DA-3b,
  DN-3, ADV-3, MOCK-3, DS-6, DE-6, DN-6, ADV-6 y MOCK-6.
- **8 diagramas anteriores** conservados: DCU-1, DCU-2, DPR-1a, DPR-1b, DPR-2a,
  DPR-2b, DPR-3a y DPR-3b. Los de control son los que citan los documentos de
  M06; los de zonas y plazas quedan como referencia.

Cada diagrama vive en su propio paquete, con el mismo identificador.

## Cómo abrirlo

Requiere una licencia de Enterprise Architect activa. Con la versión de prueba
caducada, EA muestra el aviso de registro y se cierra.

## Limitaciones conocidas

- El modelo se generó escribiendo el archivo `.qea` directamente (SQLite), porque
  la licencia estaba vencida y la automatización COM no estaba disponible.
- **No se pudo verificar visualmente** el renderizado. La validación realizada es
  estructural: integridad SQLite, sin formas ni conectores huérfanos y todas las
  formas con coordenadas.
- **MOCK-3 y MOCK-6**: el PNG va incrustado como objeto `Image`. Si tu versión de
  EA no lo dibuja, arrastra `png/MOCK-3.png` o `png/MOCK-6.png` sobre el
  diagrama.
- **DS-3 y DS-6**: lifelines y mensajes nativos; EA decide la altura de cada
  mensaje.

## Regenerar

El generador vive fuera del repositorio (herramientas locales del proyecto). Si
se actualizan los diagramas, se debe regenerar el `.qea` y reemplazar este
archivo.
