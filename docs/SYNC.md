# Sincronización automática

Nexus es offline-first: marcar o desmarcar se refleja inmediatamente y no depende de un botón “Sincronizar”.

## Flujo

1. El estado local se actualiza.
2. Se persiste en `localStorage` y en el repositorio offline.
3. Se emite `nexus:local-change`.
4. La sesión cloud intenta enviar el cambio.
5. Si falla por red, permanece pendiente.
6. Al volver la conexión se reintenta y se aplica el snapshot más reciente.

Desmarcar un título produce una eliminación explícita o tombstone; no se interpreta como “dato ausente”. Esto evita que un snapshot antiguo vuelva a marcarlo tras iniciar sesión o redesplegar.

## Conflictos

- El cambio con `updated_at` más reciente gana.
- Las colecciones usan IDs estables y eliminaciones explícitas.
- Los historiales son append-only y se deduplican por ID.
- El catálogo nunca se sincroniza porque forma parte del build.

## Eventos internos

- `nexus:local-change`: hay cambios locales para la nube.
- `nexus:snapshot-applied`: el estado remoto validado debe rehidratar la UI.
- `nexus:social-count`: actualiza el badge de solicitudes.

No deben añadirse botones manuales de sincronización. La pantalla de cuenta puede mostrar estado, última sincronización y errores, pero no controlar el mecanismo.
