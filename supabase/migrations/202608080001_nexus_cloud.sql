-- Nexus MCU 1.0 · esquema cloud inicial
-- Ejecutar con Supabase CLI o desde el editor SQL siguiendo DEPLOYMENT-VERCEL.md.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.account_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null default 'Usuario Nexus',
  avatar_url text,
  bio text not null default '',
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint username_length check (username is null or char_length(username) between 3 and 30),
  constraint display_name_length check (char_length(display_name) between 1 and 60),
  constraint bio_length check (char_length(bio) <= 300)
);

create table public.viewer_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_key text not null,
  name text not null,
  avatar text not null default 'N',
  color text not null default '#f2454b',
  child_mode boolean not null default false,
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(owner_id, local_key),
  constraint viewer_name_length check (char_length(name) between 1 and 60),
  constraint viewer_avatar_length check (char_length(avatar) between 1 and 4),
  constraint viewer_color_format check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table public.profile_snapshots (
  profile_id uuid primary key references public.viewer_profiles(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  revision bigint not null default 0,
  device_id text,
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.title_progress (
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  title_id text not null,
  status text not null default 'pending' check (status in ('pending','started','completed','ignored')),
  favorite boolean not null default false,
  watchlist boolean not null default false,
  rating smallint check (rating between 1 and 5),
  private_note text not null default '',
  watched_at timestamptz,
  rewatch_count integer not null default 0 check (rewatch_count >= 0),
  revision bigint not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key(profile_id, title_id),
  constraint private_note_length check (char_length(private_note) <= 10000)
);

create table public.episode_progress (
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  title_id text not null,
  season_number integer not null default 1 check (season_number > 0),
  episode_number integer not null check (episode_number > 0),
  completed boolean not null default true,
  watched_at timestamptz not null default timezone('utc', now()),
  revision bigint not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key(profile_id, title_id, season_number, episode_number)
);

create table public.user_preferences (
  profile_id uuid primary key references public.viewer_profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.custom_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  name text not null,
  color text not null default '#6c8fff',
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  share_slug text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint list_name_length check (char_length(name) between 1 and 80)
);

create table public.custom_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.custom_lists(id) on delete cascade,
  title_id text not null,
  position numeric(18,6) not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique(list_id, title_id)
);

create table public.marathons (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  visibility text not null default 'private' check (visibility in ('private','invite','public')),
  share_slug text unique,
  cover_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint marathon_name_length check (char_length(name) between 1 and 100),
  constraint marathon_description_length check (char_length(description) <= 1000)
);

create table public.marathon_items (
  id uuid primary key default gen_random_uuid(),
  marathon_id uuid not null references public.marathons(id) on delete cascade,
  position numeric(18,6) not null,
  title_id text not null,
  episode integer check (episode is null or episode > 0),
  planned_at timestamptz,
  duration_override integer check (duration_override is null or duration_override > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.marathon_members (
  marathon_id uuid not null references public.marathons(id) on delete cascade,
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  role text not null default 'participant' check (role in ('owner','editor','participant','viewer')),
  joined_at timestamptz not null default timezone('utc', now()),
  primary key(marathon_id, profile_id)
);

create table public.marathon_progress (
  marathon_id uuid not null references public.marathons(id) on delete cascade,
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  item_id uuid not null references public.marathon_items(id) on delete cascade,
  completed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key(marathon_id, profile_id, item_id)
);

create table public.marathon_invitations (
  id uuid primary key default gen_random_uuid(),
  marathon_id uuid not null references public.marathons(id) on delete cascade,
  token_hash text not null unique,
  role text not null default 'participant' check (role in ('editor','participant','viewer')),
  max_uses integer not null default 20 check (max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.user_achievements (
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default timezone('utc', now()),
  progress_snapshot jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  primary key(profile_id, achievement_id)
);

create table public.devices (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform text not null,
  app_version text not null,
  last_seen_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint device_name_length check (char_length(name) between 1 and 120)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  event_type text not null,
  title_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_viewer_profiles_owner on public.viewer_profiles(owner_id);
create index idx_title_progress_profile_status on public.title_progress(profile_id, status);
create index idx_episode_progress_profile_title on public.episode_progress(profile_id, title_id);
create index idx_custom_lists_profile on public.custom_lists(profile_id);
create index idx_marathons_owner on public.marathons(owner_profile_id);
create index idx_marathon_items_marathon_position on public.marathon_items(marathon_id, position);
create index idx_marathon_members_profile on public.marathon_members(profile_id);
create index idx_invitations_hash on public.marathon_invitations(token_hash) where revoked_at is null;
create index idx_devices_user_last_seen on public.devices(user_id, last_seen_at desc);
create index idx_activity_profile_created on public.activity_events(profile_id, created_at desc);
create index idx_notifications_user_unread on public.notifications(user_id, created_at desc) where read_at is null;

create trigger account_profiles_updated before update on public.account_profiles for each row execute function public.set_updated_at();
create trigger viewer_profiles_updated before update on public.viewer_profiles for each row execute function public.set_updated_at();
create trigger title_progress_updated before update on public.title_progress for each row execute function public.set_updated_at();
create trigger episode_progress_updated before update on public.episode_progress for each row execute function public.set_updated_at();
create trigger preferences_updated before update on public.user_preferences for each row execute function public.set_updated_at();
create trigger custom_lists_updated before update on public.custom_lists for each row execute function public.set_updated_at();
create trigger marathons_updated before update on public.marathons for each row execute function public.set_updated_at();
create trigger marathon_progress_updated before update on public.marathon_progress for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger security definer set search_path = public language plpgsql as $$
declare
  initial_name text;
begin
  initial_name := coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1), 'Usuario Nexus');
  insert into public.account_profiles(id, display_name) values(new.id, initial_name);
  insert into public.viewer_profiles(owner_id, local_key, name, avatar, color)
    values(new.id, 'principal', initial_name, upper(left(initial_name,1)), '#f2454b');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.owns_profile(profile uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.viewer_profiles where id = profile and owner_id = auth.uid());
$$;

create or replace function public.can_view_marathon(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.marathons m
    where m.id = target and (
      m.visibility = 'public'
      or public.owns_profile(m.owner_profile_id)
      or exists(
        select 1 from public.marathon_members mm
        join public.viewer_profiles vp on vp.id = mm.profile_id
        where mm.marathon_id = m.id and vp.owner_id = auth.uid()
      )
    )
  );
$$;

create or replace function public.can_edit_marathon(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.marathons m
    where m.id = target and (
      public.owns_profile(m.owner_profile_id)
      or exists(
        select 1 from public.marathon_members mm
        join public.viewer_profiles vp on vp.id = mm.profile_id
        where mm.marathon_id = m.id and vp.owner_id = auth.uid() and mm.role in ('owner','editor')
      )
    )
  );
$$;

create or replace function public.accept_marathon_invitation(invitation_token text, joining_profile_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  invitation public.marathon_invitations%rowtype;
begin
  if not public.owns_profile(joining_profile_id) then raise exception 'Perfil no autorizado'; end if;
  select * into invitation from public.marathon_invitations
    where token_hash = encode(digest(invitation_token, 'sha256'), 'hex')
      and revoked_at is null and expires_at > timezone('utc', now()) and use_count < max_uses
    for update;
  if invitation.id is null then raise exception 'Invitación inválida, vencida o agotada'; end if;
  insert into public.marathon_members(marathon_id, profile_id, role)
    values(invitation.marathon_id, joining_profile_id, invitation.role)
    on conflict(marathon_id, profile_id) do update set role = excluded.role;
  update public.marathon_invitations set use_count = use_count + 1 where id = invitation.id;
  return invitation.marathon_id;
end;
$$;

grant execute on function public.accept_marathon_invitation(text, uuid) to authenticated;

alter table public.account_profiles enable row level security;
alter table public.viewer_profiles enable row level security;
alter table public.profile_snapshots enable row level security;
alter table public.title_progress enable row level security;
alter table public.episode_progress enable row level security;
alter table public.user_preferences enable row level security;
alter table public.custom_lists enable row level security;
alter table public.custom_list_items enable row level security;
alter table public.marathons enable row level security;
alter table public.marathon_items enable row level security;
alter table public.marathon_members enable row level security;
alter table public.marathon_progress enable row level security;
alter table public.marathon_invitations enable row level security;
alter table public.user_achievements enable row level security;
alter table public.devices enable row level security;
alter table public.activity_events enable row level security;
alter table public.notifications enable row level security;

create policy account_self_select on public.account_profiles for select using (id = auth.uid() or visibility = 'public');
create policy account_self_update on public.account_profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy viewer_select on public.viewer_profiles for select using (owner_id = auth.uid() or (visibility = 'public' and child_mode = false));
create policy viewer_insert on public.viewer_profiles for insert with check (owner_id = auth.uid());
create policy viewer_update on public.viewer_profiles for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy viewer_delete on public.viewer_profiles for delete using (owner_id = auth.uid());

create policy snapshots_owner on public.profile_snapshots for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy progress_owner on public.title_progress for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy episodes_owner on public.episode_progress for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy preferences_owner on public.user_preferences for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy lists_select on public.custom_lists for select using (public.owns_profile(profile_id) or visibility = 'public');
create policy lists_write on public.custom_lists for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy list_items_select on public.custom_list_items for select using (exists(select 1 from public.custom_lists l where l.id = list_id and (public.owns_profile(l.profile_id) or l.visibility = 'public')));
create policy list_items_write on public.custom_list_items for all using (exists(select 1 from public.custom_lists l where l.id = list_id and public.owns_profile(l.profile_id))) with check (exists(select 1 from public.custom_lists l where l.id = list_id and public.owns_profile(l.profile_id)));

create policy marathons_select on public.marathons for select using (public.can_view_marathon(id));
create policy marathons_insert on public.marathons for insert with check (public.owns_profile(owner_profile_id));
create policy marathons_update on public.marathons for update using (public.can_edit_marathon(id)) with check (public.can_edit_marathon(id));
create policy marathons_delete on public.marathons for delete using (public.owns_profile(owner_profile_id));
create policy marathon_items_select on public.marathon_items for select using (public.can_view_marathon(marathon_id));
create policy marathon_items_write on public.marathon_items for all using (public.can_edit_marathon(marathon_id)) with check (public.can_edit_marathon(marathon_id));
create policy marathon_members_select on public.marathon_members for select using (public.can_view_marathon(marathon_id));
create policy marathon_members_delete on public.marathon_members for delete using (public.owns_profile(profile_id) or public.can_edit_marathon(marathon_id));
create policy marathon_progress_select on public.marathon_progress for select using (public.can_view_marathon(marathon_id));
create policy marathon_progress_write on public.marathon_progress for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy invitations_owner_select on public.marathon_invitations for select using (public.can_edit_marathon(marathon_id));
create policy invitations_owner_insert on public.marathon_invitations for insert with check (public.can_edit_marathon(marathon_id));
create policy invitations_owner_update on public.marathon_invitations for update using (public.can_edit_marathon(marathon_id));
create policy invitations_owner_delete on public.marathon_invitations for delete using (public.can_edit_marathon(marathon_id));

create policy achievements_select on public.user_achievements for select using (public.owns_profile(profile_id) or visibility = 'public');
create policy achievements_owner on public.user_achievements for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy devices_owner on public.devices for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy activity_owner on public.activity_events for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
create policy notifications_owner on public.notifications for select using (user_id = auth.uid());
create policy notifications_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.profile_snapshots from anon;
revoke all on public.title_progress from anon;
revoke all on public.episode_progress from anon;
revoke all on public.user_preferences from anon;
revoke all on public.devices from anon;
revoke all on public.activity_events from anon;
revoke all on public.notifications from anon;

grant usage on schema public to anon, authenticated;
grant select on public.viewer_profiles, public.user_achievements, public.marathons, public.marathon_items to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
