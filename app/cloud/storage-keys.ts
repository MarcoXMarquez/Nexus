export const NEXUS_KEYS = {
  watched: "nexus-desktop-watched-v1",
  episodes: "nexus-desktop-episodes-v1",
  watchlist: "nexus-desktop-watchlist-v1",
  ignored: "nexus-desktop-ignored-v1",
  favoriteTracks: "nexus-desktop-favorite-tracks-v1",
  intent: "nexus-desktop-intent-v1",
  spoilers: "nexus-desktop-spoilers-v1",
  activity: "nexus-desktop-activity-v1",
  ratings: "nexus-desktop-ratings-v1",
  favorites: "nexus-desktop-favorites-v1",
  notes: "nexus-desktop-notes-v1",
  watchedDates: "nexus-desktop-watched-dates-v1",
  rewatches: "nexus-desktop-rewatches-v1",
  history: "nexus-desktop-history-v1",
  customLists: "nexus-desktop-custom-lists-v1",
  reminders: "nexus-desktop-reminders-v1",
  marathonPlan: "nexus-desktop-marathon-v1",
  profiles: "nexus-desktop-profiles-v1",
  activeProfile: "nexus-desktop-active-profile-v1",
  customMarathons: "nexus-desktop-custom-marathons-v1",
  preferences: "nexus-desktop-preferences-v1",
  achievements: "nexus-desktop-achievements-v1",
  achievementRecords: "nexus-desktop-achievement-records-v1",
  customRoute: "nexus-desktop-custom-route-v1",
} as const;

export const PROFILE_VALUE_KEYS = [
  NEXUS_KEYS.watched,
  NEXUS_KEYS.episodes,
  NEXUS_KEYS.watchlist,
  NEXUS_KEYS.ignored,
  NEXUS_KEYS.favoriteTracks,
  NEXUS_KEYS.intent,
  NEXUS_KEYS.spoilers,
  NEXUS_KEYS.activity,
  NEXUS_KEYS.ratings,
  NEXUS_KEYS.favorites,
  NEXUS_KEYS.notes,
  NEXUS_KEYS.watchedDates,
  NEXUS_KEYS.rewatches,
  NEXUS_KEYS.history,
  NEXUS_KEYS.customLists,
  NEXUS_KEYS.reminders,
  NEXUS_KEYS.marathonPlan,
] as const;

export const ACCOUNT_VALUE_KEYS = [
  NEXUS_KEYS.customMarathons,
  NEXUS_KEYS.preferences,
  NEXUS_KEYS.achievements,
  NEXUS_KEYS.achievementRecords,
  NEXUS_KEYS.customRoute,
] as const;

export const DEVICE_ID_KEY = "nexus-cloud-device-id-v1";
export const CLOUD_REVISION_KEY = "nexus-cloud-revision-v1";
export const LAST_SYNC_KEY = "nexus-cloud-last-sync-v1";
export const PENDING_INVITE_KEY = "nexus-cloud-pending-invite-v1";
