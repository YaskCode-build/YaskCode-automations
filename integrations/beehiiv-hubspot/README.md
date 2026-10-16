# beehiiv → HubSpot · Apps Script V4

[English](README.en.md)

Estado: copia experimental derivada del código operativo aportado por la mantenedora. Validada con simulaciones locales; no validada todavía contra API reales en un proyecto independiente.

La instalación operativa existente utiliza `DRY_RUN=false`, un máximo de una escritura por ejecución y un activador de 15 minutos. Este repositorio distribuye `DRY_RUN=true` y conserva el máximo de una escritura. No incluye secretos, datos de suscriptores ni activadores.

## Comportamiento

Lee estados beehiiv; busca contactos por correo normalizado; crea contactos activos inexistentes; actualiza estados no activos de contactos vinculados a esta integración. Prioriza estas actualizaciones y difiere las operaciones restantes. No modifica consentimiento nativo de marketing ni envía correos. No reactiva contactos automáticamente.

No elimina contactos por ausencia en la respuesta. Un estado `inactive` no acredita el motivo de la baja. Los estados desconocidos, duplicados y contactos ambiguos detienen el lote. No equivale a una sincronización bidireccional.

## Empezar

1. Leer [instalación](../../docs/installation.md) y [privacidad](../../docs/privacy-consent.md).
2. Crear un proyecto independiente y cuentas/datos de prueba.
3. Ejecutar `npm test` y `npm run validate` localmente (sin dependencias externas).
4. Instalar la copia con simulación activada y revisar resúmenes antes de permitir escrituras en desarrollo.

Ver [cambios frente a producción](../../docs/v4-review.md), [clasp](../../docs/clasp.md) y [problemas](../../docs/troubleshooting.md).

## Límites actuales

20 páginas, 500 suscriptores y una escritura por ejecución. Esto no garantiza completar una ejecución dentro de las cuotas: se busca cada contacto y se relee toda la publicación antes de cada escritura. No hay cursor persistente, cola de errores ni presupuesto de tiempo implementado. Reintentos de lectura: tres intentos como máximo con esperas de uno y dos segundos; no interpreta Retry-After. No repetir manualmente una escritura ambigua sin reconciliar su resultado.

Las pruebas simulan el contrato; no certifican disponibilidad de API, permisos, indexación inmediata de HubSpot ni elegibilidad del plan.
