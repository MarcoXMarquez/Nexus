# Arquitectura de Nexus MCU 1.0

## Principios

- La experiencia rica de `desktop/renderer.tsx` es la interfaz canónica para web y Electron.
- El modo invitado funciona sin Supabase.
- La interfaz escribe primero en el dispositivo y sincroniza después.
- Las notas y el historial son privados por defecto.
- El catálogo Marvel y sus imágenes se distribuyen con la aplicación; la nube guarda estado del usuario.

## Capas

- `app/`: entrada Next.js, rutas públicas y PWA para Vercel.
- `app/cloud/`: cuentas, IndexedDB, sincronización y superficies cloud.
- `desktop/`: contenedor Electron, SQLite y credenciales cifradas.
- `supabase/migrations/`: esquema PostgreSQL y políticas RLS.
- `supabase/functions/`: operaciones privilegiadas que nunca exponen la service role.
- `public/`: catálogo visual completo servido por CDN.

## Flujo de datos

1. El usuario realiza una acción.
2. La interfaz conserva la compatibilidad con el estado local existente.
3. El repositorio local crea una copia versionada en IndexedDB o SQLite.
4. Si existe sesión y conexión, Nexus combina el estado con `profile_snapshots`.
5. RLS verifica que el usuario sea propietario del perfil.
6. Los datos públicos se consultan únicamente cuando su visibilidad lo permite.

## Seguridad

- La anon key puede estar en el cliente; la service role no.
- Todas las tablas privadas tienen RLS.
- Las invitaciones se guardan como SHA-256, no como token legible.
- Las sesiones de Electron se cifran con `safeStorage`.
- La comunicación Electron usa un preload limitado y validación de tamaño/tipo.
- La eliminación de cuenta se ejecuta en una Edge Function autenticada.
