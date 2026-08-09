import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EPISODE_COUNTS, MCU_ITEMS, POSTER_BY_WIKI, type MCUItem } from "../app/mcu-data";
import { TITLE_METADATA } from "../app/mcu-metadata";
import { BACKDROP_BY_ID } from "../app/backdrop-data";
import { TITLE_LOGO_BY_ID } from "../app/title-logo-data";
import {
  CHARACTER_OVERRIDES,
  CORE_STORY_IDS,
  EPISODE_RUNTIME_OVERRIDES,
  INTERNAL_ORDER_IDS,
  NARRATIVE_LINKS,
  POST_CREDIT_COUNTS,
  RUNTIME_OVERRIDES,
  SEASON_EPISODES,
  type ConnectionKind,
  type NarrativeLink,
} from "../app/narrative-data";
import { CloudWorkspace } from "../app/cloud/cloud-workspace";
import { getSupabase } from "../app/cloud/supabase";
import { DiscoveryHub, type DiscoveryItem } from "../app/features/discovery-hub";
import { decodeMarathonCode, encodeMarathonCode } from "../app/features/marathon-code";
import { achievementArtFor } from "../app/features/achievement-art";

type EpisodeState = Record<string, number[]>;
type MapItem = MCUItem & { releaseValue: number; trackId: string; order: number };
type AppView =
  | "dashboard"
  | "map"
  | "list"
  | "routes"
  | "planner"
  | "explore"
  | "calendar"
  | "achievements"
  | "profiles";
type Intent = "chronological" | "movies" | "series" | "short" | "new-line" | "random";
type Recommendation = { item: MapItem; reason: string };
type IconName =
  | "search"
  | "target"
  | "minus"
  | "plus"
  | "fit"
  | "check"
  | "film"
  | "route"
  | "download"
  | "upload"
  | "close"
  | "chevron"
  | "home"
  | "bookmark"
  | "eye"
  | "shuffle"
  | "clock"
  | "spark"
  | "bar"
  | "calendar"
  | "user"
  | "star"
  | "note"
  | "bell"
  | "settings"
  | "trophy"
  | "share"
  | "grip";
type ActivityEvent = {
  id: string;
  at: number;
  action: "watched" | "unwatched" | "episode" | "rewatch" | "rating" | "note" | "undo";
};
type CustomList = { id: string; name: string; color: string; items: string[] };
type Profile = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  child: boolean;
  guest?: boolean;
};
type SharedMarathon = {
  version: 1;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  author: string;
  tasks: Array<{ itemId: string; episode?: number }>;
  coverIds: string[];
};
type SequenceMapData = {
  id: string;
  title: string;
  subtitle: string;
  tasks: SharedMarathon["tasks"];
  kind: "marathon" | "era" | "journey" | "route";
};
type Preferences = {
  accent: "red" | "violet" | "cyan";
  intensity: number;
  density: "comfortable" | "compact";
  cardSize: "small" | "medium" | "large";
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  achievements: boolean;
};
type AchievementTier = "Bronce" | "Plata" | "Oro" | "Vibranium" | "Diamante";
type AchievementRecord = {
  id: string;
  version: number;
  unlockedAt: string;
  progressSnapshot: { completedIds: string[]; requiredIds: string[] };
};
type Achievement = {
  id: string;
  version: number;
  title: string;
  description: string;
  icon: IconName;
  tier: AchievementTier;
  unlocked: boolean;
  progress: number;
  current: number;
  goal: number;
  requiredIds: string[];
  completedIds: string[];
  coverId?: string;
  unlockedAt?: string;
};
type ToastState = { message: string; actionLabel?: string; onAction?: () => void };
type DetailPanelMode = "full" | "compact";
type GlobalHit = {
  key: string;
  item: MapItem;
  episode?: number;
  category: "Título" | "Capítulo" | "Personaje" | "Universo" | "Conexión" | "Maratón";
  context: string;
  sequence?: SequenceMapData;
};

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
const ACHIEVEMENT_RECORDS_KEY = "nexus-desktop-achievement-records-v1";
const DEFAULT_PREFERENCES: Preferences = {
  accent: "red",
  intensity: 82,
  density: "comfortable",
  cardSize: "medium",
  fontScale: 100,
  highContrast: false,
  reduceMotion: false,
  achievements: true,
};
const PROFILE_DATA_KEYS = [
  WATCHED_KEY,
  EPISODES_KEY,
  WATCHLIST_KEY,
  IGNORED_KEY,
  FAVORITE_TRACKS_KEY,
  INTENT_KEY,
  SPOILERS_KEY,
  ACTIVITY_KEY,
  RATINGS_KEY,
  FAVORITES_KEY,
  NOTES_KEY,
  WATCHED_DATES_KEY,
  REWATCHES_KEY,
  HISTORY_KEY,
  CUSTOM_LISTS_KEY,
  REMINDERS_KEY,
  MARATHON_KEY,
];
const YEAR_START = 1992;
const YEAR_END = 2028;
const MAP_LEFT = 250;
const MIN_ZOOM = 0.18;
const MAX_ZOOM = 1.35;

const MONTHS: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};
const TYPE_LABEL: Record<MCUItem["type"], string> = {
  movie: "Película",
  series: "Serie",
  animation: "Animación",
  special: "Especial",
};
const TYPE_COLOR: Record<MCUItem["type"], string> = {
  movie: "#ff5d66",
  series: "#a77bff",
  animation: "#39c9df",
  special: "#f2b84b",
};
const INTENTS: { id: Intent; label: string; hint: string }[] = [
  {
    id: "chronological",
    label: "Continuar cronológicamente",
    hint: "El siguiente estreno pendiente",
  },
  { id: "movies", label: "Solo películas", hint: "Sin temporadas ni capítulos" },
  { id: "series", label: "Solo series", hint: "Prioriza lo que ya empezaste" },
  { id: "short", label: "Algo corto", hint: "La menor duración estimada" },
  { id: "new-line", label: "Empezar una línea", hint: "Un universo todavía sin explorar" },
  { id: "random", label: "Elegir por mí", hint: "Una selección sorpresa" },
];

const TRACKS = [
  {
    id: "tobey",
    label: "Sony Pictures · Spider-Man de Sam Raimi",
    short: "Raimi",
    color: "#f24e86",
  },
  {
    id: "andrew",
    label: "Sony Pictures · The Amazing Spider-Man",
    short: "Amazing",
    color: "#9c70ff",
  },
  { id: "sony", label: "Sony’s Spider-Man Universe", short: "Sony", color: "#c757e7" },
  { id: "xmen", label: "20th Century · Universo X-Men", short: "X-Men", color: "#3b88ff" },
  {
    id: "fantastic",
    label: "Fantastic Four · Universos heredados",
    short: "Fantastic Four",
    color: "#ffb640",
  },
  { id: "other", label: "Marvel · Universos heredados", short: "Otros legados", color: "#ff793f" },
  {
    id: "defenders",
    label: "Marvel Television · The Defenders Saga",
    short: "Defenders",
    color: "#d94a42",
  },
  {
    id: "mcu",
    label: "Marvel Studios · Películas del UCM",
    short: "UCM películas",
    color: "#f24545",
  },
  {
    id: "series",
    label: "Marvel Studios · Series y especiales del UCM",
    short: "UCM series",
    color: "#58cf83",
  },
  {
    id: "animation",
    label: "Marvel Animation · Multiverso del UCM",
    short: "Marvel animado",
    color: "#25d0dd",
  },
  {
    id: "animation-xmen",
    label: "Marvel Animation · Legado de X-Men",
    short: "X-Men animado",
    color: "#6ca4ff",
  },
  {
    id: "animation-spider",
    label: "Spider-Man · universos animados",
    short: "Spider-Man animado",
    color: "#f05b8d",
  },
  {
    id: "animation-teams",
    label: "Marvel Animation · Héroes y equipos",
    short: "Equipos animados",
    color: "#f2a53a",
  },
  {
    id: "animation-films",
    label: "Marvel · Películas animadas",
    short: "Películas animadas",
    color: "#58cfb5",
  },
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
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    plus: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </>
    ),
    fit: (
      <>
        <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
        <path d="m3 8 5-5M21 8l-5-5M3 16l5 5M21 16l-5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    film: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    upload: (
      <>
        <path d="M12 21V9" />
        <path d="m7 14 5-5 5 5" />
        <path d="M5 3h14" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    shuffle: (
      <>
        <path d="M3 7h3c5 0 5 10 10 10h5" />
        <path d="m18 14 3 3-3 3M3 17h3c2 0 3-.7 4-2M14 7c.7 0 1.3 0 2 0h5M18 4l3 3-3 3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z" />
        <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" />
      </>
    ),
    bar: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />,
    note: (
      <>
        <path d="M5 3h14v18H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 4h8v5a4 4 0 0 1-8 0zM10 17h4M12 13v4M8 21h8" />
        <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
      </>
    ),
    grip: (
      <>
        <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
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

const ITEMS: MapItem[] = MCU_ITEMS.map((item, order) => ({
  ...item,
  order,
  releaseValue: releaseOf(item),
  trackId: trackOf(item),
})).sort((a, b) => a.releaseValue - b.releaseValue || a.order - b.order);
const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
const INTERNAL_ORDER_RANK = new Map(INTERNAL_ORDER_IDS.map((id, index) => [id, index]));
const CONNECTION_LABEL: Record<ConnectionKind, string> = {
  essential: "Esencial",
  recommended: "Recomendada",
  reference: "Referencia",
  variant: "Variante",
  shared: "Universo compartido",
  "time-travel": "Viaje temporal",
};
const CONNECTION_COLOR: Record<ConnectionKind, string> = {
  essential: "#ff5b61",
  recommended: "#ffb64a",
  reference: "#75a7ff",
  variant: "#b77cff",
  shared: "#57cfb0",
  "time-travel": "#57d5e3",
};

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
  const peakTrackDensity = Math.max(
    0,
    ...TRACKS.map((track) => inYear.filter((item) => item.trackId === track.id).length),
  );
  const width =
    inYear.length === 0
      ? 64
      : Math.min(
          300,
          108 + Math.max(0, peakTrackDensity - 1) * 38 + Math.max(0, inYear.length - 4) * 8,
        );
  YEAR_STARTS.set(year, elasticCursor);
  YEAR_WIDTHS.set(year, width);
  elasticCursor += width;
}
const MAP_WIDTH = elasticCursor + 330;
const xOf = (release: number) => {
  const year = Math.max(YEAR_START, Math.min(YEAR_END, Math.floor(release)));
  const fraction = Math.max(0, Math.min(0.999, release - year));
  return (YEAR_STARTS.get(year) || MAP_LEFT) + fraction * (YEAR_WIDTHS.get(year) || 100);
};
const KEY_IDS = new Set(["no-way-home", "deadpool-wolverine", "endgame", "iron-man", "doomsday"]);

function verticalMetrics(zoom: number) {
  if (zoom < 0.38) return { top: 110, gap: 72, height: 110 * 2 + (TRACKS.length - 1) * 72 };
  if (zoom < 0.78) return { top: 190, gap: 190, height: 190 * 2 + (TRACKS.length - 1) * 190 };
  return { top: 240, gap: 250, height: 240 * 2 + (TRACKS.length - 1) * 250 };
}

function yOfTrack(trackId: string, zoom: number) {
  const metrics = verticalMetrics(zoom);
  const index = Math.max(
    0,
    TRACKS.findIndex((track) => track.id === trackId),
  );
  return metrics.top + index * metrics.gap;
}
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function posterFor(item: MCUItem, size: "thumb" | "card" | "full" = "card") {
  const source = POSTER_BY_WIKI[item.wiki];
  if (!source) return "./icon-512.png";
  if (size === "full" || !source.startsWith("/posters/")) return `.${source}`;
  const base = source
    .split("/")
    .at(-1)
    ?.replace(/\.[^.]+$/, ".webp");
  return `./posters/${size}/${base}`;
}

function artworkFor(item?: MapItem | MCUItem | null, size: "card" | "hero" = "hero") {
  if (!item) return "./artwork/multiverse-hero-v1.webp";
  const backdrop = BACKDROP_BY_ID[item.id];
  if (backdrop) return `.${backdrop[size]}`;
  const track = trackOf(item);
  if (track.startsWith("animation")) return "./artwork/animation-hero-v1.webp";
  if (
    ["defenders", "tobey", "andrew", "sony"].includes(track) ||
    item.id.includes("daredevil") ||
    item.id.includes("spiderman")
  )
    return "./artwork/street-hero-v1.webp";
  if (
    [
      "guardians",
      "captain-marvel",
      "eternals",
      "fantastic-four",
      "doomsday",
      "secret-wars",
      "loki-1",
      "loki-2",
    ].some((id) => item.id.includes(id))
  )
    return "./artwork/cosmic-hero-v1.webp";
  return "./artwork/multiverse-hero-v1.webp";
}

function TitleHeading({
  item,
  placement,
}: {
  item: MapItem | MCUItem;
  placement: "hero" | "detail";
}) {
  const logo = TITLE_LOGO_BY_ID[item.id];
  return (
    <h2 className={`title-treatment title-treatment-${placement}${logo ? " has-logo" : ""}`}>
      {logo ? (
        <>
          <img src={`.${logo.src}`} alt="" />
          <span className="sr-only">{item.title}</span>
        </>
      ) : (
        item.title
      )}
    </h2>
  );
}

function mediaStyle(item: MapItem | MCUItem) {
  return {
    "--type-color": TYPE_COLOR[item.type],
    "--track-color": trackForId(trackOf(item))?.color || "#7d8798",
  } as React.CSSProperties;
}

function estimatedMinutes(item: MapItem, watched: Set<string>, episodes: EpisodeState): number {
  if (watched.has(item.id)) return 0;
  const total = EPISODE_COUNTS[item.id] || 0;
  const metadata = TITLE_METADATA[item.id];
  if (total) {
    const completed = new Set(episodes[item.id] || []);
    if (metadata?.episodeDurations?.length)
      return metadata.episodeDurations.reduce<number>(
        (sum, duration, index) =>
          sum +
          (completed.has(index + 1)
            ? 0
            : (duration ??
              metadata.episodeRuntimeMinutes ??
              EPISODE_RUNTIME_OVERRIDES[item.id] ??
              (item.type === "animation" ? 24 : 42))),
        0,
      );
    const remaining = Math.max(0, total - completed.size);
    return (
      remaining *
      (metadata?.episodeRuntimeMinutes ||
        EPISODE_RUNTIME_OVERRIDES[item.id] ||
        (item.type === "animation" ? 24 : 42))
    );
  }
  return (
    metadata?.runtimeMinutes ||
    RUNTIME_OVERRIDES[item.id] ||
    (item.type === "special" ? 50 : item.type === "animation" ? 86 : 122)
  );
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
  for (let index = 0; index < value.length; index += 1)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
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
    if (titleMatch)
      hits.push({
        key: `title-${item.id}`,
        item,
        category: "Título",
        context: `${TYPE_LABEL[item.type]} · ${item.date}`,
      });
    const character = [
      ...(metadata?.mainCharacters || []),
      ...(CHARACTER_OVERRIDES[item.id] || []),
    ].find((name) => normalize(name).includes(query));
    if (character)
      hits.push({
        key: `character-${item.id}-${character}`,
        item,
        category: "Personaje",
        context: `${character} aparece en ${item.title}`,
      });
    const universe = [item.saga, item.phase, track?.label, track?.short].find(
      (value) => value && normalize(value).includes(query),
    );
    if (universe && !titleMatch)
      hits.push({
        key: `universe-${item.id}`,
        item,
        category: "Universo",
        context: String(universe),
      });
    const connection = (NARRATIVE_LINKS[item.id] || []).find(
      (edge) =>
        normalize(edge.reason).includes(query) ||
        normalize(CONNECTION_LABEL[edge.kind]).includes(query),
    );
    if (connection)
      hits.push({
        key: `connection-${item.id}-${connection.prerequisite}`,
        item,
        category: "Conexión",
        context: connection.reason,
      });
    const episodeMatch = rawQuery.match(/(?:cap(?:í|i)tulo|episodio|ep)\s*(\d+)/i);
    const total = EPISODE_COUNTS[item.id] || 0;
    const episode = episodeMatch ? Number(episodeMatch[1]) : 0;
    if (
      episode > 0 &&
      episode <= total &&
      (titleMatch ||
        normalize(track?.short || "").includes(
          query.replace(/(?:cap(?:í|i)tulo|episodio|ep)\s*\d+/i, "").trim(),
        ))
    )
      hits.push({
        key: `episode-${item.id}-${episode}`,
        item,
        episode,
        category: "Capítulo",
        context: `${item.title} · Capítulo ${episode}`,
      });
  }
  const categoryRank: Record<GlobalHit["category"], number> = {
    Maratón: 0,
    Título: 1,
    Capítulo: 2,
    Personaje: 3,
    Universo: 4,
    Conexión: 5,
  };
  return hits
    .sort(
      (a, b) =>
        categoryRank[a.category] - categoryRank[b.category] ||
        a.item.releaseValue - b.item.releaseValue,
    )
    .slice(0, 24);
}

const CONNECTION_REASON: Record<string, string> = {
  "spiderman-raimi-1": "Prepara la convergencia con Spider-Man: No Way Home",
  "spiderman-raimi-2": "Continúa la historia de Tobey antes de No Way Home",
  "spiderman-raimi-3": "Conecta con Spider-Man: No Way Home",
  "amazing-spiderman": "Prepara la convergencia con Spider-Man: No Way Home",
  "amazing-spiderman-2": "Conecta con Spider-Man: No Way Home",
  "xmen-last-stand": "Forma parte del recorrido que converge en Deadpool & Wolverine",
  logan: "Contexto recomendado antes de Deadpool & Wolverine",
};

function useStoredProgress() {
  const [watched, setWatched] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [episodes, setEpisodes] = useState<EpisodeState>(() => {
    try {
      return JSON.parse(localStorage.getItem(EPISODES_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [ignored, setIgnored] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(IGNORED_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [favoriteTracks, setFavoriteTracks] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITE_TRACKS_KEY) || '["mcu","series"]'));
    } catch {
      return new Set(["mcu", "series"]);
    }
  });
  const [intent, setIntent] = useState<Intent>(
    () => (localStorage.getItem(INTENT_KEY) as Intent) || "chronological",
  );
  const [spoilerSafe, setSpoilerSafe] = useState(
    () => localStorage.getItem(SPOILERS_KEY) !== "false",
  );
  const [activity, setActivity] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [watchedDates, setWatchedDates] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHED_DATES_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [rewatches, setRewatches] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(REWATCHES_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [history, setHistory] = useState<ActivityEvent[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [customLists, setCustomLists] = useState<CustomList[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_LISTS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    const reloadCloudSnapshot = () => {
      try {
        setWatched(new Set(JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]")));
      } catch {
        setWatched(new Set());
      }
      try {
        setEpisodes(JSON.parse(localStorage.getItem(EPISODES_KEY) || "{}"));
      } catch {
        setEpisodes({});
      }
      try {
        setWatchlist(new Set(JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]")));
      } catch {
        setWatchlist(new Set());
      }
      try {
        setIgnored(new Set(JSON.parse(localStorage.getItem(IGNORED_KEY) || "[]")));
      } catch {
        setIgnored(new Set());
      }
      try {
        setFavoriteTracks(new Set(JSON.parse(localStorage.getItem(FAVORITE_TRACKS_KEY) || "[]")));
      } catch {
        setFavoriteTracks(new Set());
      }
      setIntent((localStorage.getItem(INTENT_KEY) as Intent) || "chronological");
      setSpoilerSafe(localStorage.getItem(SPOILERS_KEY) !== "false");
      try {
        setActivity(JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "{}"));
      } catch {
        setActivity({});
      }
      try {
        setRatings(JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"));
      } catch {
        setRatings({});
      }
      try {
        setFavorites(new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")));
      } catch {
        setFavorites(new Set());
      }
      try {
        setNotes(JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"));
      } catch {
        setNotes({});
      }
      try {
        setWatchedDates(JSON.parse(localStorage.getItem(WATCHED_DATES_KEY) || "{}"));
      } catch {
        setWatchedDates({});
      }
      try {
        setRewatches(JSON.parse(localStorage.getItem(REWATCHES_KEY) || "{}"));
      } catch {
        setRewatches({});
      }
      try {
        setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
      } catch {
        setHistory([]);
      }
      try {
        setCustomLists(JSON.parse(localStorage.getItem(CUSTOM_LISTS_KEY) || "[]"));
      } catch {
        setCustomLists([]);
      }
    };
    window.addEventListener("nexus:snapshot-applied", reloadCloudSnapshot);
    return () => window.removeEventListener("nexus:snapshot-applied", reloadCloudSnapshot);
  }, []);
  useEffect(() => localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched])), [watched]);
  useEffect(() => localStorage.setItem(EPISODES_KEY, JSON.stringify(episodes)), [episodes]);
  useEffect(() => localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...watchlist])), [watchlist]);
  useEffect(() => localStorage.setItem(IGNORED_KEY, JSON.stringify([...ignored])), [ignored]);
  useEffect(
    () => localStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify([...favoriteTracks])),
    [favoriteTracks],
  );
  useEffect(() => localStorage.setItem(INTENT_KEY, intent), [intent]);
  useEffect(() => localStorage.setItem(SPOILERS_KEY, String(spoilerSafe)), [spoilerSafe]);
  useEffect(() => localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)), [activity]);
  useEffect(() => localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings)), [ratings]);
  useEffect(() => localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])), [favorites]);
  useEffect(() => localStorage.setItem(NOTES_KEY, JSON.stringify(notes)), [notes]);
  useEffect(
    () => localStorage.setItem(WATCHED_DATES_KEY, JSON.stringify(watchedDates)),
    [watchedDates],
  );
  useEffect(() => localStorage.setItem(REWATCHES_KEY, JSON.stringify(rewatches)), [rewatches]);
  useEffect(
    () => localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-500))),
    [history],
  );
  useEffect(
    () => localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(customLists)),
    [customLists],
  );
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nexus:local-change", { detail: { kind: "progress" } }));
  }, [
    watched,
    episodes,
    watchlist,
    ignored,
    favoriteTracks,
    intent,
    spoilerSafe,
    activity,
    ratings,
    favorites,
    notes,
    watchedDates,
    rewatches,
    history,
    customLists,
  ]);
  return {
    watched,
    setWatched,
    episodes,
    setEpisodes,
    watchlist,
    setWatchlist,
    ignored,
    setIgnored,
    favoriteTracks,
    setFavoriteTracks,
    intent,
    setIntent,
    spoilerSafe,
    setSpoilerSafe,
    activity,
    setActivity,
    ratings,
    setRatings,
    favorites,
    setFavorites,
    notes,
    setNotes,
    watchedDates,
    setWatchedDates,
    rewatches,
    setRewatches,
    history,
    setHistory,
    customLists,
    setCustomLists,
  };
}

function readStoredMarathons(): SharedMarathon[] {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((entry): entry is SharedMarathon =>
          Boolean(entry?.id && entry?.name && Array.isArray(entry?.tasks)),
        )
      : [];
  } catch {
    return [];
  }
}

function useStoredMarathons() {
  const [marathons, setMarathons] = useState<SharedMarathon[]>(readStoredMarathons);
  const firstWrite = useRef(true);
  useEffect(() => {
    localStorage.setItem(CUSTOM_MARATHONS_KEY, JSON.stringify(marathons));
    if (firstWrite.current) {
      firstWrite.current = false;
      return;
    }
    window.dispatchEvent(new CustomEvent("nexus:local-change", { detail: { kind: "marathons" } }));
  }, [marathons]);
  useEffect(() => {
    const reload = () => setMarathons(readStoredMarathons());
    window.addEventListener("nexus:snapshot-applied", reload);
    return () => window.removeEventListener("nexus:snapshot-applied", reload);
  }, []);
  return { marathons, setMarathons };
}

export function App() {
  const {
    watched,
    setWatched,
    episodes,
    setEpisodes,
    watchlist,
    setWatchlist,
    ignored,
    setIgnored,
    favoriteTracks,
    setFavoriteTracks,
    intent,
    setIntent,
    spoilerSafe,
    setSpoilerSafe,
    activity,
    setActivity,
    ratings,
    setRatings,
    favorites,
    setFavorites,
    notes,
    setNotes,
    watchedDates,
    setWatchedDates,
    rewatches,
    setRewatches,
    history,
    setHistory,
    customLists,
    setCustomLists,
  } = useStoredProgress();
  const { marathons, setMarathons } = useStoredMarathons();
  const [view, setView] = useState<AppView>("dashboard");
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [activeTrack, setActiveTrack] = useState("all");
  const [query, setQuery] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [globalIndex, setGlobalIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailPanelMode>("full");
  const [detailPinned, setDetailPinned] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "{}");
      return {
        ...DEFAULT_PREFERENCES,
        ...stored,
        achievements: true,
        fontScale: Math.max(100, Math.min(135, Number(stored.fontScale) || 100)),
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });
  const [zoom, setZoom] = useState(0.46);
  const [mapScroll, setMapScroll] = useState({ left: 0, top: 0, width: 1, height: 1 });
  const [dragging, setDragging] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [achievementRecords, setAchievementRecords] = useState<Record<string, AchievementRecord>>(
    () => {
      try {
        return JSON.parse(localStorage.getItem(ACHIEVEMENT_RECORDS_KEY) || "{}");
      } catch {
        return {};
      }
    },
  );
  const [achievementActivityVersion, setAchievementActivityVersion] = useState(0);
  const [randomSeed, setRandomSeed] = useState(0);
  const [pendingMapItem, setPendingMapItem] = useState<MapItem | null>(null);
  const [routeFocus, setRouteFocus] = useState<Set<string>>(new Set());
  const [routeTarget, setRouteTarget] = useState<MapItem | null>(null);
  const [sequenceMap, setSequenceMap] = useState<SequenceMapData | null>(null);
  const [editingMarathonId, setEditingMarathonId] = useState<string | null>(null);
  const [libraryInitialTab, setLibraryInitialTab] = useState<"saved" | "marathons">("saved");
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
      if (stored.length) return stored;
    } catch {
      /* usa el perfil inicial */
    }
    return [{ id: "principal", name: "Marco", avatar: "M", color: "#f2454b", child: false }];
  });
  const [activeProfileId, setActiveProfileId] = useState(
    () => localStorage.getItem(ACTIVE_PROFILE_KEY) || "principal",
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const mapInitializedRef = useRef(false);
  const dragRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const toastTimer = useRef<number | null>(null);
  const zoomTimer = useRef<number | null>(null);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) || profiles[0];
  const globalHits = useMemo(() => {
    const regular = globalHitsFor(globalQuery).filter(
      (hit) =>
        !spoilerSafe ||
        watched.has(hit.item.id) ||
        !ITEMS.some(
          (entry) =>
            entry.trackId === hit.item.trackId &&
            !entry.upcoming &&
            !watched.has(entry.id) &&
            entry.releaseValue < hit.item.releaseValue,
        ),
    );
    if (globalQuery.trim().length < 2) return regular;
    const marathonHits: GlobalHit[] = marathons
      .filter((marathon) =>
        normalize(`${marathon.name} ${marathon.description} ${marathon.author}`).includes(
          normalize(globalQuery),
        ),
      )
      .flatMap((marathon): GlobalHit[] => {
        const item = marathon.tasks
          .map((task) => ITEM_BY_ID.get(task.itemId))
          .find((entry): entry is MapItem => Boolean(entry));
        if (!item) return [];
        return [
          {
            key: `marathon-${marathon.id}`,
            item,
            category: "Maratón",
            context: `${marathon.tasks.length} sesiones · ${marathon.author}`,
            sequence: {
              id: marathon.id,
              title: marathon.name,
              subtitle: `${marathon.tasks.length} sesiones · ${marathon.author}`,
              tasks: marathon.tasks,
              kind: "marathon",
            },
          },
        ];
      });
    return [...marathonHits, ...regular].slice(0, 24);
  }, [globalQuery, marathons, spoilerSafe, watched]);

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles]);
  useEffect(() => {
    localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
  }, [activeProfileId]);
  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    const root = document.documentElement;
    root.dataset.accent = preferences.accent;
    root.dataset.density = preferences.density;
    root.dataset.cardSize = preferences.cardSize;
    root.dataset.contrast = preferences.highContrast ? "high" : "normal";
    root.dataset.motion = preferences.reduceMotion ? "reduced" : "full";
    root.dataset.nexusTheme = spoilerSafe ? "time" : "incursion";
    root.style.setProperty("--font-scale", String(preferences.fontScale / 100));
    root.style.setProperty("--accent-intensity", String(preferences.intensity / 100));
    root.style.setProperty("--accent-weight", `${Math.round(preferences.intensity / 5)}%`);
    root.style.setProperty("--theme-saturation", String(0.72 + preferences.intensity / 180));
    window.dispatchEvent(
      new CustomEvent("nexus:local-change", { detail: { kind: "preferences" } }),
    );
  }, [preferences, spoilerSafe]);
  useEffect(() => {
    const openCloud = () => setCloudOpen(true);
    const openAchievements = () => {
      setSelected(null);
      setView("achievements");
    };
    const refreshAchievements = (event: Event) => {
      if ((event as CustomEvent<{ kind?: string }>).detail?.kind === "achievement")
        setAchievementActivityVersion((value) => value + 1);
    };
    window.addEventListener("nexus:open-cloud", openCloud);
    window.addEventListener("nexus:open-achievements", openAchievements);
    window.addEventListener("nexus:local-change", refreshAchievements);
    if (localStorage.getItem("nexus-cloud-pending-invite-v1")) setCloudOpen(true);
    return () => {
      window.removeEventListener("nexus:open-cloud", openCloud);
      window.removeEventListener("nexus:open-achievements", openAchievements);
      window.removeEventListener("nexus:local-change", refreshAchievements);
    };
  }, []);
  useEffect(() => {
    if (window.nexusDesktop || !("serviceWorker" in navigator)) return;
    const localDevelopment = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (localDevelopment) {
      // A PWA worker must never cache Next's development chunks: after HMR the
      // old module graph can hydrate but stop responding on the first state update.
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        );
      if ("caches" in window)
        void caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys.filter((key) => key.startsWith("nexus-")).map((key) => caches.delete(key)),
            ),
          );
      return;
    }
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  useEffect(() => {
    const prefix = `nexus-profile-${activeProfileId}-`;
    const values: Record<string, unknown> = {
      [WATCHED_KEY]: [...watched],
      [EPISODES_KEY]: episodes,
      [WATCHLIST_KEY]: [...watchlist],
      [IGNORED_KEY]: [...ignored],
      [FAVORITE_TRACKS_KEY]: [...favoriteTracks],
      [INTENT_KEY]: intent,
      [SPOILERS_KEY]: spoilerSafe,
      [ACTIVITY_KEY]: activity,
      [RATINGS_KEY]: ratings,
      [FAVORITES_KEY]: [...favorites],
      [NOTES_KEY]: notes,
      [WATCHED_DATES_KEY]: watchedDates,
      [REWATCHES_KEY]: rewatches,
      [HISTORY_KEY]: history.slice(-500),
      [CUSTOM_LISTS_KEY]: customLists,
    };
    Object.entries(values).forEach(([key, value]) =>
      localStorage.setItem(
        `${prefix}${key}`,
        typeof value === "string" ? value : JSON.stringify(value),
      ),
    );
  }, [
    activeProfileId,
    activity,
    customLists,
    episodes,
    favoriteTracks,
    favorites,
    history,
    ignored,
    intent,
    notes,
    ratings,
    rewatches,
    spoilerSafe,
    watched,
    watchedDates,
    watchlist,
  ]);

  const releasedItems = useMemo(() => ITEMS.filter((item) => !item.upcoming), []);
  const completedCount = releasedItems.filter((item) => watched.has(item.id)).length;
  const percent = Math.round((completedCount / releasedItems.length) * 100);
  const searchResults = useMemo(
    () =>
      query.trim()
        ? ITEMS.filter(
            (item) =>
              normalize(item.title).includes(normalize(query)) &&
              (!spoilerSafe ||
                watched.has(item.id) ||
                !ITEMS.some(
                  (entry) =>
                    entry.trackId === item.trackId &&
                    !entry.upcoming &&
                    !watched.has(entry.id) &&
                    entry.releaseValue < item.releaseValue,
                )),
          ).slice(0, 7)
        : [],
    [query, spoilerSafe, watched],
  );
  const mapHeight = verticalMetrics(zoom).height;
  const selectedTrackIds = useMemo(
    () => (favoriteTracks.size ? favoriteTracks : new Set(TRACKS.map((track) => track.id))),
    [favoriteTracks],
  );
  const eligibleItems = useMemo(
    () =>
      releasedItems.filter((item) => {
        const warnings = TITLE_METADATA[item.id]?.contentWarnings || [];
        const childSafe =
          !activeProfile?.child ||
          !warnings.some((warning) =>
            /intensa|gráfica|adultos|lenguaje fuerte|terror|perturbadoras/i.test(warning),
          );
        const spoilerSafePosition =
          !spoilerSafe ||
          !releasedItems.some(
            (entry) =>
              entry.trackId === item.trackId &&
              !watched.has(entry.id) &&
              entry.releaseValue < item.releaseValue,
          );
        return (
          childSafe &&
          spoilerSafePosition &&
          selectedTrackIds.has(item.trackId) &&
          !ignored.has(item.id) &&
          !watched.has(item.id)
        );
      }),
    [activeProfile?.child, ignored, releasedItems, selectedTrackIds, spoilerSafe, watched],
  );
  const partialSeries = useMemo(
    () =>
      ITEMS.filter((item) => {
        const total = EPISODE_COUNTS[item.id] || 0;
        const done = episodes[item.id]?.length || 0;
        return total > 0 && done > 0 && done < total && !ignored.has(item.id);
      }).sort((a, b) => (activity[b.id] || 0) - (activity[a.id] || 0)),
    [activity, episodes, ignored],
  );
  const continueItem =
    partialSeries.find((item) => selectedTrackIds.has(item.trackId)) ||
    eligibleItems.find((item) => !EPISODE_COUNTS[item.id]) ||
    eligibleItems[0] ||
    null;
  const recommendations = useMemo<Recommendation[]>(() => {
    let candidates = [...eligibleItems];
    if (intent === "movies")
      candidates = candidates.filter((item) => !EPISODE_COUNTS[item.id] && item.type !== "special");
    if (intent === "series")
      candidates = candidates.filter((item) => Boolean(EPISODE_COUNTS[item.id]));
    if (intent === "short")
      candidates.sort(
        (a, b) =>
          estimatedMinutes(a, watched, episodes) - estimatedMinutes(b, watched, episodes) ||
          a.releaseValue - b.releaseValue,
      );
    else if (intent === "new-line") {
      const untouched = TRACKS.filter(
        (track) =>
          selectedTrackIds.has(track.id) &&
          !ITEMS.some((item) => item.trackId === track.id && watched.has(item.id)),
      );
      const untouchedIds = new Set<string>(untouched.map((track) => track.id));
      candidates = candidates.filter((item) => untouchedIds.has(item.trackId));
    } else if (intent === "random") {
      candidates.sort((a, b) => seededScore(a.id, randomSeed) - seededScore(b.id, randomSeed));
    } else candidates.sort((a, b) => a.releaseValue - b.releaseValue);

    const ordered: MapItem[] = [];
    if (intent !== "movies" && intent !== "new-line")
      partialSeries
        .filter((item) => selectedTrackIds.has(item.trackId))
        .forEach((item) => ordered.push(item));
    candidates.forEach((item) => {
      if (!ordered.some((entry) => entry.id === item.id)) ordered.push(item);
    });
    return ordered.slice(0, 8).map((item) => {
      const done = episodes[item.id]?.length || 0;
      const track = trackForId(item.trackId);
      let reason = spoilerSafe
        ? "Siguiente opción segura en tu recorrido"
        : CONNECTION_REASON[item.id] || `Pertenece a la línea ${track?.short || "Marvel"}`;
      if (done > 0 && done < (EPISODE_COUNTS[item.id] || 0)) reason = "Tienes esta serie empezada";
      else if (intent === "short")
        reason = `${formatMinutes(estimatedMinutes(item, watched, episodes))} estimados para completarla`;
      else if (intent === "chronological") reason = "Es la siguiente en la cronología seleccionada";
      else if (intent === "new-line")
        reason = `Buen punto de entrada a ${track?.short || "esta línea"}`;
      else if (intent === "random") reason = `Elegida al azar entre tus líneas favoritas`;
      return { item, reason };
    });
  }, [
    eligibleItems,
    intent,
    randomSeed,
    partialSeries,
    selectedTrackIds,
    spoilerSafe,
    watched,
    episodes,
  ]);

  const dailyRecommendation = useMemo(() => {
    const candidates = eligibleItems.length
      ? eligibleItems
      : releasedItems.filter((item) => !watched.has(item.id) && !ignored.has(item.id));
    if (!candidates.length) return null;
    const today = new Date();
    const seed = Number(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
    return candidates[seed % candidates.length];
  }, [eligibleItems, ignored, releasedItems, watched]);

  const stats = useMemo(() => {
    const episodeDone = Object.values(episodes).reduce((sum, values) => sum + values.length, 0);
    const seriesCompleted = releasedItems.filter(
      (item) => EPISODE_COUNTS[item.id] && watched.has(item.id),
    ).length;
    const moviesCompleted = releasedItems.filter(
      (item) => !EPISODE_COUNTS[item.id] && watched.has(item.id),
    ).length;
    const completedLines = TRACKS.filter((track) => {
      const entries = releasedItems.filter((item) => item.trackId === track.id);
      return entries.length > 0 && entries.every((item) => watched.has(item.id));
    }).length;
    const remainingMinutes = releasedItems.reduce(
      (sum, item) => sum + estimatedMinutes(item, watched, episodes),
      0,
    );
    const trackProgress = TRACKS.map((track) => {
      const entries = releasedItems.filter((item) => item.trackId === track.id);
      return {
        track,
        ratio: entries.length
          ? entries.filter((item) => watched.has(item.id)).length / entries.length
          : 0,
      };
    }).sort((a, b) => b.ratio - a.ratio);
    const lastId = Object.entries(activity).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      episodeDone,
      seriesCompleted,
      moviesCompleted,
      completedLines,
      remainingMinutes,
      bestTrack: trackProgress[0],
      lastItem: lastId ? ITEM_BY_ID.get(lastId) : null,
    };
  }, [activity, episodes, releasedItems, watched]);
  const legacyAchievements = useMemo(() => {
    let marathonCount = 0;
    try {
      marathonCount = JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY) || "[]").length;
    } catch {}
    const completedSeries = releasedItems.filter(
      (item) => Boolean(EPISODE_COUNTS[item.id]) && watched.has(item.id),
    ).length;
    const completedTracks = TRACKS.filter((track) => {
      const entries = releasedItems.filter((item) => item.trackId === track.id);
      return entries.length > 0 && entries.every((item) => watched.has(item.id));
    }).length;
    const phases = [...new Set(releasedItems.map((item) => item.phase).filter(Boolean))];
    const completedPhases = phases.filter((phase) =>
      releasedItems.filter((item) => item.phase === phase).every((item) => watched.has(item.id)),
    ).length;
    const sagas = [...new Set(releasedItems.map((item) => item.saga).filter(Boolean))];
    const completedSagas = sagas.filter((saga) =>
      releasedItems.filter((item) => item.saga === saga).every((item) => watched.has(item.id)),
    ).length;
    const ironJourney = [
      "iron-man",
      "iron-man-2",
      "avengers",
      "iron-man-3",
      "age-ultron",
      "civil-war",
      "infinity-war",
      "endgame",
    ].filter((id) => ITEM_BY_ID.has(id));
    const spiderJourney = [
      "spiderman-raimi-1",
      "spiderman-raimi-2",
      "spiderman-raimi-3",
      "no-way-home",
    ].filter((id) => ITEM_BY_ID.has(id));
    const journeyProgress = (ids: string[]) =>
      ids.filter((id) => watched.has(id)).length / Math.max(1, ids.length);
    const rated = Object.keys(ratings).length;
    return [
      {
        id: "first",
        title: "Primer salto",
        description: "Completa tu primer título",
        icon: "spark",
        unlocked: watched.size >= 1,
        progress: Math.min(1, watched.size),
      },
      {
        id: "ten",
        title: "En marcha",
        description: "Completa 10 títulos",
        icon: "film",
        unlocked: watched.size >= 10,
        progress: Math.min(1, watched.size / 10),
      },
      {
        id: "series",
        title: "Una temporada más",
        description: "Termina una serie",
        icon: "check",
        unlocked: completedSeries >= 1,
        progress: Math.min(1, completedSeries),
      },
      {
        id: "universe",
        title: "Universo conquistado",
        description: "Completa una línea entera",
        icon: "route",
        unlocked: completedTracks >= 1,
        progress: Math.min(1, completedTracks),
      },
      {
        id: "curator",
        title: "Curador",
        description: "Crea una lista personalizada",
        icon: "bookmark",
        unlocked: customLists.length >= 1,
        progress: Math.min(1, customLists.length),
      },
      {
        id: "architect",
        title: "Arquitecto del tiempo",
        description: "Guarda un maratón propio",
        icon: "calendar",
        unlocked: marathonCount >= 1,
        progress: Math.min(1, marathonCount),
      },
      {
        id: "critic",
        title: "Crítico del multiverso",
        description: "Califica cinco títulos",
        icon: "star",
        unlocked: rated >= 5,
        progress: Math.min(1, rated / 5),
      },
      {
        id: "fifty",
        title: "Viajero veterano",
        description: "Completa 50 títulos",
        icon: "trophy",
        unlocked: watched.size >= 50,
        progress: Math.min(1, watched.size / 50),
      },
      {
        id: "phase",
        title: "Fase completada",
        description: "Completa todas las historias de una fase del UCM",
        icon: "trophy",
        unlocked: completedPhases >= 1,
        progress: Math.min(1, completedPhases),
      },
      {
        id: "saga",
        title: "Guardián de sagas",
        description: "Completa una saga audiovisual",
        icon: "route",
        unlocked: completedSagas >= 1,
        progress: Math.min(1, completedSagas),
      },
      {
        id: "iron-journey",
        title: "Legado de hierro",
        description: "Completa el viaje esencial de Iron Man",
        icon: "spark",
        unlocked: journeyProgress(ironJourney) >= 1,
        progress: journeyProgress(ironJourney),
      },
      {
        id: "raimi-journey",
        title: "Un gran poder",
        description: "Completa el viaje de Spider-Man de Tobey",
        icon: "star",
        unlocked: journeyProgress(spiderJourney) >= 1,
        progress: journeyProgress(spiderJourney),
      },
    ];
  }, [customLists.length, ratings, releasedItems, watched]);
  void legacyAchievements;

  const achievements = useMemo<Achievement[]>(() => {
    let customMarathons: SharedMarathon[] = [];
    try {
      customMarathons = JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY) || "[]");
    } catch {}
    const marathonCount = customMarathons.length;
    const completedTracks = TRACKS.filter((track) => {
      const entries = releasedItems.filter((item) => item.trackId === track.id);
      return entries.length > 0 && entries.every((item) => watched.has(item.id));
    }).length;
    const phases = [...new Set(releasedItems.map((item) => item.phase).filter(Boolean))];
    const completedPhases = phases.filter((phase) =>
      releasedItems.filter((item) => item.phase === phase).every((item) => watched.has(item.id)),
    ).length;
    const rated = Object.keys(ratings).length;
    const rewatchTotal = Object.values(rewatches).reduce((sum, value) => sum + value, 0);
    const notesTotal = Object.values(notes).filter((value) => value.trim()).length;
    const marathonCodeUsed = localStorage.getItem("nexus-achievement-marathon-code-v1") === "true";
    const sharedMarathonComplete = customMarathons.some(
      (marathon) =>
        marathon.tasks.length > 0 &&
        marathon.tasks.every((task) =>
          task.episode
            ? (episodes[task.itemId] || []).includes(task.episode)
            : watched.has(task.itemId),
        ),
    );
    const spoilerSafeRouteComplete =
      spoilerSafe &&
      ["endgame", "no-way-home"].some((target) =>
        dependencyRoute(target, false).every((item) => watched.has(item.id)),
      );
    const releasedIds = releasedItems.map((item) => item.id);
    const trackIds = (trackId: string) =>
      releasedItems.filter((item) => item.trackId === trackId).map((item) => item.id);
    const validIds = (ids: string[]) =>
      ids.filter((id, index) => ITEM_BY_ID.has(id) && ids.indexOf(id) === index);
    const route = (
      id: string,
      title: string,
      description: string,
      ids: string[],
      tier: AchievementTier,
      icon: IconName = "route",
      version = 1,
    ): Achievement => {
      const requiredIds = validIds(ids);
      const completedIds = requiredIds.filter((entry) => watched.has(entry));
      const saved = achievementRecords[id];
      const criteriaMet =
        requiredIds.length > 0 &&
        completedIds.length === requiredIds.length &&
        requiredIds.every((entry) => !ITEM_BY_ID.get(entry)?.upcoming);
      return {
        id,
        version,
        title,
        description,
        tier,
        icon,
        requiredIds,
        completedIds,
        current: completedIds.length,
        goal: Math.max(1, requiredIds.length),
        progress: completedIds.length / Math.max(1, requiredIds.length),
        coverId: requiredIds[0],
        unlocked: Boolean(saved) || criteriaMet,
        unlockedAt: saved?.unlockedAt,
      };
    };
    const metric = (
      id: string,
      title: string,
      description: string,
      current: number,
      goal: number,
      tier: AchievementTier,
      icon: IconName = "trophy",
      version = 1,
      requiredIds: string[] = [],
    ): Achievement => {
      const saved = achievementRecords[id];
      const completedIds = requiredIds.filter((entry) => watched.has(entry));
      return {
        id,
        version,
        title,
        description,
        tier,
        icon,
        requiredIds,
        completedIds,
        current,
        goal: Math.max(1, goal),
        progress: Math.min(1, current / Math.max(1, goal)),
        coverId: requiredIds[0],
        unlocked: Boolean(saved) || current >= goal,
        unlockedAt: saved?.unlockedAt,
      };
    };
    const sameDayMax = Object.values(
      history
        .filter((event) => event.action === "watched")
        .reduce<Record<string, number>>((days, event) => {
          const day = new Date(event.at).toISOString().slice(0, 10);
          days[day] = (days[day] || 0) + 1;
          return days;
        }, {}),
    ).reduce((max, value) => Math.max(max, value), 0);
    const watchedMovies = releasedItems.filter(
      (item) => item.type === "movie" && watched.has(item.id),
    ).length;
    const episodeDone = Object.values(episodes).reduce((sum, values) => sum + values.length, 0);
    const completedSeries = releasedItems.filter(
      (item) => Boolean(EPISODE_COUNTS[item.id]) && watched.has(item.id),
    ).length;
    const activeDays = new Set(
      history.map((event) => new Date(event.at).toISOString().slice(0, 10)),
    ).size;
    const weekendEvents = history.filter((event) => {
      const day = new Date(event.at).getDay();
      return event.action === "watched" && (day === 0 || day === 6);
    }).length;
    const decade = (from: number, to: number) =>
      releasedItems
        .filter((item) => item.releaseValue >= from && item.releaseValue < to)
        .map((item) => item.id);
    const completedCustomList = customLists.some(
      (list) => list.items.length > 0 && list.items.every((id) => watched.has(id)),
    );
    let customRouteIds: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("nexus-desktop-custom-route-v1") || "[]");
      customRouteIds = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
    } catch {}
    const completedCustomRoute =
      customRouteIds.length > 0 && customRouteIds.every((id) => watched.has(id));
    return [
      metric(
        "first-assembly",
        "Primer ensamblaje",
        "Completa tu primer título",
        watched.size,
        1,
        "Bronce",
        "spark",
      ),
      metric(
        "night-marathon",
        "Maratón nocturno",
        "Completa tres títulos en un mismo día",
        sameDayMax,
        3,
        "Bronce",
        "clock",
      ),
      metric(
        "archive-opens",
        "El archivo se abre",
        "Completa 10 títulos estrenados",
        watched.size,
        10,
        "Bronce",
        "film",
      ),
      metric(
        "phase-traveler",
        "Viajero de fase",
        "Completa cualquier fase del UCM",
        completedPhases,
        1,
        "Plata",
        "route",
      ),
      metric(
        "one-reality",
        "Una realidad a la vez",
        "Completa una línea del mapa",
        completedTracks,
        1,
        "Plata",
        "route",
      ),
      metric(
        "half-multiverse",
        "A mitad del multiverso",
        "Alcanza el 50% del catálogo estrenado",
        watched.size,
        Math.ceil(releasedIds.length / 2),
        "Oro",
        "bar",
        1,
        releasedIds,
      ),
      metric(
        "hundred-counting",
        "Ciento y contando",
        "Completa 100 títulos estrenados",
        watched.size,
        100,
        "Vibranium",
        "trophy",
      ),
      route(
        "everything-connected",
        "Todo está conectado",
        "Completa todo el catálogo estrenado",
        releasedIds,
        "Diamante",
        "trophy",
        2,
      ),

      route(
        "iron-trilogy",
        "Genio, millonario, filántropo",
        "Completa la trilogía de Iron Man",
        ["iron-man", "iron-man-2", "iron-man-3"],
        "Plata",
        "spark",
      ),
      route(
        "on-your-left",
        "A tu izquierda",
        "Completa la saga individual del Capitán América",
        ["cap-first-avenger", "winter-soldier", "civil-war", "brave-new-world"],
        "Oro",
        "star",
      ),
      route(
        "still-worthy",
        "Aún digno",
        "Completa las cuatro películas de Thor",
        ["thor", "thor-dark-world", "ragnarok", "love-thunder"],
        "Oro",
        "spark",
      ),
      route(
        "size-problems",
        "Problemas de tamaño",
        "Completa la trilogía de Ant-Man",
        ["ant-man", "antman-wasp", "quantumania"],
        "Plata",
        "target",
      ),
      route(
        "higher-further",
        "Más alto, más lejos",
        "Completa la ruta de Captain Marvel",
        ["captain-marvel", "the-marvels"],
        "Plata",
        "star",
      ),
      route(
        "wakanda-forever",
        "Wakanda por siempre",
        "Completa las películas de Black Panther",
        ["black-panther", "wakanda-forever"],
        "Plata",
        "trophy",
      ),
      route(
        "bargain",
        "He venido a negociar",
        "Completa las películas de Doctor Strange",
        ["doctor-strange", "multiverse-madness"],
        "Plata",
        "spark",
      ),
      route(
        "galaxy-misfits",
        "Los inadaptados de la galaxia",
        "Completa Guardianes 1–3 y el especial navideño",
        ["guardians", "guardians-2", "holiday-special", "guardians-3"],
        "Oro",
        "star",
      ),
      route(
        "avengers-assembled",
        "Vengadores reunidos",
        "Completa las cuatro películas principales de Avengers",
        ["avengers", "ultron", "infinity-war", "endgame"],
        "Oro",
        "trophy",
      ),
      route(
        "soul-price",
        "El precio de un alma",
        "Completa la Saga del Infinito",
        releasedItems
          .filter(
            (item) =>
              ["Fase 1", "Fase 2", "Fase 3"].includes(item.phase || "") && item.trackId === "mcu",
          )
          .map((item) => item.id),
        "Diamante",
        "trophy",
        2,
      ),
      route(
        "what-is-grief",
        "¿Qué es el dolor?",
        "Completa el recorrido esencial de Wanda",
        ["ultron", "civil-war", "infinity-war", "endgame", "wandavision", "multiverse-madness"],
        "Oro",
        "spark",
      ),
      route(
        "glorious-purpose",
        "Glorioso propósito",
        "Completa el recorrido esencial de Loki",
        [
          "thor",
          "avengers",
          "thor-dark-world",
          "ragnarok",
          "infinity-war",
          "endgame",
          "loki-1",
          "loki-2",
        ],
        "Oro",
        "route",
      ),
      route(
        "timeline-protector",
        "Protector de la línea temporal",
        "Completa las series y especiales estrenados del UCM",
        trackIds("series"),
        "Diamante",
        "clock",
        2,
      ),

      route(
        "great-power",
        "Un gran poder",
        "Completa la trilogía de Tobey Maguire",
        ["spiderman-raimi-1", "spiderman-raimi-2", "spiderman-raimi-3"],
        "Oro",
        "star",
      ),
      route(
        "bad-lizard",
        "El asombroso Spider-Man",
        "Completa las dos películas protagonizadas por Andrew Garfield",
        ["amazing-spiderman", "amazing-spiderman-2"],
        "Plata",
        "star",
      ),
      route(
        "back-home",
        "De vuelta a casa",
        "Completa la trilogía de Spider-Man del UCM",
        ["homecoming", "far-from-home", "no-way-home"],
        "Oro",
        "home",
      ),
      route(
        "three-spiders",
        "Tres arañas, un destino",
        "Completa las tres rutas live action hasta No Way Home",
        [
          "spiderman-raimi-1",
          "spiderman-raimi-2",
          "spiderman-raimi-3",
          "amazing-spiderman",
          "amazing-spiderman-2",
          "homecoming",
          "far-from-home",
          "no-way-home",
        ],
        "Oro",
        "route",
      ),
      route(
        "wear-mask",
        "Cualquiera puede llevar la máscara",
        "Completa las películas estrenadas de Spider-Verse",
        ["spider-verse", "across-spider-verse"],
        "Oro",
        "spark",
      ),
      route(
        "always-spectacular",
        "Siempre espectacular",
        "Completa The Spectacular Spider-Man",
        ["spectacular-spiderman"],
        "Plata",
        "star",
      ),
      route(
        "animated-neighbor",
        "Amigo y vecino de todos los universos",
        "Completa las series animadas de Spider-Man",
        trackIds("animation-spider"),
        "Oro",
        "route",
      ),
      route(
        "web-destiny",
        "La red del destino",
        "Completa todo Spider-Man estrenado, animado y live action",
        [
          ...trackIds("tobey"),
          ...trackIds("andrew"),
          ...trackIds("sony"),
          ...trackIds("animation-spider"),
          "homecoming",
          "far-from-home",
          "no-way-home",
        ],
        "Diamante",
        "trophy",
        2,
      ),

      route(
        "to-me-xmen",
        "A mí, mis X-Men",
        "Completa X-Men: TAS y X-Men ’97",
        ["xmen-animated-series", "xmen97-1", "xmen97-2"],
        "Oro",
        "route",
      ),
      route(
        "future-reunited",
        "Días de un futuro reunido",
        "Completa las películas principales de X-Men",
        trackIds("xmen").filter((id) => !id.includes("deadpool")),
        "Oro",
        "clock",
      ),
      route(
        "best-at-what-i-do",
        "El mejor en lo que hace",
        "Completa la ruta de Wolverine",
        ["wolverine-origins", "the-wolverine", "days-future-past", "logan", "deadpool-wolverine"],
        "Oro",
        "star",
      ),
      route(
        "mutant-proud",
        "Mutante y orgulloso",
        "Completa todos los universos X-Men estrenados",
        [...trackIds("xmen"), ...trackIds("animation-xmen")],
        "Diamante",
        "trophy",
        2,
      ),
      route(
        "clobbering-time",
        "Es hora de las tortas",
        "Completa Fantastic Four de 2005 y 2007",
        ["fantastic-four-2005", "silver-surfer"],
        "Plata",
        "spark",
      ),
      route(
        "first-family",
        "La primera familia",
        "Completa todos los universos Fantastic Four estrenados",
        trackIds("fantastic"),
        "Oro",
        "home",
      ),
      route(
        "legacy-keepers",
        "Guardianes del legado",
        "Completa X-Men, Fantastic Four y universos heredados",
        [...trackIds("xmen"), ...trackIds("fantastic"), ...trackIds("other")],
        "Diamante",
        "trophy",
        2,
      ),

      route(
        "hells-kitchen-devil",
        "El diablo de Hell’s Kitchen",
        "Completa la ruta de Daredevil",
        releasedIds.filter((id) => id.includes("daredevil")),
        "Oro",
        "target",
      ),
      route(
        "street-heroes",
        "Héroes a nivel de calle",
        "Completa The Defenders Saga",
        trackIds("defenders"),
        "Diamante",
        "trophy",
        2,
      ),
      route(
        "one-batch",
        "Una tanda, una misión",
        "Completa la ruta de Punisher",
        releasedIds.filter((id) => id.includes("punisher")),
        "Plata",
        "target",
      ),
      route(
        "we-are-venom",
        "Somos Venom",
        "Completa la trilogía de Venom",
        ["venom", "venom-carnage", "venom-last-dance"],
        "Oro",
        "spark",
      ),
      route(
        "symbiote-web",
        "Red simbiótica",
        "Completa Sony’s Spider-Man Universe",
        trackIds("sony"),
        "Diamante",
        "route",
        2,
      ),
      route(
        "watcher-saw-all",
        "Yo lo he visto todo",
        "Completa todas las temporadas de What If...?",
        ["what-if-1", "what-if-2", "what-if-3"],
        "Oro",
        "eye",
      ),
      route(
        "animated-mightiest",
        "Los héroes más poderosos, animados",
        "Completa Avengers: Earth’s Mightiest Heroes",
        ["avengers-earths-mightiest-heroes"],
        "Oro",
        "trophy",
      ),
      route(
        "every-frame",
        "Cada fotograma, un universo",
        "Completa todo el catálogo animado estrenado",
        releasedItems.filter((item) => item.type === "animation").map((item) => item.id),
        "Diamante",
        "film",
        2,
      ),

      metric(
        "showrunner",
        "Director de funciones",
        "Crea tu primer maratón personalizado",
        marathonCount,
        1,
        "Bronce",
        "calendar",
      ),
      metric(
        "code-between-worlds",
        "Código entre universos",
        "Comparte o importa un código de maratón",
        marathonCodeUsed ? 1 : 0,
        1,
        "Plata",
        "share",
      ),
      metric(
        "together-now",
        "Todos juntos ahora",
        "Completa un maratón creado o compartido",
        sharedMarathonComplete ? 1 : 0,
        1,
        "Oro",
        "trophy",
      ),
      metric(
        "multiverse-critic",
        "Crítico del multiverso",
        "Califica 25 títulos",
        rated,
        25,
        "Plata",
        "star",
      ),
      metric(
        "one-more-time",
        "Una vez más",
        "Registra 10 repeticiones",
        rewatchTotal,
        10,
        "Oro",
        "shuffle",
      ),
      metric(
        "watcher-notes",
        "Notas del Vigilante",
        "Escribe notas en 25 títulos",
        notesTotal,
        25,
        "Plata",
        "note",
      ),
      metric(
        "reality-curator",
        "Curador de realidades",
        "Desbloquea 50 pósteres digitales",
        watched.size,
        50,
        "Oro",
        "bookmark",
      ),
      route(
        "multiverse-museum",
        "Museo del multiverso",
        "Completa la colección digital estrenada",
        releasedIds,
        "Diamante",
        "trophy",
        2,
      ),
      metric(
        "sorcerer-oath",
        "Juramento del hechicero",
        "Completa una ruta esencial manteniendo la protección de spoilers",
        spoilerSafeRouteComplete ? 1 : 0,
        1,
        "Plata",
        "eye",
      ),
      route(
        "portals-open",
        "Los portales están abiertos",
        "Completa la ruta narrativa hasta Endgame",
        dependencyRoute("endgame").map((item) => item.id),
        "Oro",
        "route",
      ),
      route(
        "multiverse-visitors",
        "Visitantes de otros universos",
        "Completa la ruta narrativa hasta No Way Home",
        dependencyRoute("no-way-home").map((item) => item.id),
        "Oro",
        "route",
      ),
      route(
        "ready-doomsday",
        "Preparado para el fin",
        "Completa la ruta requerida de Doomsday cuando se estrene",
        dependencyRoute("doomsday").map((item) => item.id),
        "Diamante",
        "target",
        2,
      ),
      route(
        "battleworld-destiny",
        "Destino: Battleworld",
        "Completa la ruta requerida de Secret Wars cuando se estrene",
        dependencyRoute("secret-wars").map((item) => item.id),
        "Diamante",
        "route",
        2,
      ),

      metric(
        "first-movie",
        "La primera función",
        "Completa tu primera película",
        watchedMovies,
        1,
        "Bronce",
        "film",
        1,
        ["iron-man"],
      ),
      metric(
        "first-episode",
        "Solo uno más",
        "Completa tu primer capítulo",
        episodeDone,
        1,
        "Bronce",
        "film",
        1,
        ["wandavision"],
      ),
      metric(
        "five-episodes",
        "Próximo episodio",
        "Completa cinco capítulos",
        episodeDone,
        5,
        "Bronce",
        "film",
        1,
        ["loki-1"],
      ),
      metric(
        "ten-episodes",
        "¿Quién necesita dormir?",
        "Completa diez capítulos",
        episodeDone,
        10,
        "Plata",
        "clock",
        1,
        ["daredevil-s1"],
      ),
      metric(
        "season-closed",
        "Temporada cerrada",
        "Termina una temporada completa",
        completedSeries,
        1,
        "Plata",
        "check",
        1,
        ["wandavision"],
      ),
      metric(
        "double-feature",
        "Programa doble",
        "Completa dos títulos el mismo día",
        sameDayMax,
        2,
        "Bronce",
        "film",
        1,
        ["iron-man-2"],
      ),
      metric(
        "save-for-later",
        "Para después",
        "Guarda tu primer título en Mi lista",
        watchlist.size,
        1,
        "Bronce",
        "bookmark",
        1,
        ["homecoming"],
      ),
      metric(
        "good-taste",
        "Esto sí me gusta",
        "Marca cinco títulos como favoritos",
        favorites.size,
        5,
        "Bronce",
        "star",
        1,
        ["guardians"],
      ),
      metric(
        "five-stars",
        "Cinco estrellas",
        "Otorga tu primera calificación máxima",
        Object.values(ratings).filter((value) => value === 5).length,
        1,
        "Bronce",
        "star",
        1,
        ["endgame"],
      ),
      metric(
        "margin-notes",
        "Notas al margen",
        "Escribe tu primera nota personal",
        notesTotal,
        1,
        "Bronce",
        "note",
        1,
        ["winter-soldier"],
      ),

      route(
        "red-room",
        "Sol rojo",
        "Completa el recorrido esencial de Black Widow",
        [
          "iron-man-2",
          "avengers",
          "winter-soldier",
          "ultron",
          "civil-war",
          "infinity-war",
          "endgame",
          "black-widow",
        ],
        "Oro",
        "target",
      ),
      route(
        "always-angry",
        "Siempre estoy enojado",
        "Completa el recorrido esencial de Hulk",
        ["hulk", "avengers", "ultron", "ragnarok", "infinity-war", "endgame", "she-hulk"],
        "Oro",
        "spark",
      ),
      route(
        "dont-give-hope",
        "No me des esperanza",
        "Completa el recorrido esencial de Hawkeye",
        ["avengers", "ultron", "civil-war", "endgame", "hawkeye"],
        "Oro",
        "target",
      ),
      route(
        "on-your-order",
        "A la orden, Capitán",
        "Completa el recorrido de Sam Wilson",
        ["winter-soldier", "ultron", "civil-war", "falcon-winter", "brave-new-world"],
        "Oro",
        "star",
      ),
      route(
        "maximum-effort",
        "Máximo esfuerzo",
        "Completa todas las películas de Deadpool",
        ["deadpool", "deadpool-2", "deadpool-wolverine"],
        "Oro",
        "spark",
      ),
      route(
        "spirit-vengeance",
        "Espíritu de venganza",
        "Completa las películas de Ghost Rider",
        ["ghost-rider", "ghost-rider-2"],
        "Plata",
        "spark",
      ),
      route(
        "daywalker",
        "Caminante diurno",
        "Completa la trilogía estrenada de Blade",
        ["blade-1998", "blade-2", "blade-trinity"],
        "Oro",
        "target",
      ),
      route(
        "embrace-chaos",
        "Abraza el caos",
        "Completa Moon Knight y su ruta sobrenatural",
        ["moon-knight", "werewolf", "agatha"],
        "Plata",
        "spark",
      ),
      route(
        "embiggen",
        "Embiggen",
        "Completa la ruta de Ms. Marvel",
        ["ms-marvel", "the-marvels"],
        "Plata",
        "star",
      ),
      route(
        "ten-rings-legend",
        "La leyenda de los Diez Anillos",
        "Completa Shang-Chi y sus conexiones disponibles",
        ["shang-chi", "the-marvels"],
        "Plata",
        "route",
      ),
      route(
        "alias-investigations",
        "Alias Investigations",
        "Completa Jessica Jones y sus conexiones",
        ["jessica-jones-s1", "defenders-miniseries", "jessica-jones-s2", "jessica-jones-s3"],
        "Oro",
        "search",
      ),
      route(
        "sweet-christmas",
        "Dulce Navidad",
        "Completa Luke Cage y sus conexiones",
        ["luke-cage-s1", "defenders-miniseries", "luke-cage-s2"],
        "Oro",
        "spark",
      ),

      route(
        "beautiful-because-lasting",
        "Una cosa no es bella porque dure",
        "Completa el recorrido esencial de Vision",
        ["ultron", "civil-war", "infinity-war", "wandavision", "visionquest"],
        "Oro",
        "spark",
      ),
      route(
        "end-of-line",
        "Hasta el final de la línea",
        "Completa la historia de Bucky Barnes",
        [
          "cap-first-avenger",
          "winter-soldier",
          "civil-war",
          "infinity-war",
          "endgame",
          "falcon-winter",
          "thunderbolts",
        ],
        "Oro",
        "star",
      ),
      route(
        "boom-looking-for-this",
        "Boom, ¿buscabas esto?",
        "Completa las apariciones principales de War Machine",
        ["iron-man-2", "iron-man-3", "ultron", "civil-war", "infinity-war", "endgame"],
        "Oro",
        "spark",
      ),
      route(
        "avengers-idea",
        "Una idea llamada Vengadores",
        "Completa el recorrido de Nick Fury y la creación de los Avengers",
        [
          "iron-man",
          "iron-man-2",
          "thor",
          "cap-first-avenger",
          "avengers",
          "captain-marvel",
          "secret-invasion",
        ],
        "Oro",
        "eye",
      ),
      route(
        "pocket-vest",
        "Un chaleco con bolsillos",
        "Completa la historia disponible de Yelena Belova",
        ["black-widow", "hawkeye", "thunderbolts"],
        "Plata",
        "target",
      ),
      route(
        "best-hawkeye",
        "La mejor Hawkeye",
        "Completa Hawkeye y el recorrido de Kate Bishop",
        ["hawkeye"],
        "Plata",
        "target",
      ),
      route(
        "own-story",
        "Yo controlo mi propia historia",
        "Completa She-Hulk: Defensora de héroes",
        ["she-hulk"],
        "Plata",
        "spark",
      ),
      route(
        "agatha-all-along",
        "Fue Agatha todo este tiempo",
        "Completa WandaVision y Agatha All Along",
        ["wandavision", "agatha"],
        "Plata",
        "spark",
      ),
      route(
        "find-your-voice",
        "Encuentra tu voz",
        "Completa Hawkeye y Echo",
        ["hawkeye", "echo"],
        "Plata",
        "target",
      ),
      route(
        "need-that-arm",
        "Necesito ese brazo",
        "Completa el recorrido esencial de Rocket",
        ["guardians", "guardians-2", "infinity-war", "endgame", "holiday-special", "guardians-3"],
        "Oro",
        "spark",
      ),
      route(
        "we-are-groot",
        "Somos Groot",
        "Completa las historias principales de Groot",
        [
          "guardians",
          "guardians-2",
          "infinity-war",
          "endgame",
          "groot-2",
          "holiday-special",
          "guardians-3",
        ],
        "Oro",
        "star",
      ),
      route(
        "daughters-thanos",
        "Hijas de Thanos",
        "Completa el recorrido conjunto de Gamora y Nebula",
        ["guardians", "guardians-2", "infinity-war", "endgame", "guardians-3"],
        "Oro",
        "route",
      ),

      route(
        "new-avengers",
        "¿Vengadores nuevos?",
        "Completa los títulos relacionados con los Thunderbolts",
        ["black-widow", "falcon-winter", "hawkeye", "thunderbolts"],
        "Oro",
        "trophy",
      ),
      route(
        "seven-thousand-years",
        "Siete mil años",
        "Completa Eternals y sus conexiones disponibles",
        ["eternals"],
        "Plata",
        "clock",
      ),
      route(
        "marvels-together",
        "Más alto, más lejos, más rápido, juntas",
        "Completa Captain Marvel, Ms. Marvel y The Marvels",
        ["captain-marvel", "ms-marvel", "the-marvels"],
        "Oro",
        "star",
      ),
      route(
        "next-generation",
        "La siguiente generación",
        "Completa las historias disponibles de los héroes jóvenes",
        [
          "wandavision",
          "falcon-winter",
          "hawkeye",
          "ms-marvel",
          "quantumania",
          "multiverse-madness",
        ],
        "Oro",
        "spark",
      ),
      route(
        "when-night-falls",
        "Cuando cae la noche",
        "Completa la ruta sobrenatural del UCM",
        ["doctor-strange", "multiverse-madness", "moon-knight", "werewolf", "agatha"],
        "Oro",
        "spark",
      ),
      route(
        "level-seven",
        "Nivel de acceso siete",
        "Completa los títulos esenciales relacionados con S.H.I.E.L.D.",
        [
          "iron-man",
          "iron-man-2",
          "thor",
          "cap-first-avenger",
          "avengers",
          "winter-soldier",
          "ultron",
          "secret-invasion",
        ],
        "Oro",
        "eye",
      ),
      route(
        "heroes-new-york",
        "Héroes de Nueva York",
        "Completa las historias individuales de los Defenders",
        [...trackIds("defenders")],
        "Diamante",
        "home",
        2,
      ),
      route(
        "she-is-not-alone",
        "Ella no está sola",
        "Completa una ruta especial con las heroínas principales del UCM",
        [
          "black-widow",
          "captain-marvel",
          "wandavision",
          "hawkeye",
          "ms-marvel",
          "she-hulk",
          "wakanda-forever",
          "the-marvels",
        ],
        "Oro",
        "star",
      ),
      route(
        "cosmic-limits",
        "Los confines del cosmos",
        "Completa la ruta cósmica del UCM",
        [
          "thor",
          "guardians",
          "guardians-2",
          "ragnarok",
          "infinity-war",
          "captain-marvel",
          "endgame",
          "eternals",
          "love-thunder",
          "guardians-3",
          "the-marvels",
        ],
        "Diamante",
        "star",
        2,
      ),
      route(
        "avengers-all-worlds",
        "Vengadores de todos los mundos",
        "Completa equipos de Avengers live action y animados",
        [
          "avengers",
          "ultron",
          "infinity-war",
          "endgame",
          "ultimate-avengers",
          "ultimate-avengers-2",
          "avengers-earths-mightiest-heroes",
          "avengers-assemble-series",
        ],
        "Diamante",
        "trophy",
        2,
      ),

      route(
        "eyes-on-target",
        "Los ojos en el objetivo",
        "Completa el recorrido de Cyclops en animación y live action",
        [
          "xmen-animated-series",
          "xmen-2000",
          "x2",
          "xmen-last-stand",
          "days-future-past",
          "xmen-apocalypse",
          "dark-phoenix",
          "xmen97-1",
        ],
        "Oro",
        "target",
      ),
      route(
        "storm-goddess",
        "Diosa de la tormenta",
        "Completa las historias principales de Storm",
        [
          "xmen-animated-series",
          "xmen-2000",
          "x2",
          "xmen-last-stand",
          "days-future-past",
          "xmen-apocalypse",
          "dark-phoenix",
          "xmen97-1",
        ],
        "Oro",
        "spark",
      ),
      route(
        "fire-life-incarnate",
        "Fuego y vida encarnados",
        "Completa el recorrido de Jean Grey y Phoenix",
        [
          "xmen-animated-series",
          "xmen-2000",
          "x2",
          "xmen-last-stand",
          "xmen-apocalypse",
          "dark-phoenix",
          "xmen97-1",
        ],
        "Oro",
        "spark",
      ),
      route(
        "sugar-rogue",
        "Sugar",
        "Completa el recorrido de Rogue",
        ["xmen-animated-series", "xmen-2000", "x2", "xmen-last-stand", "xmen97-1"],
        "Oro",
        "star",
      ),
      route(
        "name-is-gambit",
        "El nombre es Gambit",
        "Completa las apariciones principales de Gambit",
        ["xmen-animated-series", "xmen97-1", "deadpool-wolverine"],
        "Oro",
        "spark",
      ),
      route(
        "peace-never-option",
        "La paz nunca fue una opción",
        "Completa el recorrido esencial de Magneto",
        [
          "xmen-animated-series",
          "xmen-2000",
          "x2",
          "xmen-last-stand",
          "xmen-first-class",
          "days-future-past",
          "xmen-apocalypse",
          "dark-phoenix",
          "xmen97-1",
        ],
        "Diamante",
        "route",
        2,
      ),
      route(
        "hope-coexistence",
        "La esperanza de coexistir",
        "Completa las historias principales de Charles Xavier",
        [
          "xmen-animated-series",
          "xmen-2000",
          "x2",
          "xmen-last-stand",
          "xmen-first-class",
          "days-future-past",
          "xmen-apocalypse",
          "logan",
          "xmen97-1",
        ],
        "Diamante",
        "eye",
        2,
      ),
      route(
        "the-herald",
        "El heraldo",
        "Completa las apariciones disponibles de Silver Surfer",
        ["silver-surfer"],
        "Plata",
        "spark",
      ),
      route(
        "flame-on",
        "¡Llamas a mí!",
        "Completa las diferentes versiones cinematográficas de Human Torch",
        ["fantastic-four-2005", "silver-surfer", "fantastic-four-2015", "fantastic-four"],
        "Oro",
        "spark",
      ),
      route(
        "red-sai",
        "La sai roja",
        "Completa las historias de Elektra",
        ["daredevil-2003", "elektra-2005", "daredevil-s2", "defenders-miniseries"],
        "Oro",
        "target",
      ),

      route(
        "knows-fear",
        "Quien conoce el miedo",
        "Completa Werewolf by Night y la ruta de Man-Thing",
        ["werewolf"],
        "Plata",
        "spark",
      ),
      route(
        "protector-kun-lun",
        "Protector de K’un-Lun",
        "Completa Iron Fist y The Defenders",
        ["iron-fist-s1", "defenders-miniseries", "iron-fist-s2"],
        "Oro",
        "spark",
      ),
      route(
        "man-without-fear",
        "El hombre sin miedo",
        "Completa toda la ruta disponible de Daredevil",
        releasedIds.filter((id) => id.includes("daredevil")),
        "Diamante",
        "target",
        2,
      ),
      route(
        "king-of-city",
        "El rey de la ciudad",
        "Completa las historias principales relacionadas con Kingpin",
        ["daredevil-s1", "daredevil-s3", "hawkeye", "echo", "daredevil-ba-1"],
        "Oro",
        "trophy",
      ),
      route(
        "punishment-served",
        "Castigo cumplido",
        "Completa todas las historias disponibles de Punisher",
        releasedIds.filter((id) => id.includes("punisher")),
        "Oro",
        "target",
      ),

      route(
        "neon-days",
        "Días de neón",
        "Completa una ruta de los años 90",
        decade(1990, 2000),
        "Oro",
        "clock",
      ),
      metric(
        "before-mcu",
        "Antes del UCM",
        "Completa diez títulos estrenados en los 2000",
        decade(2000, 2010).filter((id) => watched.has(id)).length,
        10,
        "Oro",
        "film",
        1,
        decade(2000, 2010),
      ),
      metric(
        "assembly-decade",
        "La década del ensamblaje",
        "Completa veinte títulos estrenados en los 2010",
        decade(2010, 2020).filter((id) => watched.has(id)).length,
        20,
        "Oro",
        "trophy",
        1,
        decade(2010, 2020),
      ),
      metric(
        "after-blip",
        "Después del Blip",
        "Completa veinte títulos estrenados en los 2020",
        decade(2020, 2030).filter((id) => watched.has(id)).length,
        20,
        "Oro",
        "route",
        1,
        decade(2020, 2030),
      ),
      metric(
        "through-time",
        "A través del tiempo",
        "Completa al menos un título de cuatro décadas diferentes",
        [decade(1990, 2000), decade(2000, 2010), decade(2010, 2020), decade(2020, 2030)].filter(
          (ids) => ids.some((id) => watched.has(id)),
        ).length,
        4,
        "Diamante",
        "clock",
      ),

      metric(
        "zero-list",
        "Lista en cero",
        "Completa todos los títulos de una lista propia",
        completedCustomList ? 1 : 0,
        1,
        "Oro",
        "bookmark",
      ),
      metric(
        "three-days-realities",
        "Tres días, tres realidades",
        "Registra actividad durante tres días diferentes",
        activeDays,
        3,
        "Plata",
        "calendar",
      ),
      metric(
        "heroic-weekend",
        "Fin de semana heroico",
        "Completa tres títulos durante fines de semana",
        weekendEvents,
        3,
        "Plata",
        "calendar",
      ),
      metric(
        "my-continuity",
        "Mi continuidad",
        "Termina un orden personalizado",
        completedCustomRoute ? 1 : 0,
        1,
        "Oro",
        "shuffle",
        1,
        customRouteIds,
      ),
      metric(
        "under-spell",
        "Bajo el hechizo",
        "Completa cinco títulos manteniendo el modo protegido",
        spoilerSafe ? Math.min(5, watched.size) : 0,
        5,
        "Plata",
        "eye",
      ),
    ];
  }, [
    achievementActivityVersion,
    achievementRecords,
    customLists,
    episodes,
    favorites,
    history,
    notes,
    ratings,
    releasedItems,
    rewatches,
    spoilerSafe,
    watched,
    watchlist,
  ]);
  const labelLayout = useMemo(() => {
    const result = new Map<
      string,
      { below: boolean; offset: number; shift: number; leaderLength: number; leaderAngle: number }
    >();
    // Keep collision packing in lockstep with the final card widths in styles.css.
    const cardWidth = zoom >= 0.78 ? 205 : zoom < 0.38 ? 180 : 158;
    const slotCount = 4;
    const levelStep = zoom >= 0.78 ? 125 : 82;
    const screenGap = zoom >= 0.78 ? 16 : 11;
    TRACKS.forEach((track) => {
      const slots = Array.from({ length: slotCount }, () => Number.NEGATIVE_INFINITY);
      const trackItems = ITEMS.filter(
        (item) => item.trackId === track.id && (zoom >= 0.38 || KEY_IDS.has(item.id)),
      );
      trackItems.forEach((item) => {
        const desiredCenter = xOf(item.releaseValue) * zoom;
        let bestSlot = 0;
        let bestCenter = Number.POSITIVE_INFINITY;
        slots.forEach((lastRight, slot) => {
          const candidateCenter = Math.max(desiredCenter, lastRight + screenGap + cardWidth / 2);
          if (candidateCenter < bestCenter) {
            bestCenter = candidateCenter;
            bestSlot = slot;
          }
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
          leaderAngle: (Math.atan2(verticalDelta, shift || 0.001) * 180) / Math.PI,
        });
      });
    });
    return result;
  }, [zoom]);

  const visibleMapItems = useMemo(() => {
    if (mapScroll.width <= 1) return ITEMS;
    const buffer = Math.max(720, mapScroll.width * 0.75);
    const min = mapScroll.left - buffer;
    const max = mapScroll.left + mapScroll.width + buffer;
    return ITEMS.filter((item) => {
      const screenX = xOf(item.releaseValue) * zoom;
      return (
        (screenX >= min && screenX <= max) ||
        item.id === selected?.id ||
        routeFocus.has(item.id) ||
        KEY_IDS.has(item.id)
      );
    });
  }, [mapScroll.left, mapScroll.width, routeFocus, selected?.id, zoom]);

  const notify = useCallback((message: string, action?: { label: string; run: () => void }) => {
    setToast({ message, actionLabel: action?.label, onAction: action?.run });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), action ? 5200 : 2600);
  }, []);

  useEffect(() => {
    if (!preferences.achievements) return;
    const previous = achievementRecords;
    const next = { ...previous };
    let fresh: Achievement | undefined;
    achievements.forEach((achievement) => {
      if (!achievement.unlocked || next[achievement.id]) return;
      next[achievement.id] = {
        id: achievement.id,
        version: achievement.version,
        unlockedAt: new Date().toISOString(),
        progressSnapshot: {
          completedIds: achievement.completedIds,
          requiredIds: achievement.requiredIds,
        },
      };
      if (Object.keys(previous).length > 0 && !fresh) fresh = achievement;
    });
    if (Object.keys(next).length !== Object.keys(previous).length) {
      setAchievementRecords(next);
      localStorage.setItem(ACHIEVEMENT_RECORDS_KEY, JSON.stringify(next));
      localStorage.setItem(UNLOCKED_ACHIEVEMENTS_KEY, JSON.stringify(Object.keys(next)));
      window.dispatchEvent(
        new CustomEvent("nexus:local-change", { detail: { kind: "achievement" } }),
      );
    }
    if (fresh) notify(`Logro desbloqueado: ${fresh.title}`);
  }, [achievementRecords, achievements, notify, preferences.achievements]);

  useEffect(() => {
    try {
      const reminders = new Set<string>(JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]"));
      const upcoming = VERIFIED_RELEASES.find(
        (event) =>
          event.date &&
          reminders.has(event.id) &&
          daysUntil(event.date) >= 0 &&
          daysUntil(event.date) <= 7,
      );
      const item = upcoming ? ITEM_BY_ID.get(upcoming.id) : null;
      if (item && upcoming?.date)
        notify(`${item.title} se estrena en ${daysUntil(upcoming.date)} días`);
    } catch {
      /* recordatorios opcionales */
    }
  }, [notify]);

  const centerItem = useCallback(
    (item: MapItem, open = true) => {
      const viewport = viewportRef.current;
      const track = TRACKS.find((entry) => entry.id === item.trackId);
      if (!viewport || !track) return;
      viewport.scrollTo({
        left: xOf(item.releaseValue) * zoom - viewport.clientWidth / 2,
        top: yOfTrack(item.trackId, zoom) - viewport.clientHeight / 2,
        behavior: "smooth",
      });
      if (open) setSelected(item);
    },
    [zoom],
  );

  const fitMap = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.max(MIN_ZOOM, Math.min(0.42, (viewport.clientWidth - 36) / MAP_WIDTH));
    setZoom(next);
    requestAnimationFrame(() =>
      viewport.scrollTo({
        left: 0,
        top: Math.max(0, verticalMetrics(next).height - viewport.clientHeight) / 2,
        behavior: "smooth",
      }),
    );
  }, []);

  const focusMcu = useCallback(() => {
    const viewport = viewportRef.current;
    const anchor = ITEM_BY_ID.get("iron-man");
    if (!viewport || !anchor) return;
    const next = 0.46;
    setZoom(next);
    requestAnimationFrame(() =>
      viewport.scrollTo({
        left: Math.max(0, xOf(anchor.releaseValue) * next - viewport.clientWidth * 0.34),
        top: Math.max(0, yOfTrack("mcu", next) - viewport.clientHeight * 0.48),
        behavior: preferences.reduceMotion ? "auto" : "smooth",
      }),
    );
  }, [preferences.reduceMotion]);

  const changeZoom = useCallback(
    (nextValue: number, clientX?: number, clientY?: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextValue));
      const rect = viewport.getBoundingClientRect();
      const localX = clientX === undefined ? viewport.clientWidth / 2 : clientX - rect.left;
      const localY = clientY === undefined ? viewport.clientHeight / 2 : clientY - rect.top;
      const worldX = (viewport.scrollLeft + localX) / zoom;
      const verticalRatio = (viewport.scrollTop + localY) / verticalMetrics(zoom).height;
      setZooming(true);
      if (zoomTimer.current) window.clearTimeout(zoomTimer.current);
      zoomTimer.current = window.setTimeout(() => setZooming(false), 180);
      setZoom(next);
      requestAnimationFrame(() =>
        viewport.scrollTo({
          left: worldX * next - localX,
          top: verticalRatio * verticalMetrics(next).height - localY,
        }),
      );
    },
    [zoom],
  );

  useEffect(() => {
    if (view !== "map" || !selected) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const keepSelectionVisible = () => {
      const node = viewport.querySelector<HTMLElement>(
        `[data-item-id="${CSS.escape(selected.id)}"]`,
      );
      const panel = document.querySelector<HTMLElement>(".detail-panel");
      if (!node || !panel) return;
      const viewportRect = viewport.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const safeLeft = viewportRect.left + 34;
      const safeRight = Math.max(safeLeft + 180, Math.min(viewportRect.right, panelRect.left) - 30);
      const safeCenter = (safeLeft + safeRight) / 2;
      const nodeCenter = (nodeRect.left + nodeRect.right) / 2;
      if (nodeRect.right > safeRight || nodeRect.left < safeLeft) {
        viewport.scrollBy({
          left: nodeCenter - safeCenter,
          behavior: preferences.reduceMotion ? "auto" : "smooth",
        });
      }
    };
    frame = requestAnimationFrame(() => requestAnimationFrame(keepSelectionVisible));
    const panel = document.querySelector<HTMLElement>(".detail-panel");
    const observer =
      panel && "ResizeObserver" in window ? new ResizeObserver(keepSelectionVisible) : null;
    if (panel && observer) observer.observe(panel);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [detailMode, preferences.reduceMotion, selected, view, zoom]);

  const openGlobalHit = useCallback((hit: GlobalHit) => {
    setGlobalSearchOpen(false);
    setGlobalQuery("");
    setGlobalIndex(0);
    if (hit.sequence) {
      setSelected(null);
      setSequenceMap(hit.sequence);
    } else setSelected(hit.item);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen(true);
        setGlobalIndex(0);
      } else if (globalSearchOpen && event.key === "ArrowDown") {
        event.preventDefault();
        setGlobalIndex((index) => Math.min(globalHits.length - 1, index + 1));
      } else if (globalSearchOpen && event.key === "ArrowUp") {
        event.preventDefault();
        setGlobalIndex((index) => Math.max(0, index - 1));
      } else if (globalSearchOpen && event.key === "Enter" && globalHits[globalIndex]) {
        event.preventDefault();
        openGlobalHit(globalHits[globalIndex]);
      } else if (event.altKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        setSelected(null);
        setView(
          (
            [
              "dashboard",
              "map",
              "list",
              "routes",
              "planner",
              "explore",
              "calendar",
              "achievements",
              "profiles",
            ] as AppView[]
          )[Number(event.key) - 1],
        );
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        if (view === "map") document.querySelector<HTMLInputElement>("#map-search")?.focus();
        else setGlobalSearchOpen(true);
      } else if (!globalSearchOpen && (event.key === "+" || event.key === "="))
        changeZoom(zoom + 0.1);
      else if (!globalSearchOpen && event.key === "-") changeZoom(zoom - 0.1);
      else if (event.key.toLowerCase() === "f" && document.activeElement?.tagName !== "INPUT")
        fitMap();
      else if (event.key === "Escape") {
        setSelected(null);
        setDetailPinned(false);
        setQuery("");
        setGlobalSearchOpen(false);
        setSettingsOpen(false);
        setAccountMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeZoom, fitMap, globalHits, globalIndex, globalSearchOpen, openGlobalHit, view, zoom]);

  useEffect(() => {
    if (view !== "map" || mapInitializedRef.current) return;
    mapInitializedRef.current = true;
    const timer = window.setTimeout(focusMcu, 90);
    return () => window.clearTimeout(timer);
  }, [focusMcu, view]);

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
    const previousEpisodes = [...(episodes[item.id] || [])];
    const previousDate = watchedDates[item.id];
    touchActivity(item, willWatch ? "watched" : "unwatched");
    setWatchedDates((current) => {
      const next = { ...current };
      if (willWatch) next[item.id] = current[item.id] || new Date().toISOString().slice(0, 10);
      else delete next[item.id];
      return next;
    });
    setWatched((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
    const total = EPISODE_COUNTS[item.id] || 0;
    if (total)
      setEpisodes((current) => ({
        ...current,
        [item.id]: watched.has(item.id)
          ? []
          : Array.from({ length: total }, (_, index) => index + 1),
      }));
    notify(willWatch ? "Marcado como visto" : "Marcado como pendiente", {
      label: "Deshacer",
      run: () => {
        setWatched((current) => {
          const next = new Set(current);
          if (willWatch) next.delete(item.id);
          else next.add(item.id);
          return next;
        });
        if (total) setEpisodes((current) => ({ ...current, [item.id]: previousEpisodes }));
        setWatchedDates((current) => {
          const next = { ...current };
          if (previousDate) next[item.id] = previousDate;
          else delete next[item.id];
          return next;
        });
        touchActivity(item, "undo");
        notify("Cambio deshecho");
      },
    });
  }

  function toggleEpisode(item: MapItem, episode: number) {
    const previousEpisodes = [...(episodes[item.id] || [])];
    const wasWatched = watched.has(item.id);
    const previousDate = watchedDates[item.id];
    const completing = !previousEpisodes.includes(episode);
    touchActivity(item, "episode");
    const total = EPISODE_COUNTS[item.id] || 0;
    setEpisodes((current) => {
      const existing = new Set(current[item.id] || []);
      if (existing.has(episode)) existing.delete(episode);
      else existing.add(episode);
      const values = [...existing].sort((a, b) => a - b);
      setWatched((seen) => {
        const next = new Set(seen);
        if (values.length === total) {
          next.add(item.id);
          setWatchedDates((dates) => ({
            ...dates,
            [item.id]: dates[item.id] || new Date().toISOString().slice(0, 10),
          }));
        } else {
          next.delete(item.id);
          setWatchedDates((dates) => {
            const nextDates = { ...dates };
            delete nextDates[item.id];
            return nextDates;
          });
        }
        return next;
      });
      return { ...current, [item.id]: values };
    });
    notify(
      completing ? `Capítulo ${episode} completado` : `Capítulo ${episode} marcado como pendiente`,
      {
        label: "Deshacer",
        run: () => {
          setEpisodes((current) => ({ ...current, [item.id]: previousEpisodes }));
          setWatched((current) => {
            const next = new Set(current);
            if (wasWatched) next.add(item.id);
            else next.delete(item.id);
            return next;
          });
          setWatchedDates((current) => {
            const next = { ...current };
            if (previousDate) next[item.id] = previousDate;
            else delete next[item.id];
            return next;
          });
          touchActivity(item, "undo");
          notify("Cambio deshecho");
        },
      },
    );
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
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
    notify(watchlist.has(item.id) ? "Quitado de Mi lista" : "Guardado en Mi lista");
  }

  function ignoreItem(item: MapItem) {
    setIgnored((current) => new Set(current).add(item.id));
    setWatchlist((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
    notify("Ya no aparecerá en tus recomendaciones");
  }

  function restoreItem(item: MapItem) {
    setIgnored((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
    notify("Título restaurado");
  }

  function toggleFavorite(item: MapItem) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
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
    setWatchedDates((current) => ({
      ...current,
      [item.id]: new Date().toISOString().slice(0, 10),
    }));
    setWatched((current) => new Set(current).add(item.id));
    touchActivity(item, "rewatch");
    notify("Repetición registrada");
  }

  function addToCustomList(item: MapItem, listId: string) {
    if (!listId) return;
    setCustomLists((current) =>
      current.map((list) =>
        list.id === listId && !list.items.includes(item.id)
          ? { ...list, items: [...list.items, item.id] }
          : list,
      ),
    );
    notify("Añadido a la lista");
  }

  const switchProfile = useCallback(
    (profileId: string, resetGuest = false) => {
      const currentPrefix = `nexus-profile-${activeProfileId}-`;
      for (const key of PROFILE_DATA_KEYS) {
        const currentValue = localStorage.getItem(key);
        if (currentValue != null) localStorage.setItem(`${currentPrefix}${key}`, currentValue);
      }
      const prefix = `nexus-profile-${profileId}-`;
      for (const key of PROFILE_DATA_KEYS) {
        const stored = resetGuest ? null : localStorage.getItem(`${prefix}${key}`);
        if (stored == null) localStorage.removeItem(key);
        else localStorage.setItem(key, stored);
      }
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
      window.location.reload();
    },
    [activeProfileId],
  );

  const addLocalCloudProfile = useCallback((profile: Profile) => {
    setProfiles((current) =>
      current.some((entry) => entry.id === profile.id) ? current : [...current, profile],
    );
  }, []);

  const removeLocalCloudProfile = useCallback((profileId: string) => {
    setProfiles((current) => current.filter((entry) => entry.id !== profileId));
  }, []);

  function toggleFavoriteTrack(trackId: string) {
    setFavoriteTracks((current) => {
      const next = new Set(current);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  }

  function openInMap(item: MapItem, preserveRoute = false) {
    if (!preserveRoute) {
      setRouteFocus(new Set());
      setRouteTarget(null);
    }
    setPendingMapItem(item);
    setView("map");
  }

  function showRouteInMap(item: MapItem, includeContext = true) {
    setRouteFocus(new Set(dependencyRoute(item.id, includeContext).map((entry) => entry.id)));
    setRouteTarget(item);
    openInMap(item, true);
  }

  function showAchievementRoute(achievement: Achievement) {
    const routeIds = achievement.requiredIds.filter((id) => ITEM_BY_ID.has(id));
    if (!routeIds.length) {
      notify("Este logro se obtiene con actividad general, no con una ruta concreta.");
      return;
    }
    const target = ITEM_BY_ID.get(routeIds.find((id) => !watched.has(id)) || routeIds.at(-1)!);
    if (!target) return;
    setRouteFocus(new Set(routeIds));
    setRouteTarget(target);
    setSelected(null);
    setPendingMapItem(target);
    setView("map");
  }

  function isSpoilerLocked(item: MapItem) {
    if (!spoilerSafe || watched.has(item.id) || item.upcoming || routeFocus.has(item.id))
      return false;
    const trackItems = releasedItems.filter((entry) => entry.trackId === item.trackId);
    const firstPending = trackItems.findIndex((entry) => !watched.has(entry.id));
    return (
      firstPending >= 0 && trackItems.findIndex((entry) => entry.id === item.id) > firstPending
    );
  }

  async function exportProgress() {
    let customMarathons: SharedMarathon[] = [];
    try {
      customMarathons = JSON.parse(localStorage.getItem(CUSTOM_MARATHONS_KEY) || "[]");
    } catch {}
    const payload = {
      watched: [...watched],
      episodes,
      watchlist: [...watchlist],
      ignored: [...ignored],
      favoriteTracks: [...favoriteTracks],
      ratings,
      favorites: [...favorites],
      notes,
      watchedDates,
      rewatches,
      history,
      customLists,
      customMarathons,
      preferences,
      profile: activeProfile,
    };
    if (!window.nexusDesktop) {
      const blob = new Blob(
        [JSON.stringify({ ...payload, exportedAt: new Date().toISOString() }, null, 2)],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexus-progreso-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Perfil exportado correctamente.");
      return;
    }
    const result = await window.nexusDesktop.exportProgress(payload);
    if (result.ok) notify("Perfil exportado correctamente.");
    else if (result.error) notify(result.error);
  }

  async function importProgress() {
    if (!window.nexusDesktop) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const payload = JSON.parse(await file.text());
          if (!Array.isArray(payload.watched) || typeof payload.episodes !== "object")
            throw new Error();
          setWatched(new Set(payload.watched));
          setEpisodes(payload.episodes);
          if (payload.watchlist) setWatchlist(new Set(payload.watchlist));
          if (payload.ignored) setIgnored(new Set(payload.ignored));
          if (payload.favoriteTracks) setFavoriteTracks(new Set(payload.favoriteTracks));
          if (payload.ratings) setRatings(payload.ratings);
          if (payload.favorites) setFavorites(new Set(payload.favorites));
          if (payload.notes) setNotes(payload.notes);
          if (payload.watchedDates) setWatchedDates(payload.watchedDates);
          if (payload.rewatches) setRewatches(payload.rewatches);
          if (payload.history) setHistory(payload.history);
          if (payload.customLists) setCustomLists(payload.customLists);
          if (payload.customMarathons)
            localStorage.setItem(CUSTOM_MARATHONS_KEY, JSON.stringify(payload.customMarathons));
          if (payload.preferences)
            setPreferences({ ...DEFAULT_PREFERENCES, ...payload.preferences });
          notify("Perfil importado correctamente.");
        } catch {
          notify("El archivo no contiene un progreso válido.");
        }
      };
      input.click();
      return;
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
      if (result.payload.customMarathons)
        localStorage.setItem(CUSTOM_MARATHONS_KEY, JSON.stringify(result.payload.customMarathons));
      if (result.payload.preferences)
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...result.payload.preferences,
          fontScale: Math.max(
            100,
            Math.min(135, Number(result.payload.preferences.fontScale) || 100),
          ),
        });
      notify("Perfil importado correctamente.");
    } else if (result.error) notify(result.error);
  }

  const updateMapScroll = () => {
    const viewport = viewportRef.current;
    if (viewport)
      setMapScroll({
        left: viewport.scrollLeft,
        top: viewport.scrollTop,
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
  };

  const openSequenceMap = useCallback((data: SequenceMapData) => {
    const tasks = data.tasks.filter((task) => ITEM_BY_ID.has(task.itemId));
    if (!tasks.length) {
      notify("Esta sucesión todavía no contiene títulos disponibles");
      return;
    }
    setSelected(null);
    setSequenceMap({ ...data, tasks });
  }, []);

  const editMarathon = useCallback((id: string | null) => {
    setEditingMarathonId(id);
    setSelected(null);
    setView("planner");
  }, []);

  return (
    <main className="desktop-shell">
      <div className="native-titlebar">
        <div className="titlebar-brand">
          <span>N</span>
          <strong>NEXUS</strong>
          <small>MAPA DEL MULTIVERSO</small>
        </div>
        <div className="titlebar-actions">
          <div className="nexus-mode-tabs" role="group" aria-label="Nivel de spoilers">
            <button
              className={!spoilerSafe ? "active complete" : ""}
              onClick={() => setSpoilerSafe(false)}
            >
              <Icon name="eye" />
              <span>
                <strong>Universo completo</strong>
                <small>Conexiones visibles</small>
              </span>
            </button>
            <button
              className={spoilerSafe ? "active protected" : ""}
              onClick={() => setSpoilerSafe(true)}
            >
              <Icon name="spark" />
              <span>
                <strong>Ruta protegida</strong>
                <small>Sin spoilers</small>
              </span>
            </button>
          </div>
          <div className="account-menu-wrap">
            <button
              className="titlebar-avatar"
              onClick={() => setAccountMenuOpen((value) => !value)}
              aria-expanded={accountMenuOpen}
              aria-label="Abrir menú personal"
            >
              {activeProfile?.avatar || "N"}
            </button>
            {accountMenuOpen && (
              <div className="account-quick-menu">
                <div>
                  <span>{activeProfile?.avatar || "N"}</span>
                  <p>
                    <strong>{activeProfile?.name || "Mi cuenta"}</strong>
                    <small>Preferencias y sincronización</small>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setCloudOpen(true);
                  }}
                >
                  <Icon name="user" />
                  Cuenta y sincronización
                </button>
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  <Icon name="settings" />
                  Apariencia y acceso
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <aside className="map-sidebar">
        <nav className="app-nav" aria-label="Navegación principal">
          <span className="nav-group-label">Principal</span>
          <button
            className={view === "dashboard" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("dashboard");
            }}
          >
            <Icon name="home" />
            <span>
              <strong>Inicio</strong>
              <small>Qué ver ahora</small>
            </span>
          </button>
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
            <Icon name="route" />
            <span>
              <strong>Mapa</strong>
              <small>Explorar universos</small>
            </span>
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setLibraryInitialTab("saved");
              setView("list");
            }}
          >
            <Icon name="bookmark" />
            <span>
              <strong>Biblioteca</strong>
              <small>{watchlist.size + favorites.size + marathons.length} personales</small>
            </span>
          </button>
          <span className="nav-group-label">Planificar</span>
          <button
            className={view === "routes" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("routes");
            }}
          >
            <Icon name="shuffle" />
            <span>
              <strong>Órdenes y rutas</strong>
              <small>Cómo verlo</small>
            </span>
          </button>
          <button
            className={view === "planner" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("planner");
            }}
          >
            <Icon name="calendar" />
            <span>
              <strong>Maratón</strong>
              <small>Planificar sesiones</small>
            </span>
          </button>
          <span className="nav-group-label">Descubrir</span>
          <button
            className={view === "explore" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("explore");
            }}
          >
            <Icon name="film" />
            <span>
              <strong>Archivo Nexus</strong>
              <small>Eras y colección</small>
            </span>
          </button>
          <button
            className={view === "calendar" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("calendar");
            }}
          >
            <Icon name="bell" />
            <span>
              <strong>Estrenos</strong>
              <small>Calendario Marvel</small>
            </span>
          </button>
          <button
            className={view === "achievements" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("achievements");
            }}
          >
            <Icon name="trophy" />
            <span>
              <strong>Logros</strong>
              <small>
                {achievements.filter((entry) => entry.unlocked).length}/{achievements.length}{" "}
                desbloqueados
              </small>
            </span>
          </button>
          <span className="nav-group-label">Cuenta</span>
          <button
            className={view === "profiles" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("profiles");
            }}
          >
            <Icon name="user" />
            <span>
              <strong>Mi perfil</strong>
              <small>Actividad y estadísticas</small>
            </span>
          </button>
        </nav>
        <section className="journey-card">
          <div className="journey-head">
            <span>Tu recorrido</span>
            <strong>{percent}%</strong>
          </div>
          <div className="progress-bar">
            <i style={{ width: `${percent}%` }} />
          </div>
          <small>
            {completedCount} de {releasedItems.length} títulos publicados
          </small>
          <button className="next-button" onClick={nextPending}>
            <Icon name="target" />
            Siguiente pendiente
          </button>
        </section>

        {view === "map" ? (
          <>
            <div className="sidebar-heading">
              <span>Líneas del mapa</span>
              <small>Enfoca un universo</small>
            </div>
            <nav className="track-list">
              <button
                className={activeTrack === "all" ? "active" : ""}
                onClick={() => setActiveTrack("all")}
              >
                <span className="all-lines">
                  <i />
                  <i />
                  <i />
                </span>
                <strong>Todo el multiverso</strong>
                <small>{ITEMS.length}</small>
              </button>
              {TRACKS.map((track) => {
                const items = ITEMS.filter((item) => item.trackId === track.id);
                const done = items.filter((item) => watched.has(item.id)).length;
                return (
                  <button
                    key={track.id}
                    className={activeTrack === track.id ? "active" : ""}
                    onClick={() => {
                      setActiveTrack(track.id);
                      const first = items[0];
                      if (first) centerItem(first, false);
                    }}
                  >
                    <span
                      className="track-swatch"
                      style={{ "--track": track.color } as React.CSSProperties}
                    />
                    <strong>{track.short}</strong>
                    <small>
                      {done}/{items.length}
                    </small>
                  </button>
                );
              })}
            </nav>
          </>
        ) : null}

        <div className="sidebar-tools">
          <button onClick={() => setGlobalSearchOpen(true)}>
            <Icon name="search" />
            Búsqueda global <kbd>Ctrl K</kbd>
          </button>
          <a
            className="tmdb-credit"
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
          >
            Arte de títulos proporcionado por TMDB
          </a>
        </div>
        <div className="keyboard-hint">
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
          <span>buscar todo</span>
          <kbd>Alt</kbd>
          <kbd>1–9</kbd>
          <span>secciones</span>
        </div>
      </aside>

      {view === "map" ? (
        <section className="map-workspace">
          <header className="map-toolbar">
            <div className="search-wrap">
              <Icon name="search" />
              <input
                id="map-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar una película o serie…"
              />
              {query && (
                <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")}>
                  <Icon name="close" size={15} />
                </button>
              )}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setQuery("");
                        setActiveTrack("all");
                        centerItem(item);
                      }}
                    >
                      <img src={posterFor(item, "thumb")} alt="" />
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          {item.date} · {TRACKS.find((track) => track.id === item.trackId)?.short}
                        </small>
                      </span>
                      <Icon name="chevron" size={15} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {routeTarget ? (
              <div className="route-focus-banner">
                <Icon name="route" />
                <span>
                  <small>Ruta revelada</small>
                  <strong>
                    {routeTarget.title} · {routeFocus.size} títulos
                  </strong>
                </span>
                <button
                  onClick={() => {
                    setRouteFocus(new Set());
                    setRouteTarget(null);
                  }}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ) : (
              <div className="era-nav">
                {ERAS.map((era) => (
                  <button key={era.label} onClick={() => jumpToYear(era.year)}>
                    {era.label}
                  </button>
                ))}
              </div>
            )}
            <div className="zoom-tools">
              <button
                className="map-focus-button"
                title="Enfocar el inicio del UCM"
                onClick={focusMcu}
              >
                UCM
              </button>
              <button title="Alejar" onClick={() => changeZoom(zoom - 0.1)}>
                <Icon name="minus" />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button title="Acercar" onClick={() => changeZoom(zoom + 0.1)}>
                <Icon name="plus" />
              </button>
              <button title="Ver todo el multiverso (F)" onClick={fitMap}>
                <Icon name="fit" />
              </button>
            </div>
          </header>

          <div
            ref={viewportRef}
            className={`map-viewport ${dragging ? "is-dragging" : ""} ${dragging || zooming ? "is-interacting" : ""} ${zoom < 0.38 ? "zoom-overview" : zoom < 0.78 ? "zoom-medium" : "zoom-close"}`}
            onScroll={updateMapScroll}
            onWheel={(event) => {
              if (event.ctrlKey) {
                event.preventDefault();
                changeZoom(zoom - event.deltaY * 0.0012, event.clientX, event.clientY);
              }
            }}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest("button")) return;
              const viewport = viewportRef.current;
              if (!viewport) return;
              setDragging(true);
              dragRef.current = {
                x: event.clientX,
                y: event.clientY,
                left: viewport.scrollLeft,
                top: viewport.scrollTop,
              };
              viewport.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragging) return;
              const viewport = viewportRef.current;
              if (viewport)
                viewport.scrollTo({
                  left: dragRef.current.left - (event.clientX - dragRef.current.x),
                  top: dragRef.current.top - (event.clientY - dragRef.current.y),
                });
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <div className="map-scale" style={{ width: MAP_WIDTH * zoom, height: mapHeight }}>
              <div className="map-world" style={{ width: MAP_WIDTH * zoom, height: mapHeight }}>
                <div className="map-years">
                  {Array.from(
                    { length: YEAR_END - YEAR_START + 1 },
                    (_, index) => YEAR_START + index,
                  ).map((year) => {
                    const compressed = (YEAR_WIDTHS.get(year) || 100) <= 70;
                    return (
                      <div
                        key={year}
                        className={`${year % 5 === 0 || year === YEAR_START ? "major-year" : ""} ${compressed ? "compressed-year" : ""}`}
                        style={{ left: xOf(year) * zoom }}
                      >
                        <span>{year}</span>
                        {compressed && <em>//</em>}
                      </div>
                    );
                  })}
                </div>
                <MapLines
                  activeTrack={activeTrack}
                  zoom={zoom}
                  mapHeight={mapHeight}
                  hideConnections={spoilerSafe || routeFocus.size > 0}
                />
                {routeTarget && (
                  <NarrativeOverlay targetId={routeTarget.id} zoom={zoom} mapHeight={mapHeight} />
                )}
                {visibleMapItems.map((item) => {
                  const track = TRACKS.find((entry) => entry.id === item.trackId)!;
                  const layout = labelLayout.get(item.id) || {
                    below: false,
                    offset: 30,
                    shift: 0,
                    leaderLength: 15,
                    leaderAngle: -90,
                  };
                  const completed = watched.has(item.id);
                  const isKey = KEY_IDS.has(item.id);
                  const muted =
                    routeFocus.size > 0
                      ? !routeFocus.has(item.id)
                      : activeTrack !== "all" &&
                        activeTrack !== item.trackId &&
                        !(isKey && item.trackId === "mcu");
                  const episodeTotal = EPISODE_COUNTS[item.id] || 0;
                  const episodeDone = episodes[item.id]?.length || 0;
                  const spoilerLocked = isSpoilerLocked(item);
                  return (
                    <button
                      key={item.id}
                      data-item-id={item.id}
                      data-track={item.trackId}
                      data-year={Math.floor(item.releaseValue)}
                      className={`station ${layout.below ? "station-below" : ""} ${completed ? "is-complete" : ""} ${selected?.id === item.id ? "is-selected" : ""} ${isKey ? "is-key" : ""} ${muted ? "is-muted" : ""} ${spoilerLocked ? "is-spoiler" : ""} ${routeFocus.has(item.id) ? "is-route" : ""}`}
                      style={
                        {
                          left: xOf(item.releaseValue) * zoom,
                          top: yOfTrack(item.trackId, zoom),
                          "--station": track.color,
                          "--card-offset": `${layout.offset}px`,
                          "--label-shift": `${layout.shift}px`,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        spoilerLocked
                          ? notify("Completa el título anterior para revelar este punto")
                          : setSelected(item)
                      }
                      title={spoilerLocked ? "Contenido protegido" : `${item.title} · ${item.date}`}
                    >
                      <span
                        className="station-leader"
                        style={{
                          width: `${layout.leaderLength}px`,
                          transform: `rotate(${layout.leaderAngle}deg)`,
                        }}
                      />
                      <span className="station-dot">
                        {completed && <Icon name="check" size={11} />}
                      </span>
                      <span className="station-card">
                        <img
                          className="station-poster"
                          src={posterFor(item, "thumb")}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          fetchPriority={selected?.id === item.id ? "high" : "low"}
                        />
                        <span className="station-copy">
                          <strong>{spoilerLocked ? "Contenido oculto" : item.title}</strong>
                          <small>{spoilerLocked ? "Protegido contra spoilers" : item.date}</small>
                          {!spoilerLocked && episodeTotal > 0 && (
                            <i>
                              <b style={{ width: `${(episodeDone / episodeTotal) * 100}%` }} />
                            </i>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
                <div className="map-help">
                  <Icon name="route" />
                  <span>Arrastra para recorrer · Ctrl + rueda para zoom</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : view === "dashboard" ? (
        <Dashboard
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
          marathons={marathons}
          stats={stats}
          onToggleTrack={toggleFavoriteTrack}
          onIntent={(nextIntent) => {
            setIntent(nextIntent);
            if (nextIntent === "random") setRandomSeed((value) => value + 1);
          }}
          onRefreshRandom={() => {
            setIntent("random");
            setRandomSeed((value) => value + 1);
          }}
          onToggleEpisode={toggleEpisode}
          onToggleWatched={toggleWatched}
          onToggleWatchlist={toggleWatchlist}
          onIgnore={ignoreItem}
          onOpenDetail={setSelected}
          onOpenMap={openInMap}
          onToggleSpoilers={() => setSpoilerSafe((value) => !value)}
          onOpenAchievements={() => setView("achievements")}
          onOpenMarathonLibrary={() => {
            setLibraryInitialTab("marathons");
            setView("list");
          }}
          onOpenSequence={openSequenceMap}
        />
      ) : view === "explore" ? (
        <DiscoveryHub
          items={releasedItems.map((item): DiscoveryItem => ({
            id: item.id,
            title: item.title,
            year: Math.floor(item.releaseValue),
            type: item.type,
            saga: item.saga || trackForId(item.trackId)?.short || "Marvel",
            poster: posterFor(item, "card"),
            backdrop: artworkFor(item, "hero"),
          }))}
          watched={watched}
          onOpen={(id) => {
            const item = ITEM_BY_ID.get(id);
            if (item) setSelected(item);
          }}
          onOpenSequence={(sequence) =>
            openSequenceMap({ ...sequence, tasks: sequence.itemIds.map((itemId) => ({ itemId })) })
          }
        />
      ) : view === "routes" ? (
        <RoutesView
          watched={watched}
          onOpenDetail={setSelected}
          onOpenMap={openInMap}
          onShowRoute={showRouteInMap}
          onOpenSequence={openSequenceMap}
        />
      ) : view === "planner" ? (
        <MarathonPlanner
          watched={watched}
          episodes={episodes}
          author={activeProfile?.name || "Nexus"}
          marathons={marathons}
          editingMarathonId={editingMarathonId}
          onMarathons={setMarathons}
          onEditConsumed={() => setEditingMarathonId(null)}
          onOpenLibrary={() => {
            setLibraryInitialTab("marathons");
            setView("list");
          }}
          onOpenSequence={openSequenceMap}
          onToggleWatched={toggleWatched}
          onToggleEpisode={toggleEpisode}
          onOpenDetail={setSelected}
          notify={notify}
        />
      ) : view === "calendar" ? (
        <MarvelCalendar onOpenDetail={setSelected} notify={notify} />
      ) : view === "achievements" ? (
        <AchievementsView
          achievements={preferences.achievements ? achievements : []}
          watched={watched}
          onOpenRoute={showAchievementRoute}
        />
      ) : view === "profiles" ? (
        <MyProfileView
          profile={activeProfile}
          watched={watched}
          ratings={ratings}
          favorites={favorites}
          history={history}
          rewatches={rewatches}
          achievements={preferences.achievements ? achievements : []}
          episodeCount={stats.episodeDone}
          completedLines={stats.completedLines}
          onOpenCollection={() => setView("explore")}
          onOpenAchievements={() => setView("achievements")}
          onOpenAchievementRoute={showAchievementRoute}
        />
      ) : (
        <ListView
          initialTab={libraryInitialTab}
          watchlist={watchlist}
          ignored={ignored}
          favorites={favorites}
          ratings={ratings}
          customLists={customLists}
          marathons={marathons}
          watched={watched}
          episodes={episodes}
          onToggleWatchlist={toggleWatchlist}
          onToggleFavorite={toggleFavorite}
          onLists={setCustomLists}
          onMarathons={setMarathons}
          onRestore={restoreItem}
          onOpenDetail={setSelected}
          onOpenMap={openInMap}
          onBrowseMap={() => setView("map")}
          onBrowseRecommendations={() => setView("dashboard")}
          onCreateMarathon={() => editMarathon(null)}
          onEditMarathon={editMarathon}
          onOpenSequence={openSequenceMap}
          notify={notify}
        />
      )}

      {selected && (
        <DetailPanel
          item={selected}
          mode={detailMode}
          pinned={detailPinned}
          watched={watched.has(selected.id)}
          episodes={episodes[selected.id] || []}
          saved={watchlist.has(selected.id)}
          ignored={ignored.has(selected.id)}
          favorite={favorites.has(selected.id)}
          rating={ratings[selected.id] || 0}
          note={notes[selected.id] || ""}
          watchedDate={watchedDates[selected.id] || ""}
          rewatchCount={rewatches[selected.id] || 0}
          customLists={customLists}
          onClose={() => {
            setSelected(null);
            setDetailPinned(false);
          }}
          onMode={setDetailMode}
          onPinned={() => setDetailPinned((value) => !value)}
          onToggleWatched={() => toggleWatched(selected)}
          onToggleEpisode={(episode) => toggleEpisode(selected, episode)}
          onToggleWatchlist={() => toggleWatchlist(selected)}
          onToggleFavorite={() => toggleFavorite(selected)}
          onRate={(value) => rateItem(selected, value)}
          onSaveNote={(value) => saveNote(selected, value)}
          onWatchedDate={(value) =>
            setWatchedDates((current) => ({ ...current, [selected.id]: value }))
          }
          onRewatch={() => registerRewatch(selected)}
          onAddToList={(listId) => addToCustomList(selected, listId)}
          onIgnore={() => (ignored.has(selected.id) ? restoreItem(selected) : ignoreItem(selected))}
          onNavigate={(id) => {
            const target = ITEM_BY_ID.get(id);
            if (target) setSelected(target);
          }}
          onShowRoute={(includeContext) => showRouteInMap(selected, includeContext)}
        />
      )}
      {globalSearchOpen && (
        <GlobalSearch
          query={globalQuery}
          setQuery={(value) => {
            setGlobalQuery(value);
            setGlobalIndex(0);
          }}
          hits={globalHits}
          activeIndex={globalIndex}
          onActive={setGlobalIndex}
          onOpen={openGlobalHit}
          onClose={() => {
            setGlobalSearchOpen(false);
            setGlobalQuery("");
          }}
        />
      )}
      {settingsOpen && (
        <PreferencesPanel
          value={preferences}
          onChange={setPreferences}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      <CloudWorkspace
        open={cloudOpen}
        onClose={() => setCloudOpen(false)}
        localProfiles={profiles}
        activeProfileId={activeProfileId}
        onAddLocalProfile={addLocalCloudProfile}
        onRemoveLocalProfile={removeLocalCloudProfile}
        onSwitchLocalProfile={switchProfile}
        notify={notify}
      />
      {sequenceMap && (
        <SequenceMapModal
          data={sequenceMap}
          watched={watched}
          episodes={episodes}
          onClose={() => setSequenceMap(null)}
          onOpenItem={(item) => {
            setSequenceMap(null);
            setSelected(item);
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" />
          <span>{toast.message}</span>
          {toast.onAction && (
            <button
              onClick={() => {
                const action = toast.onAction;
                setToast(null);
                action?.();
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </main>
  );
}

function GlobalSearch({
  query,
  setQuery,
  hits,
  activeIndex,
  onActive,
  onOpen,
  onClose,
}: {
  query: string;
  setQuery: (value: string) => void;
  hits: GlobalHit[];
  activeIndex: number;
  onActive: (index: number) => void;
  onOpen: (hit: GlobalHit) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="command-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda global"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="command-palette">
        <header>
          <Icon name="search" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Película, capítulo, personaje, universo o maratón…"
            aria-label="Buscar en todo Nexus"
          />
          <kbd>Esc</kbd>
        </header>
        {query.trim().length < 2 ? (
          <div className="command-empty">
            <Icon name="spark" size={30} />
            <strong>Busca cualquier parte del multiverso</strong>
            <p>Prueba “Wanda”, “capítulo 3”, “X-Men”, “variante” o el nombre de un maratón.</p>
          </div>
        ) : hits.length ? (
          <div className="command-results" role="listbox">
            {hits.map((hit, index) => (
              <button
                key={hit.key}
                className={index === activeIndex ? "active" : ""}
                onMouseEnter={() => onActive(index)}
                onClick={() => onOpen(hit)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <img
                  src={hit.sequence ? artworkFor(hit.item, "card") : posterFor(hit.item, "thumb")}
                  alt=""
                />
                <span>
                  <small>{hit.category}</small>
                  <strong>
                    {hit.sequence
                      ? hit.sequence.title
                      : hit.episode
                        ? `${hit.item.title} · Capítulo ${hit.episode}`
                        : hit.item.title}
                  </strong>
                  <p>{hit.context}</p>
                </span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        ) : (
          <div className="command-empty">
            <Icon name="search" size={30} />
            <strong>Sin coincidencias</strong>
            <p>Prueba otro título, personaje, universo o maratón.</p>
          </div>
        )}
        <footer>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navegar
          </span>
          <span>
            <kbd>Enter</kbd> abrir
          </span>
          <span>{hits.length} resultados</span>
        </footer>
      </section>
    </div>
  );
}

function PreferencesPanel({
  value,
  onChange,
  onClose,
}: {
  value: Preferences;
  onChange: React.Dispatch<React.SetStateAction<Preferences>>;
  onClose: () => void;
}) {
  const set = <K extends keyof Preferences>(key: K, next: Preferences[K]) => {
    if (key !== "achievements") onChange((current) => ({ ...current, [key]: next }));
  };
  return (
    <div
      className="preferences-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="preferences-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Apariencia y accesibilidad"
      >
        <header>
          <div>
            <span className="dash-eyebrow">Personalización</span>
            <h2>Apariencia y acceso</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="preference-scroll">
          <section>
            <h3>Color principal</h3>
            <div className="accent-options">
              {(["red", "violet", "cyan"] as const).map((accent) => (
                <button
                  key={accent}
                  className={`${accent} ${value.accent === accent ? "active" : ""}`}
                  onClick={() => set("accent", accent)}
                >
                  <i />
                  {accent === "red" ? "Nexus" : accent === "violet" ? "Multiverso" : "Cósmico"}
                </button>
              ))}
            </div>
            <label>
              <span>
                Intensidad del color <b>{value.intensity}%</b>
              </span>
              <input
                type="range"
                min="35"
                max="100"
                value={value.intensity}
                onChange={(event) => set("intensity", Number(event.target.value))}
              />
            </label>
          </section>
          <section>
            <h3>Densidad y tarjetas</h3>
            <div className="segmented">
              {(["comfortable", "compact"] as const).map((density) => (
                <button
                  key={density}
                  className={value.density === density ? "active" : ""}
                  onClick={() => set("density", density)}
                >
                  {density === "comfortable" ? "Cómoda" : "Compacta"}
                </button>
              ))}
            </div>
            <div className="segmented three">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  className={value.cardSize === size ? "active" : ""}
                  onClick={() => set("cardSize", size)}
                >
                  {size === "small" ? "Pequeña" : size === "medium" ? "Mediana" : "Grande"}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3>Lectura y accesibilidad</h3>
            <label>
              <span>
                Tamaño de texto <b>{value.fontScale}%</b>
              </span>
              <input
                type="range"
                min="100"
                max="135"
                step="5"
                value={Math.max(100, value.fontScale)}
                onChange={(event) => set("fontScale", Number(event.target.value))}
              />
            </label>
            <div className="text-size-presets" aria-label="Tamaños de texto recomendados">
              <button
                className={value.fontScale === 100 ? "active" : ""}
                onClick={() => set("fontScale", 100)}
              >
                Normal
              </button>
              <button
                className={value.fontScale === 115 ? "active" : ""}
                onClick={() => set("fontScale", 115)}
              >
                Grande
              </button>
              <button
                className={value.fontScale === 130 ? "active" : ""}
                onClick={() => set("fontScale", 130)}
              >
                Muy grande
              </button>
            </div>
            <button
              className={`switch-row ${value.highContrast ? "active" : ""}`}
              onClick={() => set("highContrast", !value.highContrast)}
            >
              <span>
                <strong>Alto contraste</strong>
                <small>Refuerza bordes, texto y controles</small>
              </span>
              <i />
            </button>
            <button
              className={`switch-row ${value.reduceMotion ? "active" : ""}`}
              onClick={() => set("reduceMotion", !value.reduceMotion)}
            >
              <span>
                <strong>Reducir animaciones</strong>
                <small>Evita desplazamientos y efectos decorativos</small>
              </span>
              <i />
            </button>
            <button
              className={`switch-row ${value.achievements ? "active" : ""}`}
              onClick={() => set("achievements", !value.achievements)}
            >
              <span>
                <strong>Logros opcionales</strong>
                <small>Muestra progreso y celebraciones</small>
              </span>
              <i />
            </button>
          </section>
          <section className="shortcut-list">
            <h3>Atajos</h3>
            <p>
              <kbd>Ctrl K</kbd>
              <span>Búsqueda global</span>
            </p>
            <p>
              <kbd>Alt 1–7</kbd>
              <span>Cambiar de sección</span>
            </p>
            <p>
              <kbd>Esc</kbd>
              <span>Cerrar paneles</span>
            </p>
            <p>
              <kbd>Tab</kbd>
              <span>Recorrer controles</span>
            </p>
          </section>
        </div>
        <footer>
          <button onClick={() => onChange(DEFAULT_PREFERENCES)}>Restablecer</button>
          <button onClick={onClose}>Guardar y cerrar</button>
        </footer>
      </aside>
    </div>
  );
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
  marathons: SharedMarathon[];
  stats: {
    episodeDone: number;
    seriesCompleted: number;
    moviesCompleted: number;
    completedLines: number;
    remainingMinutes: number;
    bestTrack: { track: (typeof TRACKS)[number]; ratio: number } | undefined;
    lastItem: MapItem | null | undefined;
  };
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
  onOpenAchievements: () => void;
  onOpenMarathonLibrary: () => void;
  onOpenSequence: (data: SequenceMapData) => void;
};

function Dashboard(props: DashboardProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { continueItem, episodes, watched } = props;
  const continueTotal = continueItem ? EPISODE_COUNTS[continueItem.id] || 0 : 0;
  const continueDone = continueItem ? episodes[continueItem.id]?.length || 0 : 0;
  const nextEpisode = continueTotal
    ? Array.from({ length: continueTotal }, (_, index) => index + 1).find(
        (episode) => !(episodes[continueItem!.id] || []).includes(episode),
      )
    : undefined;
  const bestTrackLabel = props.stats.bestTrack?.ratio
    ? props.stats.bestTrack.track.short
    : "Aún sin avance";
  const activeMarathon =
    props.marathons.find((marathon) =>
      marathon.tasks.some((task) => !marathonTaskDone(task, watched, episodes)),
    ) || props.marathons[0];
  const marathonDone =
    activeMarathon?.tasks.filter((task) => marathonTaskDone(task, watched, episodes)).length || 0;
  const marathonNext = activeMarathon?.tasks.find(
    (task) => !marathonTaskDone(task, watched, episodes),
  );
  const marathonNextItem = marathonNext ? ITEM_BY_ID.get(marathonNext.itemId) : undefined;

  return (
    <section className="dashboard-workspace">
      <header className="dashboard-toolbar">
        <div>
          <span className="dash-eyebrow">Tu centro de control</span>
          <h1>¿Qué quieres ver hoy?</h1>
        </div>
      </header>
      <div className="dashboard-scroll">
        <div className="dashboard-grid-top">
          <section className="continue-card">
            {continueItem ? (
              <>
                <img className="continue-art" src={artworkFor(continueItem)} alt="" />
                <img
                  className="continue-poster"
                  src={posterFor(continueItem, "full")}
                  alt={`Póster de ${continueItem.title}`}
                />
                <div className="continue-shade" />
                <div className="continue-copy">
                  <span className="dash-eyebrow">
                    {continueDone > 0 ? "Continuar viendo" : "Siguiente pendiente"}
                  </span>
                  <div className="continue-line">
                    <i style={{ background: trackForId(continueItem.trackId)?.color }} />
                    {trackForId(continueItem.trackId)?.short}
                  </div>
                  <TitleHeading item={continueItem} placement="hero" />
                  <p>
                    {continueTotal
                      ? `${continueDone}/${continueTotal} capítulos vistos${nextEpisode ? ` · sigue el capítulo ${nextEpisode}` : ""}`
                      : `${continueItem.date} · ${TYPE_LABEL[continueItem.type]}`}
                  </p>
                  {continueTotal > 0 && (
                    <div className="continue-progress">
                      <i style={{ width: `${(continueDone / continueTotal) * 100}%` }} />
                    </div>
                  )}
                  <div className="continue-actions">
                    <button className="primary" onClick={() => props.onOpenDetail(continueItem)}>
                      <Icon name="film" />
                      {continueTotal ? "Continuar" : "Ver detalles"}
                    </button>
                    {nextEpisode ? (
                      <button onClick={() => props.onToggleEpisode(continueItem, nextEpisode)}>
                        <Icon name="check" />
                        Marcar EP {nextEpisode}
                      </button>
                    ) : (
                      !continueItem.upcoming && (
                        <button onClick={() => props.onToggleWatched(continueItem)}>
                          <Icon name="check" />
                          {watched.has(continueItem.id) ? "Desmarcar" : "Marcar vista"}
                        </button>
                      )
                    )}
                    <button
                      className="icon-action"
                      title="Ver en el mapa"
                      onClick={() => props.onOpenMap(continueItem)}
                    >
                      <Icon name="route" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-continue">
                <Icon name="check" size={32} />
                <h2>Recorrido completado</h2>
                <p>No tienes títulos pendientes en las líneas escogidas.</p>
              </div>
            )}
          </section>

          <section className="daily-card">
            <div className="daily-heading">
              <span>
                <Icon name="spark" />
                Recomendación del día
              </span>
              <small>Una decisión, sin ruido</small>
            </div>
            {props.dailyRecommendation ? (
              <>
                <div className="daily-media">
                  <img src={posterFor(props.dailyRecommendation)} alt="" />
                  <span>
                    <strong>{props.dailyRecommendation.title}</strong>
                    <small>
                      {props.dailyRecommendation.date} ·{" "}
                      {trackForId(props.dailyRecommendation.trackId)?.short}
                    </small>
                  </span>
                </div>
                <p>Elegida entre tus líneas activas y tus títulos pendientes.</p>
                <div className="daily-actions">
                  <button onClick={() => props.onOpenDetail(props.dailyRecommendation!)}>
                    Ver recomendación
                  </button>
                  <button
                    title="Guardar"
                    className={props.watchlist.has(props.dailyRecommendation.id) ? "saved" : ""}
                    onClick={() => props.onToggleWatchlist(props.dailyRecommendation!)}
                  >
                    <Icon name="bookmark" />
                  </button>
                </div>
              </>
            ) : (
              <div className="daily-empty">
                <Icon name="check" />
                <p>Ya terminaste todo lo publicado.</p>
              </div>
            )}
          </section>
        </div>

        {activeMarathon && (
          <section className="dashboard-marathon-strip">
            <div className="dashboard-marathon-collage">
              {activeMarathon.coverIds
                .slice(0, 4)
                .map(
                  (id) =>
                    ITEM_BY_ID.get(id) && (
                      <img
                        key={id}
                        src={artworkFor(ITEM_BY_ID.get(id), "card")}
                        alt=""
                        loading="lazy"
                      />
                    ),
                )}
            </div>
            <div>
              <span className="dash-eyebrow">CONTINUAR MARATÓN</span>
              <h2>{activeMarathon.name}</h2>
              <p>
                {marathonNextItem
                  ? `Siguiente: ${marathonNextItem.title}${marathonNext?.episode ? ` · capítulo ${marathonNext.episode}` : ""}`
                  : "Recorrido completado"}
              </p>
              <i>
                <b
                  style={{
                    width: `${(marathonDone / Math.max(1, activeMarathon.tasks.length)) * 100}%`,
                  }}
                />
              </i>
            </div>
            <strong>
              {marathonDone}/{activeMarathon.tasks.length}
            </strong>
            <button
              onClick={() =>
                props.onOpenSequence({
                  id: activeMarathon.id,
                  title: activeMarathon.name,
                  subtitle: `${activeMarathon.tasks.length} sesiones · ${activeMarathon.author}`,
                  tasks: activeMarathon.tasks,
                  kind: "marathon",
                })
              }
            >
              <Icon name="route" />
              Abrir mapa
            </button>
            <button onClick={props.onOpenMarathonLibrary}>
              <Icon name="bookmark" />
              Biblioteca
            </button>
          </section>
        )}

        <section className="dashboard-section recommendations-section">
          <div className="dashboard-section-head">
            <div>
              <span className="dash-eyebrow">Selección explicada</span>
              <h2>Recomendado para ti</h2>
            </div>
            <small>Ordenado según tu intención</small>
          </div>
          {props.recommendations.length ? (
            <div className="recommendation-grid">
              {props.recommendations.map((entry, index) => (
                <RecommendationCard
                  key={entry.item.id}
                  recommendation={entry}
                  index={index}
                  episodes={episodes}
                  saved={props.watchlist.has(entry.item.id)}
                  onOpen={() => props.onOpenDetail(entry.item)}
                  onMap={() => props.onOpenMap(entry.item)}
                  onSave={() => props.onToggleWatchlist(entry.item)}
                  onIgnore={() => props.onIgnore(entry.item)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-recommendations">
              <Icon name="check" />
              <h3>No quedan títulos con estos filtros</h3>
              <p>Prueba otra intención o activa más líneas.</p>
            </div>
          )}
        </section>

        <section className="recommendation-settings">
          <button
            className="recommendation-settings-toggle"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((value) => !value)}
          >
            <span>
              <Icon name="settings" />
              <span>
                <strong>Ajustar recomendaciones</strong>
                <small>
                  {props.favoriteTracks.size || TRACKS.length} líneas ·{" "}
                  {INTENTS.find((entry) => entry.id === props.intent)?.label}
                </small>
              </span>
            </span>
            <Icon name={filtersOpen ? "minus" : "plus"} />
          </button>
          {filtersOpen && (
            <div className="recommendation-settings-panel">
              <section className="dashboard-section filter-section">
                <div className="dashboard-section-head">
                  <div>
                    <span className="dash-eyebrow">Personaliza la ruta</span>
                    <h2>¿Qué líneas quieres recorrer?</h2>
                  </div>
                  <small>
                    {props.favoriteTracks.size
                      ? `${props.favoriteTracks.size} seleccionadas`
                      : "Ninguna seleccionada: se usan todas"}
                  </small>
                </div>
                <div className="line-picker">
                  {TRACKS.map((track) => (
                    <button
                      key={track.id}
                      className={props.favoriteTracks.has(track.id) ? "selected" : ""}
                      onClick={() => props.onToggleTrack(track.id)}
                      aria-pressed={props.favoriteTracks.has(track.id)}
                      style={{ "--line-color": track.color } as React.CSSProperties}
                    >
                      <i />
                      <span>{track.short}</span>
                      <b>{ITEMS.filter((item) => item.trackId === track.id).length}</b>
                    </button>
                  ))}
                </div>
              </section>

              <section className="dashboard-section filter-section">
                <div className="dashboard-section-head">
                  <div>
                    <span className="dash-eyebrow">Modo de recomendación</span>
                    <h2>¿Qué te apetece?</h2>
                  </div>
                  {props.intent === "random" && (
                    <button className="refresh-random" onClick={props.onRefreshRandom}>
                      <Icon name="shuffle" />
                      Volver a elegir
                    </button>
                  )}
                </div>
                <div className="intent-picker">
                  {INTENTS.map((entry) => (
                    <button
                      key={entry.id}
                      className={props.intent === entry.id ? "selected" : ""}
                      onClick={() => props.onIntent(entry.id)}
                    >
                      <Icon
                        name={
                          entry.id === "random"
                            ? "shuffle"
                            : entry.id === "short"
                              ? "clock"
                              : entry.id === "new-line"
                                ? "route"
                                : entry.id === "series"
                                  ? "bar"
                                  : "film"
                        }
                      />
                      <span>
                        <strong>{entry.label}</strong>
                        <small>{entry.hint}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>

        <section className="dashboard-section progress-summary">
          <div className="dashboard-section-head">
            <div>
              <span className="dash-eyebrow">Resumen de progreso</span>
              <h2>Tu multiverso en números</h2>
            </div>
            <small>Duraciones reales cuando están disponibles</small>
          </div>
          <div className="stat-grid">
            <div>
              <Icon name="film" />
              <span>
                <strong>{props.stats.moviesCompleted}</strong>
                <small>películas y especiales</small>
              </span>
            </div>
            <div>
              <Icon name="bar" />
              <span>
                <strong>{props.stats.seriesCompleted}</strong>
                <small>series terminadas</small>
              </span>
            </div>
            <div>
              <Icon name="check" />
              <span>
                <strong>{props.stats.episodeDone}</strong>
                <small>capítulos vistos</small>
              </span>
            </div>
            <button onClick={props.onOpenAchievements}>
              <Icon name="trophy" />
              <span>
                <strong>Ver logros</strong>
                <small>retos y recompensas</small>
              </span>
            </button>
            <div>
              <Icon name="clock" />
              <span>
                <strong>{formatMinutes(props.stats.remainingMinutes)}</strong>
                <small>tiempo restante</small>
              </span>
            </div>
            <div>
              <Icon name="target" />
              <span>
                <strong>{bestTrackLabel}</strong>
                <small>universo más avanzado</small>
              </span>
            </div>
            <div className="last-activity">
              <Icon name="spark" />
              <span>
                <strong>{props.stats.lastItem?.title || "Aún sin actividad"}</strong>
                <small>última actividad</small>
              </span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function RecommendationCard({
  recommendation,
  index,
  episodes,
  saved,
  onOpen,
  onMap,
  onSave,
  onIgnore,
}: {
  recommendation: Recommendation;
  index: number;
  episodes: EpisodeState;
  saved: boolean;
  onOpen: () => void;
  onMap: () => void;
  onSave: () => void;
  onIgnore: () => void;
}) {
  const item = recommendation.item;
  const total = EPISODE_COUNTS[item.id] || 0;
  const done = episodes[item.id]?.length || 0;
  const track = trackForId(item.trackId);
  return (
    <article
      className={`recommendation-card media-${item.type}`}
      data-item-id={item.id}
      data-kind={total ? "series" : "movie"}
      style={mediaStyle(item)}
    >
      <button className="recommendation-poster" onClick={onOpen}>
        <img
          src={artworkFor(item, "card")}
          alt={`Imagen panorámica de ${item.title}`}
          loading="lazy"
        />
        <span className="recommendation-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="recommendation-type">
          <Icon name={total ? "film" : "clock"} size={11} />
          {TYPE_LABEL[item.type]}
        </span>
        <i className="recommendation-shade" />
        {total > 0 && (
          <i className="recommendation-progress">
            <b style={{ width: `${(done / total) * 100}%` }} />
          </i>
        )}
      </button>
      <div className="recommendation-body">
        <small>
          <i style={{ background: track?.color }} />
          {track?.short}
          <span>•</span>
          {item.date}
        </small>
        <h3>{item.title}</h3>
        <p>
          <Icon name="spark" size={13} />
          {recommendation.reason}
        </p>
      </div>
      <div className="recommendation-actions">
        <button onClick={onOpen}>Abrir</button>
        <button title="Ver en el mapa" onClick={onMap}>
          <Icon name="route" />
        </button>
        <button title="Guardar en Mi lista" className={saved ? "saved" : ""} onClick={onSave}>
          <Icon name="bookmark" />
        </button>
        <button title="No me interesa" onClick={onIgnore}>
          <Icon name="close" />
        </button>
      </div>
    </article>
  );
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

function RoutesView({
  watched,
  onOpenDetail,
  onOpenMap,
  onShowRoute,
  onOpenSequence,
}: {
  watched: Set<string>;
  onOpenDetail: (item: MapItem) => void;
  onOpenMap: (item: MapItem) => void;
  onShowRoute: (item: MapItem, includeContext?: boolean) => void;
  onOpenSequence: (data: SequenceMapData) => void;
}) {
  const [mode, setMode] = useState<RouteMode>("quick");
  const [targetId, setTargetId] = useState(() =>
    ITEM_BY_ID.has("brand-new-day") ? "brand-new-day" : "no-way-home",
  );
  const [includeContext, setIncludeContext] = useState(false);
  const [customRoute, setCustomRoute] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_ROUTE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  useEffect(
    () => localStorage.setItem(CUSTOM_ROUTE_KEY, JSON.stringify(customRoute)),
    [customRoute],
  );
  const target = ITEM_BY_ID.get(targetId) || ITEMS[0];

  const routeItems = useMemo(() => {
    if (mode === "release") return [...ITEMS].sort((a, b) => a.releaseValue - b.releaseValue);
    if (mode === "chronological")
      return [...ITEMS].sort(
        (a, b) =>
          (INTERNAL_ORDER_RANK.get(a.id) ?? 1000 + a.releaseValue) -
          (INTERNAL_ORDER_RANK.get(b.id) ?? 1000 + b.releaseValue),
      );
    if (mode === "core")
      return ITEMS.filter((item) => CORE_STORY_IDS.has(item.id)).sort(
        (a, b) => a.releaseValue - b.releaseValue,
      );
    if (mode === "quick") return dependencyRoute(target.id, includeContext);
    if (mode === "custom")
      return customRoute.map((id) => ITEM_BY_ID.get(id)).filter(Boolean) as MapItem[];
    const result: MapItem[] = [];
    const visited = new Set<string>();
    const visit = (item: MapItem) => {
      if (visited.has(item.id)) return;
      visited.add(item.id);
      for (const edge of NARRATIVE_LINKS[item.id] || []) {
        const prerequisite = ITEM_BY_ID.get(edge.prerequisite);
        if (prerequisite) visit(prerequisite);
      }
      result.push(item);
    };
    [...ITEMS].sort((a, b) => a.releaseValue - b.releaseValue).forEach(visit);
    return result;
  }, [customRoute, includeContext, mode, target.id]);

  const moveCustom = (index: number, direction: -1 | 1) =>
    setCustomRoute((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });

  return (
    <section className="dashboard-workspace routes-workspace">
      <header className="dashboard-toolbar">
        <div>
          <span className="dash-eyebrow">Navegación narrativa</span>
          <h1>Órdenes y rutas</h1>
        </div>
        <div className="route-total">
          <Icon name="route" />
          <span>
            <strong>{routeItems.length}</strong>
            <small>títulos en esta ruta</small>
          </span>
        </div>
      </header>
      <div className="dashboard-scroll">
        <div className="route-mode-picker">
          {ROUTE_MODES.map((entry) => (
            <button
              key={entry.id}
              className={mode === entry.id ? "selected" : ""}
              onClick={() => setMode(entry.id)}
            >
              <Icon
                name={
                  entry.id === "quick"
                    ? "target"
                    : entry.id === "custom"
                      ? "bookmark"
                      : entry.id === "chronological"
                        ? "clock"
                        : "route"
                }
              />
              <span>
                <strong>{entry.label}</strong>
                <small>{entry.hint}</small>
              </span>
            </button>
          ))}
        </div>

        {(mode === "quick" || mode === "custom") && (
          <section className="route-builder">
            <div>
              <span className="dash-eyebrow">Objetivo</span>
              <h2>
                {mode === "quick"
                  ? "¿Para qué película quieres prepararte?"
                  : "Añade títulos a tu orden"}
              </h2>
            </div>
            <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
              {[...ITEMS]
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} · {item.date}
                  </option>
                ))}
            </select>
            {mode === "quick" ? (
              <>
                <button
                  className={`context-toggle ${includeContext ? "active" : ""}`}
                  onClick={() => setIncludeContext((value) => !value)}
                >
                  <Icon name="spark" />
                  <span>
                    <strong>Contexto ampliado</strong>
                    <small>
                      {includeContext
                        ? "Incluye Tobey, Andrew, variantes y series"
                        : "Desactivado: mapa limpio y esencial"}
                    </small>
                  </span>
                </button>
                <button
                  className="show-route-button"
                  onClick={() => onShowRoute(target, includeContext)}
                >
                  <Icon name="route" />
                  Mostrar esta ruta en el mapa
                </button>
              </>
            ) : (
              <button
                className="show-route-button"
                disabled={customRoute.includes(target.id)}
                onClick={() => setCustomRoute((current) => [...current, target.id])}
              >
                <Icon name="plus" />
                {customRoute.includes(target.id) ? "Ya está en tu orden" : "Añadir al final"}
              </button>
            )}
          </section>
        )}

        <section className="route-sequence">
          <div className="dashboard-section-head">
            <div>
              <span className="dash-eyebrow">Secuencia resultante</span>
              <h2>{ROUTE_MODES.find((entry) => entry.id === mode)?.label}</h2>
            </div>
            <div className="sequence-heading-actions">
              <small>
                {routeItems.filter((item) => watched.has(item.id)).length}/{routeItems.length}{" "}
                completados
              </small>
              <button
                disabled={!routeItems.length}
                onClick={() =>
                  onOpenSequence({
                    id: `route-${mode}-${target.id}`,
                    title: ROUTE_MODES.find((entry) => entry.id === mode)?.label || "Ruta Nexus",
                    subtitle:
                      mode === "quick"
                        ? `Preparación para ${target.title}`
                        : "Orden de visualización",
                    tasks: routeItems.map((item) => ({ itemId: item.id })),
                    kind: "route",
                  })
                }
              >
                <Icon name="route" />
                Ver como mapa
              </button>
            </div>
          </div>
          {routeItems.length ? (
            <div className="route-list">
              {routeItems.map((item, index) => {
                const directToNext =
                  index < routeItems.length - 1
                    ? (NARRATIVE_LINKS[routeItems[index + 1].id] || []).find(
                        (edge) => edge.prerequisite === item.id,
                      )
                    : undefined;
                return (
                  <React.Fragment key={`${item.id}-${index}`}>
                    <article
                      className={`${watched.has(item.id) ? "complete " : ""}media-${item.type}`}
                      style={mediaStyle(item)}
                    >
                      <span className="route-index">{String(index + 1).padStart(2, "0")}</span>
                      <img src={posterFor(item)} alt="" />
                      <div>
                        <small>
                          <b className="type-dot" />
                          {TYPE_LABEL[item.type]} · {trackForId(item.trackId)?.short} · {item.date}
                        </small>
                        <h3>{item.title}</h3>
                        {directToNext && (
                          <p
                            style={
                              {
                                "--edge": CONNECTION_COLOR[directToNext.kind],
                              } as React.CSSProperties
                            }
                          >
                            <i />
                            {CONNECTION_LABEL[directToNext.kind]} para el siguiente título
                          </p>
                        )}
                      </div>
                      <div className="route-item-actions">
                        <button onClick={() => onOpenDetail(item)}>Ficha</button>
                        <button title="Ver en mapa" onClick={() => onOpenMap(item)}>
                          <Icon name="route" />
                        </button>
                        {mode === "custom" && (
                          <>
                            <button
                              title="Subir"
                              disabled={index === 0}
                              onClick={() => moveCustom(index, -1)}
                            >
                              ↑
                            </button>
                            <button
                              title="Bajar"
                              disabled={index === routeItems.length - 1}
                              onClick={() => moveCustom(index, 1)}
                            >
                              ↓
                            </button>
                            <button
                              title="Quitar"
                              onClick={() =>
                                setCustomRoute((current) =>
                                  current.filter((_id, currentIndex) => currentIndex !== index),
                                )
                              }
                            >
                              <Icon name="close" />
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                    {index < routeItems.length - 1 && <span className="route-step-line" />}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="list-empty">
              <Icon name="route" size={36} />
              <h2>Tu orden está vacío</h2>
              <p>Selecciona un título y añádelo para construir tu ruta personalizada.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

type MarathonTask = {
  key: string;
  itemId: string;
  episode?: number;
  minutes: number;
  date: string;
  done: boolean;
};
const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const VERIFIED_RELEASES: Array<{
  id: string;
  date?: string;
  status: "confirmed" | "window" | "tbd";
  source: string;
  note?: string;
}> = [
  {
    id: "punisher-special",
    date: "2026-05-12",
    status: "confirmed",
    source:
      "https://www.marvel.com/articles/tv-shows/a-marvel-television-special-presentation-the-punisher-one-last-kill-may-12-teaser-poster",
  },
  {
    id: "xmen97-2",
    date: "2026-07-01",
    status: "confirmed",
    source:
      "https://www.marvel.com/articles/tv-shows/x-men-97-season-2-trailer-july-1-2026-release-date-disney-plus",
  },
  {
    id: "brand-new-day",
    date: "2026-07-31",
    status: "confirmed",
    source: "https://www.marvel.com/movies/spider-man-brand-new-day",
  },
  {
    id: "friendly-spider-2",
    status: "window",
    source: "https://www.marvel.com/tv-shows",
    note: "Otoño de 2026",
  },
  {
    id: "visionquest",
    date: "2026-10-14",
    status: "confirmed",
    source: "https://www.marvel.com/articles/tv-shows/marvel-television-visionquest-release-date",
  },
  {
    id: "doomsday",
    date: "2026-12-18",
    status: "confirmed",
    source: "https://www.marvel.com/movies/avengers-doomsday",
  },
  { id: "daredevil-ba-3", status: "tbd", source: "https://www.marvel.com/tv-shows" },
  { id: "wonder-man-2", status: "tbd", source: "https://www.marvel.com/tv-shows" },
  {
    id: "secret-wars",
    date: "2027-12-17",
    status: "confirmed",
    source: "https://www.marvel.com/movies/avengers-secret-wars",
  },
];
const dateAtNoon = (iso: string) => new Date(`${iso}T12:00:00`);
const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const formatDate = (iso: string) =>
  dateAtNoon(iso).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
const daysUntil = (iso: string) =>
  Math.ceil((dateAtNoon(iso).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);

function MarathonPlanner({
  watched,
  episodes,
  author,
  marathons,
  editingMarathonId,
  onMarathons,
  onEditConsumed,
  onOpenLibrary,
  onOpenSequence,
  onToggleWatched,
  onToggleEpisode,
  onOpenDetail,
  notify,
}: {
  watched: Set<string>;
  episodes: EpisodeState;
  author: string;
  marathons: SharedMarathon[];
  editingMarathonId: string | null;
  onMarathons: React.Dispatch<React.SetStateAction<SharedMarathon[]>>;
  onEditConsumed: () => void;
  onOpenLibrary: () => void;
  onOpenSequence: (data: SequenceMapData) => void;
  onToggleWatched: (item: MapItem) => void;
  onToggleEpisode: (item: MapItem, episode: number) => void;
  onOpenDetail: (item: MapItem) => void;
  notify: (message: string) => void;
}) {
  const [plannerMode, setPlannerMode] = useState<"auto" | "custom">("auto");
  const [targetId, setTargetId] = useState("secret-wars");
  const [trackId, setTrackId] = useState("route");
  const [hours, setHours] = useState(3);
  const [startDate, setStartDate] = useState(() => isoDate(new Date()));
  const [days, setDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 0]));
  const [includeContext, setIncludeContext] = useState(false);
  const [plan, setPlan] = useState<MarathonTask[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(MARATHON_KEY) || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => localStorage.setItem(MARATHON_KEY, JSON.stringify(plan)), [plan]);
  useEffect(() => {
    if (editingMarathonId) setPlannerMode("custom");
  }, [editingMarathonId]);

  const buildPlan = (fromDate = startDate) => {
    const target = ITEM_BY_ID.get(targetId)!;
    const sourceItems =
      trackId === "route"
        ? dependencyRoute(target.id, includeContext).filter(
            (item) => item.id !== target.id || !target.upcoming,
          )
        : ITEMS.filter((item) => item.trackId === trackId).sort(
            (a, b) => a.releaseValue - b.releaseValue,
          );
    const tasks: Omit<MarathonTask, "date">[] = [];
    for (const item of sourceItems) {
      if (item.upcoming || watched.has(item.id)) continue;
      const total = EPISODE_COUNTS[item.id] || 0;
      if (total) {
        const complete = new Set(episodes[item.id] || []);
        for (let episode = 1; episode <= total; episode += 1)
          if (!complete.has(episode)) {
            const minutes =
              TITLE_METADATA[item.id]?.episodeDurations?.[episode - 1] ||
              TITLE_METADATA[item.id]?.episodeRuntimeMinutes ||
              EPISODE_RUNTIME_OVERRIDES[item.id] ||
              (item.type === "animation" ? 24 : 42);
            tasks.push({
              key: `${item.id}-e${episode}`,
              itemId: item.id,
              episode,
              minutes,
              done: false,
            });
          }
      } else
        tasks.push({
          key: item.id,
          itemId: item.id,
          minutes: TITLE_METADATA[item.id]?.runtimeMinutes || RUNTIME_OVERRIDES[item.id] || 120,
          done: false,
        });
    }
    const capacity = Math.max(30, hours * 60);
    const allowed = days.size ? days : new Set([0, 1, 2, 3, 4, 5, 6]);
    let cursor = dateAtNoon(fromDate);
    const nextAllowed = () => {
      while (!allowed.has(cursor.getDay())) cursor.setDate(cursor.getDate() + 1);
    };
    nextAllowed();
    let used = 0;
    const scheduled: MarathonTask[] = [];
    for (const task of tasks) {
      if (used > 0 && used + task.minutes > capacity) {
        cursor.setDate(cursor.getDate() + 1);
        nextAllowed();
        used = 0;
      }
      scheduled.push({ ...task, date: isoDate(cursor) });
      used += task.minutes;
    }
    setPlan(scheduled);
    notify(
      scheduled.length
        ? `Plan creado: ${scheduled.length} sesiones`
        : "No quedan títulos pendientes en esa ruta",
    );
  };
  const reorganize = () => {
    setStartDate(isoDate(new Date()));
    buildPlan(isoDate(new Date()));
    notify("Días perdidos reorganizados desde hoy");
  };
  const groups = [...new Set(plan.map((task) => task.date))];
  const totalMinutes = plan.reduce((sum, task) => sum + task.minutes, 0);
  const completed = plan.filter((task) => task.done).length;
  const finishDate = groups.at(-1);
  const target = ITEM_BY_ID.get(targetId)!;
  return (
    <section className="dashboard-workspace planner-workspace">
      <header
        className="dashboard-toolbar artwork-toolbar"
        style={{ "--hero": `url(${artworkFor(target)})` } as React.CSSProperties}
      >
        <div>
          <span className="dash-eyebrow">Planificador de maratones</span>
          <h1>Llega preparado a cualquier estreno</h1>
          <p>Convierte una ruta narrativa en sesiones realistas según tus horas libres.</p>
        </div>
        <div className="planner-target">
          <img src={posterFor(target, "thumb")} alt="" />
          <span>
            <small>Objetivo actual</small>
            <strong>{target.title}</strong>
          </span>
        </div>
      </header>
      <div className="dashboard-scroll">
        <div className="planner-mode">
          <button
            className={plannerMode === "auto" ? "active" : ""}
            onClick={() => setPlannerMode("auto")}
          >
            <Icon name="spark" />
            Plan automático
          </button>
          <button
            className={plannerMode === "custom" ? "active" : ""}
            onClick={() => {
              setPlannerMode("custom");
              onEditConsumed();
            }}
          >
            <Icon name="grip" />
            Crear para mí
          </button>
          <button onClick={onOpenLibrary}>
            <Icon name="bookmark" />
            Mis maratones <b>{marathons.length}</b>
          </button>
        </div>
        {plannerMode === "auto" ? (
          <>
            <section className="planner-config">
              <label>
                <span>Objetivo final</span>
                <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                  {ITEMS.filter(
                    (item) =>
                      item.upcoming ||
                      ["no-way-home", "deadpool-wolverine", "endgame"].includes(item.id),
                  )
                    .sort((a, b) => a.releaseValue - b.releaseValue)
                    .map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.title}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>Recorrido</span>
                <select value={trackId} onChange={(event) => setTrackId(event.target.value)}>
                  <option value="route">Requisitos del objetivo</option>
                  {TRACKS.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Horas libres por día</span>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={hours}
                  onChange={(event) => setHours(Number(event.target.value))}
                />
              </label>
              <label>
                <span>Comenzar</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <div className="day-selector">
                <span>Días disponibles</span>
                <div>
                  {DAY_LABELS.map((label, index) => (
                    <button
                      key={label}
                      className={days.has(index) ? "active" : ""}
                      onClick={() =>
                        setDays((current) => {
                          const next = new Set(current);
                          if (next.has(index)) next.delete(index);
                          else next.add(index);
                          return next;
                        })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className={`context-toggle ${includeContext ? "active" : ""}`}
                onClick={() => setIncludeContext((value) => !value)}
              >
                <Icon name="spark" />
                <span>
                  <strong>Contexto ampliado</strong>
                  <small>
                    {includeContext
                      ? "Incluye referencias y variantes"
                      : "Solo requisitos esenciales"}
                  </small>
                </span>
              </button>
              <button className="generate-plan" onClick={() => buildPlan()}>
                <Icon name="calendar" />
                Generar calendario
              </button>
            </section>
            {plan.length > 0 && (
              <>
                <section className="plan-summary">
                  <div>
                    <strong>{formatMinutes(totalMinutes)}</strong>
                    <small>contenido pendiente</small>
                  </div>
                  <div>
                    <strong>{groups.length}</strong>
                    <small>días de maratón</small>
                  </div>
                  <div>
                    <strong>
                      {completed}/{plan.length}
                    </strong>
                    <small>sesiones completadas</small>
                  </div>
                  <div>
                    <strong>{finishDate ? formatDate(finishDate) : "—"}</strong>
                    <small>fecha de finalización</small>
                  </div>
                  <button onClick={reorganize}>
                    <Icon name="shuffle" />
                    Reorganizar días perdidos
                  </button>
                </section>
                <div className="marathon-days">
                  {groups.map((date, dayIndex) => {
                    const tasks = plan.filter((task) => task.date === date);
                    const isToday = date === isoDate(new Date());
                    return (
                      <section key={date} className={`marathon-day${isToday ? " today" : ""}`}>
                        <header>
                          <span className="day-index">{String(dayIndex + 1).padStart(2, "0")}</span>
                          <span>
                            <strong>
                              {dateAtNoon(date).toLocaleDateString("es-PE", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </strong>
                            <small>
                              {formatMinutes(tasks.reduce((sum, task) => sum + task.minutes, 0))}
                              {isToday ? " · Hoy" : ""}
                            </small>
                          </span>
                          <b>
                            {tasks.filter((task) => task.done).length}/{tasks.length}
                          </b>
                        </header>
                        <div>
                          {tasks.map((task) => {
                            const item = ITEM_BY_ID.get(task.itemId)!;
                            return (
                              <article
                                className={`${task.done ? "done " : ""}media-${item.type}`}
                                style={mediaStyle(item)}
                                key={task.key}
                              >
                                <button
                                  className="task-check"
                                  onClick={() => {
                                    if (task.episode) onToggleEpisode(item, task.episode);
                                    else onToggleWatched(item);
                                    setPlan((current) =>
                                      current.map((entry) =>
                                        entry.key === task.key
                                          ? { ...entry, done: !entry.done }
                                          : entry,
                                      ),
                                    );
                                  }}
                                >
                                  <Icon name="check" />
                                </button>
                                <button className="task-art" onClick={() => onOpenDetail(item)}>
                                  <img
                                    src={artworkFor(item, "card")}
                                    alt={`Fotograma de ${item.title}`}
                                    loading="lazy"
                                  />
                                  <span>{TYPE_LABEL[item.type]}</span>
                                </button>
                                <button className="task-copy" onClick={() => onOpenDetail(item)}>
                                  <small>
                                    <i />
                                    {trackForId(item.trackId)?.short} · {task.minutes} min
                                  </small>
                                  <strong>{item.title}</strong>
                                  <span>
                                    {task.episode
                                      ? `Capítulo ${task.episode}`
                                      : task.done
                                        ? "Completada"
                                        : "Pendiente"}
                                  </span>
                                </button>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <CustomMarathonBuilder
            author={author}
            saved={marathons}
            editingMarathonId={editingMarathonId}
            onSaved={onMarathons}
            onEditConsumed={onEditConsumed}
            onOpenLibrary={onOpenLibrary}
            onOpenSequence={onOpenSequence}
            onOpenDetail={onOpenDetail}
            notify={notify}
          />
        )}
      </div>
    </section>
  );
}

function CustomMarathonBuilder({
  author,
  saved,
  editingMarathonId,
  onSaved,
  onEditConsumed,
  onOpenLibrary,
  onOpenSequence,
  onOpenDetail,
  notify,
}: {
  author: string;
  saved: SharedMarathon[];
  editingMarathonId: string | null;
  onSaved: React.Dispatch<React.SetStateAction<SharedMarathon[]>>;
  onEditConsumed: () => void;
  onOpenLibrary: () => void;
  onOpenSequence: (data: SequenceMapData) => void;
  onOpenDetail: (item: MapItem) => void;
  notify: (message: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("Mi maratón Marvel");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [marathonCode, setMarathonCode] = useState("");
  const [tasks, setTasks] = useState<Array<{ itemId: string; episode?: number }>>([]);
  const [episodeChoice, setEpisodeChoice] = useState<Record<string, number>>({});
  const [dragged, setDragged] = useState<number | null>(null);
  const resetDraft = () => {
    setEditingId(null);
    setName("Mi maratón Marvel");
    setDescription("");
    setTasks([]);
    setMarathonCode("");
    setSearch("");
    onEditConsumed();
  };
  useEffect(() => {
    if (!editingMarathonId) return;
    const marathon = saved.find((entry) => entry.id === editingMarathonId);
    if (!marathon) return;
    setEditingId(marathon.id);
    setName(marathon.name);
    setDescription(marathon.description);
    setTasks(marathon.tasks);
    setMarathonCode("");
    onEditConsumed();
  }, [editingMarathonId, onEditConsumed, saved]);
  const results = useMemo(
    () =>
      search.trim().length > 1
        ? ITEMS.filter(
            (item) =>
              !item.upcoming &&
              normalize(
                [item.title, item.saga, trackForId(item.trackId)?.short].filter(Boolean).join(" "),
              ).includes(normalize(search)),
          ).slice(0, 8)
        : [],
    [search],
  );
  const durationOf = (task: { itemId: string; episode?: number }) => {
    const item = ITEM_BY_ID.get(task.itemId)!;
    return task.episode
      ? TITLE_METADATA[item.id]?.episodeDurations?.[task.episode - 1] ||
          TITLE_METADATA[item.id]?.episodeRuntimeMinutes ||
          EPISODE_RUNTIME_OVERRIDES[item.id] ||
          24
      : TITLE_METADATA[item.id]?.runtimeMinutes || RUNTIME_OVERRIDES[item.id] || 120;
  };
  const totalMinutes = tasks.reduce((sum, task) => sum + durationOf(task), 0);
  const add = (item: MapItem, episode?: number) => {
    const key = `${item.id}-${episode || "full"}`;
    if (tasks.some((task) => `${task.itemId}-${task.episode || "full"}` === key)) {
      notify("Ese contenido ya está en el maratón");
      return;
    }
    setTasks((current) => [...current, { itemId: item.id, ...(episode ? { episode } : {}) }]);
  };
  const addSeries = (item: MapItem) => {
    const total = EPISODE_COUNTS[item.id] || 0;
    if (!total) return add(item);
    const existing = new Set(
      tasks.filter((task) => task.itemId === item.id).map((task) => task.episode),
    );
    setTasks((current) => [
      ...current,
      ...Array.from({ length: total }, (_, index) => index + 1)
        .filter((episode) => !existing.has(episode))
        .map((episode) => ({ itemId: item.id, episode })),
    ]);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= tasks.length) return;
    setTasks((current) => {
      const next = [...current];
      const [entry] = next.splice(from, 1);
      next.splice(to, 0, entry);
      return next;
    });
  };
  const payload = (): SharedMarathon => {
    const existing = saved.find((entry) => entry.id === editingId);
    return {
      version: 1,
      id: existing?.id || `marathon-${crypto.randomUUID?.() || Date.now()}`,
      name: name.trim() || "Maratón sin nombre",
      description: description.trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      author: existing?.author || author,
      tasks,
      coverIds: [...new Set(tasks.map((task) => task.itemId))].slice(0, 4),
    };
  };
  const save = () => {
    if (!tasks.length) {
      notify("Añade al menos un título");
      return;
    }
    const marathon = payload();
    onSaved((current) => [marathon, ...current.filter((entry) => entry.id !== marathon.id)]);
    setEditingId(marathon.id);
    notify(editingId ? "Cambios guardados y sincronizando" : "Maratón guardado en tu biblioteca");
  };
  const copyCode = async () => {
    if (!tasks.length) {
      notify("Añade contenido antes de crear el código");
      return;
    }
    try {
      const code = encodeMarathonCode(payload());
      setMarathonCode(code);
      localStorage.setItem("nexus-achievement-marathon-code-v1", "true");
      window.dispatchEvent(
        new CustomEvent("nexus:local-change", {
          detail: { kind: "achievement" },
        }),
      );
      await navigator.clipboard?.writeText(code);
      notify("Código Nexus copiado");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo crear el código");
    }
  };
  const importCode = () => {
    try {
      const decoded = decodeMarathonCode(marathonCode, new Set(ITEMS.map((item) => item.id)));
      for (const task of decoded.tasks) {
        if (task.episode && task.episode > (EPISODE_COUNTS[task.itemId] || 0))
          throw new Error(
            `El capítulo ${task.episode} no existe en ${ITEM_BY_ID.get(task.itemId)?.title || task.itemId}.`,
          );
      }
      const imported: SharedMarathon = {
        version: 1,
        id: `imported-${crypto.randomUUID?.() || Date.now()}`,
        name: decoded.name,
        description: decoded.description,
        createdAt: new Date().toISOString(),
        author: "Código Nexus",
        tasks: decoded.tasks,
        coverIds: [...new Set(decoded.tasks.map((task) => task.itemId))].slice(0, 4),
      };
      onSaved((current) => [imported, ...current]);
      setEditingId(imported.id);
      setName(imported.name);
      setDescription(imported.description);
      setTasks(imported.tasks);
      localStorage.setItem("nexus-achievement-marathon-code-v1", "true");
      window.dispatchEvent(
        new CustomEvent("nexus:local-change", {
          detail: { kind: "achievement" },
        }),
      );
      notify(`Importado y guardado: ${imported.name}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Código de maratón inválido");
    }
  };
  const load = (marathon: SharedMarathon) => {
    setEditingId(marathon.id);
    setName(marathon.name);
    setDescription(marathon.description);
    setTasks(marathon.tasks);
    setMarathonCode("");
    notify("Maratón abierto en el editor");
  };
  return (
    <section className="custom-marathon">
      <header className="custom-marathon-intro">
        <div>
          <span className="dash-eyebrow">
            {editingId ? "Editando tu maratón" : "Constructor personal"}
          </span>
          <h2>{editingId ? name : "Crea un maratón para ti"}</h2>
          <p>Guárdalo en Biblioteca, continúa cuando quieras y compártelo solo si tú decides.</p>
        </div>
        <div>
          <button onClick={resetDraft}>
            <Icon name="plus" />
            Nuevo maratón
          </button>
          <button onClick={onOpenLibrary}>
            <Icon name="bookmark" />
            Abrir biblioteca
          </button>
          <button className="share-marathon" onClick={copyCode} disabled={!tasks.length}>
            <Icon name="share" />
            Compartir código
          </button>
        </div>
      </header>
      <section className="marathon-code-panel">
        <div>
          <span className="dash-eyebrow">IMPORTAR DE UN AMIGO</span>
          <strong>El código NXS1 conserva títulos, capítulos y orden</strong>
          <small>Se guardará automáticamente en tu Biblioteca.</small>
        </div>
        <textarea
          value={marathonCode}
          onChange={(event) => setMarathonCode(event.target.value)}
          placeholder="Pega aquí un código NXS1…"
          spellCheck={false}
        />
        <button onClick={importCode} disabled={!marathonCode.trim()}>
          <Icon name="upload" />
          Importar y guardar
        </button>
      </section>
      <div className="builder-grid">
        <aside className="builder-catalog">
          <label>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar títulos o universos…"
            />
          </label>
          {results.length ? (
            <div className="builder-results">
              {results.map((item) => {
                const total = EPISODE_COUNTS[item.id] || 0;
                const episode = episodeChoice[item.id] || 1;
                return (
                  <article key={item.id} style={mediaStyle(item)}>
                    <img src={posterFor(item, "thumb")} alt="" />
                    <div>
                      <small>
                        {TYPE_LABEL[item.type]} · {trackForId(item.trackId)?.short}
                      </small>
                      <strong>{item.title}</strong>
                      {total ? (
                        <span>
                          <select
                            value={episode}
                            onChange={(event) =>
                              setEpisodeChoice((current) => ({
                                ...current,
                                [item.id]: Number(event.target.value),
                              }))
                            }
                          >
                            {Array.from({ length: total }, (_, index) => (
                              <option value={index + 1} key={index}>
                                Capítulo {index + 1}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => add(item, episode)}>+ capítulo</button>
                          <button onClick={() => addSeries(item)}>Serie completa</button>
                        </span>
                      ) : (
                        <button onClick={() => add(item)}>Añadir película</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="builder-search-empty">
              <Icon name="search" />
              <p>{search ? "No encontramos coincidencias" : "Busca para comenzar tu selección"}</p>
            </div>
          )}
        </aside>
        <main className="builder-editor">
          <div className="builder-fields">
            <label>
              <span>Nombre</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={70}
              />
            </label>
            <label>
              <span>Descripción</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Plan, ocasión o instrucciones para tus amigos"
                maxLength={160}
              />
            </label>
          </div>
          <div className="builder-summary">
            <div className="marathon-cover">
              {[...new Set(tasks.map((task) => task.itemId))].slice(0, 4).map((id) => (
                <img src={posterFor(ITEM_BY_ID.get(id)!, "card")} alt="" key={id} />
              ))}
              {!tasks.length && <Icon name="film" size={34} />}
            </div>
            <span>
              <strong>{tasks.length} sesiones</strong>
              <small>
                {formatMinutes(totalMinutes)} · {new Set(tasks.map((task) => task.itemId)).size}{" "}
                títulos
              </small>
            </span>
            <button className="builder-save-primary" onClick={save}>
              <Icon name="bookmark" />
              {editingId ? "Guardar cambios" : "Guardar en Biblioteca"}
            </button>
          </div>
          {tasks.length ? (
            <div className="builder-timeline">
              {tasks.map((task, index) => {
                const item = ITEM_BY_ID.get(task.itemId)!;
                return (
                  <article
                    key={`${task.itemId}-${task.episode || 0}-${index}`}
                    draggable
                    onDragStart={() => setDragged(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragged !== null) move(dragged, index);
                      setDragged(null);
                    }}
                    style={mediaStyle(item)}
                  >
                    <span className="drag-handle">
                      <Icon name="grip" />
                    </span>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <img src={artworkFor(item, "card")} alt="" />
                    <button onClick={() => onOpenDetail(item)}>
                      <small>
                        {TYPE_LABEL[item.type]} · {durationOf(task)} min
                      </small>
                      <strong>{item.title}</strong>
                      <span>{task.episode ? `Capítulo ${task.episode}` : "Película completa"}</span>
                    </button>
                    <div>
                      <button
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                        aria-label="Subir"
                      >
                        ↑
                      </button>
                      <button
                        disabled={index === tasks.length - 1}
                        onClick={() => move(index, index + 1)}
                        aria-label="Bajar"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() =>
                          setTasks((current) =>
                            current.filter((_entry, currentIndex) => currentIndex !== index),
                          )
                        }
                        aria-label="Quitar"
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="builder-drop-empty">
              <Icon name="grip" size={32} />
              <h3>Tu maratón está vacío</h3>
              <p>Busca contenido en la columna izquierda y añádelo aquí.</p>
            </div>
          )}
        </main>
      </div>
      {tasks.length > 0 && (
        <div className="builder-save-bar">
          <span>
            <small>{editingId ? "Cambios pendientes" : "Tu nuevo maratón"}</small>
            <strong>
              {tasks.length} sesiones · {formatMinutes(totalMinutes)}
            </strong>
          </span>
          <button
            onClick={() =>
              onOpenSequence({
                id: editingId || "marathon-draft",
                title: name.trim() || "Maratón sin nombre",
                subtitle: `${tasks.length} sesiones · ${formatMinutes(totalMinutes)}`,
                tasks,
                kind: "marathon",
              })
            }
          >
            <Icon name="route" />
            Vista previa
          </button>
          <button className="primary" onClick={save}>
            <Icon name="bookmark" />
            {editingId ? "Guardar cambios" : "Guardar en mi Biblioteca"}
          </button>
        </div>
      )}
      {saved.length > 0 && (
        <section className="saved-marathons">
          <div className="dashboard-section-head">
            <div>
              <span className="dash-eyebrow">Acceso rápido</span>
              <h2>Guardados recientemente</h2>
            </div>
            <button onClick={onOpenLibrary}>Ver todos en Biblioteca</button>
          </div>
          <div>
            {saved.slice(0, 3).map((marathon) => (
              <article key={marathon.id}>
                <div className="saved-cover">
                  {marathon.coverIds
                    .slice(0, 4)
                    .map(
                      (id) =>
                        ITEM_BY_ID.get(id) && (
                          <img key={id} src={posterFor(ITEM_BY_ID.get(id)!, "thumb")} alt="" />
                        ),
                    )}
                </div>
                <span>
                  <strong>{marathon.name}</strong>
                  <small>
                    {marathon.tasks.length} sesiones · {marathon.author}
                  </small>
                </span>
                <button onClick={() => load(marathon)}>Editar</button>
                <button
                  aria-label={`Ver mapa de ${marathon.name}`}
                  onClick={() =>
                    onOpenSequence({
                      id: marathon.id,
                      title: marathon.name,
                      subtitle: `${marathon.tasks.length} sesiones · ${marathon.author}`,
                      tasks: marathon.tasks,
                      kind: "marathon",
                    })
                  }
                >
                  <Icon name="route" />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function MarvelCalendar({
  onOpenDetail,
  notify,
}: {
  onOpenDetail: (item: MapItem) => void;
  notify: (message: string) => void;
}) {
  const [reminders, setReminders] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [filter, setFilter] = useState<"all" | "movie" | "series">("all");
  useEffect(() => localStorage.setItem(REMINDERS_KEY, JSON.stringify([...reminders])), [reminders]);
  const events = VERIFIED_RELEASES.filter(
    (event) =>
      filter === "all" ||
      ITEM_BY_ID.get(event.id)?.type === filter ||
      (filter === "series" && ITEM_BY_ID.get(event.id)?.type === "animation"),
  );
  const next = events
    .filter((event) => event.date && daysUntil(event.date) >= 0)
    .sort((a, b) => a.date!.localeCompare(b.date!))[0];
  return (
    <section className="dashboard-workspace calendar-workspace">
      <header
        className="dashboard-toolbar artwork-toolbar"
        style={{ "--hero": `url(./artwork/cosmic-hero-v1.webp)` } as React.CSSProperties}
      >
        <div>
          <span className="dash-eyebrow">Calendario Marvel verificado</span>
          <h1>Próximos estrenos</h1>
          <p>Fechas confirmadas, cambios visibles y recordatorios guardados en este perfil.</p>
        </div>
        {next && (
          <div className="countdown">
            <small>Siguiente estreno</small>
            <strong>{Math.max(0, daysUntil(next.date!))}</strong>
            <span>días</span>
          </div>
        )}
      </header>
      <div className="dashboard-scroll">
        <div className="calendar-filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            Todos
          </button>
          <button className={filter === "movie" ? "active" : ""} onClick={() => setFilter("movie")}>
            Películas
          </button>
          <button
            className={filter === "series" ? "active" : ""}
            onClick={() => setFilter("series")}
          >
            Series y animación
          </button>
          <a href="https://www.marvel.com/movies" target="_blank" rel="noreferrer">
            Comprobar novedades oficiales <Icon name="chevron" size={13} />
          </a>
        </div>
        <div className="release-grid">
          {events.map((event) => {
            const item = ITEM_BY_ID.get(event.id);
            if (!item) return null;
            const remaining = event.date ? daysUntil(event.date) : null;
            return (
              <article
                key={event.id}
                className={`${event.status} media-${item.type}`}
                style={mediaStyle(item)}
              >
                <div className="release-art">
                  <img className="release-backdrop" src={artworkFor(item)} alt="" />
                  <img className="release-poster" src={posterFor(item)} alt="" />
                  <span className="release-type">{TYPE_LABEL[item.type]}</span>
                </div>
                <div className="release-body">
                  <span className="release-status">
                    {event.status === "confirmed"
                      ? "Fecha confirmada"
                      : event.status === "window"
                        ? "Ventana anunciada"
                        : "Fecha pendiente"}
                  </span>
                  <h2>{item.title}</h2>
                  <p>
                    {event.date
                      ? formatDate(event.date)
                      : event.note || "Marvel todavía no ha comunicado una fecha."}
                  </p>
                  {remaining != null && (
                    <strong className={remaining < 0 ? "past" : ""}>
                      {remaining < 0
                        ? `Estrenada hace ${Math.abs(remaining)} días`
                        : remaining === 0
                          ? "Se estrena hoy"
                          : `Faltan ${remaining} días`}
                    </strong>
                  )}
                  <div>
                    <button onClick={() => onOpenDetail(item)}>Abrir ficha</button>
                    <button
                      className={reminders.has(item.id) ? "reminding" : ""}
                      onClick={() => {
                        setReminders((current) => {
                          const nextSet = new Set(current);
                          if (nextSet.has(item.id)) nextSet.delete(item.id);
                          else nextSet.add(item.id);
                          return nextSet;
                        });
                        notify(
                          reminders.has(item.id)
                            ? "Recordatorio desactivado"
                            : "Te lo recordaremos al abrir Nexus",
                        );
                      }}
                    >
                      <Icon name="bell" />
                      {reminders.has(item.id) ? "Recordatorio activo" : "Recordarme"}
                    </button>
                    <a href={event.source} target="_blank" rel="noreferrer">
                      Fuente
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <section className="calendar-note">
          <Icon name="bell" />
          <div>
            <strong>Actualizaciones responsables</strong>
            <p>
              Nexus no cambia silenciosamente una fecha. Las modificaciones se muestran como
              verificadas y enlazan a la fuente oficial antes de incorporarse al calendario.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

type AchievementFilter =
  "all" | "progress" | "unlocked" | "characters" | "universes" | "activity" | "diamond";

const CHARACTER_ACHIEVEMENT_IDS = new Set([
  "iron-trilogy",
  "on-your-left",
  "still-worthy",
  "size-problems",
  "higher-further",
  "wakanda-forever",
  "bargain",
  "galaxy-misfits",
  "what-is-grief",
  "glorious-purpose",
  "red-room",
  "always-angry",
  "dont-give-hope",
  "on-your-order",
  "maximum-effort",
  "spirit-vengeance",
  "daywalker",
  "embrace-chaos",
  "embiggen",
  "ten-rings-legend",
  "alias-investigations",
  "sweet-christmas",
  "beautiful-because-lasting",
  "end-of-line",
  "boom-looking-for-this",
  "avengers-idea",
  "pocket-vest",
  "best-hawkeye",
  "own-story",
  "agatha-all-along",
  "find-your-voice",
  "need-that-arm",
  "we-are-groot",
  "daughters-thanos",
  "new-avengers",
  "seven-thousand-years",
  "marvels-together",
  "next-generation",
  "when-night-falls",
  "level-seven",
  "heroes-new-york",
  "she-is-not-alone",
  "cosmic-limits",
  "avengers-all-worlds",
  "eyes-on-target",
  "storm-goddess",
  "fire-life-incarnate",
  "sugar-rogue",
  "name-is-gambit",
  "peace-never-option",
  "hope-coexistence",
  "the-herald",
  "flame-on",
  "red-sai",
  "knows-fear",
  "protector-kun-lun",
  "man-without-fear",
  "king-of-city",
  "punishment-served",
]);
const ACTIVITY_ACHIEVEMENT_IDS = new Set([
  "first-assembly",
  "night-marathon",
  "archive-opens",
  "showrunner",
  "code-between-worlds",
  "together-now",
  "multiverse-critic",
  "one-more-time",
  "watcher-notes",
  "reality-curator",
  "sorcerer-oath",
  "first-movie",
  "first-episode",
  "five-episodes",
  "ten-episodes",
  "season-closed",
  "double-feature",
  "save-for-later",
  "good-taste",
  "five-stars",
  "margin-notes",
  "zero-list",
  "three-days-realities",
  "heroic-weekend",
  "my-continuity",
  "under-spell",
]);
const ERA_ACHIEVEMENT_IDS = new Set([
  "neon-days",
  "before-mcu",
  "assembly-decade",
  "after-blip",
  "through-time",
]);

function achievementGroup(id: string) {
  if (ACTIVITY_ACHIEVEMENT_IDS.has(id)) return "Actividad personal";
  if (ERA_ACHIEVEMENT_IDS.has(id)) return "Eras y décadas";
  if (
    [
      "great-power",
      "bad-lizard",
      "back-home",
      "three-spiders",
      "wear-mask",
      "always-spectacular",
      "animated-neighbor",
      "web-destiny",
    ].includes(id)
  )
    return "Spider-Man";
  if (
    [
      "to-me-xmen",
      "future-reunited",
      "best-at-what-i-do",
      "mutant-proud",
      "clobbering-time",
      "first-family",
      "legacy-keepers",
    ].includes(id) ||
    ([...CHARACTER_ACHIEVEMENT_IDS].includes(id) &&
      [
        "eyes-on-target",
        "storm-goddess",
        "fire-life-incarnate",
        "sugar-rogue",
        "name-is-gambit",
        "peace-never-option",
        "hope-coexistence",
        "the-herald",
        "flame-on",
        "red-sai",
      ].includes(id))
  )
    return "Mutantes y legados";
  if (CHARACTER_ACHIEVEMENT_IDS.has(id)) return "Personajes y equipos";
  if (
    [
      "hells-kitchen-devil",
      "street-heroes",
      "one-batch",
      "we-are-venom",
      "symbiote-web",
      "watcher-saw-all",
      "animated-mightiest",
      "every-frame",
    ].includes(id)
  )
    return "Legados y animación";
  if (["portals-open", "multiverse-visitors", "ready-doomsday", "battleworld-destiny"].includes(id))
    return "Convergencias";
  if (
    [
      "phase-traveler",
      "one-reality",
      "half-multiverse",
      "hundred-counting",
      "everything-connected",
      "avengers-assembled",
      "soul-price",
      "timeline-protector",
      "multiverse-museum",
    ].includes(id)
  )
    return "Sagas y universos";
  return "UCM y personajes";
}

function achievementVisual(achievement: Achievement) {
  const item = ITEM_BY_ID.get(achievement.coverId || achievement.requiredIds[0] || "");
  return { item, ...achievementArtFor(achievement.id, achievementGroup(achievement.id), item?.id) };
}

function AchievementsView({
  achievements,
  watched,
  onOpenRoute,
}: {
  achievements: Achievement[];
  watched: Set<string>;
  onOpenRoute: (achievement: Achievement) => void;
}) {
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [group, setGroup] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"progress" | "alphabetical" | "rarity">("progress");
  const [spoilerSafe, setAchievementSpoilerSafe] = useState(
    () => localStorage.getItem(SPOILERS_KEY) !== "false",
  );
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  useEffect(() => {
    const refresh = () => setAchievementSpoilerSafe(localStorage.getItem(SPOILERS_KEY) !== "false");
    window.addEventListener("nexus:local-change", refresh);
    return () => window.removeEventListener("nexus:local-change", refresh);
  }, []);
  const unlocked = achievements.filter((entry) => entry.unlocked).length;
  const groups = ["Todos", ...new Set(achievements.map((entry) => achievementGroup(entry.id)))];
  const matchesFilter = (entry: Achievement) =>
    filter === "all" ||
    (filter === "unlocked" && entry.unlocked) ||
    (filter === "progress" && !entry.unlocked) ||
    (filter === "characters" &&
      ["Personajes y equipos", "Spider-Man", "Mutantes y legados", "UCM y personajes"].includes(
        achievementGroup(entry.id),
      )) ||
    (filter === "universes" &&
      ["Sagas y universos", "Convergencias", "Eras y décadas"].includes(
        achievementGroup(entry.id),
      )) ||
    (filter === "activity" && achievementGroup(entry.id) === "Actividad personal") ||
    (filter === "diamond" && entry.tier === "Diamante");
  const tierRank: Record<AchievementTier, number> = {
    Bronce: 1,
    Plata: 2,
    Oro: 3,
    Vibranium: 4,
    Diamante: 5,
  };
  const visible = achievements
    .filter(
      (entry) =>
        matchesFilter(entry) &&
        (group === "Todos" || achievementGroup(entry.id) === group) &&
        (!search.trim() ||
          normalize(
            [
              entry.title,
              entry.description,
              achievementGroup(entry.id),
              entry.tier,
              ...entry.requiredIds.map((id) => ITEM_BY_ID.get(id)?.title || id),
            ].join(" "),
          ).includes(normalize(search))),
    )
    .sort((a, b) =>
      sortMode === "alphabetical"
        ? a.title.localeCompare(b.title, "es")
        : sortMode === "rarity"
          ? tierRank[b.tier] - tierRank[a.tier] || b.progress - a.progress
          : Number(b.unlocked) - Number(a.unlocked) ||
            b.progress - a.progress ||
            a.title.localeCompare(b.title, "es"),
    );
  const next = [...achievements]
    .filter((entry) => !entry.unlocked)
    .sort((a, b) => b.progress - a.progress)[0];
  const near = achievements
    .filter((entry) => !entry.unlocked && entry.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);
  return (
    <section className="dashboard-workspace achievements-workspace">
      <header
        className="dashboard-toolbar artwork-toolbar achievements-hero"
        style={{ "--hero": `url(./artwork/cosmic-hero-v1.webp)` } as React.CSSProperties}
      >
        <div>
          <span className="dash-eyebrow">Tu sala de trofeos</span>
          <h1>Logros del multiverso</h1>
          <p>Encuentra retos por personaje, equipo, saga o actividad.</p>
        </div>
        <div className="achievement-hero-count">
          <strong>{unlocked}</strong>
          <span>
            <b>de {achievements.length}</b>
            <small>desbloqueados</small>
          </span>
        </div>
      </header>
      <div className="dashboard-scroll achievements-scroll">
        {next && (
          <section className="next-achievement" data-tier={next.tier.toLowerCase()}>
            <span
              className="next-achievement-hero"
              style={{ backgroundImage: `url(${achievementVisual(next).hero})` }}
              aria-hidden="true"
            />
            <span
              className="next-achievement-badge"
              style={{ backgroundImage: `url(${achievementVisual(next).thumb})` }}
              aria-hidden="true"
            />
            <div>
              <small>Siguiente insignia · {next.tier}</small>
              <h2>{next.title}</h2>
              <p>{next.description}</p>
              <i>
                <b style={{ width: `${next.progress * 100}%` }} />
              </i>
            </div>
            <strong>
              {next.current}/{next.goal}
            </strong>
            <button onClick={() => setSelectedAchievement(next)}>Ver requisitos</button>
          </section>
        )}
        {near.length > 0 && (
          <section className="achievement-near">
            <div>
              <span className="dash-eyebrow">Casi completados</span>
              <h2>Lo tienes cerca</h2>
            </div>
            <div>
              {near.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedAchievement(entry)}
                  style={{
                    backgroundImage: `linear-gradient(90deg,rgba(11,14,19,.12),rgba(11,14,19,.98) 47%),url(${achievementVisual(entry).thumb})`,
                  }}
                >
                  <span>{Math.round(entry.progress * 100)}%</span>
                  <strong>{entry.title}</strong>
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="achievement-browser">
          <div className="achievement-search">
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar personaje, equipo, saga o logro…"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Limpiar">
                <Icon name="close" />
              </button>
            )}
          </div>
          <div className="achievement-toolbar">
            <div>
              {(
                [
                  ["all", "Todos"],
                  ["progress", "En progreso"],
                  ["unlocked", "Obtenidos"],
                  ["characters", "Personajes"],
                  ["universes", "Universos"],
                  ["activity", "Actividad"],
                  ["diamond", "Diamante"],
                ] as Array<[AchievementFilter, string]>
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={filter === id ? "active" : ""}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="achievement-group-rail">
            {groups.map((entry) => {
              const sample = achievements.find(
                (achievement) => entry === "Todos" || achievementGroup(achievement.id) === entry,
              );
              return (
                <button
                  key={entry}
                  className={group === entry ? "active" : ""}
                  onClick={() => setGroup(entry)}
                  style={{
                    backgroundImage: `linear-gradient(90deg,rgba(12,15,20,.08),rgba(12,15,20,.96) 48%),url(${sample ? achievementVisual(sample).thumb : "./artwork/cosmic-hero-v1.webp"})`,
                  }}
                >
                  <span>{entry}</span>
                  <small>
                    {entry === "Todos"
                      ? achievements.length
                      : achievements.filter(
                          (achievement) => achievementGroup(achievement.id) === entry,
                        ).length}
                  </small>
                </button>
              );
            })}
          </div>
        </section>
        <div className="achievement-result-count">
          <span>
            <strong>{visible.length} logros</strong>
            <small>
              {search
                ? `Resultados para “${search}”`
                : group === "Todos"
                  ? "Explora todo el archivo"
                  : group}
            </small>
          </span>
          <label>
            <span className="sr-only">Ordenar logros</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
            >
              <option value="progress">Más cercanos</option>
              <option value="alphabetical">A–Z</option>
              <option value="rarity">Mayor rareza</option>
            </select>
          </label>
        </div>
        {visible.length ? (
          <div className="achievement-catalog">
            {visible.map((achievement) => {
              const visual = achievementVisual(achievement);
              return (
                <button
                  type="button"
                  key={achievement.id}
                  data-tier={achievement.tier.toLowerCase()}
                  className={achievement.unlocked ? "unlocked" : ""}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <span
                    className="achievement-thumb"
                    style={{ backgroundImage: `url(${visual.thumb})` }}
                    aria-hidden="true"
                  />
                  <div>
                    <small>
                      {achievementGroup(achievement.id)} · {achievement.tier}
                    </small>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.description}</p>
                    <i>
                      <b style={{ width: `${achievement.progress * 100}%` }} />
                    </i>
                    <em>
                      {achievement.unlocked
                        ? "Desbloqueado"
                        : `${achievement.current}/${achievement.goal} · ${Math.round(achievement.progress * 100)}%`}
                    </em>
                  </div>
                  {achievement.unlocked ? <Icon name="check" /> : <Icon name="chevron" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="list-empty">
            <Icon name="trophy" size={36} />
            <h2>No hay logros en este filtro</h2>
            <p>Prueba otra categoría, búsqueda o vuelve a mostrar todos.</p>
          </div>
        )}
      </div>
      {selectedAchievement && (
        <AchievementDetail
          achievement={selectedAchievement}
          watched={watched}
          spoilerSafe={spoilerSafe}
          onClose={() => setSelectedAchievement(null)}
          onOpenRoute={() => {
            onOpenRoute(selectedAchievement);
            setSelectedAchievement(null);
          }}
        />
      )}
    </section>
  );
}

function MyProfileView({
  profile,
  watched,
  ratings,
  favorites,
  history,
  rewatches,
  achievements,
  episodeCount,
  completedLines,
  onOpenCollection,
  onOpenAchievements,
  onOpenAchievementRoute,
}: {
  profile: Profile | undefined;
  watched: Set<string>;
  ratings: Record<string, number>;
  favorites: Set<string>;
  history: ActivityEvent[];
  rewatches: Record<string, number>;
  achievements: Achievement[];
  episodeCount: number;
  completedLines: number;
  onOpenCollection: () => void;
  onOpenAchievements: () => void;
  onOpenAchievementRoute: (achievement: Achievement) => void;
}) {
  const [account, setAccount] = useState<{ name: string; email: string }>({
    name: profile?.name || "Mi recorrido",
    email: "Progreso personal",
  });
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  useEffect(() => {
    const client = getSupabase();
    if (!client) return;
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted || !data.session) return;
      setAccount({
        name:
          data.session.user.user_metadata.display_name ||
          profile?.name ||
          data.session.user.email?.split("@")[0] ||
          "Mi recorrido",
        email: data.session.user.email || "Cuenta Nexus",
      });
    });
    return () => {
      mounted = false;
    };
  }, [profile?.name]);
  const currentYear = new Date().getFullYear();
  const monthly = Array.from(
    { length: 12 },
    (_, month) =>
      history.filter(
        (event) =>
          new Date(event.at).getFullYear() === currentYear &&
          new Date(event.at).getMonth() === month &&
          ["watched", "rewatch"].includes(event.action),
      ).length,
  );
  const maxMonth = Math.max(1, ...monthly);
  const average = Object.values(ratings).length
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)
    : "—";
  const released = ITEMS.filter((item) => !item.upcoming);
  const progress = Math.round((watched.size / Math.max(1, released.length)) * 100);
  const estimatedWatchedMinutes = [...watched].reduce((sum, id) => {
    const item = ITEM_BY_ID.get(id);
    if (!item) return sum;
    const episodes = EPISODE_COUNTS[id] || 0;
    return (
      sum +
      (episodes
        ? (TITLE_METADATA[id]?.episodeRuntimeMinutes || EPISODE_RUNTIME_OVERRIDES[id] || 24) *
          episodes
        : TITLE_METADATA[id]?.runtimeMinutes || RUNTIME_OVERRIDES[id] || 120)
    );
  }, 0);
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  return (
    <section className="dashboard-workspace profiles-workspace">
      <header
        className="dashboard-toolbar artwork-toolbar profile-identity-hero"
        style={
          {
            "--hero": `url(./artwork/street-hero-v1.webp)`,
            "--profile": profile?.color || "#f2454b",
          } as React.CSSProperties
        }
      >
        <div className="profile-avatar large" style={{ background: profile?.color }}>
          {profile?.avatar || account.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span className="dash-eyebrow">MI PERFIL NEXUS · {account.email}</span>
          <h1>{account.name}</h1>
          <p>Tu actividad, colección y progreso sincronizados en un solo lugar.</p>
        </div>
        <div className="profile-header-actions">
          <button onClick={onOpenAchievements}>
            <Icon name="trophy" />
            Ver logros
          </button>
          <button onClick={onOpenCollection}>
            <Icon name="film" />
            Abrir Archivo
          </button>
        </div>
      </header>
      <div className="dashboard-scroll">
        <section className="profile-overview">
          <div
            className="profile-progress-ring"
            style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}
          >
            <strong>{progress}%</strong>
            <small>completado</small>
          </div>
          <div>
            <span className="dash-eyebrow">RESUMEN DEL MULTIVERSO</span>
            <h2>{watched.size} historias forman parte de tu recorrido</h2>
            <p>
              Has registrado aproximadamente {formatMinutes(estimatedWatchedMinutes)} entre
              películas, especiales y temporadas completas.
            </p>
          </div>
          <button onClick={onOpenCollection}>
            Ver colección digital <Icon name="chevron" />
          </button>
        </section>
        <section className="personal-stats">
          <div className="dashboard-section-head">
            <div>
              <span className="dash-eyebrow">Estadísticas personales</span>
              <h2>{currentYear} en Nexus</h2>
            </div>
            <small>Basado en tu historial local</small>
          </div>
          <div className="stat-grid personal">
            <div>
              <Icon name="film" />
              <span>
                <strong>{watched.size}</strong>
                <small>títulos vistos</small>
              </span>
            </div>
            <div>
              <Icon name="star" />
              <span>
                <strong>{favorites.size}</strong>
                <small>favoritos</small>
              </span>
            </div>
            <div>
              <Icon name="bar" />
              <span>
                <strong>{average}</strong>
                <small>calificación media</small>
              </span>
            </div>
            <div>
              <Icon name="shuffle" />
              <span>
                <strong>{Object.values(rewatches).reduce((a, b) => a + b, 0)}</strong>
                <small>repeticiones</small>
              </span>
            </div>
          </div>
          <div className="annual-chart">
            {monthly.map((value, index) => (
              <div key={index}>
                <i style={{ height: `${Math.max(4, (value / maxMonth) * 100)}%` }} />
                <span>{["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}</span>
                <small>{value}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="profile-milestones">
          <article>
            <Icon name="check" />
            <strong>{episodeCount}</strong>
            <small>capítulos vistos</small>
          </article>
          <article>
            <Icon name="route" />
            <strong>{completedLines}</strong>
            <small>universos completos</small>
          </article>
          <article>
            <Icon name="trophy" />
            <strong>{unlocked}</strong>
            <small>logros desbloqueados</small>
          </article>
          <article>
            <Icon name="clock" />
            <strong>{formatMinutes(estimatedWatchedMinutes)}</strong>
            <small>tiempo registrado</small>
          </article>
        </section>
        {achievements.length > 0 && (
          <section className="achievement-section achievement-preview">
            <div className="dashboard-section-head">
              <div>
                <span className="dash-eyebrow">Progreso opcional</span>
                <h2>Logros recientes</h2>
              </div>
              <button onClick={onOpenAchievements}>
                Ver los {achievements.length} logros <Icon name="chevron" />
              </button>
            </div>
            <div className="achievement-grid">
              {[...achievements]
                .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.progress - a.progress)
                .slice(0, 4)
                .map((achievement) => {
                  const visual = achievementVisual(achievement);
                  return (
                    <button
                      type="button"
                      key={achievement.id}
                      data-tier={achievement.tier.toLowerCase()}
                      className={achievement.unlocked ? "unlocked" : ""}
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <span
                        className="achievement-preview-badge"
                        style={{ backgroundImage: `url(${visual.thumb})` }}
                        aria-hidden="true"
                      />
                      <div>
                        <small>{achievement.tier}</small>
                        <strong>{achievement.title}</strong>
                        <p>{achievement.description}</p>
                        <i>
                          <b style={{ width: `${achievement.progress * 100}%` }} />
                        </i>
                      </div>
                      {achievement.unlocked && <Icon name="check" />}
                    </button>
                  );
                })}
            </div>
          </section>
        )}
      </div>
      {selectedAchievement && (
        <AchievementDetail
          achievement={selectedAchievement}
          watched={watched}
          onClose={() => setSelectedAchievement(null)}
          onOpenRoute={() => {
            onOpenAchievementRoute(selectedAchievement);
            setSelectedAchievement(null);
          }}
        />
      )}
    </section>
  );
}

function AchievementDetail({
  achievement,
  watched,
  spoilerSafe = false,
  onClose,
  onOpenRoute,
}: {
  achievement: Achievement;
  watched: Set<string>;
  spoilerSafe?: boolean;
  onClose: () => void;
  onOpenRoute: () => void;
}) {
  const required = achievement.requiredIds
    .map((id) => ITEM_BY_ID.get(id))
    .filter((item): item is MapItem => Boolean(item));
  const [revealRequirements, setRevealRequirements] = useState(!spoilerSafe);
  const visual = achievementVisual(achievement);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div
      className="achievement-detail-layer"
      role="dialog"
      aria-modal="true"
      aria-label={`Logro ${achievement.title}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="achievement-detail" data-tier={achievement.tier.toLowerCase()}>
        <div
          className="achievement-detail-art"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(8,10,14,.18),rgba(8,10,14,.78)),url(${visual.hero})`,
          }}
        >
          <span
            className="achievement-detail-badge"
            style={{ backgroundImage: `url(${visual.badge})` }}
            aria-hidden="true"
          />
          <span className="achievement-art-credit">Arte original SFW de Nexus</span>
          <button onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
        <header>
          <span
            className="achievement-header-badge"
            style={{ backgroundImage: `url(${visual.thumb})` }}
            aria-hidden="true"
          />
          <div>
            <small>
              {achievementGroup(achievement.id)} · {achievement.tier}
            </small>
            <h2>{achievement.title}</h2>
            <p>{achievement.description}</p>
          </div>
        </header>
        <div className="achievement-detail-progress">
          <span>
            <strong>{Math.round(achievement.progress * 100)}%</strong>
            <small>
              {achievement.current}/{achievement.goal} requisitos
            </small>
          </span>
          <i>
            <b style={{ width: `${achievement.progress * 100}%` }} />
          </i>
          {achievement.unlockedAt && (
            <p>
              Obtenido el{" "}
              {new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(
                new Date(achievement.unlockedAt),
              )}
            </p>
          )}
          <p>Rareza global: se calculará con perfiles públicos cuando la comunidad esté activa.</p>
        </div>
        {required.length > 0 ? (
          <div className="achievement-requirements">
            <div className="achievement-requirement-heading">
              <h3>Títulos necesarios</h3>
              {spoilerSafe && !revealRequirements && (
                <button onClick={() => setRevealRequirements(true)}>
                  <Icon name="eye" />
                  Revelar pendientes
                </button>
              )}
            </div>
            {required.map((item) => {
              const hidden = spoilerSafe && !revealRequirements && !watched.has(item.id);
              return (
                <article
                  key={item.id}
                  className={`${watched.has(item.id) ? "complete" : "pending"} ${hidden ? "spoiler-hidden" : ""}`}
                >
                  <img
                    src={hidden ? visual.thumb : posterFor(item, "thumb")}
                    alt=""
                    loading="lazy"
                  />
                  <span>
                    <small>
                      {watched.has(item.id)
                        ? "Completado"
                        : hidden
                          ? "Requisito protegido"
                          : "Pendiente"}
                    </small>
                    <strong>{hidden ? "Título oculto" : item.title}</strong>
                    <p>
                      {hidden
                        ? "Completa la ruta para revelarlo"
                        : `${item.date} · ${trackForId(item.trackId)?.short}`}
                    </p>
                  </span>
                  {watched.has(item.id) ? <Icon name="check" /> : <Icon name="clock" />}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="achievement-general-note">
            Este logro avanza con tu actividad general y no necesita una lista concreta de títulos.
          </p>
        )}
        <footer>
          <button onClick={onClose}>Volver</button>
          <button onClick={onOpenRoute} disabled={!required.length}>
            <Icon name="route" />
            Ver ruta en el mapa
          </button>
        </footer>
      </section>
    </div>
  );
}

function marathonTaskMinutes(task: SharedMarathon["tasks"][number]) {
  const item = ITEM_BY_ID.get(task.itemId);
  if (!item) return 0;
  return task.episode
    ? TITLE_METADATA[item.id]?.episodeDurations?.[task.episode - 1] ||
        TITLE_METADATA[item.id]?.episodeRuntimeMinutes ||
        EPISODE_RUNTIME_OVERRIDES[item.id] ||
        24
    : TITLE_METADATA[item.id]?.runtimeMinutes || RUNTIME_OVERRIDES[item.id] || 120;
}

function marathonTaskDone(
  task: SharedMarathon["tasks"][number],
  watched: Set<string>,
  episodes: EpisodeState,
) {
  return task.episode
    ? (episodes[task.itemId] || []).includes(task.episode)
    : watched.has(task.itemId);
}

function ListView({
  initialTab,
  watchlist,
  ignored,
  favorites,
  ratings,
  customLists,
  marathons,
  watched,
  episodes,
  onToggleWatchlist,
  onToggleFavorite,
  onLists,
  onMarathons,
  onRestore,
  onOpenDetail,
  onOpenMap,
  onBrowseMap,
  onBrowseRecommendations,
  onCreateMarathon,
  onEditMarathon,
  onOpenSequence,
  notify,
}: {
  initialTab: "saved" | "marathons";
  watchlist: Set<string>;
  ignored: Set<string>;
  favorites: Set<string>;
  ratings: Record<string, number>;
  customLists: CustomList[];
  marathons: SharedMarathon[];
  watched: Set<string>;
  episodes: EpisodeState;
  onToggleWatchlist: (item: MapItem) => void;
  onToggleFavorite: (item: MapItem) => void;
  onLists: React.Dispatch<React.SetStateAction<CustomList[]>>;
  onMarathons: React.Dispatch<React.SetStateAction<SharedMarathon[]>>;
  onRestore: (item: MapItem) => void;
  onOpenDetail: (item: MapItem) => void;
  onOpenMap: (item: MapItem) => void;
  onBrowseMap: () => void;
  onBrowseRecommendations: () => void;
  onCreateMarathon: () => void;
  onEditMarathon: (id: string) => void;
  onOpenSequence: (data: SequenceMapData) => void;
  notify: (message: string) => void;
}) {
  const [tab, setTab] = useState<"saved" | "favorites" | "ignored" | "lists" | "marathons">(
    initialTab,
  );
  const [newListName, setNewListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const selectedList = customLists.find((list) => list.id === selectedListId) || customLists[0];
  const entries = ITEMS.filter((item) =>
    tab === "saved"
      ? watchlist.has(item.id)
      : tab === "favorites"
        ? favorites.has(item.id)
        : tab === "ignored"
          ? ignored.has(item.id)
          : tab === "lists" && selectedList?.items.includes(item.id),
  );
  const createList = () => {
    const name = newListName.trim();
    if (!name) return;
    const id = `list-${Date.now()}`;
    onLists((current) => [
      ...current,
      {
        id,
        name,
        color: ["#ff5b61", "#75a7ff", "#b77cff", "#57cfb0"][current.length % 4],
        items: [],
      },
    ]);
    setSelectedListId(id);
    setNewListName("");
    setTab("lists");
  };
  return (
    <section className="dashboard-workspace list-workspace">
      <header className="dashboard-toolbar">
        <div>
          <span className="dash-eyebrow">Tu colección personal</span>
          <h1>Biblioteca</h1>
        </div>
        <div className="list-tabs">
          <button className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>
            <Icon name="bookmark" />
            Guardados <b>{watchlist.size}</b>
          </button>
          <button
            className={tab === "favorites" ? "active" : ""}
            onClick={() => setTab("favorites")}
          >
            <Icon name="star" />
            Favoritos <b>{favorites.size}</b>
          </button>
          <button className={tab === "lists" ? "active" : ""} onClick={() => setTab("lists")}>
            <Icon name="note" />
            Listas <b>{customLists.length}</b>
          </button>
          <button
            className={tab === "marathons" ? "active" : ""}
            onClick={() => setTab("marathons")}
          >
            <Icon name="calendar" />
            Maratones <b>{marathons.length}</b>
          </button>
          <button className={tab === "ignored" ? "active" : ""} onClick={() => setTab("ignored")}>
            <Icon name="close" />
            Ocultos <b>{ignored.size}</b>
          </button>
        </div>
      </header>
      <div className="dashboard-scroll">
        {tab === "lists" && (
          <div className="custom-list-toolbar">
            <div className="custom-list-pills">
              {customLists.map((list) => (
                <button
                  key={list.id}
                  className={selectedList?.id === list.id ? "active" : ""}
                  onClick={() => setSelectedListId(list.id)}
                  style={{ "--list": list.color } as React.CSSProperties}
                >
                  <i />
                  {list.name}
                  <b>{list.items.length}</b>
                </button>
              ))}
            </div>
            <div className="new-list">
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") createList();
                }}
                placeholder="Nueva lista…"
              />
              <button onClick={createList}>
                <Icon name="plus" />
                Crear
              </button>
              {selectedList && (
                <button
                  className="delete-list"
                  onClick={() => {
                    onLists((current) => current.filter((list) => list.id !== selectedList.id));
                    setSelectedListId("");
                  }}
                >
                  <Icon name="close" />
                  Eliminar lista
                </button>
              )}
            </div>
          </div>
        )}
        {tab === "lists" && customLists.length > 0 && (
          <div className="custom-list-gallery">
            {customLists.map((list) => (
              <button
                key={list.id}
                className={selectedList?.id === list.id ? "active" : ""}
                style={{ "--list": list.color } as React.CSSProperties}
                onClick={() => setSelectedListId(list.id)}
              >
                <span className="list-collage">
                  {list.items
                    .slice(0, 4)
                    .map(
                      (id) =>
                        ITEM_BY_ID.get(id) && (
                          <img src={posterFor(ITEM_BY_ID.get(id)!, "thumb")} alt="" key={id} />
                        ),
                    )}
                  {Array.from({ length: Math.max(0, 4 - list.items.length) }, (_, index) => (
                    <i key={index} />
                  ))}
                </span>
                <span>
                  <strong>{list.name}</strong>
                  <small>{list.items.length} títulos</small>
                </span>
              </button>
            ))}
          </div>
        )}
        {tab === "marathons" && (
          <section className="marathon-library">
            <div className="marathon-library-intro">
              <div>
                <span className="dash-eyebrow">TUS RECORRIDOS</span>
                <h2>Maratones guardados</h2>
                <p>
                  Crea una sucesión, continúa por el siguiente pendiente o ábrela como un mapa
                  compacto.
                </p>
              </div>
              <button onClick={onCreateMarathon}>
                <Icon name="plus" />
                Crear nuevo maratón
              </button>
            </div>
            {marathons.length ? (
              <div className="marathon-library-grid">
                {marathons.map((marathon) => {
                  const completed = marathon.tasks.filter((task) =>
                    marathonTaskDone(task, watched, episodes),
                  ).length;
                  const totalMinutes = marathon.tasks.reduce(
                    (sum, task) => sum + marathonTaskMinutes(task),
                    0,
                  );
                  const nextTask = marathon.tasks.find(
                    (task) => !marathonTaskDone(task, watched, episodes),
                  );
                  const nextItem = nextTask ? ITEM_BY_ID.get(nextTask.itemId) : undefined;
                  const progress = Math.round(
                    (completed / Math.max(1, marathon.tasks.length)) * 100,
                  );
                  const status =
                    completed === marathon.tasks.length
                      ? "Completado"
                      : completed > 0
                        ? "En curso"
                        : "Por empezar";
                  return (
                    <article key={marathon.id} className="marathon-library-card">
                      <button
                        className="marathon-library-art"
                        onClick={() =>
                          onOpenSequence({
                            id: marathon.id,
                            title: marathon.name,
                            subtitle: `${marathon.tasks.length} sesiones · ${formatMinutes(totalMinutes)}`,
                            tasks: marathon.tasks,
                            kind: "marathon",
                          })
                        }
                        aria-label={`Abrir mapa de ${marathon.name}`}
                      >
                        <span className="marathon-library-collage">
                          {marathon.coverIds
                            .slice(0, 4)
                            .map(
                              (id) =>
                                ITEM_BY_ID.get(id) && (
                                  <img
                                    key={id}
                                    src={artworkFor(ITEM_BY_ID.get(id), "card")}
                                    alt=""
                                    loading="lazy"
                                  />
                                ),
                            )}
                          {Array.from(
                            { length: Math.max(0, 4 - marathon.coverIds.length) },
                            (_, index) => (
                              <i key={index} />
                            ),
                          )}
                        </span>
                        <b>{progress}%</b>
                        <em>{status}</em>
                      </button>
                      <div className="marathon-library-copy">
                        <small>
                          {marathon.author} ·{" "}
                          {new Date(marathon.createdAt).toLocaleDateString("es-PE")}
                        </small>
                        <h3>{marathon.name}</h3>
                        <p>
                          {marathon.description || "Una ruta personalizada del multiverso Marvel."}
                        </p>
                        <i>
                          <b style={{ width: `${progress}%` }} />
                        </i>
                        <span>
                          <strong>
                            {completed}/{marathon.tasks.length}
                          </strong>{" "}
                          sesiones · {formatMinutes(totalMinutes)}
                        </span>
                        {nextItem && (
                          <button onClick={() => onOpenDetail(nextItem)}>
                            <Icon name="target" />
                            <span>
                              <small>Siguiente pendiente</small>
                              <strong>
                                {nextItem.title}
                                {nextTask?.episode ? ` · Cap. ${nextTask.episode}` : ""}
                              </strong>
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="marathon-library-actions">
                        <button
                          onClick={() =>
                            onOpenSequence({
                              id: marathon.id,
                              title: marathon.name,
                              subtitle: `${marathon.tasks.length} sesiones · ${formatMinutes(totalMinutes)}`,
                              tasks: marathon.tasks,
                              kind: "marathon",
                            })
                          }
                        >
                          <Icon name="route" />
                          Ver mapa
                        </button>
                        <button onClick={() => onEditMarathon(marathon.id)}>
                          <Icon name="grip" />
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const code = encodeMarathonCode(marathon);
                              await navigator.clipboard?.writeText(code);
                              notify("Código Nexus copiado");
                            } catch {
                              notify("No se pudo copiar el código");
                            }
                          }}
                        >
                          <Icon name="share" />
                          Compartir
                        </button>
                        <button
                          onClick={() => {
                            const duplicate = {
                              ...marathon,
                              id: `marathon-${crypto.randomUUID?.() || Date.now()}`,
                              name: `${marathon.name} · copia`,
                              createdAt: new Date().toISOString(),
                              author: "Mi biblioteca",
                            };
                            onMarathons((current) => [duplicate, ...current]);
                            notify("Maratón duplicado");
                          }}
                        >
                          <Icon name="plus" />
                          Duplicar
                        </button>
                        <button
                          className="danger"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar “${marathon.name}”?`)) {
                              onMarathons((current) =>
                                current.filter((entry) => entry.id !== marathon.id),
                              );
                              notify("Maratón eliminado");
                            }
                          }}
                        >
                          <Icon name="close" />
                          Eliminar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="list-empty marathon-empty">
                <Icon name="calendar" size={38} />
                <h2>Aún no tienes maratones</h2>
                <p>
                  Crea uno para ti o importa el código de un amigo. Aparecerá aquí y se sincronizará
                  automáticamente.
                </p>
                <div className="empty-actions">
                  <button onClick={onCreateMarathon}>
                    <Icon name="plus" />
                    Crear mi primer maratón
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
        {tab !== "marathons" &&
          (entries.length ? (
            <div className="library-list">
              {entries.map((item) => {
                const total = EPISODE_COUNTS[item.id] || 0;
                const done = episodes[item.id]?.length || 0;
                return (
                  <article key={item.id} className={`media-${item.type}`} style={mediaStyle(item)}>
                    <div className="library-poster">
                      <img src={posterFor(item)} alt="" />
                      <span>{TYPE_LABEL[item.type]}</span>
                    </div>
                    <div>
                      <span>
                        <b className="type-dot" />
                        {trackForId(item.trackId)?.short} · {item.date}
                      </span>
                      <h2>{item.title}</h2>
                      <p>
                        {ratings[item.id] ? `${"★".repeat(ratings[item.id])} · ` : ""}
                        {watched.has(item.id)
                          ? "Completada"
                          : total
                            ? `${done}/${total} capítulos vistos`
                            : "Pendiente"}
                      </p>
                      {total > 0 && (
                        <i>
                          <b style={{ width: `${(done / total) * 100}%` }} />
                        </i>
                      )}
                    </div>
                    <div className="library-actions">
                      <button onClick={() => onOpenDetail(item)}>Abrir</button>
                      <button title="Ver en el mapa" onClick={() => onOpenMap(item)}>
                        <Icon name="route" />
                      </button>
                      {tab === "saved" ? (
                        <button title="Quitar de guardados" onClick={() => onToggleWatchlist(item)}>
                          <Icon name="close" />
                        </button>
                      ) : tab === "favorites" ? (
                        <button title="Quitar de favoritos" onClick={() => onToggleFavorite(item)}>
                          <Icon name="close" />
                        </button>
                      ) : tab === "ignored" ? (
                        <button onClick={() => onRestore(item)}>Restaurar</button>
                      ) : (
                        <button
                          title="Quitar de esta lista"
                          onClick={() =>
                            onLists((current) =>
                              current.map((list) =>
                                list.id === selectedList?.id
                                  ? {
                                      ...list,
                                      items: list.items.filter((id) => id !== item.id),
                                    }
                                  : list,
                              ),
                            )
                          }
                        >
                          <Icon name="close" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="list-empty">
              <Icon
                name={
                  tab === "favorites"
                    ? "star"
                    : tab === "lists"
                      ? "note"
                      : tab === "saved"
                        ? "bookmark"
                        : "check"
                }
                size={36}
              />
              <h2>
                {tab === "favorites"
                  ? "Aún no tienes favoritos"
                  : tab === "lists"
                    ? customLists.length
                      ? "Esta lista está vacía"
                      : "Crea tu primera lista"
                    : tab === "saved"
                      ? "Tu lista está vacía"
                      : "No has descartado nada"}
              </h2>
              <p>Explora un título y usa su ficha para guardarlo, calificarlo u organizarlo.</p>
              <div className="empty-actions">
                <button onClick={onBrowseRecommendations}>
                  <Icon name="spark" />
                  Ver recomendaciones
                </button>
                <button onClick={onBrowseMap}>
                  <Icon name="route" />
                  Explorar el mapa
                </button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function SequenceMapModal({
  data,
  watched,
  episodes,
  onClose,
  onOpenItem,
}: {
  data: SequenceMapData;
  watched: Set<string>;
  episodes: EpisodeState;
  onClose: () => void;
  onOpenItem: (item: MapItem) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, y: 0, left: 0, top: 0 });
  const [zoom, setZoom] = useState(1);
  const entries = data.tasks
    .map((task, index) => ({ task, index, item: ITEM_BY_ID.get(task.itemId) }))
    .filter(
      (entry): entry is { task: SharedMarathon["tasks"][number]; index: number; item: MapItem } =>
        Boolean(entry.item),
    );
  const lanes = [...new Set(entries.map((entry) => entry.item.trackId))];
  const baseWidth = Math.max(760, entries.length * 190 + 180);
  const baseHeight = Math.max(390, lanes.length * 150 + 170);
  const position = (entry: { item: MapItem; index: number }) => ({
    x: 100 + entry.index * 190,
    y: 95 + Math.max(0, lanes.indexOf(entry.item.trackId)) * 150,
  });
  const completed = entries.filter((entry) =>
    marathonTaskDone(entry.task, watched, episodes),
  ).length;
  const next = entries.find((entry) => !marathonTaskDone(entry.task, watched, episodes));
  const fit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nextZoom = Math.max(
      0.48,
      Math.min(
        1,
        (viewport.clientWidth - 48) / baseWidth,
        (viewport.clientHeight - 48) / baseHeight,
      ),
    );
    setZoom(nextZoom);
    window.setTimeout(() => viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" }), 0);
  }, [baseHeight, baseWidth]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", key);
    const timer = window.setTimeout(fit, 30);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", key);
    };
  }, [fit, onClose]);
  const focusEntry = (entry: (typeof entries)[number]) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const point = position(entry);
    viewport.scrollTo({
      left: Math.max(0, point.x * zoom - viewport.clientWidth / 2),
      top: Math.max(0, point.y * zoom - viewport.clientHeight / 2),
      behavior: "smooth",
    });
  };
  return (
    <div
      className="sequence-map-layer"
      role="dialog"
      aria-modal="true"
      aria-label={`Mapa de ${data.title}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="sequence-map-modal" data-kind={data.kind}>
        <header>
          <div>
            <span className="dash-eyebrow">
              {data.kind === "marathon"
                ? "MAPA DEL MARATÓN"
                : data.kind === "era"
                  ? "MAPA DE LA ERA"
                  : data.kind === "journey"
                    ? "VIAJE DEL PERSONAJE"
                    : "RUTA NARRATIVA"}
            </span>
            <h2>{data.title}</h2>
            <p>{data.subtitle}</p>
          </div>
          <div className="sequence-progress">
            <strong>{Math.round((completed / Math.max(1, entries.length)) * 100)}%</strong>
            <span>
              <i>
                <b style={{ width: `${(completed / Math.max(1, entries.length)) * 100}%` }} />
              </i>
              <small>
                {completed}/{entries.length} completados
              </small>
            </span>
          </div>
          <button onClick={onClose} aria-label="Cerrar mapa">
            <Icon name="close" />
          </button>
        </header>
        <div className="sequence-map-tools">
          <span>
            <i /> Arrastra para explorar
          </span>
          {next && (
            <button onClick={() => focusEntry(next)}>
              <Icon name="target" />
              Siguiente pendiente
            </button>
          )}
          <div>
            <button
              onClick={() => setZoom((value) => Math.max(0.48, value - 0.12))}
              aria-label="Alejar"
            >
              <Icon name="minus" />
            </button>
            <b>{Math.round(zoom * 100)}%</b>
            <button
              onClick={() => setZoom((value) => Math.min(1.4, value + 0.12))}
              aria-label="Acercar"
            >
              <Icon name="plus" />
            </button>
            <button onClick={fit}>
              <Icon name="fit" />
              Ajustar
            </button>
          </div>
        </div>
        <div
          ref={viewportRef}
          className="sequence-map-viewport"
          onWheel={(event) => {
            if (!event.ctrlKey) return;
            event.preventDefault();
            setZoom((value) => Math.max(0.48, Math.min(1.4, value - event.deltaY * 0.001)));
          }}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("button")) return;
            const viewport = viewportRef.current;
            if (!viewport) return;
            drag.current = {
              active: true,
              x: event.clientX,
              y: event.clientY,
              left: viewport.scrollLeft,
              top: viewport.scrollTop,
            };
            viewport.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drag.current.active || !viewportRef.current) return;
            viewportRef.current.scrollTo({
              left: drag.current.left - (event.clientX - drag.current.x),
              top: drag.current.top - (event.clientY - drag.current.y),
            });
          }}
          onPointerUp={() => {
            drag.current.active = false;
          }}
          onPointerCancel={() => {
            drag.current.active = false;
          }}
        >
          <div
            className="sequence-map-scale"
            style={{ width: baseWidth * zoom, height: baseHeight * zoom }}
          >
            <div
              className="sequence-map-world"
              style={{ width: baseWidth, height: baseHeight, transform: `scale(${zoom})` }}
            >
              <div className="sequence-lanes">
                {lanes.map((trackId, index) => {
                  const track = trackForId(trackId);
                  return (
                    <span
                      key={trackId}
                      style={
                        {
                          top: 95 + index * 150,
                          "--lane": track?.color || "#8e97a5",
                        } as React.CSSProperties
                      }
                    >
                      <b>{track?.short || trackId}</b>
                    </span>
                  );
                })}
              </div>
              <svg width={baseWidth} height={baseHeight} aria-hidden="true">
                {entries.slice(0, -1).map((entry, index) => {
                  const nextEntry = entries[index + 1];
                  const from = position(entry);
                  const to = position(nextEntry);
                  const color = trackForId(nextEntry.item.trackId)?.color || "#9ba5b3";
                  return (
                    <path
                      key={`${entry.index}-${nextEntry.index}`}
                      d={`M ${from.x + 61} ${from.y} C ${from.x + 125} ${from.y}, ${to.x - 70} ${to.y}, ${to.x - 8} ${to.y}`}
                      stroke={color}
                    />
                  );
                })}
              </svg>
              {entries.map((entry) => {
                const point = position(entry);
                const done = marathonTaskDone(entry.task, watched, episodes);
                const track = trackForId(entry.item.trackId);
                return (
                  <button
                    key={`${entry.task.itemId}-${entry.task.episode || 0}-${entry.index}`}
                    className={`sequence-node ${done ? "done" : ""} ${next?.index === entry.index ? "next" : ""}`}
                    style={
                      {
                        left: point.x,
                        top: point.y,
                        "--node": track?.color || "#9ba5b3",
                      } as React.CSSProperties
                    }
                    onClick={() => onOpenItem(entry.item)}
                  >
                    <span>
                      <img src={artworkFor(entry.item, "card")} alt="" loading="lazy" />
                      <b>
                        {done ? <Icon name="check" /> : String(entry.index + 1).padStart(2, "0")}
                      </b>
                    </span>
                    <small>
                      {entry.task.episode
                        ? `CAPÍTULO ${entry.task.episode}`
                        : TYPE_LABEL[entry.item.type]}{" "}
                      · {Math.floor(entry.item.releaseValue)}
                    </small>
                    <strong>{entry.item.title}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <footer>
          <span>Ctrl + rueda para zoom · Esc para cerrar</span>
          <button onClick={onClose}>Cerrar mapa</button>
        </footer>
      </section>
    </div>
  );
}

function NarrativeOverlay({
  targetId,
  zoom,
  mapHeight,
}: {
  targetId: string;
  zoom: number;
  mapHeight: number;
}) {
  const edges = dependencyEdges(targetId, true);
  return (
    <svg
      className="narrative-overlay"
      width={MAP_WIDTH * zoom}
      height={mapHeight}
      viewBox={`0 0 ${MAP_WIDTH} ${mapHeight}`}
      preserveAspectRatio="none"
      aria-label="Conexiones de la ruta seleccionada"
    >
      <defs>
        <filter id="routeGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {edges.map(({ from, to, edge }, index) => {
        const startX = xOf(from.releaseValue);
        const endX = xOf(to.releaseValue);
        const startY = yOfTrack(from.trackId, zoom);
        const endY = yOfTrack(to.trackId, zoom);
        const bend = Math.max(70, Math.abs(endX - startX) * 0.35);
        return (
          <g key={`${from.id}-${to.id}-${index}`} data-kind={edge.kind}>
            <path
              className="narrative-path-glow"
              stroke={CONNECTION_COLOR[edge.kind]}
              d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}
            />
            <path
              className={`narrative-path narrative-${edge.kind}`}
              stroke={CONNECTION_COLOR[edge.kind]}
              d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}
            />
            <circle
              className="narrative-junction"
              cx={endX}
              cy={endY}
              r="8"
              stroke={CONNECTION_COLOR[edge.kind]}
            />
          </g>
        );
      })}
    </svg>
  );
}

function MapLines({
  activeTrack,
  zoom,
  mapHeight,
  hideConnections,
}: {
  activeTrack: string;
  zoom: number;
  mapHeight: number;
  hideConnections: boolean;
}) {
  const noWayHome = ITEM_BY_ID.get("no-way-home")!;
  const deadpoolWolverine = ITEM_BY_ID.get("deadpool-wolverine")!;
  const endgame =
    ITEM_BY_ID.get("endgame") || ITEMS.find((item) => item.title === "Avengers: Endgame")!;
  const firstSeries = ITEMS.find((item) => item.trackId === "series")!;
  const xmenLast = ITEMS.filter(
    (item) => item.trackId === "xmen" && item.releaseValue < deadpoolWolverine.releaseValue,
  ).at(-1)!;
  const pathFor = (trackId: string) => {
    const items = ITEMS.filter((item) => item.trackId === trackId);
    return {
      start: xOf(items[0].releaseValue),
      end: xOf(items.at(-1)!.releaseValue),
      y: yOfTrack(trackId, zoom),
    };
  };
  const mcuY = yOfTrack("mcu", zoom);
  const seriesY = yOfTrack("series", zoom);
  return (
    <>
      <svg
        className="track-svg"
        width={MAP_WIDTH * zoom}
        height={mapHeight}
        viewBox={`0 0 ${MAP_WIDTH} ${mapHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {TRACKS.map((track) => {
          const line = pathFor(track.id);
          const muted = activeTrack !== "all" && activeTrack !== track.id && !(track.id === "mcu");
          return (
            <g key={track.id} className={muted ? "line-muted" : ""}>
              <path
                className="track-glow"
                stroke={track.color}
                d={`M ${line.start} ${line.y} L ${line.end} ${line.y}`}
              />
              <path
                className="track-core"
                stroke={track.color}
                d={`M ${line.start} ${line.y} L ${line.end} ${line.y}`}
              />
            </g>
          );
        })}
        <g className={hideConnections ? "connections-hidden" : ""}>
          <Connection
            fromId="spiderman-raimi-3"
            toX={xOf(noWayHome.releaseValue)}
            toY={mcuY}
            color="#f24e86"
            active={activeTrack === "all" || activeTrack === "tobey"}
            zoom={zoom}
          />
          <Connection
            fromId="amazing-spiderman-2"
            toX={xOf(noWayHome.releaseValue)}
            toY={mcuY}
            color="#9c70ff"
            active={activeTrack === "all" || activeTrack === "andrew"}
            zoom={zoom}
          />
          <Connection
            fromId="venom-2"
            toX={xOf(noWayHome.releaseValue)}
            toY={mcuY}
            color="#c757e7"
            active={activeTrack === "all" || activeTrack === "sony"}
            dashed
            zoom={zoom}
          />
          <Connection
            fromId={xmenLast.id}
            toX={xOf(deadpoolWolverine.releaseValue)}
            toY={mcuY}
            color="#3b88ff"
            active={activeTrack === "all" || activeTrack === "xmen"}
            zoom={zoom}
          />
          <Connection
            fromId={
              ITEMS.filter(
                (item) =>
                  item.trackId === "fantastic" &&
                  item.releaseValue < deadpoolWolverine.releaseValue,
              ).at(-1)?.id || "fantastic-four-2015"
            }
            toX={xOf(deadpoolWolverine.releaseValue)}
            toY={mcuY}
            color="#ffb640"
            active={activeTrack === "all" || activeTrack === "fantastic"}
            dashed
            zoom={zoom}
          />
          <path
            className="branch-connector"
            stroke="#58cf83"
            d={`M ${xOf(endgame.releaseValue)} ${mcuY} C ${xOf(endgame.releaseValue) + 80} ${mcuY}, ${xOf(firstSeries.releaseValue) - 100} ${seriesY}, ${xOf(firstSeries.releaseValue)} ${seriesY}`}
          />
          <g className="legend-key">
            <circle cx={xOf(noWayHome.releaseValue)} cy={mcuY} r="13" />
            <circle cx={xOf(deadpoolWolverine.releaseValue)} cy={mcuY} r="13" />
          </g>
        </g>
      </svg>
      {TRACKS.map((track) => {
        const line = pathFor(track.id);
        const muted = activeTrack !== "all" && activeTrack !== track.id && track.id !== "mcu";
        return (
          <span
            key={track.id}
            className={`track-name ${muted ? "line-muted" : ""}`}
            style={{
              left: Math.max(18, line.start * zoom - 14),
              top: line.y - 27,
              color: track.color,
            }}
          >
            {track.label}
          </span>
        );
      })}
    </>
  );
}

function Connection({
  fromId,
  toX,
  toY,
  color,
  active,
  zoom,
  dashed = false,
}: {
  fromId: string;
  toX: number;
  toY: number;
  color: string;
  active: boolean;
  zoom: number;
  dashed?: boolean;
}) {
  const from = ITEM_BY_ID.get(fromId);
  if (!from) return null;
  const fromX = xOf(from.releaseValue);
  const fromY = yOfTrack(from.trackId, zoom);
  return (
    <path
      className={`branch-connector ${active ? "" : "line-muted"} ${dashed ? "is-dashed" : ""}`}
      stroke={color}
      d={`M ${fromX} ${fromY} C ${fromX + 160} ${fromY}, ${toX - 220} ${toY}, ${toX} ${toY}`}
    />
  );
}

function RouteTree({
  itemId,
  onNavigate,
  visited = new Set(),
  depth = 0,
}: {
  itemId: string;
  onNavigate: (id: string) => void;
  visited?: Set<string>;
  depth?: number;
}) {
  if (visited.has(itemId) || depth > 8) return null;
  const nextVisited = new Set(visited).add(itemId);
  const links = NARRATIVE_LINKS[itemId] || [];
  if (!links.length) return null;
  return (
    <div className="route-tree" data-depth={depth}>
      {links.map((edge, index) => {
        const prerequisite = ITEM_BY_ID.get(edge.prerequisite);
        if (!prerequisite) return null;
        return (
          <div className="tree-branch" key={`${itemId}-${edge.prerequisite}-${index}`}>
            <button
              onClick={() => onNavigate(prerequisite.id)}
              style={{ "--edge": CONNECTION_COLOR[edge.kind] } as React.CSSProperties}
            >
              <i />
              <img src={posterFor(prerequisite)} alt="" />
              <span>
                <small>{CONNECTION_LABEL[edge.kind]}</small>
                <strong>{prerequisite.title}</strong>
              </span>
              <Icon name="chevron" size={14} />
            </button>
            <RouteTree
              itemId={prerequisite.id}
              onNavigate={onNavigate}
              visited={nextVisited}
              depth={depth + 1}
            />
          </div>
        );
      })}
    </div>
  );
}

function DetailPanel({
  item,
  mode,
  pinned,
  watched,
  episodes,
  saved,
  ignored,
  favorite,
  rating,
  note,
  watchedDate,
  rewatchCount,
  customLists,
  onClose,
  onMode,
  onPinned,
  onToggleWatched,
  onToggleEpisode,
  onToggleWatchlist,
  onToggleFavorite,
  onRate,
  onSaveNote,
  onWatchedDate,
  onRewatch,
  onAddToList,
  onIgnore,
  onNavigate,
  onShowRoute,
}: {
  item: MapItem;
  mode: DetailPanelMode;
  pinned: boolean;
  watched: boolean;
  episodes: number[];
  saved: boolean;
  ignored: boolean;
  favorite: boolean;
  rating: number;
  note: string;
  watchedDate: string;
  rewatchCount: number;
  customLists: CustomList[];
  onClose: () => void;
  onMode: (mode: DetailPanelMode) => void;
  onPinned: () => void;
  onToggleWatched: () => void;
  onToggleEpisode: (episode: number) => void;
  onToggleWatchlist: () => void;
  onToggleFavorite: () => void;
  onRate: (rating: number) => void;
  onSaveNote: (note: string) => void;
  onWatchedDate: (date: string) => void;
  onRewatch: () => void;
  onAddToList: (listId: string) => void;
  onIgnore: () => void;
  onNavigate: (id: string) => void;
  onShowRoute: (includeContext: boolean) => void;
}) {
  const total = EPISODE_COUNTS[item.id] || 0;
  const track = TRACKS.find((entry) => entry.id === item.trackId)!;
  const metadata = TITLE_METADATA[item.id];
  const [showTree, setShowTree] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note);
  const [listChoice, setListChoice] = useState("");
  useEffect(() => {
    setShowTree(false);
    setNoteDraft(note);
    setListChoice("");
  }, [item.id, note]);
  const runtime = metadata?.runtimeMinutes || RUNTIME_OVERRIDES[item.id];
  const episodeRuntime = metadata?.episodeRuntimeMinutes || EPISODE_RUNTIME_OVERRIDES[item.id];
  const characters = metadata?.mainCharacters?.length
    ? metadata.mainCharacters
    : CHARACTER_OVERRIDES[item.id] || [];
  const directLinks = NARRATIVE_LINKS[item.id] || [];
  const postCredits = POST_CREDIT_COUNTS[item.id] ?? metadata?.postCredits;
  const seasons = SEASON_EPISODES[item.id] || (total ? [total] : []);
  let episodeOffset = 0;
  return (
    <aside
      className={`detail-panel ${mode} ${pinned ? "pinned" : ""}`}
      aria-label={`Ficha de ${item.title}`}
    >
      <div className="detail-panel-controls">
        <button
          className={mode === "compact" ? "active" : ""}
          onClick={() => onMode(mode === "compact" ? "full" : "compact")}
          aria-label={mode === "compact" ? "Ampliar panel" : "Compactar panel"}
        >
          <Icon name={mode === "compact" ? "plus" : "minus"} />
          <span>{mode === "compact" ? "Ampliar" : "Compactar"}</span>
        </button>
        <button
          className={pinned ? "active" : ""}
          onClick={onPinned}
          aria-pressed={pinned}
          aria-label={pinned ? "Desfijar panel" : "Fijar panel"}
        >
          <Icon name="target" />
          <span>{pinned ? "Fijado" : "Fijar"}</span>
        </button>
        <button onClick={onClose} aria-label="Cerrar panel">
          <Icon name="close" />
          <span>Esc</span>
        </button>
      </div>
      <div className="detail-visual">
        <img className="detail-artwork" src={artworkFor(item)} alt="" />
        <img
          className="detail-poster"
          src={posterFor(item, "full")}
          alt={`Póster de ${item.title}`}
        />
        <div className="poster-shade" />
      </div>
      <div className="detail-body">
        <div className="branch-pill" style={{ "--branch": track.color } as React.CSSProperties}>
          <i />
          {track.label}
        </div>
        <TitleHeading item={item} placement="detail" />
        <p className="detail-meta">
          {item.date}
          <span /> {TYPE_LABEL[item.type]}
          {item.phase ? (
            <>
              <span />
              {item.phase}
            </>
          ) : null}
        </p>
        {item.saga && <p className="saga-name">{item.saga}</p>}
        {item.upcoming ? (
          <div className="upcoming-note">Próximamente · todavía no cuenta para tu progreso</div>
        ) : (
          <button
            className={`watch-button ${watched ? "is-watched" : ""}`}
            onClick={onToggleWatched}
          >
            <Icon name={watched ? "check" : "film"} />
            {watched ? "Completada" : total ? "Completar temporada" : "Marcar como vista"}
          </button>
        )}
        <div className="detail-secondary-actions">
          <button className={saved ? "saved" : ""} onClick={onToggleWatchlist}>
            <Icon name="bookmark" />
            {saved ? "Guardada en Mi lista" : "Guardar en Mi lista"}
          </button>
          <button className={ignored ? "ignored" : ""} onClick={onIgnore}>
            <Icon name={ignored ? "check" : "close"} />
            {ignored ? "Volver a recomendar" : "No me interesa"}
          </button>
        </div>

        <section className="personal-title-tools">
          <div className="favorite-rating">
            <button
              className={favorite ? "favorite active" : "favorite"}
              onClick={onToggleFavorite}
            >
              <Icon name="star" />
              {favorite ? "Favorita" : "Añadir a favoritos"}
            </button>
            <div className="rating-stars" aria-label="Calificación">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={value <= rating ? "active" : ""}
                  onClick={() => onRate(value)}
                  aria-label={`${value} estrellas`}
                >
                  <Icon name="star" size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="personal-row">
            <label>
              <span>Fecha vista</span>
              <input
                type="date"
                value={watchedDate}
                onChange={(event) => onWatchedDate(event.target.value)}
              />
            </label>
            <button onClick={onRewatch}>
              <Icon name="shuffle" />
              Registrar repetición{rewatchCount ? ` · ${rewatchCount}` : ""}
            </button>
          </div>
          {customLists.length > 0 && (
            <div className="add-list-row">
              <select value={listChoice} onChange={(event) => setListChoice(event.target.value)}>
                <option value="">Añadir a una lista…</option>
                {customLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
              <button
                disabled={!listChoice}
                onClick={() => {
                  onAddToList(listChoice);
                  setListChoice("");
                }}
              >
                <Icon name="plus" />
                Añadir
              </button>
            </div>
          )}
          <label className="note-editor">
            <span>
              <Icon name="note" size={14} />
              Notas personales
            </span>
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              onBlur={() => onSaveNote(noteDraft)}
              placeholder="Qué te pareció, qué recordar para después…"
            />
            <small>Se guarda al salir del campo.</small>
          </label>
        </section>

        {metadata?.synopsis && (
          <section className="metadata-section synopsis-section">
            <span className="detail-kicker">Sin spoilers</span>
            <h3>De qué trata</h3>
            <p className="synopsis-copy">{metadata.synopsis}</p>
          </section>
        )}

        {directLinks.length > 0 && (
          <section className="metadata-section requirements-section">
            <span className="detail-kicker">Antes de verla</span>
            <h3>Conexiones necesarias</h3>
            <p className="section-intro">
              Solo se muestran los vínculos directos. Abre uno para profundizar sin saturar el mapa.
            </p>
            <div className="requirement-list">
              {directLinks.map((edge, index) => {
                const prerequisite = ITEM_BY_ID.get(edge.prerequisite);
                if (!prerequisite) return null;
                return (
                  <button
                    className="requirement-card"
                    key={`${edge.prerequisite}-${index}`}
                    onClick={() => onNavigate(prerequisite.id)}
                    style={{ "--edge": CONNECTION_COLOR[edge.kind] } as React.CSSProperties}
                  >
                    <img src={posterFor(prerequisite)} alt="" />
                    <span>
                      <small>{CONNECTION_LABEL[edge.kind]}</small>
                      <strong>{prerequisite.title}</strong>
                      <p>{edge.reason}</p>
                    </span>
                    <Icon name="chevron" size={15} />
                  </button>
                );
              })}
            </div>
            <div className="route-actions">
              <button onClick={() => onShowRoute(false)}>
                <Icon name="target" />
                Ruta esencial
              </button>
              <button onClick={() => onShowRoute(true)}>
                <Icon name="route" />
                Ruta con contexto
              </button>
              <button
                className={showTree ? "active" : ""}
                onClick={() => setShowTree((value) => !value)}
              >
                <Icon name="chevron" />
                {showTree ? "Ocultar árbol" : "Desplegar árbol"}
              </button>
            </div>
            {showTree && <RouteTree itemId={item.id} onNavigate={onNavigate} />}
          </section>
        )}

        {total > 0 && (
          <section className="episodes-section">
            <div className="episode-heading">
              <div>
                <span>Progreso de la serie</span>
                <strong>
                  {episodes.length}/{total} capítulos
                </strong>
              </div>
              <b>{Math.round((episodes.length / total) * 100)}%</b>
            </div>
            <div className="episode-progress">
              <i style={{ width: `${(episodes.length / total) * 100}%` }} />
            </div>
            <div className="seasons-list">
              {seasons.map((seasonTotal, seasonIndex) => {
                const start = episodeOffset;
                episodeOffset += seasonTotal;
                const titleSeasonMatch = item.title.match(/T(\d+)/i);
                const seasonNumber =
                  seasons.length === 1 && titleSeasonMatch
                    ? Number(titleSeasonMatch[1])
                    : seasonIndex + 1;
                const seasonDone = Array.from(
                  { length: seasonTotal },
                  (_, index) => start + index + 1,
                ).filter((episode) => episodes.includes(episode)).length;
                return (
                  <div className="season-block" key={seasonIndex}>
                    <div className="season-heading">
                      <strong>Temporada {seasonNumber}</strong>
                      <span>
                        {seasonDone}/{seasonTotal}
                      </span>
                    </div>
                    <div className="episode-grid">
                      {Array.from({ length: seasonTotal }, (_, index) => {
                        const episode = start + index + 1;
                        const duration =
                          metadata?.episodeDurations?.[episode - 1] || episodeRuntime;
                        return (
                          <button
                            key={episode}
                            className={episodes.includes(episode) ? "complete" : ""}
                            onClick={() => onToggleEpisode(episode)}
                          >
                            <span>
                              {episodes.includes(episode) ? (
                                <Icon name="check" size={14} />
                              ) : (
                                index + 1
                              )}
                            </span>
                            <small>
                              EP {String(index + 1).padStart(2, "0")}
                              {duration ? ` · ${duration}m` : ""}
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="metadata-section information-section">
          <span className="detail-kicker">Ficha completa</span>
          <h3>Información</h3>
          <div className="detail-facts">
            <div>
              <span>Año</span>
              <strong>{Math.floor(item.releaseValue)}</strong>
            </div>
            <div>
              <span>Duración</span>
              <strong>
                {total
                  ? episodeRuntime
                    ? `${episodeRuntime} min/ep.`
                    : "Variable"
                  : runtime
                    ? formatMinutes(runtime)
                    : "Por confirmar"}
              </strong>
            </div>
            <div>
              <span>Poscréditos</span>
              <strong>
                {postCredits == null
                  ? "No registrado"
                  : postCredits === 0
                    ? "Ninguna"
                    : `${postCredits} escena${postCredits === 1 ? "" : "s"}`}
              </strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{item.upcoming ? "Próxima" : watched ? "Vista" : "Pendiente"}</strong>
            </div>
          </div>
          {characters.length > 0 && (
            <div className="metadata-group">
              <h4>Personajes principales</h4>
              <div className="metadata-chips">
                {characters.slice(0, 10).map((character) => (
                  <span key={character}>{character}</span>
                ))}
              </div>
            </div>
          )}
          {metadata?.platforms?.length > 0 && (
            <div className="metadata-group">
              <h4>Plataforma o canal registrado</h4>
              <div className="metadata-chips platforms">
                {metadata.platforms.map((platform) => (
                  <span key={platform}>{platform}</span>
                ))}
              </div>
              <small className="regional-note">
                La disponibilidad puede cambiar según el catálogo de Perú.
              </small>
            </div>
          )}
          {metadata?.contentWarnings?.length > 0 && (
            <div className="metadata-group">
              <h4>Avisos de contenido</h4>
              <div className="metadata-chips warnings">
                {metadata.contentWarnings.map((warning) => (
                  <span key={warning}>{warning}</span>
                ))}
              </div>
            </div>
          )}
          {metadata && (
            <div className="external-actions">
              <a
                className="trailer-button"
                href={metadata.trailerUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="film" />
                Buscar tráiler oficial
              </a>
              <a className="source-link" href={metadata.sourceUrl} target="_blank" rel="noreferrer">
                Fuente: {metadata.sourceLabel}
                <Icon name="chevron" size={13} />
              </a>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
