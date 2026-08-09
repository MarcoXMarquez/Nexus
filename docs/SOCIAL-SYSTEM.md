# Sistema social

## Experiencia incluida

- Buscar por handle con mínimo tres caracteres.
- Enviar, aceptar, rechazar y cancelar solicitudes.
- Ver amigos y solicitudes recibidas/enviadas.
- Perfil social con estadísticas permitidas, siguiente título y actividad.
- Comparación por líneas, títulos comunes y diferencias.
- Invitar a crear o compartir un maratón desde la biblioteca.
- Eliminar amistad, bloquear, desbloquear y reportar.
- Badge de solicitudes y refresco en tiempo real.

## Privacidad

Cada perfil decide si aparece en búsquedas, si acepta solicitudes y quién puede ver progreso, actividad, logros y maratones. Los niveles son `public`, `friends` y `private`.

El modo sin spoilers oculta títulos futuros y conexiones al comparar. La actividad pública elimina notas, correos y datos de dispositivos. El bloqueo impide búsqueda útil, solicitud, perfil y comparación en ambos sentidos.

## Seguridad y abuso

- Solo el dueño puede actuar como su perfil (`owns_profile`).
- Las funciones privilegiadas revocan ejecución a `PUBLIC` y `anon`.
- Límite de solicitudes por día, máximo de amistades y límite de reportes.
- No hay escritura directa en solicitudes, amistades, bloqueos ni reportes.
- RLS restringe las lecturas a participantes autorizados.
- Los reportes no son visibles para el usuario denunciado.

## Estados de interfaz

Toda acción tiene carga, éxito y error. Un error no cierra el perfil. Las listas vacías explican el siguiente paso y el invitado recibe una llamada clara para iniciar sesión.

La migración necesaria es `202608080004_social_graph.sql`.
