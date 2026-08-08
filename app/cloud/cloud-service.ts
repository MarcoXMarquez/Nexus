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
  const unionKeys = [NEXUS_KEYS.watched, NEXUS_KEYS.watchlist, NEXUS_KEYS.favorites, NEXUS_KEYS.favoriteTracks, NEXUS_KEYS.achievements];
  for (const key of unionKeys) values[key] = arrayUnion(older.values[key], newer.values[key]);
  const objectKeys = [NEXUS_KEYS.episodes, NEXUS_KEYS.ratings, NEXUS_KEYS.notes, NEXUS_KEYS.watchedDates, NEXUS_KEYS.rewatches, NEXUS_KEYS.activity];
  for (const key of objectKeys) {
    const left = older.values[key];
    const right = newer.values[key];
    if (left && right && typeof left === "object" && typeof right === "object") values[key] = { ...left, ...right };
  }
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
  const { data, error } = await client.from("marathons").insert({
    owner_profile_id: profileId,
    name: marathon.name,
    description: marathon.description,
    visibility,
    share_slug: shareSlug,
    cover_ids: marathon.coverIds,
  }).select("*").single();
  if (error) throw error;
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

export async function syncAchievements(profileId: string, achievementIds: string[]) {
  const client = getSupabase();
  if (!client || !achievementIds.length) return;
  const rows = achievementIds.map((achievementId) => ({ profile_id: profileId, achievement_id: achievementId, visibility: "private" }));
  const { error } = await client.from("user_achievements").upsert(rows, { onConflict: "profile_id,achievement_id" });
  if (error) throw error;
}

export async function requestAccountDeletion() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase todavía no está configurado.");
  const { error } = await client.functions.invoke("delete-account", { body: { confirmation: "DELETE_MY_NEXUS_ACCOUNT" } });
  if (error) throw error;
}
