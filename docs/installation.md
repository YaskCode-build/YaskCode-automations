# Instalación en desarrollo independiente

[English](installation.en.md)

Esta guía no modifica ni reemplaza la instalación de producción. Estado: experimental; falta validar de extremo a extremo con cuentas de prueba.

## Requisitos

- Cuenta Google con Apps Script y permisos de conexiones externas.
- Acceso autorizado a API de beehiiv para leer suscripciones y a API CRM de HubSpot para leer y escribir contactos. Comprobar acceso y cuotas en el plan concreto; el repositorio no garantiza API gratuitas para cualquier cuenta.
- Node.js 22 o superior para las pruebas locales. No se requieren paquetes npm para ejecutarlas.
- Credenciales propias con el menor alcance posible. La creación de propiedades HubSpot es un paso administrativo separado; el motor no las crea.

## Propiedades HubSpot

Preparar los nombres internos exactos en el entorno de prueba:

| Nombre interno | Tipo y valores requeridos |
| --- | --- |
| `email` | Propiedad estándar de correo |
| `yaskcode_contact_source` | Texto o enumeración que admita `beehiiv_newsletter` |
| `yaskcode_relationship` | Texto o selección que admita `newsletter_subscriber`; valores múltiples separados por punto y coma |
| `beehiiv_subscription_status` | Texto o enumeración: active, pending, inactive, unsubscribed, bounced |
| `beehiiv_subscribed_at` | Fecha compatible con milisegundos Unix a medianoche UTC |
| `beehiiv_last_sync` | Fecha y hora compatible con ISO 8601 UTC |

Confirmar tipos/opciones con la API del portal antes de escribir. Si ya existen, inspeccionarlas; no recrearlas ni cambiar su tipo a ciegas.

## Instalación manual

1. Crear un proyecto nuevo de Apps Script con nombre que indique desarrollo.
2. Copiar `YaskCode_V4.gs` desde `integrations/beehiiv-hubspot/apps-script/src/`. Mantener `DRY_RUN = true`.
3. Mostrar el manifiesto en configuración y usar el `appsscript.json` incluido. Su único alcance explícito permite solicitudes externas; no instala activadores ni autoriza acceso general a Drive o correo.
4. En Script Properties, configurar `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` y `HUBSPOT_ACCESS_TOKEN` con valores del entorno de prueba. Las plantillas del repositorio no son credenciales funcionales.
5. Autorizar y ejecutar manualmente `sincronizarYaskCodeV4`. Una simulación sigue leyendo datos reales si se usan cuentas reales: por eso se requieren cuentas y datos de prueba.
6. Revisar resúmenes y confirmar el plan. Solo en desarrollo, cambiar `DRY_RUN` a false para probar una escritura; comprobar resultado CRM antes de repetir.
7. Tras completar estas comprobaciones, si se desea periodicidad en desarrollo, crear manualmente un único activador de tiempo para esa función cada 15 minutos. No duplicar activadores. El repositorio no lo hace automáticamente.

## Detener y recuperar

Para detener un entorno de desarrollo, eliminar su activador; también puede volver a activarse DRY_RUN. La simulación evita escrituras, pero continúa consumiendo lecturas. Ante resultado ambiguo comprobar CRM antes de repetir. Recuperar una versión de código no revierte datos CRM: conservar revisión y plan de reparación por separado.

## Fuentes y comprobación pendiente

- https://developers.beehiiv.com/api-reference/subscriptions/index
- https://developers.beehiiv.com/welcome/pagination
- https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm
- https://developers.google.com/apps-script/guides/services/quotas

Referencias consultadas el 16 de octubre de 2026. La validación independiente debe confirmar paginación, tipos de fecha, límites y permisos antes de dar esta instalación por reproducible.
