# Portal EMI · actualización V31

Referencia visual: https://www.emi.edu.bo/ (12 de octubre de 2026).
Cabecera blanca, navegación institucional, azul y amarillo, banner con controles, accesos académicos y unidades. Textos redactados para el proyecto y fotografías incluidas en V30.

Ruta local: Inicio → Infraestructura → Parqueos → Ingreso NEXO PARK.
Los accesos de oferta académica, investigación y servicios institucionales abren las páginas oficiales en otra pestaña. Las noticias se enlazan en su fuente, sin duplicar publicaciones desactualizadas.

Se conserva el backend, el modelo de datos y los nueve módulos/siete actores de V30. La documentación V30 sigue siendo la base técnica; este anexo describe exclusivamente la actualización del portal.

Instalación: reemplazar frontend, actualizar los package.json y package-lock.json adjuntos y reiniciar el servidor. Para el paquete completo, seguir README.md. No reemplazar el archivo .env real ni eliminar el volumen PostgreSQL.

Verificación realizada: carrusel anterior/siguiente, recorrido Inicio → Infraestructura → Parqueos → Login, preguntas frecuentes, menú móvil y ausencia de desbordamiento horizontal a 390 px. Revisión visual en Chromium. Prueba de estructura: nueve módulos en ambas capas e imports relativos válidos.
