-- Nexus 1.1: los estados pendientes y capítulos desmarcados son cambios
-- explícitos. Esto evita que un snapshot antiguo los vuelva a marcar.

alter table public.title_progress
  add column if not exists device_id text;

alter table public.episode_progress
  alter column watched_at drop not null,
  add column if not exists device_id text;

create index if not exists idx_title_progress_revision
  on public.title_progress(profile_id, title_id, revision desc);

create index if not exists idx_episode_progress_revision
  on public.episode_progress(profile_id, title_id, season_number, episode_number, revision desc);

