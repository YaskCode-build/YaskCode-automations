# Flujo previsto con clasp

Referencia oficial: https://developers.google.com/apps-script/guides/clasp (consultada el 16 de octubre de 2026).

1. Preparar Node.js y una versión compatible de `@google/clasp`.
2. Habilitar Apps Script API en la cuenta de desarrollo y autenticar localmente con `clasp login`.
3. Crear un proyecto de desarrollo independiente; no seleccionar producción.
4. Configurar `.clasp.json` solo localmente. No subirlo ni subir `.clasprc.json` o archivos OAuth.
5. Revisar `clasp status` y el proyecto de destino antes de cada transferencia. Push puede sobrescribir archivos remotos; pull puede sobrescribir archivos locales.
6. Configurar credenciales de prueba fuera de Git y autorizar permisos mínimos.
7. Probar sin escrituras antes de cualquier activador de desarrollo.

El manifiesto, rutas y comandos de instalación completos se fijarán al incorporar el motor revisado. No se configura despliegue automático ni credenciales clasp en Actions.
