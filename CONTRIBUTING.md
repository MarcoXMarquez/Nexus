# Contribuir a Nexus

## Regla principal

No añadas otra vista grande a `desktop/renderer.tsx`. Crea un módulo en `app/features/<función>` con su componente, estilos, servicio y tipos. El renderer solo debe conectarlo a la navegación y al estado global.

## Convenciones

- TypeScript estricto, componentes funcionales y nombres descriptivos.
- Dos espacios de indentación; Prettier es la fuente de verdad.
- Datos de dominio en `app/core` o en el módulo que los posee.
- Acceso Supabase en servicios, nunca dentro de JSX.
- Una migración nueva para cada cambio de base de datos; una migración ya publicada no se reescribe.
- Las tablas privadas requieren RLS, índices y pruebas de acceso negativo.
- No uses `service_role` en variables `NEXT_PUBLIC_*`.
- Las imágenes nuevas deben tener procedencia, formato optimizado y dimensiones apropiadas para su uso.

## Validación obligatoria

```bash
npm run format:check
npm run test
npm run lint
npm run build
```

## Commits

Mantén cada commit ejecutable y enfocado:

1. infraestructura o migración;
2. servicio y tipos;
3. experiencia visual;
4. documentación.

No mezcles arte generado, cambios de datos y lógica de sincronización si pueden revisarse por separado.
