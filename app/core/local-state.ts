import { useEffect, useRef, useState } from "react";
import type {
  ActivityEvent,
  CustomList,
  EpisodeState,
  Intent,
  Preferences,
  SharedMarathon,
} from "./models";

export const WATCHED_KEY = "nexus-desktop-watched-v1";
export const EPISODES_KEY = "nexus-desktop-episodes-v1";
export const WATCHLIST_KEY = "nexus-desktop-watchlist-v1";
export const IGNORED_KEY = "nexus-desktop-ignored-v1";
export const FAVORITE_TRACKS_KEY = "nexus-desktop-favorite-tracks-v1";
export const INTENT_KEY = "nexus-desktop-intent-v1";
export const SPOILERS_KEY = "nexus-desktop-spoilers-v1";
export const ACTIVITY_KEY = "nexus-desktop-activity-v1";
export const RATINGS_KEY = "nexus-desktop-ratings-v1";
export const FAVORITES_KEY = "nexus-desktop-favorites-v1";
export const NOTES_KEY = "nexus-desktop-notes-v1";
export const WATCHED_DATES_KEY = "nexus-desktop-watched-dates-v1";
export const REWATCHES_KEY = "nexus-desktop-rewatches-v1";
export const HISTORY_KEY = "nexus-desktop-history-v1";
export const CUSTOM_LISTS_KEY = "nexus-desktop-custom-lists-v1";
export const REMINDERS_KEY = "nexus-desktop-reminders-v1";
export const MARATHON_KEY = "nexus-desktop-marathon-v1";
export const PROFILES_KEY = "nexus-desktop-profiles-v1";
export const ACTIVE_PROFILE_KEY = "nexus-desktop-active-profile-v1";
export const CUSTOM_MARATHONS_KEY = "nexus-desktop-custom-marathons-v1";
export const PREFERENCES_KEY = "nexus-desktop-preferences-v1";
export const UNLOCKED_ACHIEVEMENTS_KEY = "nexus-desktop-achievements-v1";
export const ACHIEVEMENT_RECORDS_KEY = "nexus-desktop-achievement-records-v1";

export const DEFAULT_PREFERENCES: Preferences = {
  accent: "red",
  intensity: 82,
  density: "comfortable",
  cardSize: "medium",
  fontScale: 100,
  highContrast: false,
  reduceMotion: false,
  achievements: true,
};

export const PROFILE_DATA_KEYS = [
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

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function readSet(key: string, fallback: string[] = []): Set<string> {
  return new Set(readJson<string[]>(key, fallback));
}

export function useStoredProgress() {
  const [watched, setWatched] = useState(() => readSet(WATCHED_KEY));
  const [episodes, setEpisodes] = useState<EpisodeState>(() => readJson(EPISODES_KEY, {}));
  const [watchlist, setWatchlist] = useState(() => readSet(WATCHLIST_KEY));
  const [ignored, setIgnored] = useState(() => readSet(IGNORED_KEY));
  const [favoriteTracks, setFavoriteTracks] = useState(() =>
    readSet(FAVORITE_TRACKS_KEY, ["mcu", "series"]),
  );
  const [intent, setIntent] = useState<Intent>(
    () => (localStorage.getItem(INTENT_KEY) as Intent) || "chronological",
  );
  const [spoilerSafe, setSpoilerSafe] = useState(
    () => localStorage.getItem(SPOILERS_KEY) !== "false",
  );
  const [activity, setActivity] = useState<Record<string, number>>(() =>
    readJson(ACTIVITY_KEY, {}),
  );
  const [ratings, setRatings] = useState<Record<string, number>>(() => readJson(RATINGS_KEY, {}));
  const [favorites, setFavorites] = useState(() => readSet(FAVORITES_KEY));
  const [notes, setNotes] = useState<Record<string, string>>(() => readJson(NOTES_KEY, {}));
  const [watchedDates, setWatchedDates] = useState<Record<string, string>>(() =>
    readJson(WATCHED_DATES_KEY, {}),
  );
  const [rewatches, setRewatches] = useState<Record<string, number>>(() =>
    readJson(REWATCHES_KEY, {}),
  );
  const [history, setHistory] = useState<ActivityEvent[]>(() => readJson(HISTORY_KEY, []));
  const [customLists, setCustomLists] = useState<CustomList[]>(() =>
    readJson(CUSTOM_LISTS_KEY, []),
  );

  useEffect(() => {
    const reloadCloudSnapshot = () => {
      setWatched(readSet(WATCHED_KEY));
      setEpisodes(readJson(EPISODES_KEY, {}));
      setWatchlist(readSet(WATCHLIST_KEY));
      setIgnored(readSet(IGNORED_KEY));
      setFavoriteTracks(readSet(FAVORITE_TRACKS_KEY));
      setIntent((localStorage.getItem(INTENT_KEY) as Intent) || "chronological");
      setSpoilerSafe(localStorage.getItem(SPOILERS_KEY) !== "false");
      setActivity(readJson(ACTIVITY_KEY, {}));
      setRatings(readJson(RATINGS_KEY, {}));
      setFavorites(readSet(FAVORITES_KEY));
      setNotes(readJson(NOTES_KEY, {}));
      setWatchedDates(readJson(WATCHED_DATES_KEY, {}));
      setRewatches(readJson(REWATCHES_KEY, {}));
      setHistory(readJson(HISTORY_KEY, []));
      setCustomLists(readJson(CUSTOM_LISTS_KEY, []));
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
  return readJson<SharedMarathon[]>(CUSTOM_MARATHONS_KEY, []).filter((entry) =>
    Boolean(entry?.id && entry?.name && Array.isArray(entry?.tasks)),
  );
}

export function useStoredMarathons() {
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
