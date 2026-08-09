# Navegación web

`app/features/navigation` convierte el estado visible en URL y usa la History API nativa. Esto mantiene la velocidad de una SPA sin romper los controles del navegador.

## Parámetros

- `view`: dashboard, map, library, marathons, profile, achievements, friends, etc.
- `title`: ficha seleccionada.
- `profile`: handle del amigo abierto.
- `compare`: comparación activa con ese amigo.

Ejemplo:

```text
/?view=map&title=iron-man
/?view=friends&profile=marco&compare=marco
```

Abrir una vista o capa crea una entrada de historial. Cerrar una ficha usa Atrás cuando la capa nació dentro de la sesión; un enlace profundo inicial limpia solamente el parámetro correspondiente. `popstate` rehidrata la vista, la ficha y el perfil.

## Regla para nuevas vistas

1. Añadir el identificador a `APP_VIEWS`.
2. Renderizarla desde la composición principal.
3. Abrirla mediante `openView`, no con estados paralelos.
4. Si es una capa, representarla con un parámetro propio y cerrarla con `closeTopLayer`.
5. Probar enlace directo, Atrás, Adelante y recarga.
