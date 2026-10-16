# Estado de validación · edición experimental 0.1.0

[English](release-readiness.en.md)

Fecha: 16 de octubre de 2026. La mantenedora autorizó avanzar a publicación. Este documento registra una edición educativa experimental, no certifica una instalación independiente ni disponibilidad continua.

## Comprobado

- Código operativo aportado por la mantenedora con escritura real y límite de una operación. La copia de distribución activa simulación y documenta sus modificaciones.
- 14 pruebas con adaptadores simulados; sin credenciales ni llamadas a las API reales.
- Validación local de sintaxis .gs, JSON, enlaces relativos, bloques Markdown, simulación por defecto y patrones básicos de secretos.
- CI aprobada en la primera entrega del motor y en la ampliación educativa.
- Revisión de las versiones de archivos del historial inicial y de la entrega educativa: sin valores de credenciales ni datos de suscriptores detectados. Los correos de pruebas pertenecen a example.com. Esta revisión no demuestra ausencia absoluta de secretos.
- Licencia MIT existente conservada. Referencias externas enlazadas sin presentar una alianza ni incorporar su código.

## Pendiente y explícito

Instalación independiente con cuentas de prueba; elegibilidad y cuotas por plan de las API; medición de llamadas y duración; presupuesto de tiempo; Retry-After; reconciliación durable; traducciones actualizadas al evolucionar el código. Estas limitaciones no se ocultan tras el resultado de las pruebas.

La periodicidad de 15 minutos describe la instalación de la mantenedora, no una garantía de latencia ni una configuración que se copie con Git. Producción no ha sido modificada por este proyecto.

## Publicación

El cambio de visibilidad y la habilitación del reporte privado de vulnerabilidades son ajustes de GitHub, no cambios de código. Comprobar la visibilidad efectiva y la disponibilidad del botón Report a vulnerability antes de anunciar que esas funciones están activas. La existencia de este documento no prueba que la visibilidad ya sea pública.
