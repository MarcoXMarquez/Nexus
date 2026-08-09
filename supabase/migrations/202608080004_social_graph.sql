-- Nexus MCU 1.1 · grafo social seguro
-- Aplica esta migración después de 202608080003_progress_tombstones.sql.

alter table public.viewer_profiles add column if not exists handle text;

update public.viewer_profiles
set handle = 'nexus-' || left(replace(id::text, '-', ''), 10)
where handle is null;

alter table public.viewer_profiles alter column handle set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'viewer_profiles_handle_format'
      and conrelid = 'public.viewer_profiles'::regclass
  ) then
    alter table public.viewer_profiles
      add constraint viewer_profiles_handle_format
      check (handle ~ '^[a-z0-9][a-z0-9_-]{2,23}$');
  end if;
end;
$$;

create unique index if not exists viewer_profiles_handle_unique
  on public.viewer_profiles(lower(handle));

create or replace function public.prepare_social_handle()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.handle is null or btrim(new.handle) = '' then
    new.handle := 'nexus-' || left(replace(new.id::text, '-', ''), 10);
  else
    new.handle := lower(btrim(new.handle));
  end if;
  return new;
end;
$$;

drop trigger if exists viewer_profiles_social_handle on public.viewer_profiles;
create trigger viewer_profiles_social_handle
  before insert or update of handle on public.viewer_profiles
  for each row execute function public.prepare_social_handle();

create table if not exists public.social_settings (
  profile_id uuid primary key references public.viewer_profiles(id) on delete cascade,
  discoverability text not null default 'exact'
    check (discoverability in ('hidden', 'exact', 'searchable')),
  progress_visibility text not null default 'friends'
    check (progress_visibility in ('private', 'friends', 'public')),
  achievements_visibility text not null default 'friends'
    check (achievements_visibility in ('private', 'friends', 'public')),
  activity_visibility text not null default 'friends'
    check (activity_visibility in ('private', 'friends', 'public')),
  marathons_visibility text not null default 'friends'
    check (marathons_visibility in ('private', 'friends', 'public')),
  allow_friend_requests boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.social_settings(profile_id)
select id from public.viewer_profiles
on conflict(profile_id) do nothing;

create or replace function public.create_social_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.social_settings(profile_id) values(new.id)
  on conflict(profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists viewer_profiles_social_settings on public.viewer_profiles;
create trigger viewer_profiles_social_settings
  after insert on public.viewer_profiles
  for each row execute function public.create_social_settings();

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  recipient_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  constraint friend_requests_not_self check (sender_profile_id <> recipient_profile_id)
);

create unique index if not exists friend_requests_pending_pair_unique
  on public.friend_requests(
    least(sender_profile_id, recipient_profile_id),
    greatest(sender_profile_id, recipient_profile_id)
  )
  where status = 'pending';

create index if not exists friend_requests_recipient_pending
  on public.friend_requests(recipient_profile_id, created_at desc)
  where status = 'pending';

create table if not exists public.friendships (
  profile_a uuid not null references public.viewer_profiles(id) on delete cascade,
  profile_b uuid not null references public.viewer_profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key(profile_a, profile_b),
  constraint friendships_canonical_pair check (profile_a < profile_b)
);

create index if not exists friendships_profile_b on public.friendships(profile_b, created_at desc);

create table if not exists public.profile_blocks (
  blocker_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  blocked_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key(blocker_profile_id, blocked_profile_id),
  constraint profile_blocks_not_self check (blocker_profile_id <> blocked_profile_id)
);

create index if not exists profile_blocks_blocked on public.profile_blocks(blocked_profile_id);

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  reported_profile_id uuid not null references public.viewer_profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'impersonation', 'inappropriate', 'other')),
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint moderation_reports_not_self check (reporter_profile_id <> reported_profile_id),
  constraint moderation_reports_details_length check (char_length(details) <= 1000)
);

create index if not exists moderation_reports_open
  on public.moderation_reports(created_at desc)
  where status = 'open';

create or replace function public.profiles_are_friends(left_profile uuid, right_profile uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.friendships f
    where f.profile_a = least(left_profile, right_profile)
      and f.profile_b = greatest(left_profile, right_profile)
  );
$$;

create or replace function public.profiles_are_blocked(left_profile uuid, right_profile uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profile_blocks b
    where (b.blocker_profile_id = left_profile and b.blocked_profile_id = right_profile)
       or (b.blocker_profile_id = right_profile and b.blocked_profile_id = left_profile)
  );
$$;

create or replace function public.can_view_social_field(
  viewer_profile uuid,
  target_profile uuid,
  field_visibility text
)
returns boolean language sql stable security definer set search_path = public as $$
  select
    public.owns_profile(target_profile)
    or (
      not public.profiles_are_blocked(viewer_profile, target_profile)
      and (
        field_visibility = 'public'
        or (field_visibility = 'friends' and public.profiles_are_friends(viewer_profile, target_profile))
      )
    );
$$;

create or replace function public.set_social_handle(acting_profile uuid, requested_handle text)
returns text language plpgsql security definer set search_path = public as $$
declare
  normalized text := lower(btrim(requested_handle));
begin
  if not public.owns_profile(acting_profile) then
    raise exception 'Perfil no autorizado';
  end if;
  if normalized !~ '^[a-z0-9][a-z0-9_-]{2,23}$' then
    raise exception 'El identificador debe tener entre 3 y 24 caracteres';
  end if;
  if normalized in ('admin', 'nexus', 'marvel', 'support', 'moderator', 'system') then
    raise exception 'Identificador reservado';
  end if;

  update public.viewer_profiles set handle = normalized where id = acting_profile;
  return normalized;
exception when unique_violation then
  raise exception 'Ese identificador ya está en uso';
end;
$$;

create or replace function public.update_social_settings(
  acting_profile uuid,
  next_discoverability text,
  next_progress_visibility text,
  next_achievements_visibility text,
  next_activity_visibility text,
  next_marathons_visibility text,
  next_allow_friend_requests boolean
)
returns public.social_settings language plpgsql security definer set search_path = public as $$
declare
  result public.social_settings;
begin
  if not public.owns_profile(acting_profile) then
    raise exception 'Perfil no autorizado';
  end if;

  insert into public.social_settings(
    profile_id,
    discoverability,
    progress_visibility,
    achievements_visibility,
    activity_visibility,
    marathons_visibility,
    allow_friend_requests,
    updated_at
  ) values (
    acting_profile,
    next_discoverability,
    next_progress_visibility,
    next_achievements_visibility,
    next_activity_visibility,
    next_marathons_visibility,
    next_allow_friend_requests,
    timezone('utc', now())
  )
  on conflict(profile_id) do update set
    discoverability = excluded.discoverability,
    progress_visibility = excluded.progress_visibility,
    achievements_visibility = excluded.achievements_visibility,
    activity_visibility = excluded.activity_visibility,
    marathons_visibility = excluded.marathons_visibility,
    allow_friend_requests = excluded.allow_friend_requests,
    updated_at = excluded.updated_at
  returning * into result;

  return result;
end;
$$;

create or replace function public.search_social_profiles(
  acting_profile uuid,
  search_text text,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table(
  profile_id uuid,
  handle text,
  name text,
  avatar text,
  color text,
  relationship text
)
language plpgsql stable security definer set search_path = public as $$
declare
  normalized text := lower(btrim(search_text));
begin
  if not public.owns_profile(acting_profile) then
    raise exception 'Perfil no autorizado';
  end if;
  if char_length(normalized) < 3 then return; end if;

  return query
  select
    vp.id,
    vp.handle,
    vp.name,
    vp.avatar,
    vp.color,
    case
      when public.profiles_are_friends(acting_profile, vp.id) then 'friends'
      when exists(
        select 1 from public.friend_requests fr
        where fr.sender_profile_id = acting_profile
          and fr.recipient_profile_id = vp.id
          and fr.status = 'pending'
      ) then 'sent'
      when exists(
        select 1 from public.friend_requests fr
        where fr.sender_profile_id = vp.id
          and fr.recipient_profile_id = acting_profile
          and fr.status = 'pending'
      ) then 'received'
      else 'none'
    end
  from public.viewer_profiles vp
  join public.social_settings ss on ss.profile_id = vp.id
  where vp.id <> acting_profile
    and vp.child_mode = false
    and not public.profiles_are_blocked(acting_profile, vp.id)
    and (
      (ss.discoverability = 'exact' and lower(vp.handle) = normalized)
      or (
        ss.discoverability = 'searchable'
        and (lower(vp.handle) like '%' || normalized || '%' or lower(vp.name) like '%' || normalized || '%')
      )
    )
  order by
    case when lower(vp.handle) = normalized then 0 else 1 end,
    lower(vp.handle)
  limit least(greatest(result_limit, 1), 20)
  offset greatest(result_offset, 0);
end;
$$;

create or replace function public.send_friend_request(acting_profile uuid, target_profile uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  request_id uuid;
  target_owner uuid;
  sender_handle text;
  sender_name text;
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;
  if acting_profile = target_profile then raise exception 'No puedes agregarte a ti mismo'; end if;
  if public.profiles_are_blocked(acting_profile, target_profile) then raise exception 'Perfil no disponible'; end if;
  if public.profiles_are_friends(acting_profile, target_profile) then raise exception 'Ya son amigos'; end if;
  if not exists(
    select 1 from public.social_settings ss
    join public.viewer_profiles vp on vp.id = ss.profile_id
    where ss.profile_id = target_profile and ss.allow_friend_requests and not vp.child_mode
  ) then raise exception 'Este perfil no acepta solicitudes'; end if;
  if (select count(*) from public.friendships f where f.profile_a = acting_profile or f.profile_b = acting_profile) >= 250 then
    raise exception 'Alcanzaste el límite de amigos';
  end if;
  if (select count(*) from public.friend_requests fr where fr.sender_profile_id = acting_profile and fr.created_at > timezone('utc', now()) - interval '1 day') >= 30 then
    raise exception 'Demasiadas solicitudes en las últimas 24 horas';
  end if;

  insert into public.friend_requests(sender_profile_id, recipient_profile_id)
  values(acting_profile, target_profile)
  returning id into request_id;

  select vp.owner_id, sender.handle, sender.name
  into target_owner, sender_handle, sender_name
  from public.viewer_profiles vp
  cross join public.viewer_profiles sender
  where vp.id = target_profile and sender.id = acting_profile;

  insert into public.notifications(user_id, kind, payload)
  values(target_owner, 'friend_request', jsonb_build_object(
    'requestId', request_id,
    'profileId', acting_profile,
    'handle', sender_handle,
    'name', sender_name
  ));

  return request_id;
exception when unique_violation then
  raise exception 'Ya existe una solicitud pendiente';
end;
$$;

create or replace function public.respond_friend_request(
  acting_profile uuid,
  request_id uuid,
  accept_request boolean
)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  request_row public.friend_requests%rowtype;
  recipient_owner uuid;
  recipient_handle text;
  recipient_name text;
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  select * into request_row
  from public.friend_requests fr
  where fr.id = request_id
    and fr.recipient_profile_id = acting_profile
    and fr.status = 'pending'
  for update;

  if request_row.id is null then raise exception 'Solicitud no disponible'; end if;
  if public.profiles_are_blocked(request_row.sender_profile_id, acting_profile) then
    raise exception 'Solicitud no disponible';
  end if;

  update public.friend_requests
  set status = case when accept_request then 'accepted' else 'rejected' end,
      resolved_at = timezone('utc', now())
  where id = request_row.id;

  if accept_request then
    insert into public.friendships(profile_a, profile_b)
    values(
      least(request_row.sender_profile_id, acting_profile),
      greatest(request_row.sender_profile_id, acting_profile)
    )
    on conflict do nothing;

    select vp.owner_id, recipient.handle, recipient.name
    into recipient_owner, recipient_handle, recipient_name
    from public.viewer_profiles vp
    cross join public.viewer_profiles recipient
    where vp.id = request_row.sender_profile_id and recipient.id = acting_profile;

    insert into public.notifications(user_id, kind, payload)
    values(recipient_owner, 'friend_accepted', jsonb_build_object(
      'profileId', acting_profile,
      'handle', recipient_handle,
      'name', recipient_name
    ));
  end if;

  return accept_request;
end;
$$;

create or replace function public.cancel_friend_request(acting_profile uuid, request_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  update public.friend_requests
  set status = 'cancelled', resolved_at = timezone('utc', now())
  where id = request_id and sender_profile_id = acting_profile and status = 'pending';

  return found;
end;
$$;

create or replace function public.remove_friend(acting_profile uuid, target_profile uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  delete from public.friendships
  where profile_a = least(acting_profile, target_profile)
    and profile_b = greatest(acting_profile, target_profile);

  return found;
end;
$$;

create or replace function public.block_social_profile(acting_profile uuid, target_profile uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;
  if acting_profile = target_profile then raise exception 'No puedes bloquearte a ti mismo'; end if;

  insert into public.profile_blocks(blocker_profile_id, blocked_profile_id)
  values(acting_profile, target_profile)
  on conflict do nothing;

  delete from public.friendships
  where profile_a = least(acting_profile, target_profile)
    and profile_b = greatest(acting_profile, target_profile);

  update public.friend_requests
  set status = 'cancelled', resolved_at = timezone('utc', now())
  where status = 'pending'
    and least(sender_profile_id, recipient_profile_id) = least(acting_profile, target_profile)
    and greatest(sender_profile_id, recipient_profile_id) = greatest(acting_profile, target_profile);

  return true;
end;
$$;

create or replace function public.unblock_social_profile(acting_profile uuid, target_profile uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;
  delete from public.profile_blocks
  where blocker_profile_id = acting_profile and blocked_profile_id = target_profile;
  return found;
end;
$$;

create or replace function public.list_friend_requests(acting_profile uuid)
returns table(
  request_id uuid,
  direction text,
  profile_id uuid,
  handle text,
  name text,
  avatar text,
  color text,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  return query
  select
    fr.id,
    case when fr.sender_profile_id = acting_profile then 'sent' else 'received' end,
    other_profile.id,
    other_profile.handle,
    other_profile.name,
    other_profile.avatar,
    other_profile.color,
    fr.created_at
  from public.friend_requests fr
  join public.viewer_profiles other_profile
    on other_profile.id = case
      when fr.sender_profile_id = acting_profile then fr.recipient_profile_id
      else fr.sender_profile_id
    end
  where fr.status = 'pending'
    and (fr.sender_profile_id = acting_profile or fr.recipient_profile_id = acting_profile)
    and not public.profiles_are_blocked(acting_profile, other_profile.id)
  order by fr.created_at desc;
end;
$$;

create or replace function public.list_friends(acting_profile uuid)
returns table(
  profile_id uuid,
  handle text,
  name text,
  avatar text,
  color text,
  completed_titles integer,
  total_titles integer,
  achievement_count integer,
  friends_since timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  return query
  select
    friend.id,
    friend.handle,
    friend.name,
    friend.avatar,
    friend.color,
    case when public.can_view_social_field(acting_profile, friend.id, settings.progress_visibility)
      then (select count(*)::integer from public.title_progress tp where tp.profile_id = friend.id and tp.status = 'completed')
      else null
    end,
    case when public.can_view_social_field(acting_profile, friend.id, settings.progress_visibility)
      then (select count(*)::integer from public.catalog_titles ct where not ct.upcoming)
      else null
    end,
    case when public.can_view_social_field(acting_profile, friend.id, settings.achievements_visibility)
      then (select count(*)::integer from public.user_achievements ua where ua.profile_id = friend.id)
      else null
    end,
    f.created_at
  from public.friendships f
  join public.viewer_profiles friend
    on friend.id = case when f.profile_a = acting_profile then f.profile_b else f.profile_a end
  join public.social_settings settings on settings.profile_id = friend.id
  where f.profile_a = acting_profile or f.profile_b = acting_profile
  order by lower(friend.name), lower(friend.handle);
end;
$$;

create or replace function public.get_social_profile(acting_profile uuid, requested_handle text)
returns table(
  profile_id uuid,
  handle text,
  name text,
  avatar text,
  color text,
  relationship text,
  completed_titles integer,
  total_titles integer,
  completed_movies integer,
  completed_series integer,
  achievement_count integer,
  friends_since timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  return query
  select
    target.id,
    target.handle,
    target.name,
    target.avatar,
    target.color,
    case
      when public.profiles_are_friends(acting_profile, target.id) then 'friends'
      when exists(select 1 from public.friend_requests fr where fr.sender_profile_id = acting_profile and fr.recipient_profile_id = target.id and fr.status = 'pending') then 'sent'
      when exists(select 1 from public.friend_requests fr where fr.sender_profile_id = target.id and fr.recipient_profile_id = acting_profile and fr.status = 'pending') then 'received'
      else 'none'
    end,
    case when public.can_view_social_field(acting_profile, target.id, settings.progress_visibility)
      then (select count(*)::integer from public.title_progress tp where tp.profile_id = target.id and tp.status = 'completed') else null end,
    case when public.can_view_social_field(acting_profile, target.id, settings.progress_visibility)
      then (select count(*)::integer from public.catalog_titles ct where not ct.upcoming) else null end,
    case when public.can_view_social_field(acting_profile, target.id, settings.progress_visibility)
      then (select count(*)::integer from public.title_progress tp join public.catalog_titles ct on ct.id = tp.title_id where tp.profile_id = target.id and tp.status = 'completed' and ct.media_type in ('movie', 'special')) else null end,
    case when public.can_view_social_field(acting_profile, target.id, settings.progress_visibility)
      then (select count(*)::integer from public.title_progress tp join public.catalog_titles ct on ct.id = tp.title_id where tp.profile_id = target.id and tp.status = 'completed' and ct.media_type in ('series', 'animation')) else null end,
    case when public.can_view_social_field(acting_profile, target.id, settings.achievements_visibility)
      then (select count(*)::integer from public.user_achievements ua where ua.profile_id = target.id) else null end,
    (select f.created_at from public.friendships f where f.profile_a = least(acting_profile, target.id) and f.profile_b = greatest(acting_profile, target.id))
  from public.viewer_profiles target
  join public.social_settings settings on settings.profile_id = target.id
  where lower(target.handle) = lower(btrim(requested_handle))
    and target.child_mode = false
    and not public.profiles_are_blocked(acting_profile, target.id)
    and (
      public.profiles_are_friends(acting_profile, target.id)
      or settings.discoverability <> 'hidden'
      or public.owns_profile(target.id)
    )
  limit 1;
end;
$$;

create or replace function public.compare_friend_progress(acting_profile uuid, target_profile uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  target_settings public.social_settings%rowtype;
  viewer_titles text[];
  friend_titles text[];
  viewer_achievements text[];
  friend_achievements text[];
  track_progress jsonb;
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;
  if not public.profiles_are_friends(acting_profile, target_profile) then raise exception 'Solo puedes comparar con amigos'; end if;
  if public.profiles_are_blocked(acting_profile, target_profile) then raise exception 'Perfil no disponible'; end if;

  select * into target_settings from public.social_settings where profile_id = target_profile;
  if not public.can_view_social_field(acting_profile, target_profile, target_settings.progress_visibility) then
    raise exception 'Este amigo mantiene su progreso privado';
  end if;

  select coalesce(array_agg(tp.title_id order by tp.title_id), '{}'::text[])
  into viewer_titles
  from public.title_progress tp
  where tp.profile_id = acting_profile and tp.status = 'completed';

  select coalesce(array_agg(tp.title_id order by tp.title_id), '{}'::text[])
  into friend_titles
  from public.title_progress tp
  where tp.profile_id = target_profile and tp.status = 'completed';

  select coalesce(array_agg(ua.achievement_id order by ua.achievement_id), '{}'::text[])
  into viewer_achievements
  from public.user_achievements ua
  where ua.profile_id = acting_profile;

  if public.can_view_social_field(acting_profile, target_profile, target_settings.achievements_visibility) then
    select coalesce(array_agg(ua.achievement_id order by ua.achievement_id), '{}'::text[])
    into friend_achievements
    from public.user_achievements ua
    where ua.profile_id = target_profile;
  else
    friend_achievements := '{}'::text[];
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'trackId', progress.track_id,
    'total', progress.total,
    'viewerCompleted', progress.viewer_completed,
    'friendCompleted', progress.friend_completed
  ) order by progress.track_id), '[]'::jsonb)
  into track_progress
  from (
    select
      coalesce(ct.lane, case when ct.media_type = 'movie' then 'mcu' else 'series' end) as track_id,
      count(*)::integer as total,
      count(*) filter(where ct.id = any(viewer_titles))::integer as viewer_completed,
      count(*) filter(where ct.id = any(friend_titles))::integer as friend_completed
    from public.catalog_titles ct
    where not ct.upcoming
    group by 1
  ) progress;

  return jsonb_build_object(
    'viewerCompleted', to_jsonb(viewer_titles),
    'friendCompleted', to_jsonb(friend_titles),
    'sharedTitleIds', to_jsonb(array(select unnest(viewer_titles) intersect select unnest(friend_titles))),
    'onlyViewerTitleIds', to_jsonb(array(select unnest(viewer_titles) except select unnest(friend_titles))),
    'onlyFriendTitleIds', to_jsonb(array(select unnest(friend_titles) except select unnest(viewer_titles))),
    'togetherPendingTitleIds', coalesce((
      select jsonb_agg(id order by release_order nulls last, id)
      from (
        select ct.id, ct.release_order
        from public.catalog_titles ct
        where not ct.upcoming and not (ct.id = any(viewer_titles)) and not (ct.id = any(friend_titles))
        order by ct.release_order nulls last, ct.id
        limit 24
      ) pending
    ), '[]'::jsonb),
    'viewerAchievementIds', to_jsonb(viewer_achievements),
    'friendAchievementIds', to_jsonb(friend_achievements),
    'sharedAchievementIds', to_jsonb(array(select unnest(viewer_achievements) intersect select unnest(friend_achievements))),
    'trackProgress', track_progress
  );
end;
$$;

create or replace function public.list_friend_activity(acting_profile uuid, result_limit integer default 30)
returns table(
  profile_id uuid,
  handle text,
  name text,
  avatar text,
  event_type text,
  title_id text,
  payload jsonb,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;

  return query
  select
    friend.id,
    friend.handle,
    friend.name,
    friend.avatar,
    event.event_type,
    event.title_id,
    event.payload - 'note' - 'email' - 'deviceId',
    event.created_at
  from public.friendships friendship
  join public.viewer_profiles friend
    on friend.id = case when friendship.profile_a = acting_profile then friendship.profile_b else friendship.profile_a end
  join public.social_settings settings on settings.profile_id = friend.id
  join public.activity_events event on event.profile_id = friend.id
  where (friendship.profile_a = acting_profile or friendship.profile_b = acting_profile)
    and public.can_view_social_field(acting_profile, friend.id, settings.activity_visibility)
    and event.event_type in ('watched', 'achievement', 'marathon_completed')
  order by event.created_at desc
  limit least(greatest(result_limit, 1), 50);
end;
$$;

create or replace function public.report_social_profile(
  acting_profile uuid,
  target_profile uuid,
  report_reason text,
  report_details text default ''
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  report_id uuid;
begin
  if not public.owns_profile(acting_profile) then raise exception 'Perfil no autorizado'; end if;
  if acting_profile = target_profile then raise exception 'Reporte no válido'; end if;
  if (select count(*) from public.moderation_reports mr where mr.reporter_profile_id = acting_profile and mr.created_at > timezone('utc', now()) - interval '1 day') >= 10 then
    raise exception 'Demasiados reportes en las últimas 24 horas';
  end if;

  insert into public.moderation_reports(reporter_profile_id, reported_profile_id, reason, details)
  values(acting_profile, target_profile, report_reason, left(coalesce(report_details, ''), 1000))
  returning id into report_id;

  perform public.block_social_profile(acting_profile, target_profile);
  return report_id;
end;
$$;

alter table public.social_settings enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.profile_blocks enable row level security;
alter table public.moderation_reports enable row level security;

create policy social_settings_owner_select on public.social_settings
  for select using (public.owns_profile(profile_id));
create policy social_settings_owner_write on public.social_settings
  for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));

create policy friend_requests_participant_select on public.friend_requests
  for select using (public.owns_profile(sender_profile_id) or public.owns_profile(recipient_profile_id));
create policy friendships_participant_select on public.friendships
  for select using (public.owns_profile(profile_a) or public.owns_profile(profile_b));
create policy profile_blocks_owner_select on public.profile_blocks
  for select using (public.owns_profile(blocker_profile_id));
create policy moderation_reports_owner_select on public.moderation_reports
  for select using (public.owns_profile(reporter_profile_id));

revoke all on public.friend_requests, public.friendships, public.profile_blocks, public.moderation_reports from anon;
revoke insert, update, delete on public.friend_requests, public.friendships, public.profile_blocks, public.moderation_reports from authenticated;
grant select on public.friend_requests, public.friendships, public.profile_blocks, public.moderation_reports to authenticated;
grant select, insert, update on public.social_settings to authenticated;

grant execute on function public.set_social_handle(uuid, text) to authenticated;
grant execute on function public.update_social_settings(uuid, text, text, text, text, text, boolean) to authenticated;
grant execute on function public.search_social_profiles(uuid, text, integer, integer) to authenticated;
grant execute on function public.send_friend_request(uuid, uuid) to authenticated;
grant execute on function public.respond_friend_request(uuid, uuid, boolean) to authenticated;
grant execute on function public.cancel_friend_request(uuid, uuid) to authenticated;
grant execute on function public.remove_friend(uuid, uuid) to authenticated;
grant execute on function public.block_social_profile(uuid, uuid) to authenticated;
grant execute on function public.unblock_social_profile(uuid, uuid) to authenticated;
grant execute on function public.list_friend_requests(uuid) to authenticated;
grant execute on function public.list_friends(uuid) to authenticated;
grant execute on function public.get_social_profile(uuid, text) to authenticated;
grant execute on function public.compare_friend_progress(uuid, uuid) to authenticated;
grant execute on function public.list_friend_activity(uuid, integer) to authenticated;
grant execute on function public.report_social_profile(uuid, uuid, text, text) to authenticated;

do $$
begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'friend_requests') then
      alter publication supabase_realtime add table public.friend_requests;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'friendships') then
      alter publication supabase_realtime add table public.friendships;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
      alter publication supabase_realtime add table public.notifications;
    end if;
  end if;
end;
$$;
