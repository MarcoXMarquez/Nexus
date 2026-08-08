"use client";

import type { Session } from "@supabase/supabase-js";
import { applySnapshot, captureSnapshot, completeMutation, getDeviceId, pendingMutations, queueSnapshot, saveLocalSnapshot } from "./local-repository";
import { LAST_SYNC_KEY, NEXUS_KEYS } from "./storage-keys";
import { getSupabase, publicAppUrl } from "./supabase";
import type { CloudMarathon, CloudProfile, DeviceRecord, LocalMarathon, LocalProfile, NexusSnapshot } from "./types";

function platformName() {
  if (window.nexusDesktop?.platform) return `Nexus Desktop · ${window.nexusDesktop.platform}`;
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  return mobile ? "Nexus Web · móvil" : "Nexus Web · navegador";
}

export async function signUp(email: string, password: string, displayName: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  return client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${publicAppUrl()}/auth/callback`,
      data: { display_name: displayName.trim() || email.split("@")[0] },
    },
  });
}

export async function signIn(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  return client.auth.signInWithPassword({ email, password });
}

export async function sendPasswordReset(email: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  return client.auth.resetPasswordForEmail(email, { redirectTo: `${publicAppUrl()}/auth/reset` });
}

export async function updatePassword(password: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  return client.auth.updateUser({ password });
}

export async function signOut(scope: "local" | "global" = "local") {
  const client = getSupabase();
  if (!client) return;
  await client.auth.signOut({ scope });
}

export async function upsertLocalProfiles(session: Session, profiles: LocalProfile[]): Promise<CloudProfile[]> {
  const client = getSupabase();
  if (!client) return [];
  const rows = profiles.filter((profile) => !profile.guest).map((profile) => ({
    owner_id: session.user.id,
    local_key: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    child_mode: profile.child,
  }));
  if (rows.length) {
    const { error } = await client.from("viewer_profiles").upsert(rows, { onConflict: "owner_id,local_key" });
    if (error) throw error;
  }
  const { data, error } = await client.from("viewer_profiles").select("*").eq("owner_id", session.user.id).order("created_at");
  if (error) throw error;
  return (data || []) as CloudProfile[];
}

export async function createCloudProfile(session: Session, profile: Omit<LocalProfile, "id">): Promise<CloudProfile> {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const localKey = `profile-${crypto.randomUUID()}`;
  const { data, error } = await client.from("viewer_profiles").insert({
    owner_id: session.user.id,
    local_key: localKey,
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    child_mode: profile.child,
    visibility: "private",
  }).select("*").single();
  if (error) throw error;
  return data as CloudProfile;
}

export async function updateCloudProfile(profileId: string, values: Partial<Pick<CloudProfile, "name" | "avatar" | "color" | "child_mode" | "visibility">>) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const { error } = await client.from("viewer_profiles").update(values).eq("id", profileId);
  if (error) throw error;
  if (values.visibility) {
    const achievementVisibility = values.visibility === "public" ? "public" : "private";
    const achievements = await client.from("user_achievements").update({ visibility: achievementVisibility }).eq("profile_id", profileId);
    if (achievements.error) throw achievements.error;
  }
}

export async function deleteCloudProfile(profileId: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const { error } = await client.from("viewer_profiles").delete().eq("id", profileId);
  if (error) throw error;
}

export async function registerDevice(session: Session): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  const deviceId = getDeviceId();
  const existing = await client.from("devices").select("revoked_at").eq("id", deviceId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.revoked_at) throw new Error("Este dispositivo fue desvinculado. Inicia sesión nuevamente si deseas volver a usarlo.");
  const { error } = await client.from("devices").upsert({
    id: deviceId,
    user_id: session.user.id,
    name: platformName(),
    platform: window.nexusDesktop?.platform || navigator.platform || "web",
    app_version: "1.0.0",
    last_seen_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (error) throw error;
}

export async function listDevices(session: Session): Promise<DeviceRecord[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from("devices").select("*").eq("user_id", session.user.id).order("last_seen_at", { ascending: false });
  if (error) throw error;
  return (data || []) as DeviceRecord[];
}

export async function revokeDevice(deviceId: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from("devices").update({ revoked_at: new Date().toISOString() }).eq("id", deviceId);
  if (error) throw error;
}

function cloudProfileForLocal(profiles: CloudProfile[], localProfileId: string) {
  return profiles.find((profile) => profile.local_key === localProfileId) || profiles[0] || null;
}

export async function syncProfile(session: Session, profiles: CloudProfile[], localProfileId: string, prefer: "merge" | "local" | "cloud" = "merge") {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const cloudProfile = cloudProfileForLocal(profiles, localProfileId);
  if (!cloudProfile) throw new Error("No existe un perfil cloud para sincronizar.");

  const local = captureSnapshot(localProfileId);
  const contentKey = `nexus-cloud-content-v1:${localProfileId}`;
  const previousFingerprint = localStorage.getItem(contentKey);
  const localFingerprint = JSON.stringify(local.values);
  const localChanged = previousFingerprint == null || previousFingerprint !== localFingerprint;
  const previousSync = localStorage.getItem(LAST_SYNC_KEY);
  await queueSnapshot(local);
  const { data: remoteRow, error: remoteError } = await client.from("profile_snapshots").select("snapshot,revision,updated_at").eq("profile_id", cloudProfile.id).maybeSingle();
  if (remoteError) throw remoteError;
  const remote = remoteRow?.snapshot as NexusSnapshot | undefined;
  const remoteChanged = Boolean(remote && (!previousSync || new Date(remote.updatedAt).getTime() > new Date(previousSync).getTime()));
  let finalSnapshot: NexusSnapshot;

  if (remote && (prefer === "cloud" || (prefer === "merge" && remoteChanged && !localChanged))) {
    finalSnapshot = remote;
    applySnapshot(finalSnapshot, localProfileId);
    await saveLocalSnapshot(finalSnapshot);
    await pushSnapshot(cloudProfile.id, finalSnapshot);
  } else if (remote && prefer === "merge" && remoteChanged && localChanged) {
    const remoteIsNewest = new Date(remote.updatedAt).getTime() >= new Date(local.updatedAt).getTime();
    finalSnapshot = remoteIsNewest ? mergeSnapshots(local, remote) : mergeSnapshots(remote, local);
    applySnapshot(finalSnapshot, localProfileId);
    await saveLocalSnapshot(finalSnapshot);
    await pushSnapshot(cloudProfile.id, finalSnapshot);
  } else {
    finalSnapshot = remote && prefer === "merge" ? mergeSnapshots(remote, local) : local;
    await pushSnapshot(cloudProfile.id, finalSnapshot);
    await saveLocalSnapshot(finalSnapshot);
  }

  for (const mutation of await pendingMutations()) {
    if (mutation.profileId === localProfileId) await completeMutation(mutation.id);
  }
  const now = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, now);
  localStorage.setItem(contentKey, JSON.stringify(finalSnapshot.values));
  await registerDevice(session);
  return now;
}

async function pushSnapshot(profileId: string, snapshot: NexusSnapshot) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from("profile_snapshots").upsert({
    profile_id: profileId,
    snapshot,
    revision: snapshot.revision,
    device_id: snapshot.deviceId,
    updated_at: snapshot.updatedAt,
  }, { onConflict: "profile_id" });
  if (error) throw error;
}

function arrayUnion(a: unknown, b: unknown) {
  if (!Array.isArray(a) || !Array.isArray(b)) return b ?? a;
  return [...new Set([...a, ...b])];
}

function mergeSnapshots(older: NexusSnapshot, newer: NexusSnapshot): NexusSnapshot {
  const values = { ...older.values, ...newer.values };
  const unionKeys = [NEXUS_KEYS.watchlist, NEXUS_KEYS.favorites, NEXUS_KEYS.favoriteTracks, NEXUS_KEYS.achievements];
  for (const key of unionKeys) values[key] = arrayUnion(older.values[key], newer.values[key]);
  const objectKeys = [NEXUS_KEYS.ratings, NEXUS_KEYS.notes, NEXUS_KEYS.rewatches, NEXUS_KEYS.activity, NEXUS_KEYS.achievementRecords];
  for (const key of objectKeys) {
    const left = older.values[key];
    const right = newer.values[key];
    if (left && right && typeof left === "object" && typeof right === "object") values[key] = { ...left, ...right };
  }
  // Películas y episodios usan la última actividad de cada título. Esto
  // permite sincronizar también un "desmarcar", algo que una unión de arrays
  // no puede representar correctamente.
  const olderActivity = (older.values[NEXUS_KEYS.activity] || {}) as Record<string, number>;
  const newerActivity = (newer.values[NEXUS_KEYS.activity] || {}) as Record<string, number>;
  values[NEXUS_KEYS.activity] = Object.fromEntries([...new Set([...Object.keys(olderActivity), ...Object.keys(newerActivity)])].map((id) => [id, Math.max(olderActivity[id] || 0, newerActivity[id] || 0)]));
  const olderWatched = new Set(Array.isArray(older.values[NEXUS_KEYS.watched]) ? older.values[NEXUS_KEYS.watched] as string[] : []);
  const newerWatched = new Set(Array.isArray(newer.values[NEXUS_KEYS.watched]) ? newer.values[NEXUS_KEYS.watched] as string[] : []);
  const allProgressIds = new Set([...olderWatched, ...newerWatched, ...Object.keys(olderActivity), ...Object.keys(newerActivity)]);
  values[NEXUS_KEYS.watched] = [...allProgressIds].filter((id) => (newerActivity[id] || 0) >= (olderActivity[id] || 0) ? newerWatched.has(id) : olderWatched.has(id));
  const olderEpisodes = (older.values[NEXUS_KEYS.episodes] || {}) as Record<string, number[]>;
  const newerEpisodes = (newer.values[NEXUS_KEYS.episodes] || {}) as Record<string, number[]>;
  const mergedEpisodes: Record<string, number[]> = {};
  for (const id of new Set([...Object.keys(olderEpisodes), ...Object.keys(newerEpisodes)])) {
    mergedEpisodes[id] = ((newerActivity[id] || 0) >= (olderActivity[id] || 0) ? newerEpisodes[id] : olderEpisodes[id]) || [];
  }
  values[NEXUS_KEYS.episodes] = mergedEpisodes;
  const olderDates = (older.values[NEXUS_KEYS.watchedDates] || {}) as Record<string, string>;
  const newerDates = (newer.values[NEXUS_KEYS.watchedDates] || {}) as Record<string, string>;
  const mergedDates: Record<string, string> = {};
  for (const id of new Set([...Object.keys(olderDates), ...Object.keys(newerDates)])) {
    const value = (newerActivity[id] || 0) >= (olderActivity[id] || 0) ? newerDates[id] : olderDates[id];
    if (value) mergedDates[id] = value;
  }
  values[NEXUS_KEYS.watchedDates] = mergedDates;
  return {
    ...newer,
    values,
    revision: Math.max(older.revision, newer.revision) + 1,
    updatedAt: new Date().toISOString(),
  };
}

export async function listMarathons(profileId: string): Promise<CloudMarathon[]> {
  const client = getSupabase();
  if (!client) return [];
  const memberships = await client.from("marathon_members").select("marathon_id").eq("profile_id", profileId);
  if (memberships.error) throw memberships.error;
  const joinedIds = (memberships.data || []).map((entry) => entry.marathon_id as string);
  let query = client.from("marathons").select("*,marathon_items(*)");
  query = joinedIds.length ? query.or(`owner_profile_id.eq.${profileId},id.in.(${joinedIds.join(",")})`) : query.eq("owner_profile_id", profileId);
  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CloudMarathon[];
}

export async function uploadMarathon(profileId: string, marathon: LocalMarathon, visibility: "private" | "invite" | "public" = "invite") {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const shareSlug = visibility === "public" ? `${marathon.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 45) || "maraton"}-${crypto.randomUUID().slice(0, 7)}` : null;
  const { data, error } = await client.from("marathons").upsert({
    owner_profile_id: profileId,
    source_local_id: marathon.id,
    name: marathon.name,
    description: marathon.description,
    visibility,
    share_slug: shareSlug,
    cover_ids: marathon.coverIds,
  }, { onConflict: "owner_profile_id,source_local_id" }).select("*").single();
  if (error) throw error;
  const cleared = await client.from("marathon_items").delete().eq("marathon_id", data.id);
  if (cleared.error) throw cleared.error;
  const items = marathon.tasks.map((task, index) => ({ marathon_id: data.id, position: (index + 1) * 1000, title_id: task.itemId, episode: task.episode || null }));
  if (items.length) {
    const inserted = await client.from("marathon_items").insert(items);
    if (inserted.error) throw inserted.error;
  }
  return { marathon: data as CloudMarathon, url: shareSlug ? `${publicAppUrl()}/marathon/${shareSlug}` : undefined };
}

export async function createInvitation(marathonId: string, role: "editor" | "participant" | "viewer" = "participant") {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const { error } = await client.from("marathon_invitations").insert({ marathon_id: marathonId, token_hash: tokenHash, role, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
  if (error) throw error;
  return { token, url: `${publicAppUrl()}/invite/${token}` };
}

export async function acceptInvitation(token: string, profileId: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const { data, error } = await client.rpc("accept_marathon_invitation", { invitation_token: token, joining_profile_id: profileId });
  if (error) throw error;
  return data;
}

export async function syncAchievements(profileId: string, achievementIds: string[], records: Record<string, { version?: number; unlockedAt?: string; progressSnapshot?: unknown }> = {}) {
  const client = getSupabase();
  if (!client || !achievementIds.length) return;
  const rows = achievementIds.map((achievementId) => ({ profile_id: profileId, achievement_id: achievementId, unlocked_at: records[achievementId]?.unlockedAt || new Date().toISOString(), progress_snapshot: { version: records[achievementId]?.version || 1, ...(records[achievementId]?.progressSnapshot && typeof records[achievementId].progressSnapshot === "object" ? records[achievementId].progressSnapshot as object : {}) }, visibility: "private" }));
  const { error } = await client.from("user_achievements").upsert(rows, { onConflict: "profile_id,achievement_id" });
  if (error) throw error;
}

function storedArray(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch { return []; }
}

function storedRecord<T>(key: string): Record<string, T> {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, T> : {};
  } catch { return {}; }
}

/**
 * Refleja el estado local en las tablas relacionales. profile_snapshots sigue
 * funcionando como respaldo offline, pero la fuente consultable en la nube
 * queda normalizada por título y episodio.
 */
export async function syncStructuredProfile(profileId: string) {
  const client = getSupabase();
  if (!client) return;
  const watched = new Set(storedArray(NEXUS_KEYS.watched));
  const watchlist = new Set(storedArray(NEXUS_KEYS.watchlist));
  const ignored = new Set(storedArray(NEXUS_KEYS.ignored));
  const favorites = new Set(storedArray(NEXUS_KEYS.favorites));
  const ratings = storedRecord<number>(NEXUS_KEYS.ratings);
  const notes = storedRecord<string>(NEXUS_KEYS.notes);
  const watchedDates = storedRecord<string>(NEXUS_KEYS.watchedDates);
  const rewatches = storedRecord<number>(NEXUS_KEYS.rewatches);
  const episodes = storedRecord<number[]>(NEXUS_KEYS.episodes);
  const activity = storedRecord<number>(NEXUS_KEYS.activity);
  const deviceId = getDeviceId();
  const titleIds = new Set<string>([
    ...watched, ...watchlist, ...ignored, ...favorites,
    ...Object.keys(ratings), ...Object.keys(notes), ...Object.keys(watchedDates),
    ...Object.keys(rewatches), ...Object.keys(episodes), ...Object.keys(activity),
  ]);

  const existingTitles = await client.from("title_progress").select("title_id").eq("profile_id", profileId);
  if (existingTitles.error) throw existingTitles.error;
  if (titleIds.size) {
    const rows = [...titleIds].map((titleId) => ({
      profile_id: profileId,
      title_id: titleId,
      status: ignored.has(titleId) ? "ignored" : watched.has(titleId) ? "completed" : (episodes[titleId]?.length || 0) > 0 ? "started" : "pending",
      favorite: favorites.has(titleId),
      watchlist: watchlist.has(titleId),
      rating: ratings[titleId] || null,
      private_note: notes[titleId] || "",
      watched_at: watchedDates[titleId] ? new Date(`${watchedDates[titleId]}T12:00:00Z`).toISOString() : null,
      rewatch_count: Math.max(0, Number(rewatches[titleId]) || 0),
      revision: activity[titleId] || Date.now(),
      device_id: deviceId,
    }));
    const inserted = await client.from("title_progress").upsert(rows, { onConflict: "profile_id,title_id" });
    if (inserted.error) throw inserted.error;
  }
  const staleTitleIds = (existingTitles.data || []).map((row) => row.title_id as string).filter((titleId) => !titleIds.has(titleId));
  if (staleTitleIds.length) {
    const removed = await client.from("title_progress").delete().eq("profile_id", profileId).in("title_id", staleTitleIds);
    if (removed.error) throw removed.error;
  }

  const existingEpisodes = await client.from("episode_progress").select("title_id,season_number,episode_number").eq("profile_id", profileId);
  if (existingEpisodes.error) throw existingEpisodes.error;
  const localEpisodeKeys = new Set(Object.entries(episodes).flatMap(([titleId, values]) =>
    (Array.isArray(values) ? values : []).map((episodeNumber) => `${titleId}:1:${episodeNumber}`),
  ));
  const allEpisodeKeys = new Set([
    ...localEpisodeKeys,
    ...(existingEpisodes.data || []).map((row) => `${row.title_id}:${row.season_number}:${row.episode_number}`),
  ]);
  const episodeRows = [...allEpisodeKeys].map((key) => {
    const [titleId, seasonNumber, episodeNumber] = key.split(":");
    return {
      profile_id: profileId,
      title_id: titleId,
      season_number: Number(seasonNumber),
      episode_number: Number(episodeNumber),
      completed: localEpisodeKeys.has(key),
      watched_at: localEpisodeKeys.has(key) ? new Date(activity[titleId] || Date.now()).toISOString() : null,
      revision: activity[titleId] || Date.now(),
      device_id: deviceId,
    };
  });
  if (episodeRows.length) {
    const inserted = await client.from("episode_progress").upsert(episodeRows, { onConflict: "profile_id,title_id,season_number,episode_number" });
    if (inserted.error) throw inserted.error;
  }

  const preferences = Object.fromEntries([
    NEXUS_KEYS.favoriteTracks, NEXUS_KEYS.intent, NEXUS_KEYS.spoilers,
    NEXUS_KEYS.preferences, NEXUS_KEYS.reminders, NEXUS_KEYS.customRoute,
  ].map((key) => {
    const raw = localStorage.getItem(key);
    if (raw == null) return [key, null];
    try { return [key, JSON.parse(raw)]; } catch { return [key, raw]; }
  }));
  const savedPreferences = await client.from("user_preferences").upsert({ profile_id: profileId, preferences }, { onConflict: "profile_id" });
  if (savedPreferences.error) throw savedPreferences.error;
  await syncAchievements(profileId, storedArray(NEXUS_KEYS.achievements), storedRecord(NEXUS_KEYS.achievementRecords));
}

export async function syncLocalMarathons(profileId: string) {
  const client = getSupabase();
  if (!client) return;
  let local: LocalMarathon[] = [];
  try { local = JSON.parse(localStorage.getItem(NEXUS_KEYS.customMarathons) || "[]"); } catch { return; }
  const fingerprintKey = `nexus-cloud-marathons-v1:${profileId}`;
  const fingerprint = JSON.stringify(local);
  if (localStorage.getItem(fingerprintKey) === fingerprint) return;
  for (const marathon of local) {
    const existing = await client.from("marathons").select("id").eq("owner_profile_id", profileId).eq("source_local_id", marathon.id).maybeSingle();
    // Permite que una instalación actual siga funcionando hasta ejecutar 002.
    if (existing.error && (existing.error.code === "PGRST204" || /source_local_id/i.test(existing.error.message))) return;
    if (existing.error) throw existing.error;
    const saved = existing.data
      ? await client.from("marathons").update({ name: marathon.name, description: marathon.description, cover_ids: marathon.coverIds }).eq("id", existing.data.id).select("id").single()
      : await client.from("marathons").insert({ owner_profile_id: profileId, source_local_id: marathon.id, name: marathon.name, description: marathon.description, visibility: "private", cover_ids: marathon.coverIds }).select("id").single();
    if (saved.error) throw saved.error;
    const data = saved.data;
    const removed = await client.from("marathon_items").delete().eq("marathon_id", data.id);
    if (removed.error) throw removed.error;
    if (marathon.tasks.length) {
      const rows = marathon.tasks.map((task, index) => ({ marathon_id: data.id, position: (index + 1) * 1000, title_id: task.itemId, episode: task.episode || null }));
      const inserted = await client.from("marathon_items").insert(rows);
      if (inserted.error) throw inserted.error;
    }
  }
  localStorage.setItem(fingerprintKey, fingerprint);
}

export async function requestAccountDeletion() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const { error } = await client.functions.invoke("delete-account", { body: { confirmation: "DELETE_MY_NEXUS_ACCOUNT" } });
  if (error) throw error;
}
