# Modelo de datos

## Identidad

- `auth.users`: credenciales administradas por Supabase Auth.
- `accounts`: preferencias y estado de la cuenta.
- `viewer_profiles`: perfil visible dentro de Nexus. `account_id` pertenece a una cuenta y `handle` es único y normalizado.
- `social_settings`: descubrimiento, invitaciones y visibilidad por campo.

## Progreso

El catálogo no se duplica en la nube. Películas, series, episodios, pósteres y metadatos son estáticos y se identifican con los IDs permanentes del repositorio. Las tablas de usuario guardan referencias a esos IDs.

- `title_progress`: estado de una película, serie o especial.
- `episode_progress`: progreso por capítulo.
- `watchlists`, `custom_lists` y elementos asociados.
- `profile_snapshots`: respaldo compatible con el estado local histórico.
- `activity_events`: historial sanitizado para el propio perfil y, si se permite, sus amigos.

## Maratones y logros

- `marathons` y `marathon_items`: definición ordenada y progreso.
- `marathon_invitations`: invitaciones almacenadas mediante hash.
- `achievement_unlocks`: insignias obtenidas y fecha.

Los códigos `NXS1` de maratones son portátiles y conservan el orden de los IDs; no son credenciales ni conceden acceso a datos privados.

## Red social

- `friend_requests`: solicitud pendiente con emisor y receptor.
- `friendships`: relación canónica; el UUID menor queda en `profile_a` para impedir duplicados.
- `profile_blocks`: bloqueo unilateral que invalida solicitudes y amistades.
- `moderation_reports`: reporte privado del denunciante.

La UI nunca lee estas tablas para construir objetos públicos arbitrarios. Consume funciones RPC que devuelven DTO explícitos.
