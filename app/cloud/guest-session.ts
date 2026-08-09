import { ACCOUNT_VALUE_KEYS, LAST_SYNC_KEY, PROFILE_VALUE_KEYS } from "./storage-keys";
import type { LocalProfile } from "./types";

export const GUEST_ENTRY_KEY = "nexus-guest-entry-v2";
const GUEST_BACKUP_KEY = "nexus-guest-backup-v2";
const LEGACY_GUEST_ENTRY_KEY = "nexus-guest-entry-v1";

const GUEST_COLORS = ["#7d63ff", "#2bbf8a", "#d44f77", "#37a8d4", "#d49636"];
const ISOLATED_KEYS = [...PROFILE_VALUE_KEYS, ...ACCOUNT_VALUE_KEYS, LAST_SYNC_KEY] as const;

export type GuestSession = {
  version: 2;
  createdAt: string;
  profile: LocalProfile;
};

type GuestBackup = {
  version: 2;
  values: Record<string, string | null>;
};

function randomNumber(max: number) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % max;
}

export function getGuestSession(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_ENTRY_KEY) || "null") as GuestSession;
    if (parsed?.version === 2 && parsed.profile?.guest && parsed.profile?.id) return parsed;
  } catch {
    /* una sesión inválida vuelve a la puerta de acceso */
  }
  return null;
}

export function startFreshGuestSession(): GuestSession {
  const values: Record<string, string | null> = {};
  for (const key of ISOLATED_KEYS) values[key] = localStorage.getItem(key);
  const backup: GuestBackup = { version: 2, values };
  localStorage.setItem(GUEST_BACKUP_KEY, JSON.stringify(backup));

  for (const key of ISOLATED_KEYS) localStorage.removeItem(key);

  const variantNumber = String(1000 + randomNumber(9000));
  const session: GuestSession = {
    version: 2,
    createdAt: new Date().toISOString(),
    profile: {
      id: `guest-${crypto.randomUUID()}`,
      name: `Variante ${variantNumber}`,
      avatar: "V",
      color: GUEST_COLORS[randomNumber(GUEST_COLORS.length)],
      child: false,
      guest: true,
    },
  };

  localStorage.removeItem(LEGACY_GUEST_ENTRY_KEY);
  localStorage.setItem(GUEST_ENTRY_KEY, JSON.stringify(session));
  window.history.replaceState({}, "", window.location.pathname);
  return session;
}

export function endGuestSession() {
  const guest = getGuestSession();
  let backup: GuestBackup | null = null;
  try {
    backup = JSON.parse(localStorage.getItem(GUEST_BACKUP_KEY) || "null") as GuestBackup;
  } catch {
    backup = null;
  }

  if (backup?.version === 2) {
    for (const key of ISOLATED_KEYS) {
      const previous = backup.values[key];
      if (previous == null) localStorage.removeItem(key);
      else localStorage.setItem(key, previous);
    }
  }

  if (guest) {
    const prefix = `nexus-profile-${guest.profile.id}-`;
    const guestKeys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix)) guestKeys.push(key);
    }
    for (const key of guestKeys) localStorage.removeItem(key);
  }

  localStorage.removeItem(GUEST_ENTRY_KEY);
  localStorage.removeItem(GUEST_BACKUP_KEY);
  localStorage.removeItem(LEGACY_GUEST_ENTRY_KEY);
}

export function clearInvalidGuestEntry() {
  if (getGuestSession()) return;
  if (
    localStorage.getItem(GUEST_ENTRY_KEY) ||
    localStorage.getItem(LEGACY_GUEST_ENTRY_KEY) ||
    localStorage.getItem(GUEST_BACKUP_KEY)
  )
    endGuestSession();
}

export function requestCloudAuth(mode: "signin" | "signup") {
  window.dispatchEvent(new CustomEvent("nexus:open-cloud", { detail: { mode } }));
}
