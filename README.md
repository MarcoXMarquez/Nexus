# Nexus · MCU Tracker 1.0

Web/PWA y aplicación Electron para recorrer el multiverso audiovisual de Marvel, seguir películas y episodios, crear maratones y sincronizar perfiles mediante Nexus Cloud.

## Funciones

- Modo invitado completamente local.
- Mapa cronológico ramificado.
- Películas, series, capítulos, rutas y recomendaciones.
- Perfiles múltiples e infantiles.
- Cuentas, recuperación y sincronización offline-first con Supabase.
- Maratones privados, públicos o mediante invitación.
- Importación de maratones de amigos.
- Logros y perfiles públicos opcionales.
- Dispositivos vinculados.
- Exportación y eliminación completa de cuenta.
- PWA responsive e instalable.
- Aplicación Electron con SQLite y credenciales cifradas.

## Desarrollo web

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Copia `.env.example` como `.env.local` para activar Supabase. Sin esas variables la aplicación continúa funcionando como invitado.

## Escritorio

```bash
npm run desktop:build
npm run desktop:start
npm run desktop:make
```

## Despliegue

El proyecto no se despliega automáticamente. Sigue [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md) para crear Supabase y publicar personalmente en Vercel.

La arquitectura y las decisiones de seguridad están resumidas en [ARCHITECTURE.md](./ARCHITECTURE.md).
