import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EPISODE_COUNTS, MCU_ITEMS, POSTER_BY_WIKI, type MCUItem } from "../app/mcu-data";
import { TITLE_METADATA } from "../app/mcu-metadata";
import { BACKDROP_BY_ID } from "../app/backdrop-data";
import { TITLE_LOGO_BY_ID } from "../app/title-logo-data";
import { CHARACTER_OVERRIDES, CORE_STORY_IDS, EPISODE_RUNTIME_OVERRIDES, INTERNAL_ORDER_IDS, NARRATIVE_LINKS, POST_CREDIT_COUNTS, RUNTIME_OVERRIDES, SEASON_EPISODES, type ConnectionKind, type NarrativeLink } from "../app/narrative-data";
import { CloudWorkspace } from "../app/cloud/cloud-workspace";

type EpisodeState = Record<string, number[]>;
type MapItem = MCUItem & { releaseValue: number; trackId: string; order: number };
type AppView = "dashboard" | "map" | "routes" | "planner" | "calendar" | "list" | "profiles";
type Intent = "chronological" | "movies" | "series" | "short" | "new-line" | "random";
type Recommendation = { item: MapItem; reason: string };
type IconName = "search" | "target" | "minus" | "plus" | "fit" | "check" | "film" | "route" | "download" | "upload" | "close" | "chevron" | "home" | "bookmark" | "eye" | "shuffle" | "clock" | "spark" | "bar" | "calendar" | "user" | "star" | "note" | "bell" | "settings" | "trophy" | "share" | "grip";
type ActivityEvent = { id: string; at: number; action: "watched" | "unwatched" | "episode" | "rewatch" | "rating" | "note" };
type CustomList = { id: string; name: string; color: string; items: string[] };
type Profile = { id: string; name: string; avatar: string; color: string; child: boolean; guest?: boolean };
type SharedMarathon = { version: 1; id: string; name: string; description: string; createdAt: string; author: string; tasks: Array<{ itemId: string; episode?: number }>; coverIds: string[] };
type Preferences = { accent: "red" | "violet" | "cyan"; intensity: number; density: "comfortable" | "compact"; cardSize: "small" | "medium" | "large"; fontScale: number; highContrast: boolean; reduceMotion: boolean; achievements: boolean };
type Achievement = { id: string; title: string; description: string; icon: IconName; unlocked: boolean; progress: number };
type GlobalHit = { key: string; item: MapItem; episode?: number; category: "Título" | "Capítulo" | "Personaje" | "Universo" | "Conexión"; context: string };

const WATCHED_KEY = "nexus-desktop-watched-v1";
const EPISODES_KEY = "nexus-desktop-episodes-v1";
const WATCHLIST_KEY = "nexus-desktop-watchlist-v1";
const IGNORED_KEY = "nexus-desktop-ignored-v1";
const FAVORITE_TRACKS_KEY = "nexus-desktop-favorite-tracks-v1";
const INTENT_KEY = "nexus-desktop-intent-v1";
const SPOILERS_KEY = "nexus-desktop-spoilers-v1";
const ACTIVITY_KEY = "nexus-desktop-activity-v1";
const RATINGS_KEY = "nexus-desktop-ratings-v1";
const FAVORITES_KEY = "nexus-desktop-favorites-v1";
const NOTES_KEY = "nexus-desktop-notes-v1";
const WATCHED_DATES_KEY = "nexus-desktop-watched-dates-v1";
const REWATCHES_KEY = "nexus-desktop-rewatches-v1";
const HISTORY_KEY = "nexus-desktop-history-v1";
const CUSTOM_LISTS_KEY = "nexus-desktop-custom-lists-v1";
const REMINDERS_KEY = "nexus-desktop-reminders-v1";
const MARATHON_KEY = "nexus-desktop-marathon-v1";
const PROFILES_KEY = "nexus-desktop-profiles-v1";
const ACTIVE_PROFILE_KEY = "nexus-desktop-active-profile-v1";
const CUSTOM_MARATHONS_KEY = "nexus-desktop-custom-marathons-v1";
const PREFERENCES_KEY = "nexus-desktop-preferences-v1";
const UNLOCKED_ACHIEVEMENTS_KEY = "nexus-desktop-achievements-v1";
const DEFAULT_PREFERENCES: Preferences = { accent: "red", intensity: 82, density: "comfortable", cardSize: "medium", fontScale: 100, highContrast: false, reduceMotion: false, achievements: true };
const PROFILE_DATA_KEYS = [WATCHED_KEY, EPISODES_KEY, WATCHLIST_KEY, IGNORED_KEY, FAVORITE_TRACKS_KEY, INTENT_KEY, SPOILERS_KEY, ACTIVITY_KEY, RATINGS_KEY, FAVORITES_KEY, NOTES_KEY, WATCHED_DATES_KEY, REWATCHES_KEY, HISTORY_KEY, CUSTOM_LISTS_KEY, REMINDERS_KEY, MARATHON_KEY];
const YEAR_START = 1992;
const YEAR_END = 2028;
const MAP_LEFT = 250;
const MIN_ZOOM = 0.18;
const MAX_ZOOM = 1.35;

const MONTHS: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
const TYPE_LABEL: Record<MCUItem["type"], string> = { movie: "Película", series: "Serie", animation: "Animación", special: "Especial" };
const TYPE_COLOR: Record<MCUItem["type"], string> = { movie: "#ff5d66", series: "#a77bff", animation: "#39c9df", special: "#f2b84b" };
const INTENTS: { id: Intent; label: string; hint: string }[] = [
  { id: "chronological", label: "Continuar cronológicamente", hint: "El siguiente estreno pendiente" },
  { id: "movies", label: "Solo películas", hint: "Sin temporadas ni capítulos" },
  { id: "series", label: "Solo series", hint: "Prioriza lo que ya empezaste" },
  { id: "short", label: "Algo corto", hint: "La menor duración estimada" },
  { id: "new-line", label: "Empezar una línea", hint: "Un universo todavía sin explorar" },
  { id: "random", label: "Elegir por mí", hint: "Una selección sorpresa" },
];

const TRACKS = [
  { id: "animation", label: "Marvel Studios · animación", short: "Marvel animado", color: "#25d0dd" },
  { id: "animation-xmen", label: "X-Men · universos animados", short: "X-Men animado", color: "#6ca4ff" },
  { id: "animation-spider", label: "Spider-Man · universos animados", short: "Spider-Man animado", color: "#f05b8d" },
  { id: "animation-teams", label: "Avengers y equipos · animación", short: "Equipos animados", color: "#f2a53a" },
  { id: "animation-films", label: "Películas animadas de Marvel", short: "Películas animadas", color: "#58cfb5" },
  { id: "defenders", label: "Saga de los Defensores · Marvel Television", short: "Defensores", color: "#d94a42" },
  { id: "xmen", label: "X-Men · Fox", short: "X-Men", color: "#3b88ff" },
  { id: "fantastic", label: "Fantastic Four · legado", short: "Fantastic Four", color: "#ffb640" },
  { id: "other", label: "Defensores y legado", short: "Otros legados", color: "#ff793f" },
  { id: "tobey", label: "Spider-Man · Tobey", short: "Tobey", color: "#f24e86" },
  { id: "andrew", label: "Spider-Man · Andrew", short: "Andrew", color: "#9c70ff" },
  { id: "sony", label: "Sony Spider-Man Universe", short: "Sony", color: "#c757e7" },
  { id: "mcu", label: "Universo Cinematográfico Marvel", short: "UCM películas", color: "#f24545" },
  { id: "series", label: "UCM · series y especiales", short: "UCM series", color: "#58cf83" },
] as const;

const ERAS = [
  { label: "Animación 90s", year: 1992 },
  { label: "Legado", year: 1998 },
  { label: "Inicio UCM", year: 2008 },
  { label: "Infinity", year: 2012 },
  { label: "Endgame", year: 2019 },
  { label: "Multiverso", year: 2021 },
  { label: "Ahora", year: 2025 },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    minus: <path d="M5 12h14"/>, plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    fit: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="m3 8 5-5M21 8l-5-5M3 16l5 5M21 16l-5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>, film: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4"/></>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    upload: <><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></>, close: <><path d="m6 6 12 12M18 6 6 18"/></>, chevron: <path d="m9 18 6-6-6-6"/>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z"/>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    shuffle: <><path d="M3 7h3c5 0 5 10 10 10h5"/><path d="m18 14 3 3-3 3M3 17h3c2 0 3-.7 4-2M14 7c.7 0 1.3 0 2 0h5M18 4l3 3-3 3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/></>,
    bar: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>,
    note: <><path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0zM10 17h4M12 13v4M8 21h8"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4"/></>,
    share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></>,
    grip: <><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function releaseOf(item: MCUItem) {
  if (typeof item.release === "number") return item.release;
  const text = item.date.toLowerCase();
  const year = Number(text.match(/(?:19|20)\d{2}/)?.[0] ?? 2027);
  const month = Object.keys(MONTHS).find((key) => text.includes(key));
  return year + (month ? (MONTHS[month] + 0.5) / 12 : 0.5);
}

function trackOf(item: MCUItem) {
  if (item.lane === "spider") return item.id.includes("raimi") ? "tobey" : "andrew";
  if (item.lane) return item.lane;
  if (item.type === "animation") return "animation";
  return item.type === "movie" ? "mcu" : "series";
}

const ITEMS: MapItem[] = MCU_ITEMS.map((item, order) => ({ ...item, order, releaseValue: releaseOf(item), trackId: trackOf(item) })).sort((a, b) => a.releaseValue - b.releaseValue || a.order - b.order);
const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
const INTERNAL_ORDER_RANK = new Map(INTERNAL_ORDER_IDS.map((id, index) => [id, index]));
const CONNECTION_LABEL: Record<ConnectionKind, string> = { essential: "Esencial", recommended: "Recomendada", reference: "Referencia", variant: "Variante", shared: "Universo compartido", "time-travel": "Viaje temporal" };
const CONNECTION_COLOR: Record<ConnectionKind, string> = { essential: "#ff5b61", recommended: "#ffb64a", reference: "#75a7ff", variant: "#b77cff", shared: "#57cfb0", "time-travel": "#57d5e3" };

function dependencyRoute(targetId: string, includeContext = true) {
  const route: MapItem[] = [];
  const visited = new Set<string>();
  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const edge of NARRATIVE_LINKS[id] || []) {
      if (includeContext || edge.kind === "essential") visit(edge.prerequisite);
    }
    const item = ITEM_BY_ID.get(id);
    if (item) route.push(item);
  }
  visit(targetId);
  return route;
}

function dependencyEdges(targetId: string, includeContext = true) {
  const result: Array<{ from: MapItem; to: MapItem; edge: NarrativeLink }> = [];
  const visited = new Set<string>();
  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const edge of NARRATIVE_LINKS[id] || []) {
      if (!includeContext && edge.kind !== "essential") continue;
      const from = ITEM_BY_ID.get(edge.prerequisite);
      const to = ITEM_BY_ID.get(id);
      if (from && to) result.push({ from, to, edge });
      visit(edge.prerequisite);
    }
  }
  visit(targetId);
  return result;
}

// Cronología elástica: los años con más estrenos reciben espacio extra y los
// años vacíos se comprimen. Todas las ramas comparten los mismos anclajes.
const YEAR_WIDTHS = new Map<number, number>();
const YEAR_STARTS = new Map<number, number>();
let elasticCursor = MAP_LEFT;
for (let year = YEAR_START; year <= YEAR_END; year += 1) {
  const inYear = ITEMS.filter((item) => Math.floor(item.releaseValue) === year);
  const peakTrackDensity = Math.max(0, ...TRACKS.map((track) => inYear.filter((item) => item.trackId === track.id).length));
  const width = inYear.length === 0
    ? 64
    : Math.min(300, 108 + Math.max(0, peakTrackDensity - 1) * 38 + Math.max(0, inYear.length - 4) * 8);
  YEAR_STARTS.set(year, elasticCursor);
  YEAR_WIDTHS.set(year, width);
  elasticCursor += width;
}
const MAP_WIDTH = elasticCursor + 330;
const xOf = (release: number) => {
  const year = Math.max(YEAR_START, Math.min(YEAR_END, Math.floor(release)));
  const fraction = Math.max(0, Math.min(.999, release - year));
  return (YEAR_STARTS.get(year) || MAP_LEFT) + fraction * (YEAR_WIDTHS.get(year) || 100);
};
const KEY_IDS = new Set(["no-way-home", "deadpool-wolverine", "endgame", "iron-man", "doomsday"]);

function verticalMetrics(zoom: number) {
  if (zoom < .38) return { top: 110, gap: 72, height: 110 * 2 + (TRACKS.length - 1) * 72 };
  if (zoom < .78) return { top: 190, gap: 190, height: 190 * 2 + (TRACKS.length - 1) * 190 };
  return { top: 240, gap: 250, height: 240 * 2 + (TRACKS.length - 1) * 250 };
}

function yOfTrack(trackId: string, zoom: number) {
  const metrics = verticalMetrics(zoom);
  const index = Math.max(0, TRACKS.findIndex((track) => track.id === trackId));
  return metrics.top + index * metrics.gap;
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function posterFor(item: MCUItem, size: "thumb" | "card" | "full" = "card") {
  const source = POSTER_BY_WIKI[item.wiki];
  if (!source) return "./icon-512.png";
  if (size === "full" || !source.startsWith("/posters/")) return `.${source}`;
  const base = source.split("/").at(-1)?.replace(/\.[^.]+$/, ".webp");
  return `./posters/${size}/${base}`;
}

function artworkFor(item?: MapItem | MCUItem | null, size: "card" | "hero" = "hero") {
  if (!item) return "./artwork/multiverse-hero-v1.webp";
  const backdrop = BACKDROP_BY_ID[item.id];
  if (backdrop) return `.${backdrop[size]}`;
  const track = trackOf(item);
  if (track.startsWith("animation")) return "./artwork/animation-hero-v1.webp";
  if (["defenders", "tobey", "andrew", "sony"].includes(track) || item.id.includes("daredevil") || item.id.includes("spiderman")) return "./artwork/street-hero-v1.webp";
  if (["guardians", "captain-marvel", "eternals", "fantastic-four", "doomsday", "secret-wars", "loki-1", "loki-2"].some((id) => item.id.includes(id))) return "./artwork/cosmic-hero-v1.webp";
  return "./artwork/multiverse-hero-v1.webp";
}

function TitleHeading({ item, placement }: { item: MapItem | MCUItem; placement: "hero" | "detail" }) {
  const logo = TITLE_LOGO_BY_ID[item.id];
  return <h2 className={`title-treatment title-treatment-${placement}${logo ? " has-logo" : ""}`}>
    {logo ? <><img src={`.${logo.src}`} alt=""/><span className="sr-only">{item.title}</span></> : item.title}
  </h2>;
}

function mediaStyle(item: MapItem | MCUItem) {
  return { "--type-color": TYPE_COLOR[item.type], "--track-color": trackForId(trackOf(item))?.color || "#7d8798" } as React.CSSProperties;
}

function estimatedMinutes(item: MapItem, watched: Set<string>, episodes: EpisodeState): number {
  if (watched.has(item.id)) return 0;
  const total = EPISODE_COUNTS[item.id] || 0;
  const metadata = TITLE_METADATA[item.id];
  if (total) {
    const completed = new Set(episodes[item.id] || []);
    if (metadata?.episodeDurations?.length) return metadata.episodeDurations.reduce<number>((sum, duration, index) => sum + (completed.has(index + 1) ? 0 : duration ?? metadata.episodeRuntimeMinutes ?? EPISODE_RUNTIME_OVERRIDES[item.id] ?? (item.type === "animation" ? 24 : 42)), 0);
    const remaining = Math.max(0, total - completed.size);
    return remaining * (metadata?.episodeRuntimeMinutes || EPISODE_RUNTIME_OVERRIDES[item.id] || (item.type === "animation" ? 24 : 42));
  }
  return metadata?.runtimeMinutes || RUNTIME_OVERRIDES[item.id] || (item.type === "special" ? 50 : item.type === "animation" ? 86 : 122);
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `≈ ${days} d ${hours % 24} h`;
  return `≈ ${hours} h ${minutes % 60} min`;
}

function seededScore(value: string, seed: number) {
  let hash = seed || 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function trackForId(id: string) {
  return TRACKS.find((track) => track.id === id);
}

function globalHitsFor(rawQuery: string): GlobalHit[] {
  const query = normalize(rawQuery.trim());
  if (query.length < 2) return [];
  const hits: GlobalHit[] = [];
  for (const item of ITEMS) {
    const metadata = TITLE_METADATA[item.id];
    const track = trackForId(item.trackId);
    const titleMatch = normalize(item.title).includes(query);
    if (titleMatch) hits.push({ key:`title-${item.id}`, item, category:"Título", context:`${TYPE_LABEL[item.type]} · ${item.date}` });
    const character = [...(metadata?.mainCharacters||[]),...(CHARACTER_OVERRIDES[item.id]||[])].find((name) => normalize(name).includes(query));
    if (character) hits.push({ key:`character-${item.id}-${character}`, item, category:"Personaje", context:`${character} aparece en ${item.title}` });
    const universe = [item.saga, item.phase, track?.label, track?.short].find((value) => value && normalize(value).includes(query));
    if (universe && !titleMatch) hits.push({ key:`universe-${item.id}`, item, category:"Universo", context:String(universe) });
    const connection = (NARRATIVE_LINKS[item.id] || []).find((edge) => normalize(edge.reason).includes(query) || normalize(CONNECTION_LABEL[edge.kind]).includes(query));
    if (connection) hits.push({ key:`connection-${item.id}-${connection.prerequisite}`, item, category:"Conexión", context:connection.reason });
    const episodeMatch = rawQuery.match(/(?:cap(?:í|i)tulo|episodio|ep)\s*(\d+)/i);
    const total = EPISODE_COUNTS[item.id] || 0;
    const episode = episodeMatch ? Number(episodeMatch[1]) : 0;
    if (episode > 0 && episode <= total && (titleMatch || normalize(track?.short || "").includes(query.replace(/(?:cap(?:í|i)tulo|episodio|ep)\s*\d+/i,"" ).trim()))) hits.push({ key:`episode-${item.id}-${episode}`, item, episode, category:"Capítulo", context:`${item.title} · Capítulo ${episode}` });
  }
  const categoryRank = { Título:0, Capítulo:1, Personaje:2, Universo:3, Conexión:4 };
  return hits.sort((a,b) => categoryRank[a.category] - categoryRank[b.category] || a.item.releaseValue - b.item.releaseValue).slice(0,24);
}

const CONNECTION_REASON: Record<string, string> = {
  "spiderman-raimi-1": "Prepara la convergencia con Spider-Man: No Way Home",
  "spiderman-raimi-2": "Continúa la historia de Tobey antes de No Way Home",
  "spiderman-raimi-3": "Conecta con Spider-Man: No Way Home",
  "amazing-spiderman": "Prepara la convergencia con Spider-Man: No Way Home",
  "amazing-spiderman-2": "Conecta con Spider-Man: No Way Home",
  "xmen-last-stand": "Forma parte del recorrido que converge en Deadpool & Wolverine",
  "logan": "Contexto recomendado antes de Deadpool & Wolverine",
};

function useStoredProgress() {
  const [watched, setWatched] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]")); } catch { return new Set(); }
  });
  const [episodes, setEpisodes] = useState<EpisodeState>(() => {
    try { return JSON.parse(localStorage.getItem(EPISODES_KEY) || "{}"); } catch { return {}; }
  });
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]")); } catch { return new Set(); }
  });
  const [ignored, setIgnored] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(IGNORED_KEY) || "[]")); } catch { return new Set(); }
  });
  const [favoriteTracks, setFavoriteTracks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAVORITE_TRACKS_KEY) || '["mcu","series"]')); } catch { return new Set(["mcu", "series"]); }
  });
  const [intent, setIntent] = useState<Intent>(() => (localStorage.getItem(INTENT_KEY) as Intent) || "chronological");
  const [spoilerSafe, setSpoilerSafe] = useState(() => localStorage.getItem(SPOILERS_KEY) !== "false");
  const [activity, setActivity] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "{}"); } catch { return {}; }
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"); } catch { return {}; } });
  const [favorites, setFavorites] = useState<Set<string>>(() => { try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")); } catch { return new Set(); } });
  const [notes, setNotes] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"); } catch { return {}; } });
  const [watchedDates, setWatchedDates] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem(WATCHED_DATES_KEY) || "{}"); } catch { return {}; } });
  const [rewatches, setRewatches] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem(REWATCHES_KEY) || "{}"); } catch { return {}; } });
  const [history, setHistory] = useState<ActivityEvent[]>(() => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } });
  const [customLists, setCustomLists] = useState<CustomList[]>(() => { try { return JSON.parse(localStorage.getItem(CUSTOM_LISTS_KEY) || "[]"); } catch { return []; } });
  useEffect(() => localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched])), [watched]);
  useEffect(() => localStorage.setItem(EPISODES_KEY, JSON.stringify(episodes)), [episodes]);
  useEffect(() => localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...watchlist])), [watchlist]);
  useEffect(() => localStorage.setItem(IGNORED_KEY, JSON.stringify([...ignored])), [ignored]);
  useEffect(() => localStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify([...favoriteTracks])), [favoriteTracks]);
  useEffect(() => localStorage.setItem(INTENT_KEY, intent), [intent]);
  useEffect(() => localStorage.setItem(SPOILERS_KEY, String(spoilerSafe)), [spoilerSafe]);
  useEffect(() => localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)), [activity]);
  useEffect(() => localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings)), [ratings]);
  useEffect(() => localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])), [favorites]);
  useEffect(() => localStorage.setItem(NOTES_KEY, JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem(WATCHED_DATES_KEY, JSON.stringify(watchedDates)), [watchedDates]);
  useEffect(() => localStorage.setItem(REWATCHES_KEY, JSON.stringify(rewatches)), [rewatches]);
  useEffect(() => localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-500))), [history]);
  useEffect(() => localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(customLists)), [customLists]);
  return { watched, setWatched, episodes, setEpisodes, watchlist, setWatchlist, ignored, setIgnored, favoriteTracks, setFavoriteTracks, intent, setIntent, spoilerSafe, setSpoilerSafe, activity, setActivity, ratings, setRatings, favorites, setFavorites, notes, setNotes, watchedDates, setWatchedDates, rewatches, setRewatches, history, setHistory, customLists, setCustomLists };
}

export function App() {
  const { watched, setWatched, episodes, setEpisodes, watchlist, setWatchlist, ignored, setIgnored, favoriteTracks, setFavoriteTracks, intent, setIntent, spoilerSafe, setSpoilerSafe, activity, setActivity, ratings, setRatings, favorites, setFavorites, notes, setNotes, watchedDates, setWatchedDates, rewatches, setRewatches, history, setHistory, customLists, setCustomLists } = useStoredProgress();
  const [view, setView] = useState<AppView>("dashboard");
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [activeTrack, setActiveTrack] = useState("all");
  const [query, setQuery] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [globalIndex, setGlobalIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(() => { try { const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "{}"); return { ...DEFAULT_PREFERENCES, ...stored, fontScale: Math.max(100, Math.min(135, Number(stored.fontScale) || 100)) }; } catch { return DEFAULT_PREFERENCES; } });
  const [zoom, setZoom] = useState(0.46);
  const [mapScroll, setMapScroll] = useState({ left: 0, top: 0, width: 1, height: 1 });
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState("");
  const [randomSeed, setRandomSeed] = useState(0);
  const [pendingMapItem, setPendingMapItem] = useState<MapItem | null>(null);
  const [routeFocus, setRouteFocus] = useState<Set<string>>(new Set());
  const [routeTarget, setRouteTarget] = useState<MapItem | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try { const stored = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"); if (stored.length) return stored; } catch { /* usa el perfil inicial */ }
    return [{ id: "principal", name: "Marco", avatar: "M", color: "#f2454b", child: false }];
  });
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem(ACTIVE_PROFILE_KEY) || "principal");
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const toastTimer = useRef<number | null>(null);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) || profiles[0];
  const globalHits = useMemo(() => globalHitsFor(globalQuery), [globalQuery]);

  useEffect(() => { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId); }, [activeProfileId]);
  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    const root = document.documentElement;
    root.dataset.accent = preferences.accent;
    root.dataset.density = preferences.density;
    root.dataset.cardSize = preferences.cardSize;
    root.dataset.contrast = preferences.highContrast ? "high" : "normal";
    root.dataset.motion = preferences.reduceMotion ? "reduced" : "full";
    root.style.setProperty("--font-scale", String(preferences.fontScale / 100));
    root.style.setProperty("--accent-intensity", String(preferences.intensity / 100));
    root.style.setProperty("--accent-weight", `${Math.round(preferences.intensity / 5)}%`);
    root.style.setProperty("--theme-saturation", String(.72 + preferences.intensity / 180));
  }, [preferences]);
  useEffect(() => {
    const openCloud = () => setCloudOpen(true);
    window.addEventListener("nexus:open-cloud", openCloud);
    if (localStorage.getItem("nexus-cloud-pending-invite-v1")) setCloudOpen(true);
    return () => window.removeEventListener("nexus:open-cloud", openCloud);
  }, []);
  useEffect(() => {
    if (window.nexusDesktop || !("serviceWorker" in navigator)) return;
    const localDevelopment = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (localDevelopment) {
      // A PWA worker must never cache Next's development chunks: after HMR the
      // old module graph can hydrate but stop responding on the first state update.
      void navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())));
      if ("caches" in window) void caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("nexus-")).map((key) => caches.delete(key))));
      return;
    }
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  useEffect(() => {
    const prefix = `nexus-profile-${activeProfileId}-`;
    const values: Record<string, unknown> = {
      [WATCHED_KEY]: [...watched], [EPISODES_KEY]: episodes, [WATCHLIST_KEY]: [...watchlist], [IGNORED_KEY]: [...ignored], [FAVORITE_TRACKS_KEY]: [...favoriteTracks], [INTENT_KEY]: intent, [SPOILERS_KEY]: spoilerSafe, [ACTIVITY_KEY]: activity,
      [RATINGS_KEY]: ratings, [FAVORITES_KEY]: [...favorites], [NOTES_KEY]: notes, [WATCHED_DATES_KEY]: watchedDates, [REWATCHES_KEY]: rewatches, [HISTORY_KEY]: history.slice(-500), [CUSTOM_LISTS_KEY]: customLists,
    };
    Object.entries(values).forEach(([key, value]) => localStorage.setItem(`${prefix}${key}`, typeof value === "string" ? value : JSON.stringify(value)));
  }, [activeProfileId, activity, customLists, episodes, favoriteTracks, favorites, history, ignored, intent, notes, ratings, rewatches, spoilerSafe, watched, watchedDates, watchlist]);

  const releasedItems = useMemo(() => ITEMS.filter((item) => !item.upcoming), []);
  const completedCount = releasedItems.filter((item) => watched.has(item.id)).length;
  const percent = Math.round((completedCount / releasedItems.length) * 100);
  const searchResults = useMemo(() => query.trim() ? ITEMS.filter((item) => normalize(item.title).includes(normalize(query))).slice(0, 7) : [], [query]);
  const mapHeight = verticalMetrics(zoom).height;
  const selectedTrackIds = useMemo(() => favoriteTracks.size ? favoriteTracks : new Set(TRACKS.map((track) => track.id)), [favoriteTracks]);
  const eligibleItems = useMemo(() => releasedItems.filter((item) => {
    const warnings = TITLE_METADATA[item.id]?.contentWarnings || [];
    const childSafe = !activeProfile?.child || !warnings.some((warning) => /intensa|gráfica|adultos|lenguaje fuerte|terror|perturbadoras/i.test(warning));
    return childSafe && selectedTrackIds.has(item.trackId) && !ignored.has(item.id) && !watched.has(item.id);
  }), [activeProfile?.child, ignored, releasedItems, selectedTrackIds, watched]);
  const partialSeries = useMemo(() => ITEMS
    .filter((item) => {
      const total = EPISODE_COUNTS[item.id] || 0;
      const done = episodes[item.id]?.length || 0;
      return total > 0 && done > 0 && done < total && !ignored.has(item.id);
    })
    .sort((a, b) => (activity[b.id] || 0) - (activity[a.id] || 0)), [activity, episodes, ignored]);
  const continueItem = partialSeries.find((item) => selectedTrackIds.has(item.trackId)) || eligibleItems.find((item) => !EPISODE_COUNTS[item.id]) || eligibleItems[0] || null;
  const recommendations = useMemo<Recommendation[]>(() => {
    let candidates = [...eligibleItems];
    if (intent === "movies") candidates = candidates.filter((item) => !EPISODE_COUNTS[item.id] && item.type !== "special");
    if (intent === "series") candidates = candidates.filter((item) => Boolean(EPISODE_COUNTS[item.id]));
    if (intent === "short") candidates.sort((a, b) => estimatedMinutes(a, watched, episodes) - estimatedMinutes(b, watched, episodes) || a.releaseValue - b.releaseValue);
    else if (intent === "new-line") {
      const untouched = TRACKS.filter((track) => selectedTrackIds.has(track.id) && !ITEMS.some((item) => item.trackId === track.id && watched.has(item.id)));
      const untouchedIds = new Set<string>(untouched.map((track) => track.id));
      candidates = candidates.filter((item) => untouchedIds.has(item.trackId));
    } else if (intent === "random") {
      candidates.sort((a, b) => seededScore(a.id, randomSeed) - seededScore(b.id, randomSeed));
    } else candidates.sort((a, b) => a.releaseValue - b.releaseValue);

    const ordered: MapItem[] = [];
    if (intent !== "movies" && intent !== "new-line") partialSeries.filter((item) => selectedTrackIds.has(item.trackId)).forEach((item) => ordered.push(item));
    candidates.forEach((item) => { if (!ordered.some((entry) => entry.id === item.id)) ordered.push(item); });
    return ordered.slice(0, 8).map((item) => {
      const done = episodes[item.id]?.length || 0;
      const track = trackForId(item.trackId);
      let reason = CONNECTION_REASON[item.id] || `Pertenece a la línea ${track?.short || "Marvel"}`;
      if (done > 0 && done < (EPISODE_COUNTS[item.id] || 0)) reason = "Tienes esta serie empezada";
      else if (intent === "short") reason = `${formatMinutes(estimatedMinutes(item, watched, episodes))} estimados para completarla`;
      else if (intent === "chronological") reason = "Es la siguiente en la cronología seleccionada";
      else if (intent === "new-line") reason = `Buen punto de entrada a ${track?.short || "esta línea"}`;
      else if (intent === "random") reason = `Elegida al azar entre tus líneas favoritas`;
      return { item, reason };
    });
  }, [eligibleItems, intent, randomSeed, partialSeries, selectedTrackIds, watched, episodes]);

  const dailyRecommendation = useMemo(() => {
    const candidates = eligibleItems.length ? eligibleItems : releasedItems.filter((item) => !watched.has(item.id) && !ignored.has(item.id));
    if (!candidates.length) return null;
    const today = new Date();
    const seed = Number(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
    return candidates[seed % candidates.length];
  }, [eligibleItems, ignored, releasedItems, watched]);

  const stats = useMemo(() => {
    const episodeDone = Object.values(episodes).reduce((sum, values) => sum + values.length, 0);
    const seriesCompleted = releasedItems.filter((item) => EPISODE_COUNTS[item.id] && watched.has(item.id)).length;
    const moviesCompleted = releasedItems.filter((item) => !EPISODE_COUNTS[item.id] && watched.has(item.id)).length;
    const completedLines = TRACKS.filter((track) => {
      const entries = releasedItems.filter((item) => item.trackId === track.id);
      return entries.length > 0 && entries.every((item) => watched.has(item.id));
    }).length;
    const remainingMinutes = releasedItems.reduce((sum, item) => sum + estimatedMinutes(item, watched, episodes), 0);
    const trackProgress = TRACKS.map((track) => {
      const entries = releasedItems.filter((item) => item.trackId === track.id);
      return { track, ratio: entries.length ? entries.filter((item) => watched.has(item.id)).length / entries.length : 0 };
    }).sort((a, b) => b.ratio - a.ratio);
    const lastId = Object.entries(activity).sort((a, b) => b[1] - a[1])[0]?.[0];
    return { episodeDone, seriesCompleted, moviesCompleted, completedLines, remainingMinutes, bestTrack: trackProgress[0], lastItem: lastId ? ITEM_BY_ID.get(lastId) : null };
  }, [activity, episodes, releasedItems, watched]);
  const achievements = useMemo<Achievement[]>(() => {
    let marathonCount=0; try { marathonCount=JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY)||"[]").length; } catch {}
    const completedSeries=releasedItems.filter((item)=>Boolean(EPISODE_COUNTS[item.id])&&watched.has(item.id)).length;
    const completedTracks=TRACKS.filter((track)=>{const entries=releasedItems.filter((item)=>item.trackId===track.id);return entries.length>0&&entries.every((item)=>watched.has(item.id));}).length;
    const rated=Object.keys(ratings).length;
    return [
      {id:"first",title:"Primer salto",description:"Completa tu primer título",icon:"spark",unlocked:watched.size>=1,progress:Math.min(1,watched.size)},
      {id:"ten",title:"En marcha",description:"Completa 10 títulos",icon:"film",unlocked:watched.size>=10,progress:Math.min(1,watched.size/10)},
      {id:"series",title:"Una temporada más",description:"Termina una serie",icon:"check",unlocked:completedSeries>=1,progress:Math.min(1,completedSeries)},
      {id:"universe",title:"Universo conquistado",description:"Completa una línea entera",icon:"route",unlocked:completedTracks>=1,progress:Math.min(1,completedTracks)},
      {id:"curator",title:"Curador",description:"Crea una lista personalizada",icon:"bookmark",unlocked:customLists.length>=1,progress:Math.min(1,customLists.length)},
      {id:"architect",title:"Arquitecto del tiempo",description:"Guarda un maratón propio",icon:"calendar",unlocked:marathonCount>=1,progress:Math.min(1,marathonCount)},
      {id:"critic",title:"Crítico del multiverso",description:"Califica cinco títulos",icon:"star",unlocked:rated>=5,progress:Math.min(1,rated/5)},
      {id:"fifty",title:"Viajero veterano",description:"Completa 50 títulos",icon:"trophy",unlocked:watched.size>=50,progress:Math.min(1,watched.size/50)},
    ];
  }, [customLists.length, ratings, releasedItems, watched]);
  const labelLayout = useMemo(() => {
    const result = new Map<string, { below: boolean; offset: number; shift: number; leaderLength: number; leaderAngle: number }>();
    // Keep collision packing in lockstep with the final card widths in styles.css.
    const cardWidth = zoom >= .78 ? 205 : zoom < .38 ? 180 : 158;
    const slotCount = 4;
    const levelStep = zoom >= .78 ? 125 : 82;
    const screenGap = zoom >= .78 ? 16 : 11;
    TRACKS.forEach((track) => {
      const slots = Array.from({ length: slotCount }, () => Number.NEGATIVE_INFINITY);
      const trackItems = ITEMS.filter((item) => item.trackId === track.id && (zoom >= .38 || KEY_IDS.has(item.id)));
      trackItems.forEach((item) => {
        const desiredCenter = xOf(item.releaseValue) * zoom;
        let bestSlot = 0;
        let bestCenter = Number.POSITIVE_INFINITY;
        slots.forEach((lastRight, slot) => {
          const candidateCenter = Math.max(desiredCenter, lastRight + screenGap + cardWidth / 2);
          if (candidateCenter < bestCenter) { bestCenter = candidateCenter; bestSlot = slot; }
        });
        const shift = Math.max(0, bestCenter - desiredCenter);
        slots[bestSlot] = bestCenter + cardWidth / 2;
        const below = bestSlot % 2 === 1;
        const offset = 30 + Math.floor(bestSlot / 2) * levelStep;
        const verticalDelta = below ? offset - 15 : -(offset - 15);
        result.set(item.id, {
          below,
          offset,
          shift,
          leaderLength: Math.max(14, Math.hypot(shift, verticalDelta)),
          leaderAngle: Math.atan2(verticalDelta, shift || .001) * 180 / Math.PI,
        });
      });
    });
    return result;
  }, [zoom]);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(()=>{
    if(!preferences.achievements)return;
    let previous:string[]=[]; try{previous=JSON.parse(localStorage.getItem(UNLOCKED_ACHIEVEMENTS_KEY)||"[]");}catch{}
    const unlocked=achievements.filter((achievement)=>achievement.unlocked).map((achievement)=>achievement.id);
    const fresh=achievements.find((achievement)=>achievement.unlocked&&!previous.includes(achievement.id));
    localStorage.setItem(UNLOCKED_ACHIEVEMENTS_KEY,JSON.stringify(unlocked));
    if(fresh&&previous.length>0)notify(`Logro desbloqueado: ${fresh.title}`);
  },[achievements,notify,preferences.achievements]);

  useEffect(() => {
    try {
      const reminders = new Set<string>(JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]"));
      const upcoming = VERIFIED_RELEASES.find((event) => event.date && reminders.has(event.id) && daysUntil(event.date) >= 0 && daysUntil(event.date) <= 7);
      const item = upcoming ? ITEM_BY_ID.get(upcoming.id) : null;
      if (item && upcoming?.date) notify(`${item.title} se estrena en ${daysUntil(upcoming.date)} días`);
    } catch { /* recordatorios opcionales */ }
  }, [notify]);

  const centerItem = useCallback((item: MapItem, open = true) => {
    const viewport = viewportRef.current;
    const track = TRACKS.find((entry) => entry.id === item.trackId);
    if (!viewport || !track) return;
    viewport.scrollTo({ left: xOf(item.releaseValue) * zoom - viewport.clientWidth / 2, top: yOfTrack(item.trackId, zoom) - viewport.clientHeight / 2, behavior: "smooth" });
    if (open) setSelected(item);
  }, [zoom]);

  const fitMap = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.max(MIN_ZOOM, Math.min(0.42, (viewport.clientWidth - 36) / MAP_WIDTH));
    setZoom(next);
    requestAnimationFrame(() => viewport.scrollTo({ left: 0, top: Math.max(0, verticalMetrics(next).height - viewport.clientHeight) / 2, behavior: "smooth" }));
  }, []);

  const changeZoom = useCallback((nextValue: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextValue));
    const rect = viewport.getBoundingClientRect();
    const localX = clientX === undefined ? viewport.clientWidth / 2 : clientX - rect.left;
    const localY = clientY === undefined ? viewport.clientHeight / 2 : clientY - rect.top;
    const worldX = (viewport.scrollLeft + localX) / zoom;
    const verticalRatio = (viewport.scrollTop + localY) / verticalMetrics(zoom).height;
    setZoom(next);
    requestAnimationFrame(() => viewport.scrollTo({ left: worldX * next - localX, top: verticalRatio * verticalMetrics(next).height - localY }));
  }, [zoom]);

  const openGlobalHit = useCallback((hit: GlobalHit) => {
    setGlobalSearchOpen(false); setGlobalQuery(""); setGlobalIndex(0); setSelected(hit.item);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setGlobalSearchOpen(true); setGlobalIndex(0);
      } else if (globalSearchOpen && event.key === "ArrowDown") {
        event.preventDefault(); setGlobalIndex((index) => Math.min(globalHits.length - 1, index + 1));
      } else if (globalSearchOpen && event.key === "ArrowUp") {
        event.preventDefault(); setGlobalIndex((index) => Math.max(0, index - 1));
      } else if (globalSearchOpen && event.key === "Enter" && globalHits[globalIndex]) {
        event.preventDefault(); openGlobalHit(globalHits[globalIndex]);
      } else if (event.altKey && /^[1-7]$/.test(event.key)) {
        event.preventDefault(); setSelected(null); setView((["dashboard","map","routes","planner","calendar","list","profiles"] as AppView[])[Number(event.key) - 1]);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        if (view === "map") document.querySelector<HTMLInputElement>("#map-search")?.focus(); else setGlobalSearchOpen(true);
      } else if (!globalSearchOpen && (event.key === "+" || event.key === "=")) changeZoom(zoom + 0.1);
      else if (!globalSearchOpen && event.key === "-") changeZoom(zoom - 0.1);
      else if (event.key.toLowerCase() === "f" && document.activeElement?.tagName !== "INPUT") fitMap();
      else if (event.key === "Escape") { setSelected(null); setQuery(""); setGlobalSearchOpen(false); setSettingsOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeZoom, fitMap, globalHits, globalIndex, globalSearchOpen, openGlobalHit, view, zoom]);

  useEffect(() => {
    if (view !== "map") return;
    const timer = window.setTimeout(fitMap, 80);
    return () => window.clearTimeout(timer);
  }, [fitMap, view]);

  useEffect(() => {
    if (view !== "map" || !pendingMapItem) return;
    const timer = window.setTimeout(() => {
      setActiveTrack(pendingMapItem.trackId);
      centerItem(pendingMapItem);
      setPendingMapItem(null);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [centerItem, pendingMapItem, view]);

  function touchActivity(item: MapItem, action: ActivityEvent["action"] = "watched") {
    setActivity((current) => ({ ...current, [item.id]: Date.now() }));
    setHistory((current) => [...current, { id: item.id, at: Date.now(), action }].slice(-500));
  }

  function toggleWatched(item: MapItem) {
    const willWatch = !watched.has(item.id);
    touchActivity(item, willWatch ? "watched" : "unwatched");
    if (willWatch) setWatchedDates((current) => ({ ...current, [item.id]: current[item.id] || new Date().toISOString().slice(0, 10) }));
    setWatched((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
    const total = EPISODE_COUNTS[item.id] || 0;
    if (total) setEpisodes((current) => ({ ...current, [item.id]: watched.has(item.id) ? [] : Array.from({ length: total }, (_, index) => index + 1) }));
  }

  function toggleEpisode(item: MapItem, episode: number) {
    touchActivity(item, "episode");
    const total = EPISODE_COUNTS[item.id] || 0;
    setEpisodes((current) => {
      const existing = new Set(current[item.id] || []);
      if (existing.has(episode)) existing.delete(episode); else existing.add(episode);
      const values = [...existing].sort((a, b) => a - b);
      setWatched((seen) => {
        const next = new Set(seen);
        if (values.length === total) { next.add(item.id); setWatchedDates((dates) => ({ ...dates, [item.id]: dates[item.id] || new Date().toISOString().slice(0, 10) })); } else next.delete(item.id);
        return next;
      });
      return { ...current, [item.id]: values };
    });
  }

  function jumpToYear(year: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ left: xOf(year) * zoom - 70, behavior: "smooth" });
  }

  function nextPending() {
    const next = releasedItems.find((item) => !watched.has(item.id));
    if (next) openInMap(next);
    else notify("Has completado todos los títulos publicados.");
  }

  function toggleWatchlist(item: MapItem) {
    setWatchlist((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
    notify(watchlist.has(item.id) ? "Quitado de Mi lista" : "Guardado en Mi lista");
  }

  function ignoreItem(item: MapItem) {
    setIgnored((current) => new Set(current).add(item.id));
    setWatchlist((current) => { const next = new Set(current); next.delete(item.id); return next; });
    notify("Ya no aparecerá en tus recomendaciones");
  }

  function restoreItem(item: MapItem) {
    setIgnored((current) => { const next = new Set(current); next.delete(item.id); return next; });
    notify("Título restaurado");
  }

  function toggleFavorite(item: MapItem) {
    setFavorites((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; });
    notify(favorites.has(item.id) ? "Quitado de favoritos" : "Añadido a favoritos");
  }

  function rateItem(item: MapItem, rating: number) {
    setRatings((current) => ({ ...current, [item.id]: rating }));
    touchActivity(item, "rating");
  }

  function saveNote(item: MapItem, note: string) {
    setNotes((current) => ({ ...current, [item.id]: note }));
    touchActivity(item, "note");
  }

  function registerRewatch(item: MapItem) {
    setRewatches((current) => ({ ...current, [item.id]: (current[item.id] || 0) + 1 }));
    setWatchedDates((current) => ({ ...current, [item.id]: new Date().toISOString().slice(0, 10) }));
    setWatched((current) => new Set(current).add(item.id));
    touchActivity(item, "rewatch");
    notify("Repetición registrada");
  }

  function addToCustomList(item: MapItem, listId: string) {
    if (!listId) return;
    setCustomLists((current) => current.map((list) => list.id === listId && !list.items.includes(item.id) ? { ...list, items: [...list.items, item.id] } : list));
    notify("Añadido a la lista");
  }

  const switchProfile = useCallback((profileId: string, resetGuest = false) => {
    const currentPrefix = `nexus-profile-${activeProfileId}-`;
    for (const key of PROFILE_DATA_KEYS) {
      const currentValue = localStorage.getItem(key);
      if (currentValue != null) localStorage.setItem(`${currentPrefix}${key}`, currentValue);
    }
    const prefix = `nexus-profile-${profileId}-`;
    for (const key of PROFILE_DATA_KEYS) {
      const stored = resetGuest ? null : localStorage.getItem(`${prefix}${key}`);
      if (stored == null) localStorage.removeItem(key); else localStorage.setItem(key, stored);
    }
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    window.location.reload();
  }, [activeProfileId]);

  const addLocalCloudProfile = useCallback((profile: Profile) => {
    setProfiles((current) => current.some((entry) => entry.id === profile.id) ? current : [...current, profile]);
  }, []);

  const removeLocalCloudProfile = useCallback((profileId: string) => {
    setProfiles((current) => current.filter((entry) => entry.id !== profileId));
  }, []);

  function toggleFavoriteTrack(trackId: string) {
    setFavoriteTracks((current) => {
      const next = new Set(current);
      if (next.has(trackId)) next.delete(trackId); else next.add(trackId);
      return next;
    });
  }

  function openInMap(item: MapItem, preserveRoute = false) {
    if (!preserveRoute) { setRouteFocus(new Set()); setRouteTarget(null); }
    setPendingMapItem(item);
    setView("map");
  }

  function showRouteInMap(item: MapItem, includeContext = true) {
    setRouteFocus(new Set(dependencyRoute(item.id, includeContext).map((entry) => entry.id)));
    setRouteTarget(item);
    openInMap(item, true);
  }

  function isSpoilerLocked(item: MapItem) {
    if (!spoilerSafe || watched.has(item.id) || item.upcoming || routeFocus.has(item.id)) return false;
    const trackItems = releasedItems.filter((entry) => entry.trackId === item.trackId);
    const firstPending = trackItems.findIndex((entry) => !watched.has(entry.id));
    return firstPending >= 0 && trackItems.findIndex((entry) => entry.id === item.id) > firstPending;
  }

  async function exportProgress() {
    let customMarathons:SharedMarathon[]=[]; try{customMarathons=JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY)||"[]");}catch{}
    const payload = { watched: [...watched], episodes, watchlist: [...watchlist], ignored: [...ignored], favoriteTracks: [...favoriteTracks], ratings, favorites: [...favorites], notes, watchedDates, rewatches, history, customLists, customMarathons, preferences, profile: activeProfile };
    if (!window.nexusDesktop) {
      const blob = new Blob([JSON.stringify({ ...payload, exportedAt:new Date().toISOString() }, null, 2)], { type:"application/json" });
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href=url; link.download=`nexus-progreso-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url);
      notify("Perfil exportado correctamente.");
      return;
    }
    const result = await window.nexusDesktop.exportProgress(payload);
    if (result.ok) notify("Perfil exportado correctamente."); else if (result.error) notify(result.error);
  }

  async function importProgress() {
    if (!window.nexusDesktop) {
      const input=document.createElement("input"); input.type="file"; input.accept="application/json,.json"; input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{const payload=JSON.parse(await file.text());if(!Array.isArray(payload.watched)||typeof payload.episodes!=="object")throw new Error();setWatched(new Set(payload.watched));setEpisodes(payload.episodes);if(payload.watchlist)setWatchlist(new Set(payload.watchlist));if(payload.ignored)setIgnored(new Set(payload.ignored));if(payload.favoriteTracks)setFavoriteTracks(new Set(payload.favoriteTracks));if(payload.ratings)setRatings(payload.ratings);if(payload.favorites)setFavorites(new Set(payload.favorites));if(payload.notes)setNotes(payload.notes);if(payload.watchedDates)setWatchedDates(payload.watchedDates);if(payload.rewatches)setRewatches(payload.rewatches);if(payload.history)setHistory(payload.history);if(payload.customLists)setCustomLists(payload.customLists);if(payload.customMarathons)localStorage.setItem(CUSTOM_MARATHONS_KEY,JSON.stringify(payload.customMarathons));if(payload.preferences)setPreferences({...DEFAULT_PREFERENCES,...payload.preferences});notify("Perfil importado correctamente.");}catch{notify("El archivo no contiene un progreso válido.");}};input.click();return;
    }
    const result = await window.nexusDesktop.importProgress();
    if (result.ok && result.payload) {
      setWatched(new Set(result.payload.watched));
      setEpisodes(result.payload.episodes);
      if (result.payload.watchlist) setWatchlist(new Set(result.payload.watchlist));
      if (result.payload.ignored) setIgnored(new Set(result.payload.ignored));
      if (result.payload.favoriteTracks) setFavoriteTracks(new Set(result.payload.favoriteTracks));
      if (result.payload.ratings) setRatings(result.payload.ratings);
      if (result.payload.favorites) setFavorites(new Set(result.payload.favorites));
      if (result.payload.notes) setNotes(result.payload.notes);
      if (result.payload.watchedDates) setWatchedDates(result.payload.watchedDates);
      if (result.payload.rewatches) setRewatches(result.payload.rewatches);
      if (result.payload.history) setHistory(result.payload.history);
      if (result.payload.customLists) setCustomLists(result.payload.customLists);
      if (result.payload.customMarathons) localStorage.setItem(CUSTOM_MARATHONS_KEY,JSON.stringify(result.payload.customMarathons));
      if (result.payload.preferences) setPreferences({ ...DEFAULT_PREFERENCES,...result.payload.preferences,fontScale:Math.max(100,Math.min(135,Number(result.payload.preferences.fontScale)||100)) });
      notify("Perfil importado correctamente.");
    } else if (result.error) notify(result.error);
  }

  const updateMapScroll = () => {
    const viewport = viewportRef.current;
    if (viewport) setMapScroll({ left: viewport.scrollLeft, top: viewport.scrollTop, width: viewport.clientWidth, height: viewport.clientHeight });
  };

  return (
    <main className="desktop-shell">
      <div className="native-titlebar"><div className="titlebar-brand"><span>N</span><strong>NEXUS</strong><small>MAPA DEL MULTIVERSO</small></div></div>
      <aside className="map-sidebar">
        <nav className="app-nav" aria-label="Navegación principal">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => { setSelected(null); setView("dashboard"); }}><Icon name="home"/><span><strong>Inicio</strong><small>Qué ver ahora</small></span></button>
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Icon name="route"/><span><strong>Mapa</strong><small>Explorar universos</small></span></button>
          <button className={view === "routes" ? "active" : ""} onClick={() => { setSelected(null); setView("routes"); }}><Icon name="shuffle"/><span><strong>Órdenes y rutas</strong><small>Cómo verlo</small></span></button>
          <button className={view === "planner" ? "active" : ""} onClick={() => { setSelected(null); setView("planner"); }}><Icon name="calendar"/><span><strong>Maratón</strong><small>Planificar sesiones</small></span></button>
          <button className={view === "calendar" ? "active" : ""} onClick={() => { setSelected(null); setView("calendar"); }}><Icon name="bell"/><span><strong>Estrenos</strong><small>Calendario Marvel</small></span></button>
          <button className={view === "list" ? "active" : ""} onClick={() => { setSelected(null); setView("list"); }}><Icon name="bookmark"/><span><strong>Biblioteca</strong><small>{watchlist.size + favorites.size} personales</small></span></button>
          <button className={view === "profiles" ? "active" : ""} onClick={() => { setSelected(null); setView("profiles"); }}><Icon name="user"/><span><strong>{activeProfile?.name || "Perfil"}</strong><small>Perfil y estadísticas</small></span></button>
        </nav>
        <section className="journey-card">
          <div className="journey-head"><span>Tu recorrido</span><strong>{percent}%</strong></div>
          <div className="progress-bar"><i style={{ width: `${percent}%` }} /></div>
          <small>{completedCount} de {releasedItems.length} títulos publicados</small>
          <button className="next-button" onClick={nextPending}><Icon name="target" />Siguiente pendiente</button>
        </section>

        {view === "map" ? <><div className="sidebar-heading"><span>Líneas del mapa</span><small>Enfoca un universo</small></div>
        <nav className="track-list">
          <button className={activeTrack === "all" ? "active" : ""} onClick={() => setActiveTrack("all")}><span className="all-lines"><i/><i/><i/></span><strong>Todo el multiverso</strong><small>{ITEMS.length}</small></button>
          {TRACKS.map((track) => {
            const items = ITEMS.filter((item) => item.trackId === track.id);
            const done = items.filter((item) => watched.has(item.id)).length;
            return <button key={track.id} className={activeTrack === track.id ? "active" : ""} onClick={() => { setActiveTrack(track.id); const first = items[0]; if (first) centerItem(first, false); }}><span className="track-swatch" style={{ "--track": track.color } as React.CSSProperties}/><strong>{track.short}</strong><small>{done}/{items.length}</small></button>;
          })}
        </nav></> : <div className="sidebar-overview">
          <span>Tu configuración</span>
          <div><strong>{favoriteTracks.size || TRACKS.length}</strong><small>líneas activas</small></div>
          <div><strong>{watchlist.size}</strong><small>en Mi lista</small></div>
          <div><strong>{ignored.size}</strong><small>descartados</small></div>
          <button className={spoilerSafe ? "enabled" : ""} onClick={() => setSpoilerSafe((value) => !value)}><Icon name="eye"/><span><strong>Protección de spoilers</strong><small>{spoilerSafe ? "Activada" : "Desactivada"}</small></span></button>
        </div>}

        <div className="sidebar-tools">
          <button className="cloud-sidebar-button" onClick={() => setCloudOpen(true)}><Icon name="user"/>Cuenta y sincronización</button>
          <button onClick={() => setGlobalSearchOpen(true)}><Icon name="search"/>Búsqueda global <kbd>Ctrl K</kbd></button>
          <button onClick={() => setSettingsOpen(true)}><Icon name="settings"/>Apariencia y acceso</button>
          <button onClick={exportProgress}><Icon name="download"/>Exportar perfil</button>
          <button onClick={importProgress}><Icon name="upload"/>Importar perfil</button>
          <a className="tmdb-credit" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">Arte de títulos proporcionado por TMDB</a>
        </div>
        <div className="keyboard-hint"><kbd>Ctrl</kbd><kbd>K</kbd><span>buscar todo</span><kbd>Alt</kbd><kbd>1–7</kbd><span>secciones</span></div>
      </aside>

      {view === "map" ? <section className="map-workspace">
        <header className="map-toolbar">
          <div className="search-wrap">
            <Icon name="search"/>
            <input id="map-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una película o serie…" />
            {query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")}><Icon name="close" size={15}/></button>}
            {searchResults.length > 0 && <div className="search-results">{searchResults.map((item) => <button key={item.id} onClick={() => { setQuery(""); setActiveTrack("all"); centerItem(item); }}><img src={posterFor(item, "thumb")} alt=""/><span><strong>{item.title}</strong><small>{item.date} · {TRACKS.find((track) => track.id === item.trackId)?.short}</small></span><Icon name="chevron" size={15}/></button>)}</div>}
          </div>
          {routeTarget ? <div className="route-focus-banner"><Icon name="route"/><span><small>Ruta revelada</small><strong>{routeTarget.title} · {routeFocus.size} títulos</strong></span><button onClick={() => { setRouteFocus(new Set()); setRouteTarget(null); }}><Icon name="close" size={14}/></button></div> : <div className="era-nav">{ERAS.map((era) => <button key={era.label} onClick={() => jumpToYear(era.year)}>{era.label}</button>)}</div>}
          <div className="zoom-tools">
            <button title="Alejar" onClick={() => changeZoom(zoom - .1)}><Icon name="minus"/></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button title="Acercar" onClick={() => changeZoom(zoom + .1)}><Icon name="plus"/></button>
            <button title="Encajar todo (F)" onClick={fitMap}><Icon name="fit"/></button>
          </div>
        </header>

        <div
          ref={viewportRef}
          className={`map-viewport ${dragging ? "is-dragging" : ""} ${zoom < .38 ? "zoom-overview" : zoom < .78 ? "zoom-medium" : "zoom-close"}`}
          onScroll={updateMapScroll}
          onWheel={(event) => { if (event.ctrlKey) { event.preventDefault(); changeZoom(zoom - event.deltaY * .0012, event.clientX, event.clientY); } }}
          onPointerDown={(event) => { if ((event.target as HTMLElement).closest("button")) return; const viewport = viewportRef.current; if (!viewport) return; setDragging(true); dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }; viewport.setPointerCapture(event.pointerId); }}
          onPointerMove={(event) => { if (!dragging) return; const viewport = viewportRef.current; if (viewport) viewport.scrollTo({ left: dragRef.current.left - (event.clientX - dragRef.current.x), top: dragRef.current.top - (event.clientY - dragRef.current.y) }); }}
          onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
        >
          <div className="map-scale" style={{ width: MAP_WIDTH * zoom, height: mapHeight }}>
            <div className="map-world" style={{ width: MAP_WIDTH * zoom, height: mapHeight }}>
              <div className="map-years">{Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, index) => YEAR_START + index).map((year) => {
                const compressed = (YEAR_WIDTHS.get(year) || 100) <= 70;
                return <div key={year} className={`${year % 5 === 0 || year === YEAR_START ? "major-year" : ""} ${compressed ? "compressed-year" : ""}`} style={{ left: xOf(year) * zoom }}><span>{year}</span>{compressed && <em>//</em>}</div>;
              })}</div>
              <MapLines activeTrack={activeTrack} zoom={zoom} mapHeight={mapHeight} hideConnections={spoilerSafe || routeFocus.size > 0} />
              {routeTarget && <NarrativeOverlay targetId={routeTarget.id} zoom={zoom} mapHeight={mapHeight}/>} 
              {ITEMS.map((item) => {
                const track = TRACKS.find((entry) => entry.id === item.trackId)!;
                const layout = labelLayout.get(item.id) || { below: false, offset: 30, shift: 0, leaderLength: 15, leaderAngle: -90 };
                const completed = watched.has(item.id);
                const isKey = KEY_IDS.has(item.id);
                const muted = routeFocus.size > 0 ? !routeFocus.has(item.id) : activeTrack !== "all" && activeTrack !== item.trackId && !(isKey && item.trackId === "mcu");
                const episodeTotal = EPISODE_COUNTS[item.id] || 0;
                const episodeDone = episodes[item.id]?.length || 0;
                const spoilerLocked = isSpoilerLocked(item);
                return <button key={item.id} data-track={item.trackId} data-year={Math.floor(item.releaseValue)} className={`station ${layout.below ? "station-below" : ""} ${completed ? "is-complete" : ""} ${selected?.id === item.id ? "is-selected" : ""} ${isKey ? "is-key" : ""} ${muted ? "is-muted" : ""} ${spoilerLocked ? "is-spoiler" : ""} ${routeFocus.has(item.id) ? "is-route" : ""}`} style={{ left: xOf(item.releaseValue) * zoom, top: yOfTrack(item.trackId, zoom), "--station": track.color, "--card-offset": `${layout.offset}px`, "--label-shift": `${layout.shift}px` } as React.CSSProperties} onClick={() => spoilerLocked ? notify("Completa el título anterior para revelar este punto") : setSelected(item)} title={spoilerLocked ? "Contenido protegido" : `${item.title} · ${item.date}`}>
                  <span className="station-leader" style={{ width: `${layout.leaderLength}px`, transform: `rotate(${layout.leaderAngle}deg)` }}/>
                  <span className="station-dot">{completed && <Icon name="check" size={11}/>}</span>
                  <span className="station-card">
                    <img className="station-poster" src={posterFor(item, "thumb")} alt="" loading="lazy"/>
                    <span className="station-copy"><strong>{spoilerLocked ? "Contenido oculto" : item.title}</strong><small>{spoilerLocked ? "Protegido contra spoilers" : item.date}</small>{!spoilerLocked && episodeTotal > 0 && <i><b style={{ width: `${(episodeDone / episodeTotal) * 100}%` }}/></i>}</span>
                  </span>
                </button>;
              })}
              <div className="map-help"><Icon name="route"/><span>Arrastra para recorrer · Ctrl + rueda para zoom</span></div>
            </div>
          </div>
        </div>

        <MiniMap zoom={zoom} mapScroll={mapScroll} activeTrack={activeTrack} onNavigate={(ratio) => { const viewport = viewportRef.current; if (viewport) viewport.scrollTo({ left: ratio * MAP_WIDTH * zoom - viewport.clientWidth / 2, behavior: "smooth" }); }} />
      </section> : view === "dashboard" ? <Dashboard
        watched={watched}
        episodes={episodes}
        favoriteTracks={favoriteTracks}
        intent={intent}
        watchlist={watchlist}
        ignored={ignored}
        spoilerSafe={spoilerSafe}
        continueItem={continueItem}
        recommendations={recommendations}
        dailyRecommendation={dailyRecommendation}
        stats={stats}
        onToggleTrack={toggleFavoriteTrack}
        onIntent={(nextIntent) => { setIntent(nextIntent); if (nextIntent === "random") setRandomSeed((value) => value + 1); }}
        onRefreshRandom={() => { setIntent("random"); setRandomSeed((value) => value + 1); }}
        onToggleEpisode={toggleEpisode}
        onToggleWatched={toggleWatched}
        onToggleWatchlist={toggleWatchlist}
        onIgnore={ignoreItem}
        onOpenDetail={setSelected}
        onOpenMap={openInMap}
        onToggleSpoilers={() => setSpoilerSafe((value) => !value)}
      /> : view === "routes" ? <RoutesView watched={watched} onOpenDetail={setSelected} onOpenMap={openInMap} onShowRoute={showRouteInMap} /> : view === "planner" ? <MarathonPlanner watched={watched} episodes={episodes} author={activeProfile?.name||"Nexus"} onToggleWatched={toggleWatched} onToggleEpisode={toggleEpisode} onOpenDetail={setSelected} notify={notify}/> : view === "calendar" ? <MarvelCalendar onOpenDetail={setSelected} notify={notify}/> : view === "profiles" ? <ProfilesView profiles={profiles} activeProfileId={activeProfileId} watched={watched} ratings={ratings} favorites={favorites} history={history} rewatches={rewatches} achievements={preferences.achievements ? achievements : []} onProfiles={setProfiles} onSwitch={switchProfile} notify={notify}/> : <ListView
        watchlist={watchlist}
        ignored={ignored}
        favorites={favorites}
        ratings={ratings}
        customLists={customLists}
        watched={watched}
        episodes={episodes}
        onToggleWatchlist={toggleWatchlist}
        onToggleFavorite={toggleFavorite}
        onLists={setCustomLists}
        onRestore={restoreItem}
        onOpenDetail={setSelected}
        onOpenMap={openInMap}
      />}

      {selected && <DetailPanel item={selected} watched={watched.has(selected.id)} episodes={episodes[selected.id] || []} saved={watchlist.has(selected.id)} ignored={ignored.has(selected.id)} favorite={favorites.has(selected.id)} rating={ratings[selected.id] || 0} note={notes[selected.id] || ""} watchedDate={watchedDates[selected.id] || ""} rewatchCount={rewatches[selected.id] || 0} customLists={customLists} onClose={() => setSelected(null)} onToggleWatched={() => toggleWatched(selected)} onToggleEpisode={(episode) => toggleEpisode(selected, episode)} onToggleWatchlist={() => toggleWatchlist(selected)} onToggleFavorite={() => toggleFavorite(selected)} onRate={(value) => rateItem(selected, value)} onSaveNote={(value) => saveNote(selected, value)} onWatchedDate={(value) => setWatchedDates((current) => ({ ...current, [selected.id]: value }))} onRewatch={() => registerRewatch(selected)} onAddToList={(listId) => addToCustomList(selected, listId)} onIgnore={() => ignored.has(selected.id) ? restoreItem(selected) : ignoreItem(selected)} onNavigate={(id) => { const target = ITEM_BY_ID.get(id); if (target) setSelected(target); }} onShowRoute={(includeContext) => showRouteInMap(selected, includeContext)} />}
      {globalSearchOpen && <GlobalSearch query={globalQuery} setQuery={(value) => { setGlobalQuery(value); setGlobalIndex(0); }} hits={globalHits} activeIndex={globalIndex} onActive={setGlobalIndex} onOpen={openGlobalHit} onClose={() => { setGlobalSearchOpen(false); setGlobalQuery(""); }}/>} 
      {settingsOpen && <PreferencesPanel value={preferences} onChange={setPreferences} onClose={() => setSettingsOpen(false)}/>} 
      <CloudWorkspace open={cloudOpen} onClose={() => setCloudOpen(false)} localProfiles={profiles} activeProfileId={activeProfileId} onAddLocalProfile={addLocalCloudProfile} onRemoveLocalProfile={removeLocalCloudProfile} onSwitchLocalProfile={switchProfile} notify={notify}/>
      {toast && <div className="toast"><Icon name="check"/>{toast}</div>}
    </main>
  );
}

function GlobalSearch({ query, setQuery, hits, activeIndex, onActive, onOpen, onClose }: { query:string; setQuery:(value:string)=>void; hits:GlobalHit[]; activeIndex:number; onActive:(index:number)=>void; onOpen:(hit:GlobalHit)=>void; onClose:()=>void }) {
  return <div className="command-layer" role="dialog" aria-modal="true" aria-label="Búsqueda global" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="command-palette"><header><Icon name="search"/><input autoFocus value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Película, capítulo, personaje, universo o conexión…" aria-label="Buscar en todo Nexus"/><kbd>Esc</kbd></header>{query.trim().length < 2 ? <div className="command-empty"><Icon name="spark" size={30}/><strong>Busca cualquier parte del multiverso</strong><p>Prueba “Wanda”, “capítulo 3”, “X-Men”, “variante” o “Tony Stark”.</p></div> : hits.length ? <div className="command-results" role="listbox">{hits.map((hit,index)=><button key={hit.key} className={index===activeIndex ? "active" : ""} onMouseEnter={()=>onActive(index)} onClick={()=>onOpen(hit)} role="option" aria-selected={index===activeIndex}><img src={posterFor(hit.item,"thumb")} alt=""/><span><small>{hit.category}</small><strong>{hit.episode ? `${hit.item.title} · Capítulo ${hit.episode}` : hit.item.title}</strong><p>{hit.context}</p></span><Icon name="chevron"/></button>)}</div> : <div className="command-empty"><Icon name="search" size={30}/><strong>Sin coincidencias</strong><p>Prueba otro título, personaje o universo.</p></div>}<footer><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span>{hits.length} resultados</span></footer></section></div>;
}

function PreferencesPanel({ value, onChange, onClose }: { value:Preferences; onChange:React.Dispatch<React.SetStateAction<Preferences>>; onClose:()=>void }) {
  const set = <K extends keyof Preferences>(key:K, next:Preferences[K]) => onChange((current)=>({ ...current,[key]:next }));
  return <div className="preferences-layer" onMouseDown={(event)=>{ if(event.target===event.currentTarget) onClose(); }}><aside className="preferences-panel" role="dialog" aria-modal="true" aria-label="Apariencia y accesibilidad"><header><div><span className="dash-eyebrow">Personalización</span><h2>Apariencia y acceso</h2></div><button onClick={onClose} aria-label="Cerrar"><Icon name="close"/></button></header><div className="preference-scroll"><section><h3>Color principal</h3><div className="accent-options">{(["red","violet","cyan"] as const).map((accent)=><button key={accent} className={`${accent} ${value.accent===accent ? "active":""}`} onClick={()=>set("accent",accent)}><i/>{accent==="red"?"Nexus":accent==="violet"?"Multiverso":"Cósmico"}</button>)}</div><label><span>Intensidad del color <b>{value.intensity}%</b></span><input type="range" min="35" max="100" value={value.intensity} onChange={(event)=>set("intensity",Number(event.target.value))}/></label></section><section><h3>Densidad y tarjetas</h3><div className="segmented">{(["comfortable","compact"] as const).map((density)=><button key={density} className={value.density===density?"active":""} onClick={()=>set("density",density)}>{density==="comfortable"?"Cómoda":"Compacta"}</button>)}</div><div className="segmented three">{(["small","medium","large"] as const).map((size)=><button key={size} className={value.cardSize===size?"active":""} onClick={()=>set("cardSize",size)}>{size==="small"?"Pequeña":size==="medium"?"Mediana":"Grande"}</button>)}</div></section><section><h3>Lectura y accesibilidad</h3><label><span>Tamaño de texto <b>{value.fontScale}%</b></span><input type="range" min="100" max="135" step="5" value={Math.max(100,value.fontScale)} onChange={(event)=>set("fontScale",Number(event.target.value))}/></label><div className="text-size-presets" aria-label="Tamaños de texto recomendados"><button className={value.fontScale===100?"active":""} onClick={()=>set("fontScale",100)}>Normal</button><button className={value.fontScale===115?"active":""} onClick={()=>set("fontScale",115)}>Grande</button><button className={value.fontScale===130?"active":""} onClick={()=>set("fontScale",130)}>Muy grande</button></div><button className={`switch-row ${value.highContrast?"active":""}`} onClick={()=>set("highContrast",!value.highContrast)}><span><strong>Alto contraste</strong><small>Refuerza bordes, texto y controles</small></span><i/></button><button className={`switch-row ${value.reduceMotion?"active":""}`} onClick={()=>set("reduceMotion",!value.reduceMotion)}><span><strong>Reducir animaciones</strong><small>Evita desplazamientos y efectos decorativos</small></span><i/></button><button className={`switch-row ${value.achievements?"active":""}`} onClick={()=>set("achievements",!value.achievements)}><span><strong>Logros opcionales</strong><small>Muestra progreso y celebraciones</small></span><i/></button></section><section className="shortcut-list"><h3>Atajos</h3><p><kbd>Ctrl K</kbd><span>Búsqueda global</span></p><p><kbd>Alt 1–7</kbd><span>Cambiar de sección</span></p><p><kbd>Esc</kbd><span>Cerrar paneles</span></p><p><kbd>Tab</kbd><span>Recorrer controles</span></p></section></div><footer><button onClick={()=>onChange(DEFAULT_PREFERENCES)}>Restablecer</button><button onClick={onClose}>Guardar y cerrar</button></footer></aside></div>;
}

type DashboardProps = {
  watched: Set<string>;
  episodes: EpisodeState;
  favoriteTracks: Set<string>;
  intent: Intent;
  watchlist: Set<string>;
  ignored: Set<string>;
  spoilerSafe: boolean;
  continueItem: MapItem | null;
  recommendations: Recommendation[];
  dailyRecommendation: MapItem | null;
  stats: { episodeDone: number; seriesCompleted: number; moviesCompleted: number; completedLines: number; remainingMinutes: number; bestTrack: { track: (typeof TRACKS)[number]; ratio: number } | undefined; lastItem: MapItem | null | undefined };
  onToggleTrack: (trackId: string) => void;
  onIntent: (intent: Intent) => void;
  onRefreshRandom: () => void;
  onToggleEpisode: (item: MapItem, episode: number) => void;
  onToggleWatched: (item: MapItem) => void;
  onToggleWatchlist: (item: MapItem) => void;
  onIgnore: (item: MapItem) => void;
  onOpenDetail: (item: MapItem) => void;
  onOpenMap: (item: MapItem) => void;
  onToggleSpoilers: () => void;
};

function Dashboard(props: DashboardProps) {
  const { continueItem, episodes, watched } = props;
  const continueTotal = continueItem ? EPISODE_COUNTS[continueItem.id] || 0 : 0;
  const continueDone = continueItem ? episodes[continueItem.id]?.length || 0 : 0;
  const nextEpisode = continueTotal ? Array.from({ length: continueTotal }, (_, index) => index + 1).find((episode) => !(episodes[continueItem!.id] || []).includes(episode)) : undefined;
  const bestTrackLabel = props.stats.bestTrack?.ratio ? props.stats.bestTrack.track.short : "Aún sin avance";

  return <section className="dashboard-workspace">
    <header className="dashboard-toolbar">
      <div><span className="dash-eyebrow">Tu centro de control</span><h1>¿Qué quieres ver hoy?</h1></div>
      <button className={`spoiler-toggle ${props.spoilerSafe ? "enabled" : ""}`} onClick={props.onToggleSpoilers}><Icon name="eye"/><span><strong>Spoilers</strong><small>{props.spoilerSafe ? "Protegidos" : "Visibles"}</small></span></button>
    </header>
    <div className="dashboard-scroll">
      <div className="dashboard-grid-top">
        <section className="continue-card">
          {continueItem ? <>
            <img className="continue-art" src={artworkFor(continueItem)} alt=""/>
            <img className="continue-poster" src={posterFor(continueItem, "full")} alt={`Póster de ${continueItem.title}`}/>
            <div className="continue-shade"/>
            <div className="continue-copy">
              <span className="dash-eyebrow">{continueDone > 0 ? "Continuar viendo" : "Siguiente pendiente"}</span>
              <div className="continue-line"><i style={{ background: trackForId(continueItem.trackId)?.color }}/>{trackForId(continueItem.trackId)?.short}</div>
              <TitleHeading item={continueItem} placement="hero"/>
              <p>{continueTotal ? `${continueDone}/${continueTotal} capítulos vistos${nextEpisode ? ` · sigue el capítulo ${nextEpisode}` : ""}` : `${continueItem.date} · ${TYPE_LABEL[continueItem.type]}`}</p>
              {continueTotal > 0 && <div className="continue-progress"><i style={{ width: `${continueDone / continueTotal * 100}%` }}/></div>}
              <div className="continue-actions">
                <button className="primary" onClick={() => props.onOpenDetail(continueItem)}><Icon name="film"/>{continueTotal ? "Continuar" : "Ver detalles"}</button>
                {nextEpisode ? <button onClick={() => props.onToggleEpisode(continueItem, nextEpisode)}><Icon name="check"/>Marcar EP {nextEpisode}</button> : !continueItem.upcoming && <button onClick={() => props.onToggleWatched(continueItem)}><Icon name="check"/>{watched.has(continueItem.id) ? "Desmarcar" : "Marcar vista"}</button>}
                <button className="icon-action" title="Ver en el mapa" onClick={() => props.onOpenMap(continueItem)}><Icon name="route"/></button>
              </div>
            </div>
          </> : <div className="empty-continue"><Icon name="check" size={32}/><h2>Recorrido completado</h2><p>No tienes títulos pendientes en las líneas escogidas.</p></div>}
        </section>

        <section className="daily-card">
          <div className="daily-heading"><span><Icon name="spark"/>Recomendación del día</span><small>Una decisión, sin ruido</small></div>
          {props.dailyRecommendation ? <>
            <div className="daily-media"><img src={posterFor(props.dailyRecommendation)} alt=""/><span><strong>{props.dailyRecommendation.title}</strong><small>{props.dailyRecommendation.date} · {trackForId(props.dailyRecommendation.trackId)?.short}</small></span></div>
            <p>Elegida entre tus líneas activas y tus títulos pendientes.</p>
            <div className="daily-actions"><button onClick={() => props.onOpenDetail(props.dailyRecommendation!)}>Ver recomendación</button><button title="Guardar" className={props.watchlist.has(props.dailyRecommendation.id) ? "saved" : ""} onClick={() => props.onToggleWatchlist(props.dailyRecommendation!)}><Icon name="bookmark"/></button></div>
          </> : <div className="daily-empty"><Icon name="check"/><p>Ya terminaste todo lo publicado.</p></div>}
        </section>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-head"><div><span className="dash-eyebrow">Personaliza la ruta</span><h2>¿Qué líneas quieres recorrer?</h2></div><small>{props.favoriteTracks.size ? `${props.favoriteTracks.size} seleccionadas` : "Ninguna seleccionada: se usan todas"}</small></div>
        <div className="line-picker">{TRACKS.map((track) => <button key={track.id} className={props.favoriteTracks.has(track.id) ? "selected" : ""} onClick={() => props.onToggleTrack(track.id)} aria-pressed={props.favoriteTracks.has(track.id)} style={{ "--line-color": track.color } as React.CSSProperties}><i/><span>{track.short}</span><b>{ITEMS.filter((item) => item.trackId === track.id).length}</b></button>)}</div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-head"><div><span className="dash-eyebrow">Modo de recomendación</span><h2>¿Qué te apetece?</h2></div>{props.intent === "random" && <button className="refresh-random" onClick={props.onRefreshRandom}><Icon name="shuffle"/>Volver a elegir</button>}</div>
        <div className="intent-picker">{INTENTS.map((entry) => <button key={entry.id} className={props.intent === entry.id ? "selected" : ""} onClick={() => props.onIntent(entry.id)}><Icon name={entry.id === "random" ? "shuffle" : entry.id === "short" ? "clock" : entry.id === "new-line" ? "route" : entry.id === "series" ? "bar" : "film"}/><span><strong>{entry.label}</strong><small>{entry.hint}</small></span></button>)}</div>
      </section>

      <section className="dashboard-section recommendations-section">
        <div className="dashboard-section-head"><div><span className="dash-eyebrow">Selección explicada</span><h2>Recomendado para ti</h2></div><small>Ordenado según tu intención</small></div>
        {props.recommendations.length ? <div className="recommendation-grid">{props.recommendations.map((entry, index) => <RecommendationCard key={entry.item.id} recommendation={entry} index={index} episodes={episodes} saved={props.watchlist.has(entry.item.id)} onOpen={() => props.onOpenDetail(entry.item)} onMap={() => props.onOpenMap(entry.item)} onSave={() => props.onToggleWatchlist(entry.item)} onIgnore={() => props.onIgnore(entry.item)}/>)}</div> : <div className="empty-recommendations"><Icon name="check"/><h3>No quedan títulos con estos filtros</h3><p>Prueba otra intención o activa más líneas.</p></div>}
      </section>

      <section className="dashboard-section progress-summary">
        <div className="dashboard-section-head"><div><span className="dash-eyebrow">Resumen de progreso</span><h2>Tu multiverso en números</h2></div><small>Duraciones reales cuando están disponibles</small></div>
        <div className="stat-grid">
          <div><Icon name="film"/><span><strong>{props.stats.moviesCompleted}</strong><small>películas y especiales</small></span></div>
          <div><Icon name="bar"/><span><strong>{props.stats.seriesCompleted}</strong><small>series terminadas</small></span></div>
          <div><Icon name="check"/><span><strong>{props.stats.episodeDone}</strong><small>capítulos vistos</small></span></div>
          <div><Icon name="route"/><span><strong>{props.stats.completedLines}/{TRACKS.length}</strong><small>líneas completadas</small></span></div>
          <div><Icon name="clock"/><span><strong>{formatMinutes(props.stats.remainingMinutes)}</strong><small>tiempo restante</small></span></div>
          <div><Icon name="target"/><span><strong>{bestTrackLabel}</strong><small>universo más avanzado</small></span></div>
          <div className="last-activity"><Icon name="spark"/><span><strong>{props.stats.lastItem?.title || "Aún sin actividad"}</strong><small>última actividad</small></span></div>
        </div>
      </section>
    </div>
  </section>;
}

function RecommendationCard({ recommendation, index, episodes, saved, onOpen, onMap, onSave, onIgnore }: { recommendation: Recommendation; index: number; episodes: EpisodeState; saved: boolean; onOpen: () => void; onMap: () => void; onSave: () => void; onIgnore: () => void }) {
  const item = recommendation.item;
  const total = EPISODE_COUNTS[item.id] || 0;
  const done = episodes[item.id]?.length || 0;
  const track = trackForId(item.trackId);
  return <article className={`recommendation-card media-${item.type}`} data-item-id={item.id} data-kind={total ? "series" : "movie"} style={mediaStyle(item)}>
    <button className="recommendation-poster" onClick={onOpen}><img src={artworkFor(item, "card")} alt={`Imagen panorámica de ${item.title}`} loading="lazy"/><span className="recommendation-index">{String(index + 1).padStart(2, "0")}</span><span className="recommendation-type"><Icon name={total ? "film" : "clock"} size={11}/>{TYPE_LABEL[item.type]}</span><i className="recommendation-shade"/>{total > 0 && <i className="recommendation-progress"><b style={{ width: `${done / total * 100}%` }}/></i>}</button>
    <div className="recommendation-body"><small><i style={{ background: track?.color }}/>{track?.short}<span>•</span>{item.date}</small><h3>{item.title}</h3><p><Icon name="spark" size={13}/>{recommendation.reason}</p></div>
    <div className="recommendation-actions"><button onClick={onOpen}>Abrir</button><button title="Ver en el mapa" onClick={onMap}><Icon name="route"/></button><button title="Guardar en Mi lista" className={saved ? "saved" : ""} onClick={onSave}><Icon name="bookmark"/></button><button title="No me interesa" onClick={onIgnore}><Icon name="close"/></button></div>
  </article>;
}

type RouteMode = "release" | "chronological" | "recommended" | "core" | "quick" | "custom";
const ROUTE_MODES: Array<{ id: RouteMode; label: string; hint: string }> = [
  { id: "release", label: "Orden de estreno", hint: "Como lo descubrió el público" },
  { id: "chronological", label: "Cronología interna", hint: "Según cuándo ocurre la historia" },
  { id: "recommended", label: "Orden recomendado", hint: "Respeta dependencias narrativas" },
  { id: "core", label: "Historia principal", hint: "Solo la columna vertebral del UCM" },
  { id: "quick", label: "Ruta rápida", hint: "Prepárate para una película" },
  { id: "custom", label: "Orden personalizado", hint: "Construye tu propia ruta" },
];
const CUSTOM_ROUTE_KEY = "nexus-desktop-custom-route-v1";

function RoutesView({ watched, onOpenDetail, onOpenMap, onShowRoute }: { watched: Set<string>; onOpenDetail: (item: MapItem) => void; onOpenMap: (item: MapItem) => void; onShowRoute: (item: MapItem, includeContext?: boolean) => void }) {
  const [mode, setMode] = useState<RouteMode>("quick");
  const [targetId, setTargetId] = useState(() => ITEM_BY_ID.has("brand-new-day") ? "brand-new-day" : "no-way-home");
  const [includeContext, setIncludeContext] = useState(false);
  const [customRoute, setCustomRoute] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_ROUTE_KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => localStorage.setItem(CUSTOM_ROUTE_KEY, JSON.stringify(customRoute)), [customRoute]);
  const target = ITEM_BY_ID.get(targetId) || ITEMS[0];

  const routeItems = useMemo(() => {
    if (mode === "release") return [...ITEMS].sort((a, b) => a.releaseValue - b.releaseValue);
    if (mode === "chronological") return [...ITEMS].sort((a, b) => (INTERNAL_ORDER_RANK.get(a.id) ?? 1000 + a.releaseValue) - (INTERNAL_ORDER_RANK.get(b.id) ?? 1000 + b.releaseValue));
    if (mode === "core") return ITEMS.filter((item) => CORE_STORY_IDS.has(item.id)).sort((a, b) => a.releaseValue - b.releaseValue);
    if (mode === "quick") return dependencyRoute(target.id, includeContext);
    if (mode === "custom") return customRoute.map((id) => ITEM_BY_ID.get(id)).filter(Boolean) as MapItem[];
    const result: MapItem[] = [];
    const visited = new Set<string>();
    const visit = (item: MapItem) => {
      if (visited.has(item.id)) return;
      visited.add(item.id);
      for (const edge of NARRATIVE_LINKS[item.id] || []) { const prerequisite = ITEM_BY_ID.get(edge.prerequisite); if (prerequisite) visit(prerequisite); }
      result.push(item);
    };
    [...ITEMS].sort((a, b) => a.releaseValue - b.releaseValue).forEach(visit);
    return result;
  }, [customRoute, includeContext, mode, target.id]);

  const moveCustom = (index: number, direction: -1 | 1) => setCustomRoute((current) => {
    const destination = index + direction;
    if (destination < 0 || destination >= current.length) return current;
    const next = [...current];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });

  return <section className="dashboard-workspace routes-workspace">
    <header className="dashboard-toolbar"><div><span className="dash-eyebrow">Navegación narrativa</span><h1>Órdenes y rutas</h1></div><div className="route-total"><Icon name="route"/><span><strong>{routeItems.length}</strong><small>títulos en esta ruta</small></span></div></header>
    <div className="dashboard-scroll">
      <div className="route-mode-picker">{ROUTE_MODES.map((entry) => <button key={entry.id} className={mode === entry.id ? "selected" : ""} onClick={() => setMode(entry.id)}><Icon name={entry.id === "quick" ? "target" : entry.id === "custom" ? "bookmark" : entry.id === "chronological" ? "clock" : "route"}/><span><strong>{entry.label}</strong><small>{entry.hint}</small></span></button>)}</div>

      {(mode === "quick" || mode === "custom") && <section className="route-builder">
        <div><span className="dash-eyebrow">Objetivo</span><h2>{mode === "quick" ? "¿Para qué película quieres prepararte?" : "Añade títulos a tu orden"}</h2></div>
        <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>{[...ITEMS].sort((a, b) => a.title.localeCompare(b.title)).map((item) => <option key={item.id} value={item.id}>{item.title} · {item.date}</option>)}</select>
        {mode === "quick" ? <><button className={`context-toggle ${includeContext ? "active" : ""}`} onClick={() => setIncludeContext((value) => !value)}><Icon name="spark"/><span><strong>Contexto ampliado</strong><small>{includeContext ? "Incluye Tobey, Andrew, variantes y series" : "Desactivado: mapa limpio y esencial"}</small></span></button><button className="show-route-button" onClick={() => onShowRoute(target, includeContext)}><Icon name="route"/>Mostrar esta ruta en el mapa</button></> : <button className="show-route-button" disabled={customRoute.includes(target.id)} onClick={() => setCustomRoute((current) => [...current, target.id])}><Icon name="plus"/>{customRoute.includes(target.id) ? "Ya está en tu orden" : "Añadir al final"}</button>}
      </section>}

      <section className="route-sequence">
        <div className="dashboard-section-head"><div><span className="dash-eyebrow">Secuencia resultante</span><h2>{ROUTE_MODES.find((entry) => entry.id === mode)?.label}</h2></div><small>{routeItems.filter((item) => watched.has(item.id)).length}/{routeItems.length} completados</small></div>
        {routeItems.length ? <div className="route-list">{routeItems.map((item, index) => {
          const directToNext = index < routeItems.length - 1 ? (NARRATIVE_LINKS[routeItems[index + 1].id] || []).find((edge) => edge.prerequisite === item.id) : undefined;
          return <React.Fragment key={`${item.id}-${index}`}><article className={`${watched.has(item.id) ? "complete " : ""}media-${item.type}`} style={mediaStyle(item)}><span className="route-index">{String(index + 1).padStart(2, "0")}</span><img src={posterFor(item)} alt=""/><div><small><b className="type-dot"/>{TYPE_LABEL[item.type]} · {trackForId(item.trackId)?.short} · {item.date}</small><h3>{item.title}</h3>{directToNext && <p style={{ "--edge": CONNECTION_COLOR[directToNext.kind] } as React.CSSProperties}><i/>{CONNECTION_LABEL[directToNext.kind]} para el siguiente título</p>}</div><div className="route-item-actions"><button onClick={() => onOpenDetail(item)}>Ficha</button><button title="Ver en mapa" onClick={() => onOpenMap(item)}><Icon name="route"/></button>{mode === "custom" && <><button title="Subir" disabled={index === 0} onClick={() => moveCustom(index, -1)}>↑</button><button title="Bajar" disabled={index === routeItems.length - 1} onClick={() => moveCustom(index, 1)}>↓</button><button title="Quitar" onClick={() => setCustomRoute((current) => current.filter((_id, currentIndex) => currentIndex !== index))}><Icon name="close"/></button></>}</div></article>{index < routeItems.length - 1 && <span className="route-step-line"/>}</React.Fragment>;
        })}</div> : <div className="list-empty"><Icon name="route" size={36}/><h2>Tu orden está vacío</h2><p>Selecciona un título y añádelo para construir tu ruta personalizada.</p></div>}
      </section>
    </div>
  </section>;
}

type MarathonTask = { key: string; itemId: string; episode?: number; minutes: number; date: string; done: boolean };
const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const VERIFIED_RELEASES: Array<{ id: string; date?: string; status: "confirmed" | "window" | "tbd"; source: string; note?: string }> = [
  { id: "punisher-special", date: "2026-05-12", status: "confirmed", source: "https://www.marvel.com/articles/tv-shows/a-marvel-television-special-presentation-the-punisher-one-last-kill-may-12-teaser-poster" },
  { id: "xmen97-2", date: "2026-07-01", status: "confirmed", source: "https://www.marvel.com/articles/tv-shows/x-men-97-season-2-trailer-july-1-2026-release-date-disney-plus" },
  { id: "brand-new-day", date: "2026-07-31", status: "confirmed", source: "https://www.marvel.com/movies/spider-man-brand-new-day" },
  { id: "friendly-spider-2", status: "window", source: "https://www.marvel.com/tv-shows", note: "Otoño de 2026" },
  { id: "visionquest", date: "2026-10-14", status: "confirmed", source: "https://www.marvel.com/articles/tv-shows/marvel-television-visionquest-release-date" },
  { id: "doomsday", date: "2026-12-18", status: "confirmed", source: "https://www.marvel.com/movies/avengers-doomsday" },
  { id: "daredevil-ba-3", status: "tbd", source: "https://www.marvel.com/tv-shows" },
  { id: "wonder-man-2", status: "tbd", source: "https://www.marvel.com/tv-shows" },
  { id: "secret-wars", date: "2027-12-17", status: "confirmed", source: "https://www.marvel.com/movies/avengers-secret-wars" },
];
const dateAtNoon = (iso: string) => new Date(`${iso}T12:00:00`);
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const formatDate = (iso: string) => dateAtNoon(iso).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
const daysUntil = (iso: string) => Math.ceil((dateAtNoon(iso).getTime() - new Date().setHours(0,0,0,0)) / 86400000);

function MarathonPlanner({ watched, episodes, author, onToggleWatched, onToggleEpisode, onOpenDetail, notify }: { watched: Set<string>; episodes: EpisodeState; author:string; onToggleWatched: (item: MapItem) => void; onToggleEpisode: (item: MapItem, episode: number) => void; onOpenDetail: (item: MapItem) => void; notify: (message: string) => void }) {
  const [plannerMode, setPlannerMode] = useState<"auto"|"custom">("auto");
  const [targetId, setTargetId] = useState("secret-wars");
  const [trackId, setTrackId] = useState("route");
  const [hours, setHours] = useState(3);
  const [startDate, setStartDate] = useState(() => isoDate(new Date()));
  const [days, setDays] = useState<Set<number>>(new Set([1,2,3,4,5,6,0]));
  const [includeContext, setIncludeContext] = useState(false);
  const [plan, setPlan] = useState<MarathonTask[]>(() => { try { return JSON.parse(localStorage.getItem(MARATHON_KEY) || "[]"); } catch { return []; } });
  useEffect(() => localStorage.setItem(MARATHON_KEY, JSON.stringify(plan)), [plan]);

  const buildPlan = (fromDate = startDate) => {
    const target = ITEM_BY_ID.get(targetId)!;
    const sourceItems = trackId === "route" ? dependencyRoute(target.id, includeContext).filter((item) => item.id !== target.id || !target.upcoming) : ITEMS.filter((item) => item.trackId === trackId).sort((a,b) => a.releaseValue - b.releaseValue);
    const tasks: Omit<MarathonTask, "date">[] = [];
    for (const item of sourceItems) {
      if (item.upcoming || watched.has(item.id)) continue;
      const total = EPISODE_COUNTS[item.id] || 0;
      if (total) {
        const complete = new Set(episodes[item.id] || []);
        for (let episode = 1; episode <= total; episode += 1) if (!complete.has(episode)) {
          const minutes = TITLE_METADATA[item.id]?.episodeDurations?.[episode - 1] || TITLE_METADATA[item.id]?.episodeRuntimeMinutes || EPISODE_RUNTIME_OVERRIDES[item.id] || (item.type === "animation" ? 24 : 42);
          tasks.push({ key: `${item.id}-e${episode}`, itemId: item.id, episode, minutes, done: false });
        }
      } else tasks.push({ key: item.id, itemId: item.id, minutes: TITLE_METADATA[item.id]?.runtimeMinutes || RUNTIME_OVERRIDES[item.id] || 120, done: false });
    }
    const capacity = Math.max(30, hours * 60);
    const allowed = days.size ? days : new Set([0,1,2,3,4,5,6]);
    let cursor = dateAtNoon(fromDate);
    const nextAllowed = () => { while (!allowed.has(cursor.getDay())) cursor.setDate(cursor.getDate() + 1); };
    nextAllowed(); let used = 0;
    const scheduled: MarathonTask[] = [];
    for (const task of tasks) {
      if (used > 0 && used + task.minutes > capacity) { cursor.setDate(cursor.getDate() + 1); nextAllowed(); used = 0; }
      scheduled.push({ ...task, date: isoDate(cursor) }); used += task.minutes;
    }
    setPlan(scheduled); notify(scheduled.length ? `Plan creado: ${scheduled.length} sesiones` : "No quedan títulos pendientes en esa ruta");
  };
  const reorganize = () => { setStartDate(isoDate(new Date())); buildPlan(isoDate(new Date())); notify("Días perdidos reorganizados desde hoy"); };
  const groups = [...new Set(plan.map((task) => task.date))];
  const totalMinutes = plan.reduce((sum, task) => sum + task.minutes, 0);
  const completed = plan.filter((task) => task.done).length;
  const finishDate = groups.at(-1);
  const target = ITEM_BY_ID.get(targetId)!;
  return <section className="dashboard-workspace planner-workspace">
    <header className="dashboard-toolbar artwork-toolbar" style={{ "--hero": `url(${artworkFor(target)})` } as React.CSSProperties}><div><span className="dash-eyebrow">Planificador de maratones</span><h1>Llega preparado a cualquier estreno</h1><p>Convierte una ruta narrativa en sesiones realistas según tus horas libres.</p></div><div className="planner-target"><img src={posterFor(target, "thumb")} alt=""/><span><small>Objetivo actual</small><strong>{target.title}</strong></span></div></header>
    <div className="dashboard-scroll"><div className="planner-mode"><button className={plannerMode==="auto"?"active":""} onClick={()=>setPlannerMode("auto")}><Icon name="spark"/>Plan automático</button><button className={plannerMode==="custom"?"active":""} onClick={()=>setPlannerMode("custom")}><Icon name="grip"/>Crear y compartir</button></div>{plannerMode === "auto" ? <>
      <section className="planner-config">
        <label><span>Objetivo final</span><select value={targetId} onChange={(event) => setTargetId(event.target.value)}>{ITEMS.filter((item) => item.upcoming || ["no-way-home","deadpool-wolverine","endgame"].includes(item.id)).sort((a,b) => a.releaseValue-b.releaseValue).map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
        <label><span>Recorrido</span><select value={trackId} onChange={(event) => setTrackId(event.target.value)}><option value="route">Requisitos del objetivo</option>{TRACKS.map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}</select></label>
        <label><span>Horas libres por día</span><input type="number" min="0.5" max="12" step="0.5" value={hours} onChange={(event) => setHours(Number(event.target.value))}/></label>
        <label><span>Comenzar</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)}/></label>
        <div className="day-selector"><span>Días disponibles</span><div>{DAY_LABELS.map((label,index) => <button key={label} className={days.has(index) ? "active" : ""} onClick={() => setDays((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; })}>{label}</button>)}</div></div>
        <button className={`context-toggle ${includeContext ? "active" : ""}`} onClick={() => setIncludeContext((value) => !value)}><Icon name="spark"/><span><strong>Contexto ampliado</strong><small>{includeContext ? "Incluye referencias y variantes" : "Solo requisitos esenciales"}</small></span></button>
        <button className="generate-plan" onClick={() => buildPlan()}><Icon name="calendar"/>Generar calendario</button>
      </section>
      {plan.length > 0 && <><section className="plan-summary"><div><strong>{formatMinutes(totalMinutes)}</strong><small>contenido pendiente</small></div><div><strong>{groups.length}</strong><small>días de maratón</small></div><div><strong>{completed}/{plan.length}</strong><small>sesiones completadas</small></div><div><strong>{finishDate ? formatDate(finishDate) : "—"}</strong><small>fecha de finalización</small></div><button onClick={reorganize}><Icon name="shuffle"/>Reorganizar días perdidos</button></section><div className="marathon-days">{groups.map((date, dayIndex) => { const tasks = plan.filter((task) => task.date === date); const isToday = date === isoDate(new Date()); return <section key={date} className={`marathon-day${isToday ? " today" : ""}`}><header><span className="day-index">{String(dayIndex + 1).padStart(2,"0")}</span><span><strong>{dateAtNoon(date).toLocaleDateString("es-PE", { weekday:"long", day:"numeric", month:"long" })}</strong><small>{formatMinutes(tasks.reduce((sum,task) => sum + task.minutes,0))}{isToday ? " · Hoy" : ""}</small></span><b>{tasks.filter((task) => task.done).length}/{tasks.length}</b></header><div>{tasks.map((task) => { const item = ITEM_BY_ID.get(task.itemId)!; return <article className={`${task.done ? "done " : ""}media-${item.type}`} style={mediaStyle(item)} key={task.key}><button className="task-check" onClick={() => { if (task.episode) onToggleEpisode(item, task.episode); else onToggleWatched(item); setPlan((current) => current.map((entry) => entry.key === task.key ? { ...entry, done: !entry.done } : entry)); }}><Icon name="check"/></button><button className="task-art" onClick={() => onOpenDetail(item)}><img src={artworkFor(item,"card")} alt={`Fotograma de ${item.title}`} loading="lazy"/><span>{TYPE_LABEL[item.type]}</span></button><button className="task-copy" onClick={() => onOpenDetail(item)}><small><i/>{trackForId(item.trackId)?.short} · {task.minutes} min</small><strong>{item.title}</strong><span>{task.episode ? `Capítulo ${task.episode}` : task.done ? "Completada" : "Pendiente"}</span></button></article>; })}</div></section>; })}</div></>}</> : <CustomMarathonBuilder author={author} onOpenDetail={onOpenDetail} notify={notify}/>} 
    </div>
  </section>;
}

function CustomMarathonBuilder({ author, onOpenDetail, notify }: { author:string; onOpenDetail:(item:MapItem)=>void; notify:(message:string)=>void }) {
  const [saved, setSaved] = useState<SharedMarathon[]>(()=>{ try { return JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY)||"[]"); } catch { return []; } });
  const [name,setName]=useState("Mi maratón Marvel"); const [description,setDescription]=useState(""); const [search,setSearch]=useState("");
  const [tasks,setTasks]=useState<Array<{itemId:string;episode?:number}>>([]); const [episodeChoice,setEpisodeChoice]=useState<Record<string,number>>({}); const [dragged,setDragged]=useState<number|null>(null);
  useEffect(()=>localStorage.setItem(CUSTOM_MARATHONS_KEY,JSON.stringify(saved)),[saved]);
  const results=useMemo(()=>search.trim().length>1?ITEMS.filter((item)=>!item.upcoming&&normalize([item.title,item.saga,trackForId(item.trackId)?.short].filter(Boolean).join(" ")).includes(normalize(search))).slice(0,8):[],[search]);
  const durationOf=(task:{itemId:string;episode?:number})=>{ const item=ITEM_BY_ID.get(task.itemId)!; return task.episode ? TITLE_METADATA[item.id]?.episodeDurations?.[task.episode-1]||TITLE_METADATA[item.id]?.episodeRuntimeMinutes||EPISODE_RUNTIME_OVERRIDES[item.id]||24 : TITLE_METADATA[item.id]?.runtimeMinutes||RUNTIME_OVERRIDES[item.id]||120; };
  const totalMinutes=tasks.reduce((sum,task)=>sum+durationOf(task),0);
  const add=(item:MapItem,episode?:number)=>{ const key=`${item.id}-${episode||"full"}`; if(tasks.some((task)=>`${task.itemId}-${task.episode||"full"}`===key)){notify("Ese contenido ya está en el maratón");return;} setTasks((current)=>[...current,{itemId:item.id,...(episode?{episode}:{})}]); };
  const addSeries=(item:MapItem)=>{ const total=EPISODE_COUNTS[item.id]||0; if(!total)return add(item); const existing=new Set(tasks.filter((task)=>task.itemId===item.id).map((task)=>task.episode)); setTasks((current)=>[...current,...Array.from({length:total},(_,index)=>index+1).filter((episode)=>!existing.has(episode)).map((episode)=>({itemId:item.id,episode}))]); };
  const move=(from:number,to:number)=>{ if(to<0||to>=tasks.length)return; setTasks((current)=>{const next=[...current];const [entry]=next.splice(from,1);next.splice(to,0,entry);return next;}); };
  const payload=():SharedMarathon=>({version:1,id:`marathon-${Date.now()}`,name:name.trim()||"Maratón sin nombre",description:description.trim(),createdAt:new Date().toISOString(),author,tasks,coverIds:[...new Set(tasks.map((task)=>task.itemId))].slice(0,4)});
  const save=()=>{ if(!tasks.length){notify("Añade al menos un título");return;} const marathon=payload(); setSaved((current)=>[marathon,...current.filter((entry)=>entry.name!==marathon.name)]);notify("Maratón guardado"); };
  const share=async()=>{ if(!tasks.length){notify("Añade contenido antes de compartir");return;} const marathon=payload(); if(window.nexusCloud){const result=await window.nexusCloud.shareMarathon(marathon);if(result.ok)notify(result.url?"Enlace copiado para compartir":"Maratón guardado");else{window.dispatchEvent(new CustomEvent("nexus:open-cloud"));notify(result.error||"Inicia sesión para compartir");}return;} if(window.nexusDesktop){const result=await window.nexusDesktop.exportMarathon(marathon);if(result?.ok)notify("Archivo listo para compartir");else if(result?.error)notify(result.error);return;} const blob=new Blob([JSON.stringify(marathon,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`${marathon.id}.nexus-marathon`;link.click();URL.revokeObjectURL(url);notify("Archivo listo para compartir"); };
  const importPlan=async()=>{ if(!window.nexusDesktop){window.dispatchEvent(new CustomEvent("nexus:open-cloud"));notify("Pega la invitación en Nexus Cloud");return;} const result=await window.nexusDesktop.importMarathon(); if(result?.ok&&result.payload){ const marathon=result.payload as SharedMarathon; const validTasks=marathon.tasks.filter((task)=>ITEM_BY_ID.has(task.itemId)); if(!validTasks.length){notify("Ese maratón no coincide con este catálogo");return;} const imported={...marathon,tasks:validTasks,id:`imported-${Date.now()}`}; setSaved((current)=>[imported,...current]);setName(imported.name);setDescription(imported.description||"");setTasks(imported.tasks);notify(`Importado: ${imported.name}`); } else if(result?.error)notify(result.error); };
  const load=(marathon:SharedMarathon)=>{setName(marathon.name);setDescription(marathon.description);setTasks(marathon.tasks);notify("Maratón abierto en el editor");};
  return <section className="custom-marathon"><header className="custom-marathon-intro"><div><span className="dash-eyebrow">Constructor visual</span><h2>Crea una ruta para tu grupo</h2><p>Elige películas o capítulos, ordénalos y comparte un archivo que no incluye tu progreso personal.</p></div><div><button onClick={importPlan}><Icon name="upload"/>Importar de un amigo</button><button className="share-marathon" onClick={share}><Icon name="share"/>Compartir archivo</button></div></header><div className="builder-grid"><aside className="builder-catalog"><label><Icon name="search"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar títulos o universos…"/></label>{results.length?<div className="builder-results">{results.map((item)=>{const total=EPISODE_COUNTS[item.id]||0;const episode=episodeChoice[item.id]||1;return <article key={item.id} style={mediaStyle(item)}><img src={posterFor(item,"thumb")} alt=""/><div><small>{TYPE_LABEL[item.type]} · {trackForId(item.trackId)?.short}</small><strong>{item.title}</strong>{total?<span><select value={episode} onChange={(event)=>setEpisodeChoice((current)=>({...current,[item.id]:Number(event.target.value)}))}>{Array.from({length:total},(_,index)=><option value={index+1} key={index}>Capítulo {index+1}</option>)}</select><button onClick={()=>add(item,episode)}>+ capítulo</button><button onClick={()=>addSeries(item)}>Serie completa</button></span>:<button onClick={()=>add(item)}>Añadir película</button>}</div></article>})}</div>:<div className="builder-search-empty"><Icon name="search"/><p>{search?"No encontramos coincidencias":"Busca para comenzar tu selección"}</p></div>}</aside><main className="builder-editor"><div className="builder-fields"><label><span>Nombre</span><input value={name} onChange={(event)=>setName(event.target.value)} maxLength={70}/></label><label><span>Descripción</span><input value={description} onChange={(event)=>setDescription(event.target.value)} placeholder="Plan, ocasión o instrucciones para tus amigos" maxLength={160}/></label></div><div className="builder-summary"><div className="marathon-cover">{[...new Set(tasks.map((task)=>task.itemId))].slice(0,4).map((id)=><img src={posterFor(ITEM_BY_ID.get(id)!,"card")} alt="" key={id}/>)}{!tasks.length&&<Icon name="film" size={34}/>}</div><span><strong>{tasks.length} sesiones</strong><small>{formatMinutes(totalMinutes)} · {new Set(tasks.map((task)=>task.itemId)).size} títulos</small></span><button onClick={save}><Icon name="bookmark"/>Guardar</button></div>{tasks.length?<div className="builder-timeline">{tasks.map((task,index)=>{const item=ITEM_BY_ID.get(task.itemId)!;return <article key={`${task.itemId}-${task.episode||0}-${index}`} draggable onDragStart={()=>setDragged(index)} onDragOver={(event)=>event.preventDefault()} onDrop={()=>{if(dragged!==null)move(dragged,index);setDragged(null);}} style={mediaStyle(item)}><span className="drag-handle"><Icon name="grip"/></span><b>{String(index+1).padStart(2,"0")}</b><img src={artworkFor(item,"card")} alt=""/><button onClick={()=>onOpenDetail(item)}><small>{TYPE_LABEL[item.type]} · {durationOf(task)} min</small><strong>{item.title}</strong><span>{task.episode?`Capítulo ${task.episode}`:"Película completa"}</span></button><div><button disabled={index===0} onClick={()=>move(index,index-1)} aria-label="Subir">↑</button><button disabled={index===tasks.length-1} onClick={()=>move(index,index+1)} aria-label="Bajar">↓</button><button onClick={()=>setTasks((current)=>current.filter((_entry,currentIndex)=>currentIndex!==index))} aria-label="Quitar"><Icon name="close"/></button></div></article>})}</div>:<div className="builder-drop-empty"><Icon name="grip" size={32}/><h3>Tu maratón está vacío</h3><p>Busca contenido en la columna izquierda y añádelo aquí.</p></div>}</main></div>{saved.length>0&&<section className="saved-marathons"><div className="dashboard-section-head"><div><span className="dash-eyebrow">Plantillas locales</span><h2>Tus maratones</h2></div><small>{saved.length} guardados</small></div><div>{saved.map((marathon)=><article key={marathon.id}><div className="saved-cover">{marathon.coverIds.slice(0,4).map((id)=>ITEM_BY_ID.get(id)&&<img key={id} src={posterFor(ITEM_BY_ID.get(id)!,"thumb")} alt=""/>)}</div><span><strong>{marathon.name}</strong><small>{marathon.tasks.length} sesiones · {marathon.author}</small></span><button onClick={()=>load(marathon)}>Editar</button><button onClick={()=>setSaved((current)=>current.filter((entry)=>entry.id!==marathon.id))}><Icon name="close"/></button></article>)}</div></section>}</section>;
}

function MarvelCalendar({ onOpenDetail, notify }: { onOpenDetail: (item: MapItem) => void; notify: (message: string) => void }) {
  const [reminders, setReminders] = useState<Set<string>>(() => { try { return new Set(JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]")); } catch { return new Set(); } });
  const [filter, setFilter] = useState<"all"|"movie"|"series">("all");
  useEffect(() => localStorage.setItem(REMINDERS_KEY, JSON.stringify([...reminders])), [reminders]);
  const events = VERIFIED_RELEASES.filter((event) => filter === "all" || ITEM_BY_ID.get(event.id)?.type === filter || (filter === "series" && ITEM_BY_ID.get(event.id)?.type === "animation"));
  const next = events.filter((event) => event.date && daysUntil(event.date) >= 0).sort((a,b) => a.date!.localeCompare(b.date!))[0];
  return <section className="dashboard-workspace calendar-workspace">
    <header className="dashboard-toolbar artwork-toolbar" style={{ "--hero": `url(./artwork/cosmic-hero-v1.webp)` } as React.CSSProperties}><div><span className="dash-eyebrow">Calendario Marvel verificado</span><h1>Próximos estrenos</h1><p>Fechas confirmadas, cambios visibles y recordatorios guardados en este perfil.</p></div>{next && <div className="countdown"><small>Siguiente estreno</small><strong>{Math.max(0, daysUntil(next.date!))}</strong><span>días</span></div>}</header>
    <div className="dashboard-scroll"><div className="calendar-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button><button className={filter === "movie" ? "active" : ""} onClick={() => setFilter("movie")}>Películas</button><button className={filter === "series" ? "active" : ""} onClick={() => setFilter("series")}>Series y animación</button><a href="https://www.marvel.com/movies" target="_blank" rel="noreferrer">Comprobar novedades oficiales <Icon name="chevron" size={13}/></a></div>
      <div className="release-grid">{events.map((event) => { const item = ITEM_BY_ID.get(event.id); if (!item) return null; const remaining = event.date ? daysUntil(event.date) : null; return <article key={event.id} className={`${event.status} media-${item.type}`} style={mediaStyle(item)}><div className="release-art"><img className="release-backdrop" src={artworkFor(item)} alt=""/><img className="release-poster" src={posterFor(item)} alt=""/><span className="release-type">{TYPE_LABEL[item.type]}</span></div><div className="release-body"><span className="release-status">{event.status === "confirmed" ? "Fecha confirmada" : event.status === "window" ? "Ventana anunciada" : "Fecha pendiente"}</span><h2>{item.title}</h2><p>{event.date ? formatDate(event.date) : event.note || "Marvel todavía no ha comunicado una fecha."}</p>{remaining != null && <strong className={remaining < 0 ? "past" : ""}>{remaining < 0 ? `Estrenada hace ${Math.abs(remaining)} días` : remaining === 0 ? "Se estrena hoy" : `Faltan ${remaining} días`}</strong>}<div><button onClick={() => onOpenDetail(item)}>Abrir ficha</button><button className={reminders.has(item.id) ? "reminding" : ""} onClick={() => { setReminders((current) => { const nextSet = new Set(current); if (nextSet.has(item.id)) nextSet.delete(item.id); else nextSet.add(item.id); return nextSet; }); notify(reminders.has(item.id) ? "Recordatorio desactivado" : "Te lo recordaremos al abrir Nexus"); }}><Icon name="bell"/>{reminders.has(item.id) ? "Recordatorio activo" : "Recordarme"}</button><a href={event.source} target="_blank" rel="noreferrer">Fuente</a></div></div></article>; })}</div>
      <section className="calendar-note"><Icon name="bell"/><div><strong>Actualizaciones responsables</strong><p>Nexus no cambia silenciosamente una fecha. Las modificaciones se muestran como verificadas y enlazan a la fuente oficial antes de incorporarse al calendario.</p></div></section>
    </div>
  </section>;
}

function ProfilesView({ profiles, activeProfileId, watched, ratings, favorites, history, rewatches, achievements, onProfiles, onSwitch, notify }: { profiles: Profile[]; activeProfileId: string; watched: Set<string>; ratings: Record<string,number>; favorites: Set<string>; history: ActivityEvent[]; rewatches: Record<string,number>; achievements:Achievement[]; onProfiles: React.Dispatch<React.SetStateAction<Profile[]>>; onSwitch: (id:string, resetGuest?:boolean) => void; notify:(message:string)=>void }) {
  const [name, setName] = useState(""); const [avatar, setAvatar] = useState("N"); const [color, setColor] = useState("#755bff"); const [child, setChild] = useState(false);
  const currentYear = new Date().getFullYear();
  const monthly = Array.from({ length: 12 }, (_, month) => history.filter((event) => new Date(event.at).getFullYear() === currentYear && new Date(event.at).getMonth() === month && ["watched","rewatch"].includes(event.action)).length);
  const maxMonth = Math.max(1, ...monthly);
  const average = Object.values(ratings).length ? (Object.values(ratings).reduce((a,b)=>a+b,0) / Object.values(ratings).length).toFixed(1) : "—";
  const create = () => { const clean = name.trim(); if (!clean) return; const id = `profile-${Date.now()}`; const profile = { id, name: clean, avatar: avatar.trim().slice(0,2).toUpperCase() || clean[0].toUpperCase(), color, child }; onProfiles((current) => [...current, profile]); setName(""); notify("Perfil creado"); };
  const progressOf = (profile: Profile) => { if (profile.id === activeProfileId) return watched.size; try { return JSON.parse(localStorage.getItem(`nexus-profile-${profile.id}-${WATCHED_KEY}`) || "[]").length; } catch { return 0; } };
  return <section className="dashboard-workspace profiles-workspace">
    <header className="dashboard-toolbar artwork-toolbar" style={{ "--hero": `url(./artwork/street-hero-v1.webp)` } as React.CSSProperties}><div><span className="dash-eyebrow">Perfiles y actividad</span><h1>Tu espacio personal</h1><p>Cada usuario conserva su propio progreso, preferencias, listas y protección de spoilers.</p></div><div className="profile-avatar large" style={{ background: profiles.find((profile) => profile.id === activeProfileId)?.color }}>{profiles.find((profile) => profile.id === activeProfileId)?.avatar}</div></header>
    <div className="dashboard-scroll"><section className="profile-grid">{profiles.filter((profile)=>!profile.guest).map((profile) => <article className={profile.id === activeProfileId ? "active" : ""} key={profile.id} style={{ "--profile": profile.color } as React.CSSProperties}><div className="profile-avatar" style={{ background: profile.color }}>{profile.avatar}</div><div><h2>{profile.name}</h2><p>{profile.child ? "Perfil infantil · spoilers protegidos" : "Perfil estándar"}</p><span>{progressOf(profile)} títulos completados</span></div>{profile.id === activeProfileId ? <b>Activo</b> : <button onClick={() => onSwitch(profile.id)}>Cambiar</button>}{profile.id !== "principal" && profile.id !== activeProfileId && <button className="profile-delete" title="Eliminar" onClick={() => onProfiles((current) => current.filter((entry) => entry.id !== profile.id))}><Icon name="close"/></button>}</article>)}<button className="guest-profile" onClick={() => { const guest = profiles.find((profile)=>profile.guest) || { id:"guest",name:"Invitado",avatar:"I",color:"#69717e",child:false,guest:true }; if (!profiles.some((profile)=>profile.guest)) onProfiles((current)=>[...current,guest]); setTimeout(()=>onSwitch("guest",true),20); }}><Icon name="user"/><span><strong>Modo invitado</strong><small>Comienza vacío y no altera otros perfiles</small></span></button></section>
      <section className="create-profile"><div><span className="dash-eyebrow">Nuevo usuario</span><h2>Crear perfil</h2></div><input value={name} onChange={(event)=>setName(event.target.value)} placeholder="Nombre"/><input className="avatar-input" value={avatar} maxLength={2} onChange={(event)=>setAvatar(event.target.value)} title="Iniciales"/><input type="color" value={color} onChange={(event)=>setColor(event.target.value)}/><button className={child ? "child active" : "child"} onClick={()=>setChild((value)=>!value)}><Icon name="eye"/>{child ? "Infantil activado" : "Perfil infantil"}</button><button className="create-profile-button" onClick={create}><Icon name="plus"/>Crear perfil</button></section>
      <section className="personal-stats"><div className="dashboard-section-head"><div><span className="dash-eyebrow">Estadísticas personales</span><h2>{currentYear} en Nexus</h2></div><small>Basado en tu historial local</small></div><div className="stat-grid personal"><div><Icon name="film"/><span><strong>{watched.size}</strong><small>títulos vistos</small></span></div><div><Icon name="star"/><span><strong>{favorites.size}</strong><small>favoritos</small></span></div><div><Icon name="bar"/><span><strong>{average}</strong><small>calificación media</small></span></div><div><Icon name="shuffle"/><span><strong>{Object.values(rewatches).reduce((a,b)=>a+b,0)}</strong><small>repeticiones</small></span></div></div><div className="annual-chart">{monthly.map((value,index)=><div key={index}><i style={{ height:`${Math.max(4,value/maxMonth*100)}%` }}/><span>{["E","F","M","A","M","J","J","A","S","O","N","D"][index]}</span><small>{value}</small></div>)}</div></section>
      {achievements.length>0&&<section className="achievement-section"><div className="dashboard-section-head"><div><span className="dash-eyebrow">Progreso opcional</span><h2>Logros del multiverso</h2></div><small>{achievements.filter((achievement)=>achievement.unlocked).length}/{achievements.length} desbloqueados</small></div><div className="achievement-grid">{achievements.map((achievement)=><article key={achievement.id} className={achievement.unlocked?"unlocked":""}><span><Icon name={achievement.icon}/></span><div><strong>{achievement.title}</strong><p>{achievement.description}</p><i><b style={{width:`${achievement.progress*100}%`}}/></i></div>{achievement.unlocked&&<Icon name="check"/>}</article>)}</div></section>}
      <section className="profile-comparison"><div className="dashboard-section-head"><div><span className="dash-eyebrow">Comparación local</span><h2>Progreso por usuario</h2></div></div>{profiles.filter((profile)=>!profile.guest).map((profile)=><div key={profile.id}><span className="profile-avatar mini" style={{background:profile.color}}>{profile.avatar}</span><strong>{profile.name}</strong><i><b style={{width:`${progressOf(profile)/Math.max(1,ITEMS.filter((item)=>!item.upcoming).length)*100}%`,background:profile.color}}/></i><small>{progressOf(profile)} completados</small></div>)}</section>
    </div>
  </section>;
}

function ListView({ watchlist, ignored, favorites, ratings, customLists, watched, episodes, onToggleWatchlist, onToggleFavorite, onLists, onRestore, onOpenDetail, onOpenMap }: { watchlist: Set<string>; ignored: Set<string>; favorites: Set<string>; ratings: Record<string, number>; customLists: CustomList[]; watched: Set<string>; episodes: EpisodeState; onToggleWatchlist: (item: MapItem) => void; onToggleFavorite: (item: MapItem) => void; onLists: React.Dispatch<React.SetStateAction<CustomList[]>>; onRestore: (item: MapItem) => void; onOpenDetail: (item: MapItem) => void; onOpenMap: (item: MapItem) => void }) {
  const [tab, setTab] = useState<"saved" | "favorites" | "ignored" | "lists">("saved");
  const [newListName, setNewListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const selectedList = customLists.find((list) => list.id === selectedListId) || customLists[0];
  const entries = ITEMS.filter((item) => tab === "saved" ? watchlist.has(item.id) : tab === "favorites" ? favorites.has(item.id) : tab === "ignored" ? ignored.has(item.id) : selectedList?.items.includes(item.id));
  const createList = () => {
    const name = newListName.trim(); if (!name) return;
    const id = `list-${Date.now()}`;
    onLists((current) => [...current, { id, name, color: ["#ff5b61", "#75a7ff", "#b77cff", "#57cfb0"][current.length % 4], items: [] }]);
    setSelectedListId(id); setNewListName(""); setTab("lists");
  };
  return <section className="dashboard-workspace list-workspace">
    <header className="dashboard-toolbar"><div><span className="dash-eyebrow">Tu colección personal</span><h1>Biblioteca</h1></div><div className="list-tabs"><button className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}><Icon name="bookmark"/>Guardados <b>{watchlist.size}</b></button><button className={tab === "favorites" ? "active" : ""} onClick={() => setTab("favorites")}><Icon name="star"/>Favoritos <b>{favorites.size}</b></button><button className={tab === "lists" ? "active" : ""} onClick={() => setTab("lists")}><Icon name="note"/>Listas <b>{customLists.length}</b></button><button className={tab === "ignored" ? "active" : ""} onClick={() => setTab("ignored")}><Icon name="close"/>Ocultos <b>{ignored.size}</b></button></div></header>
    <div className="dashboard-scroll">
      {tab === "lists" && <div className="custom-list-toolbar"><div className="custom-list-pills">{customLists.map((list) => <button key={list.id} className={selectedList?.id === list.id ? "active" : ""} onClick={() => setSelectedListId(list.id)} style={{ "--list": list.color } as React.CSSProperties}><i/>{list.name}<b>{list.items.length}</b></button>)}</div><div className="new-list"><input value={newListName} onChange={(event) => setNewListName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createList(); }} placeholder="Nueva lista…"/><button onClick={createList}><Icon name="plus"/>Crear</button>{selectedList && <button className="delete-list" onClick={() => { onLists((current) => current.filter((list) => list.id !== selectedList.id)); setSelectedListId(""); }}><Icon name="close"/>Eliminar lista</button>}</div></div>}
      {tab === "lists" && customLists.length > 0 && <div className="custom-list-gallery">{customLists.map((list)=><button key={list.id} className={selectedList?.id===list.id?"active":""} style={{"--list":list.color} as React.CSSProperties} onClick={()=>setSelectedListId(list.id)}><span className="list-collage">{list.items.slice(0,4).map((id)=>ITEM_BY_ID.get(id)&&<img src={posterFor(ITEM_BY_ID.get(id)!,"thumb")} alt="" key={id}/>)}{Array.from({length:Math.max(0,4-list.items.length)},(_,index)=><i key={index}/>)}</span><span><strong>{list.name}</strong><small>{list.items.length} títulos</small></span></button>)}</div>}
      {entries.length ? <div className="library-list">{entries.map((item) => {
        const total = EPISODE_COUNTS[item.id] || 0;
        const done = episodes[item.id]?.length || 0;
        return <article key={item.id} className={`media-${item.type}`} style={mediaStyle(item)}><div className="library-poster"><img src={posterFor(item)} alt=""/><span>{TYPE_LABEL[item.type]}</span></div><div><span><b className="type-dot"/>{trackForId(item.trackId)?.short} · {item.date}</span><h2>{item.title}</h2><p>{ratings[item.id] ? `${"★".repeat(ratings[item.id])} · ` : ""}{watched.has(item.id) ? "Completada" : total ? `${done}/${total} capítulos vistos` : "Pendiente"}</p>{total > 0 && <i><b style={{ width: `${done / total * 100}%` }}/></i>}</div><div className="library-actions"><button onClick={() => onOpenDetail(item)}>Abrir</button><button title="Ver en el mapa" onClick={() => onOpenMap(item)}><Icon name="route"/></button>{tab === "saved" ? <button title="Quitar de guardados" onClick={() => onToggleWatchlist(item)}><Icon name="close"/></button> : tab === "favorites" ? <button title="Quitar de favoritos" onClick={() => onToggleFavorite(item)}><Icon name="close"/></button> : tab === "ignored" ? <button onClick={() => onRestore(item)}>Restaurar</button> : <button title="Quitar de esta lista" onClick={() => onLists((current) => current.map((list) => list.id === selectedList?.id ? { ...list, items: list.items.filter((id) => id !== item.id) } : list))}><Icon name="close"/></button>}</div></article>;
      })}</div> : <div className="list-empty"><Icon name={tab === "favorites" ? "star" : tab === "lists" ? "note" : tab === "saved" ? "bookmark" : "check"} size={36}/><h2>{tab === "favorites" ? "Aún no tienes favoritos" : tab === "lists" ? customLists.length ? "Esta lista está vacía" : "Crea tu primera lista" : tab === "saved" ? "Tu lista está vacía" : "No has descartado nada"}</h2><p>Abre una ficha para organizar tus títulos y registrar tus preferencias.</p></div>}
    </div>
  </section>;
}

function NarrativeOverlay({ targetId, zoom, mapHeight }: { targetId: string; zoom: number; mapHeight: number }) {
  const edges = dependencyEdges(targetId, true);
  return <svg className="narrative-overlay" width={MAP_WIDTH * zoom} height={mapHeight} viewBox={`0 0 ${MAP_WIDTH} ${mapHeight}`} preserveAspectRatio="none" aria-label="Conexiones de la ruta seleccionada">
    <defs><filter id="routeGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {edges.map(({ from, to, edge }, index) => {
      const startX = xOf(from.releaseValue);
      const endX = xOf(to.releaseValue);
      const startY = yOfTrack(from.trackId, zoom);
      const endY = yOfTrack(to.trackId, zoom);
      const bend = Math.max(70, Math.abs(endX - startX) * .35);
      return <g key={`${from.id}-${to.id}-${index}`} data-kind={edge.kind}>
        <path className="narrative-path-glow" stroke={CONNECTION_COLOR[edge.kind]} d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}/>
        <path className={`narrative-path narrative-${edge.kind}`} stroke={CONNECTION_COLOR[edge.kind]} d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}/>
        <circle className="narrative-junction" cx={endX} cy={endY} r="8" stroke={CONNECTION_COLOR[edge.kind]}/>
      </g>;
    })}
  </svg>;
}

function MapLines({ activeTrack, zoom, mapHeight, hideConnections }: { activeTrack: string; zoom: number; mapHeight: number; hideConnections: boolean }) {
  const noWayHome = ITEM_BY_ID.get("no-way-home")!;
  const deadpoolWolverine = ITEM_BY_ID.get("deadpool-wolverine")!;
  const endgame = ITEM_BY_ID.get("endgame") || ITEMS.find((item) => item.title === "Avengers: Endgame")!;
  const firstSeries = ITEMS.find((item) => item.trackId === "series")!;
  const xmenLast = ITEMS.filter((item) => item.trackId === "xmen" && item.releaseValue < deadpoolWolverine.releaseValue).at(-1)!;
  const pathFor = (trackId: string) => {
    const items = ITEMS.filter((item) => item.trackId === trackId);
    return { start: xOf(items[0].releaseValue), end: xOf(items.at(-1)!.releaseValue), y: yOfTrack(trackId, zoom) };
  };
  const mcuY = yOfTrack("mcu", zoom);
  const seriesY = yOfTrack("series", zoom);
  return <><svg className="track-svg" width={MAP_WIDTH * zoom} height={mapHeight} viewBox={`0 0 ${MAP_WIDTH} ${mapHeight}`} preserveAspectRatio="none" aria-hidden="true">
    <defs><filter id="lineGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {TRACKS.map((track) => {
      const line = pathFor(track.id);
      const muted = activeTrack !== "all" && activeTrack !== track.id && !(track.id === "mcu");
      return <g key={track.id} className={muted ? "line-muted" : ""}>
        <path className="track-glow" stroke={track.color} d={`M ${line.start} ${line.y} L ${line.end} ${line.y}`}/>
        <path className="track-core" stroke={track.color} d={`M ${line.start} ${line.y} L ${line.end} ${line.y}`}/>
      </g>;
    })}
    <g className={hideConnections ? "connections-hidden" : ""}>
    <Connection fromId="spiderman-raimi-3" toX={xOf(noWayHome.releaseValue)} toY={mcuY} color="#f24e86" active={activeTrack === "all" || activeTrack === "tobey"} zoom={zoom}/>
    <Connection fromId="amazing-spiderman-2" toX={xOf(noWayHome.releaseValue)} toY={mcuY} color="#9c70ff" active={activeTrack === "all" || activeTrack === "andrew"} zoom={zoom}/>
    <Connection fromId="venom-2" toX={xOf(noWayHome.releaseValue)} toY={mcuY} color="#c757e7" active={activeTrack === "all" || activeTrack === "sony"} dashed zoom={zoom}/>
    <Connection fromId={xmenLast.id} toX={xOf(deadpoolWolverine.releaseValue)} toY={mcuY} color="#3b88ff" active={activeTrack === "all" || activeTrack === "xmen"} zoom={zoom}/>
    <Connection fromId={ITEMS.filter((item) => item.trackId === "fantastic" && item.releaseValue < deadpoolWolverine.releaseValue).at(-1)?.id || "fantastic-four-2015"} toX={xOf(deadpoolWolverine.releaseValue)} toY={mcuY} color="#ffb640" active={activeTrack === "all" || activeTrack === "fantastic"} dashed zoom={zoom}/>
    <path className="branch-connector" stroke="#58cf83" d={`M ${xOf(endgame.releaseValue)} ${mcuY} C ${xOf(endgame.releaseValue) + 80} ${mcuY}, ${xOf(firstSeries.releaseValue) - 100} ${seriesY}, ${xOf(firstSeries.releaseValue)} ${seriesY}`}/>
    <g className="legend-key"><circle cx={xOf(noWayHome.releaseValue)} cy={mcuY} r="13"/><circle cx={xOf(deadpoolWolverine.releaseValue)} cy={mcuY} r="13"/></g>
    </g>
  </svg>{TRACKS.map((track) => {
    const line = pathFor(track.id);
    const muted = activeTrack !== "all" && activeTrack !== track.id && track.id !== "mcu";
    return <span key={track.id} className={`track-name ${muted ? "line-muted" : ""}`} style={{ left: Math.max(18, line.start * zoom - 14), top: line.y - 27, color: track.color }}>{track.label}</span>;
  })}</>;
}

function Connection({ fromId, toX, toY, color, active, zoom, dashed = false }: { fromId: string; toX: number; toY: number; color: string; active: boolean; zoom: number; dashed?: boolean }) {
  const from = ITEM_BY_ID.get(fromId);
  if (!from) return null;
  const fromX = xOf(from.releaseValue);
  const fromY = yOfTrack(from.trackId, zoom);
  return <path className={`branch-connector ${active ? "" : "line-muted"} ${dashed ? "is-dashed" : ""}`} stroke={color} d={`M ${fromX} ${fromY} C ${fromX + 160} ${fromY}, ${toX - 220} ${toY}, ${toX} ${toY}`}/>;
}

function MiniMap({ zoom, mapScroll, activeTrack, onNavigate }: { zoom: number; mapScroll: { left: number; top: number; width: number; height: number }; activeTrack: string; onNavigate: (ratio: number) => void }) {
  const left = Math.max(0, Math.min(100, (mapScroll.left / zoom / MAP_WIDTH) * 100));
  const width = Math.min(100, (mapScroll.width / zoom / MAP_WIDTH) * 100);
  return <div className="minimap" onPointerDown={(event) => { const rect = event.currentTarget.getBoundingClientRect(); onNavigate((event.clientX - rect.left) / rect.width); }}>
    <span className="minimap-label">NAVEGADOR</span>
    <div className="minimap-lines">{TRACKS.map((track) => <i key={track.id} style={{ background: track.color, opacity: activeTrack === "all" || activeTrack === track.id ? .9 : .13 }}/>)}</div>
    <div className="minimap-window" style={{ left: `${left}%`, width: `${width}%` }}/>
  </div>;
}

function RouteTree({ itemId, onNavigate, visited = new Set(), depth = 0 }: { itemId: string; onNavigate: (id: string) => void; visited?: Set<string>; depth?: number }) {
  if (visited.has(itemId) || depth > 8) return null;
  const nextVisited = new Set(visited).add(itemId);
  const links = NARRATIVE_LINKS[itemId] || [];
  if (!links.length) return null;
  return <div className="route-tree" data-depth={depth}>{links.map((edge, index) => {
    const prerequisite = ITEM_BY_ID.get(edge.prerequisite);
    if (!prerequisite) return null;
    return <div className="tree-branch" key={`${itemId}-${edge.prerequisite}-${index}`}>
      <button onClick={() => onNavigate(prerequisite.id)} style={{ "--edge": CONNECTION_COLOR[edge.kind] } as React.CSSProperties}>
        <i/><img src={posterFor(prerequisite)} alt=""/><span><small>{CONNECTION_LABEL[edge.kind]}</small><strong>{prerequisite.title}</strong></span><Icon name="chevron" size={14}/>
      </button>
      <RouteTree itemId={prerequisite.id} onNavigate={onNavigate} visited={nextVisited} depth={depth + 1}/>
    </div>;
  })}</div>;
}

function DetailPanel({ item, watched, episodes, saved, ignored, favorite, rating, note, watchedDate, rewatchCount, customLists, onClose, onToggleWatched, onToggleEpisode, onToggleWatchlist, onToggleFavorite, onRate, onSaveNote, onWatchedDate, onRewatch, onAddToList, onIgnore, onNavigate, onShowRoute }: { item: MapItem; watched: boolean; episodes: number[]; saved: boolean; ignored: boolean; favorite: boolean; rating: number; note: string; watchedDate: string; rewatchCount: number; customLists: CustomList[]; onClose: () => void; onToggleWatched: () => void; onToggleEpisode: (episode: number) => void; onToggleWatchlist: () => void; onToggleFavorite: () => void; onRate: (rating: number) => void; onSaveNote: (note: string) => void; onWatchedDate: (date: string) => void; onRewatch: () => void; onAddToList: (listId: string) => void; onIgnore: () => void; onNavigate: (id: string) => void; onShowRoute: (includeContext: boolean) => void }) {
  const total = EPISODE_COUNTS[item.id] || 0;
  const track = TRACKS.find((entry) => entry.id === item.trackId)!;
  const metadata = TITLE_METADATA[item.id];
  const [showTree, setShowTree] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note);
  const [listChoice, setListChoice] = useState("");
  useEffect(() => { setShowTree(false); setNoteDraft(note); setListChoice(""); }, [item.id, note]);
  const runtime = metadata?.runtimeMinutes || RUNTIME_OVERRIDES[item.id];
  const episodeRuntime = metadata?.episodeRuntimeMinutes || EPISODE_RUNTIME_OVERRIDES[item.id];
  const characters = metadata?.mainCharacters?.length ? metadata.mainCharacters : (CHARACTER_OVERRIDES[item.id] || []);
  const directLinks = NARRATIVE_LINKS[item.id] || [];
  const postCredits = POST_CREDIT_COUNTS[item.id] ?? metadata?.postCredits;
  const seasons = SEASON_EPISODES[item.id] || (total ? [total] : []);
  let episodeOffset = 0;
  return <aside className="detail-panel">
    <button className="panel-close" onClick={onClose} aria-label="Cerrar"><Icon name="close"/></button>
    <div className="detail-visual"><img className="detail-artwork" src={artworkFor(item)} alt=""/><img className="detail-poster" src={posterFor(item, "full")} alt={`Póster de ${item.title}`}/><div className="poster-shade"/></div>
    <div className="detail-body">
      <div className="branch-pill" style={{ "--branch": track.color } as React.CSSProperties}><i/>{track.label}</div>
      <TitleHeading item={item} placement="detail"/>
      <p className="detail-meta">{item.date}<span/> {TYPE_LABEL[item.type]}{item.phase ? <><span/>{item.phase}</> : null}</p>
      {item.saga && <p className="saga-name">{item.saga}</p>}
      {item.upcoming ? <div className="upcoming-note">Próximamente · todavía no cuenta para tu progreso</div> : <button className={`watch-button ${watched ? "is-watched" : ""}`} onClick={onToggleWatched}><Icon name={watched ? "check" : "film"}/>{watched ? "Completada" : total ? "Completar temporada" : "Marcar como vista"}</button>}
      <div className="detail-secondary-actions"><button className={saved ? "saved" : ""} onClick={onToggleWatchlist}><Icon name="bookmark"/>{saved ? "Guardada en Mi lista" : "Guardar en Mi lista"}</button><button className={ignored ? "ignored" : ""} onClick={onIgnore}><Icon name={ignored ? "check" : "close"}/>{ignored ? "Volver a recomendar" : "No me interesa"}</button></div>

      <section className="personal-title-tools">
        <div className="favorite-rating"><button className={favorite ? "favorite active" : "favorite"} onClick={onToggleFavorite}><Icon name="star"/>{favorite ? "Favorita" : "Añadir a favoritos"}</button><div className="rating-stars" aria-label="Calificación">{[1,2,3,4,5].map((value) => <button key={value} className={value <= rating ? "active" : ""} onClick={() => onRate(value)} aria-label={`${value} estrellas`}><Icon name="star" size={16}/></button>)}</div></div>
        <div className="personal-row"><label><span>Fecha vista</span><input type="date" value={watchedDate} onChange={(event) => onWatchedDate(event.target.value)}/></label><button onClick={onRewatch}><Icon name="shuffle"/>Registrar repetición{rewatchCount ? ` · ${rewatchCount}` : ""}</button></div>
        {customLists.length > 0 && <div className="add-list-row"><select value={listChoice} onChange={(event) => setListChoice(event.target.value)}><option value="">Añadir a una lista…</option>{customLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select><button disabled={!listChoice} onClick={() => { onAddToList(listChoice); setListChoice(""); }}><Icon name="plus"/>Añadir</button></div>}
        <label className="note-editor"><span><Icon name="note" size={14}/>Notas personales</span><textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} onBlur={() => onSaveNote(noteDraft)} placeholder="Qué te pareció, qué recordar para después…"/><small>Se guarda al salir del campo.</small></label>
      </section>

      {metadata?.synopsis && <section className="metadata-section synopsis-section"><span className="detail-kicker">Sin spoilers</span><h3>De qué trata</h3><p className="synopsis-copy">{metadata.synopsis}</p></section>}

      {directLinks.length > 0 && <section className="metadata-section requirements-section">
        <span className="detail-kicker">Antes de verla</span><h3>Conexiones necesarias</h3>
        <p className="section-intro">Solo se muestran los vínculos directos. Abre uno para profundizar sin saturar el mapa.</p>
        <div className="requirement-list">{directLinks.map((edge, index) => {
          const prerequisite = ITEM_BY_ID.get(edge.prerequisite);
          if (!prerequisite) return null;
          return <button className="requirement-card" key={`${edge.prerequisite}-${index}`} onClick={() => onNavigate(prerequisite.id)} style={{ "--edge": CONNECTION_COLOR[edge.kind] } as React.CSSProperties}>
            <img src={posterFor(prerequisite)} alt=""/><span><small>{CONNECTION_LABEL[edge.kind]}</small><strong>{prerequisite.title}</strong><p>{edge.reason}</p></span><Icon name="chevron" size={15}/>
          </button>;
        })}</div>
        <div className="route-actions"><button onClick={() => onShowRoute(false)}><Icon name="target"/>Ruta esencial</button><button onClick={() => onShowRoute(true)}><Icon name="route"/>Ruta con contexto</button><button className={showTree ? "active" : ""} onClick={() => setShowTree((value) => !value)}><Icon name="chevron"/>{showTree ? "Ocultar árbol" : "Desplegar árbol"}</button></div>
        {showTree && <RouteTree itemId={item.id} onNavigate={onNavigate}/>} 
      </section>}

      {total > 0 && <section className="episodes-section">
        <div className="episode-heading"><div><span>Progreso de la serie</span><strong>{episodes.length}/{total} capítulos</strong></div><b>{Math.round((episodes.length / total) * 100)}%</b></div>
        <div className="episode-progress"><i style={{ width: `${(episodes.length / total) * 100}%` }}/></div>
        <div className="seasons-list">{seasons.map((seasonTotal, seasonIndex) => {
          const start = episodeOffset;
          episodeOffset += seasonTotal;
          const titleSeasonMatch = item.title.match(/T(\d+)/i);
          const seasonNumber = seasons.length === 1 && titleSeasonMatch ? Number(titleSeasonMatch[1]) : seasonIndex + 1;
          const seasonDone = Array.from({ length: seasonTotal }, (_, index) => start + index + 1).filter((episode) => episodes.includes(episode)).length;
          return <div className="season-block" key={seasonIndex}><div className="season-heading"><strong>Temporada {seasonNumber}</strong><span>{seasonDone}/{seasonTotal}</span></div><div className="episode-grid">{Array.from({ length: seasonTotal }, (_, index) => {
            const episode = start + index + 1;
            const duration = metadata?.episodeDurations?.[episode - 1] || episodeRuntime;
            return <button key={episode} className={episodes.includes(episode) ? "complete" : ""} onClick={() => onToggleEpisode(episode)}><span>{episodes.includes(episode) ? <Icon name="check" size={14}/> : index + 1}</span><small>EP {String(index + 1).padStart(2, "0")}{duration ? ` · ${duration}m` : ""}</small></button>;
          })}</div></div>;
        })}</div>
      </section>}

      <section className="metadata-section information-section"><span className="detail-kicker">Ficha completa</span><h3>Información</h3>
        <div className="detail-facts"><div><span>Año</span><strong>{Math.floor(item.releaseValue)}</strong></div><div><span>Duración</span><strong>{total ? (episodeRuntime ? `${episodeRuntime} min/ep.` : "Variable") : runtime ? formatMinutes(runtime) : "Por confirmar"}</strong></div><div><span>Poscréditos</span><strong>{postCredits == null ? "No registrado" : postCredits === 0 ? "Ninguna" : `${postCredits} escena${postCredits === 1 ? "" : "s"}`}</strong></div><div><span>Estado</span><strong>{item.upcoming ? "Próxima" : watched ? "Vista" : "Pendiente"}</strong></div></div>
        {characters.length > 0 && <div className="metadata-group"><h4>Personajes principales</h4><div className="metadata-chips">{characters.slice(0, 10).map((character) => <span key={character}>{character}</span>)}</div></div>}
        {metadata?.platforms?.length > 0 && <div className="metadata-group"><h4>Plataforma o canal registrado</h4><div className="metadata-chips platforms">{metadata.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div><small className="regional-note">La disponibilidad puede cambiar según el catálogo de Perú.</small></div>}
        {metadata?.contentWarnings?.length > 0 && <div className="metadata-group"><h4>Avisos de contenido</h4><div className="metadata-chips warnings">{metadata.contentWarnings.map((warning) => <span key={warning}>{warning}</span>)}</div></div>}
        {metadata && <div className="external-actions"><a className="trailer-button" href={metadata.trailerUrl} target="_blank" rel="noreferrer"><Icon name="film"/>Buscar tráiler oficial</a><a className="source-link" href={metadata.sourceUrl} target="_blank" rel="noreferrer">Fuente: {metadata.sourceLabel}<Icon name="chevron" size={13}/></a></div>}
      </section>
    </div>
  </aside>;
}
