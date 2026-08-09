import type { MCUItem } from "../mcu-data";

export type EpisodeState = Record<string, number[]>;
export type MapItem = MCUItem & { releaseValue: number; trackId: string; order: number };
export type Intent = "chronological" | "movies" | "series" | "short" | "new-line" | "random";
export type Recommendation = { item: MapItem; reason: string };

export type IconName =
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

export type ActivityEvent = {
  id: string;
  at: number;
  action: "watched" | "unwatched" | "episode" | "rewatch" | "rating" | "note" | "undo";
};

export type CustomList = { id: string; name: string; color: string; items: string[] };

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  child: boolean;
  guest?: boolean;
};

export type SharedMarathon = {
  version: 1;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  author: string;
  tasks: Array<{ itemId: string; episode?: number }>;
  coverIds: string[];
};

export type SequenceMapData = {
  id: string;
  title: string;
  subtitle: string;
  tasks: SharedMarathon["tasks"];
  kind: "marathon" | "era" | "journey" | "route";
};

export type Preferences = {
  accent: "red" | "violet" | "cyan";
  intensity: number;
  density: "comfortable" | "compact";
  cardSize: "small" | "medium" | "large";
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  achievements: boolean;
};

export type AchievementTier = "Bronce" | "Plata" | "Oro" | "Vibranium" | "Diamante";

export type AchievementRecord = {
  id: string;
  version: number;
  unlockedAt: string;
  progressSnapshot: { completedIds: string[]; requiredIds: string[] };
};

export type Achievement = {
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

export type ToastState = { message: string; actionLabel?: string; onAction?: () => void };
export type DetailPanelMode = "full" | "compact";

export type GlobalHit = {
  key: string;
  item: MapItem;
  episode?: number;
  category: "Título" | "Capítulo" | "Personaje" | "Universo" | "Conexión" | "Maratón";
  context: string;
  sequence?: SequenceMapData;
};
