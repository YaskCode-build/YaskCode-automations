# Solución de problemas inicial

[English](troubleshooting.en.md)

| Síntoma | Comprobación |
| --- | --- |
| GitHub devuelve 404 | Confirmar URL, visibilidad y acceso de la aplicación al repositorio privado |
| YASKCODE_SYNC_FAILED | Error genérico para proteger datos; revisar configuración, cuotas y conectividad en desarrollo |
| Faltan propiedades secretas | Configurar los nombres documentados en Script Properties del proyecto de desarrollo; nunca copiarlos a Git |
| HTTP 401/403 | Revisar credencial, permisos y plan API sin imprimir tokens |
| HTTP 429 | Revisar límites y política de espera; no repetir escrituras a ciegas |
| Lectura incompleta o estados desconocidos | Detener escrituras y validar contrato API con ejemplos sintéticos |
| Bajas no reflejadas en marketing nativo | El campo importado de newsletter no equivale a consentimiento nativo de HubSpot |

No cambiar producción para diagnosticar el borrador. La copia distribuida es experimental y su instalación independiente sigue pendiente.
