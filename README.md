# Nexus · MCU Tracker

Web/PWA y aplicación Electron para recorrer el multiverso audiovisual de Marvel, seguir películas y episodios, crear maratones y sincronizar el progreso.

## Funciones principales

- Puerta inicial con registro, inicio de sesión o invitado local.
- Mapa cronológico ramificado y fichas de títulos.
- Seguimiento de películas, series, capítulos, favoritos y listas.
- Maratones personales y códigos portátiles para compartirlos.
- Logros visuales y perfiles públicos opcionales.
- Amigos, solicitudes, búsqueda, privacidad y comparación de avance.
- Navegación compatible con Atrás/Adelante y enlaces directos.
- Sincronización automática offline-first con Supabase.
- PWA responsive y aplicación Electron.

## Desarrollo

```bash
npm install
npm run dev
npm run test
npm run lint
npm run format:check
npm run build
```

Copia `.env.example` como `.env.local` para activar Supabase. Sin esas variables Nexus conserva el modo invitado local.

## Base de datos

```bash
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

La migración social más reciente es `supabase/migrations/202608080004_social_graph.sql`. No despliegues la web antes de aplicarla si quieres habilitar Amigos.

## Despliegue

El repositorio no se publica automáticamente. Sigue [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md) para desplegarlo personalmente en Vercel.

Empieza por [ARCHITECTURE.md](./ARCHITECTURE.md) para entender el código y por [CONTRIBUTING.md](./CONTRIBUTING.md) antes de añadir una función.
