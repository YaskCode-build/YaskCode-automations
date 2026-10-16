# Arquitectura y límites

[English](architecture.en.md)

GitHub conserva la fuente revisada. Google Apps Script ejecuta la integración. clasp transfiere archivos explícitamente a un proyecto independiente de desarrollo. No hay despliegue automático a producción.

```mermaid
flowchart TD
  B[beehiiv] --> A[Apps Script]
  A --> H[HubSpot]
  G[GitHub] --> C[Copia local revisada]
  C -->|clasp| D[Apps Script de desarrollo]
```

El diagrama separa el flujo de datos operativo del flujo de desarrollo. El estado importado de newsletter no cambia por sí mismo el consentimiento nativo de marketing de HubSpot.

Ver [revisión de candidatos V4](v4-review.md). Los campos y errores se describen en la guía; falta validación independiente contra API reales.
