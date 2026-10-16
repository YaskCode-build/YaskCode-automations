# Revisión inicial de los candidatos V4

Inspección estática: 16 de octubre de 2026. No se ejecutó ninguno de estos archivos ni se accedió a producción.

## Material recuperado

Dos archivos independientes: `YaskCode_Sync_V4_Seguro(1).gs` y `YaskCode_V4_Motor_General_Etapa6.gs`. Ambos declaran la función `sincronizarYaskCodeV4` y `DRY_RUN = true`. Por tanto, ninguno acredita por sí solo la configuración actual que escribe automáticamente en producción.

En la lectura no se observaron claves, tokens, valores de publicación ni contactos incrustados. Ambos consultan Script Properties para `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` y `HUBSPOT_ACCESS_TOKEN`. Este resultado no equivale a una auditoría completa ni a validación funcional.

## Comportamientos observados

- Bloqueo de concurrencia mediante ScriptLock y liberación en finally.
- Lectura con límites de 20 páginas y 500 suscriptores, rechazo de correos duplicados y paginación incompleta.
- Búsqueda por correo antes de crear y detección de más de un resultado.
- Reactivaciones apartadas para revisión; actualización de propiedades propias, sin llamadas a consentimiento nativo de marketing.
- Reintentos limitados a operaciones de lectura, incluida búsqueda POST; sin repetición automática de escrituras.
- Resúmenes numéricos, sin impresión deliberada de listas de correos o tokens.

## Diferencia relevante

La copia temprana bloquea todo el plan si supera cinco escrituras. Etapa6 prioriza actualizaciones de estados no activos y procesa un lote de hasta cinco, dejando pendientes para otra ejecución. Etapa6 añade comprobaciones explícitas contra altas no activas y reactivaciones en el bloque de escritura.

## Aspectos que requieren validación

1. Confirmar que el archivo final en producción corresponde a Etapa6 y conocer cambios posteriores, sin cambiar el activador.
2. Cotejar el esquema de paginación y los estados con la API vigente; no dar por correcta la combinación `has_more` y `next_cursor` sin verificar contrato.
3. Estimar tiempo y llamadas: cada contacto genera una búsqueda y cada escritura vuelve a leer toda la publicación. Cinco escrituras no garantizan ejecución corta.
4. Añadir manejo del presupuesto de tiempo y política para Retry-After; los reintentos actuales esperan uno y dos segundos.
5. Revisar consistencia eventual de búsquedas CRM y reconciliación de escrituras ambiguas.
6. La revalidación de actualizaciones comprueba ID y estado anterior, pero no vuelve a verificar el vínculo fuente/relación. Evaluar cambios concurrentes de esos campos.
7. Los estados ambiguos bloquean todo el lote, lo que puede retrasar bajas válidas. Documentar y probar esta decisión.
8. Revisar los errores de plataforma: `e.message` y la excepción relanzada podrían contener datos de diagnóstico no controlados. Exigir redacción en la versión pública.
9. Validar los tipos y opciones de las propiedades CRM y los límites de ambas API según plan.

## Siguiente entrada necesaria

Exportación del código final operativo o confirmación de qué archivo corresponde exactamente a él, incluidos cambios posteriores. No solicitar ni copiar Script Properties, tokens, listas de suscriptores ni registros con datos personales. Hasta entonces no se incorpora un motor ejecutable al repositorio.
