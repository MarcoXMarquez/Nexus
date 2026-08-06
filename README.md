# Nexus · MCU Tracker

Web app instalable para recorrer el universo audiovisual de Marvel como una línea temporal ramificada.

Incluye navegación adaptada a escritorio y móvil, búsqueda y filtros, zoom, seguimiento de películas vistas, progreso por episodio para series y persistencia local.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

La información editable del catálogo y las temporadas está en `app/mcu-data.ts`. El progreso del usuario se guarda en el navegador mediante `localStorage`.
