# Arquitectura de Nexus

Nexus es una única aplicación React compartida por Next.js, la PWA y Electron. El catálogo y el arte Marvel viajan con la aplicación; Supabase conserva únicamente identidad, progreso y datos sociales del usuario.

## Capas

```text
app/
├── core/                 Modelos y estado local reutilizable
├── cloud/                Supabase, sincronización y DTO sociales
├── features/
│   ├── friends/          Amigos, privacidad y comparación
│   └── navigation/       URL e History API
├── auth/                 Puerta de acceso y recuperación
└── page.tsx              Entrada web
desktop/
├── renderer.tsx          Composición y superficies heredadas
└── main.cjs              Contenedor Electron
supabase/
├── migrations/           Esquema, índices, funciones y RLS
└── functions/            Operaciones privilegiadas
public/                   Imágenes optimizadas y PWA
tests/                    Contratos de arquitectura y seguridad
docs/                     Guías de cada subsistema
```

`desktop/renderer.tsx` sigue componiendo las vistas históricas. Los modelos, la persistencia, la navegación y la experiencia social ya no viven allí. Toda función nueva debe entrar como módulo dentro de `app/features`, no volver a agrandar el renderer.

## Flujo de una acción

1. La interfaz actualiza el estado local de manera inmediata.
2. `app/core/local-state.ts` persiste el cambio y emite `nexus:local-change`.
3. La capa cloud crea una operación durable y la intenta enviar a Supabase.
4. Al recuperar conectividad se vacía la cola automáticamente.
5. Un snapshot remoto válido emite `nexus:snapshot-applied` y rehidrata la interfaz.

La interfaz nunca contiene una service-role key. Las funciones `security definer` comprueban propiedad, revocan acceso anónimo y devuelven DTO limitados.

## Documentos relacionados

- [Modelo de datos](./docs/DATA-MODEL.md)
- [Navegación](./docs/NAVIGATION.md)
- [Sistema social](./docs/SOCIAL-SYSTEM.md)
- [Sincronización](./docs/SYNC.md)
- [Contribuir](./CONTRIBUTING.md)
- [Forja del Multiverso — diseño futuro](./docs/FORJA-MULTIVERSO.md)
