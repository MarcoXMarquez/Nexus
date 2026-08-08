import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../app/mcu-data.ts", import.meta.url), "utf8");
const itemsStart = source.indexOf("[", source.indexOf("=", source.indexOf("export const MCU_ITEMS")));
const itemsEnd = source.indexOf("\n];", itemsStart) + 2;
const countsStart = source.indexOf("{", source.indexOf("=", source.indexOf("export const EPISODE_COUNTS")));
const countsEnd = source.indexOf("\n};", countsStart) + 2;
const items = JSON.parse(source.slice(itemsStart, itemsEnd));
const episodeCounts = JSON.parse(source.slice(countsStart, countsEnd));
const sqlString = (value) => value == null ? "null" : `'${String(value).replaceAll("'", "''")}'`;
const rows = items.map((item) => `(${sqlString(item.id)},${sqlString(item.title)},${sqlString(item.date)},${item.release ?? "null"},${sqlString(item.lane)},${sqlString(item.phase)},${sqlString(item.saga)},${sqlString(item.type)},${sqlString(item.wiki)},${Boolean(item.upcoming)})`).join(",\n");
const episodes = Object.entries(episodeCounts).map(([titleId, count]) => `select ${sqlString(titleId)}, 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, ${count}) episode_number`).join("\nunion all\n");

const migration = `-- Nexus MCU 1.0 · catálogo normalizado y sincronización por entidad
-- Generado desde app/mcu-data.ts. No editar el bloque de seeds a mano.

create table if not exists public.catalog_titles (
  id text primary key,
  title text not null,
  display_date text not null,
  release_order numeric,
  lane text,
  phase text,
  saga text,
  media_type text not null check (media_type in ('movie','series','animation','special')),
  wiki_key text not null,
  upcoming boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_episodes (
  title_id text not null references public.catalog_titles(id) on delete cascade,
  season_number integer not null default 1 check (season_number > 0),
  episode_number integer not null check (episode_number > 0),
  name text not null,
  runtime_minutes integer check (runtime_minutes is null or runtime_minutes > 0),
  primary key(title_id, season_number, episode_number)
);

insert into public.catalog_titles(id,title,display_date,release_order,lane,phase,saga,media_type,wiki_key,upcoming) values
${rows}
on conflict(id) do update set title=excluded.title,display_date=excluded.display_date,release_order=excluded.release_order,lane=excluded.lane,phase=excluded.phase,saga=excluded.saga,media_type=excluded.media_type,wiki_key=excluded.wiki_key,upcoming=excluded.upcoming,updated_at=timezone('utc',now());

insert into public.catalog_episodes(title_id,season_number,episode_number,name)
${episodes}
on conflict(title_id,season_number,episode_number) do update set name=excluded.name;

alter table public.marathons add column if not exists source_local_id text;
create unique index if not exists idx_marathons_owner_source on public.marathons(owner_profile_id,source_local_id);

do $$ begin
  if not exists(select 1 from pg_constraint where conname='title_progress_catalog_fk') then
    alter table public.title_progress add constraint title_progress_catalog_fk foreign key(title_id) references public.catalog_titles(id) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='episode_progress_catalog_fk') then
    alter table public.episode_progress add constraint episode_progress_catalog_fk foreign key(title_id,season_number,episode_number) references public.catalog_episodes(title_id,season_number,episode_number) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='custom_list_items_catalog_fk') then
    alter table public.custom_list_items add constraint custom_list_items_catalog_fk foreign key(title_id) references public.catalog_titles(id) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='marathon_items_catalog_fk') then
    alter table public.marathon_items add constraint marathon_items_catalog_fk foreign key(title_id) references public.catalog_titles(id) not valid;
  end if;
end $$;

alter table public.catalog_titles enable row level security;
alter table public.catalog_episodes enable row level security;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='catalog_titles' and policyname='catalog_titles_read') then
    create policy catalog_titles_read on public.catalog_titles for select using (true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='catalog_episodes' and policyname='catalog_episodes_read') then
    create policy catalog_episodes_read on public.catalog_episodes for select using (true);
  end if;
end $$;

grant select on public.catalog_titles, public.catalog_episodes to anon, authenticated;
revoke insert, update, delete on public.catalog_titles, public.catalog_episodes from anon, authenticated;
`;

writeFileSync(new URL("../supabase/migrations/202608080002_catalog_and_event_sync.sql", import.meta.url), migration);
console.log(`Generated ${items.length} titles and ${Object.values(episodeCounts).reduce((sum, value) => sum + value, 0)} episodes.`);
