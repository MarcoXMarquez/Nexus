import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type {
  FriendActivity,
  FriendComparison,
  FriendProfile,
  FriendRequest,
  FriendSummary,
  SocialContext,
  SocialHubData,
  SocialSearchResult,
  SocialSettings,
} from "./social-types";

type DatabaseRow = Record<string, unknown>;

function configuredClient(): SupabaseClient {
  const client = getSupabase();
  if (!client) throw new Error("La conexión con Supabase no está configurada");
  return client;
}

function stringValue(row: DatabaseRow, key: string): string {
  return typeof row[key] === "string" ? (row[key] as string) : "";
}

function numberOrNull(row: DatabaseRow, key: string): number | null {
  return typeof row[key] === "number" ? (row[key] as number) : null;
}

function identityFrom(row: DatabaseRow) {
  return {
    profileId: stringValue(row, "profile_id") || stringValue(row, "id"),
    handle: stringValue(row, "handle"),
    name: stringValue(row, "name"),
    avatar: stringValue(row, "avatar"),
    color: stringValue(row, "color") || "#f2454b",
  };
}

async function currentUserId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error("Inicia sesión para utilizar Amigos");
  return data.session.user.id;
}

export async function resolveSocialContext(localProfileId: string): Promise<SocialContext> {
  const client = configuredClient();
  const ownerId = await currentUserId(client);
  let profileQuery = await client
    .from("viewer_profiles")
    .select("id,handle,name,avatar,color")
    .eq("owner_id", ownerId)
    .eq("local_key", localProfileId)
    .maybeSingle();

  if (!profileQuery.data && !profileQuery.error) {
    profileQuery = await client
      .from("viewer_profiles")
      .select("id,handle,name,avatar,color")
      .eq("owner_id", ownerId)
      .order("created_at")
      .limit(1)
      .maybeSingle();
  }

  if (profileQuery.error) throw profileQuery.error;
  if (!profileQuery.data) throw new Error("No se encontró el perfil sincronizado");

  const profileId = String(profileQuery.data.id);
  const settingsQuery = await client
    .from("social_settings")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (settingsQuery.error) throw settingsQuery.error;

  const settings = settingsQuery.data || {
    profile_id: profileId,
    discoverability: "exact",
    progress_visibility: "friends",
    achievements_visibility: "friends",
    activity_visibility: "friends",
    marathons_visibility: "friends",
    allow_friend_requests: true,
  };

  return {
    identity: identityFrom({ ...profileQuery.data, profile_id: profileId }),
    settings: {
      profileId,
      discoverability: settings.discoverability,
      progressVisibility: settings.progress_visibility,
      achievementsVisibility: settings.achievements_visibility,
      activityVisibility: settings.activity_visibility,
      marathonsVisibility: settings.marathons_visibility,
      allowFriendRequests: settings.allow_friend_requests,
    },
  } as SocialContext;
}

export async function saveSocialHandle(profileId: string, handle: string): Promise<string> {
  const { data, error } = await configuredClient().rpc("set_social_handle", {
    acting_profile: profileId,
    requested_handle: handle,
  });
  if (error) throw error;
  return String(data);
}

export async function saveSocialSettings(settings: SocialSettings): Promise<SocialSettings> {
  const { data, error } = await configuredClient().rpc("update_social_settings", {
    acting_profile: settings.profileId,
    next_discoverability: settings.discoverability,
    next_progress_visibility: settings.progressVisibility,
    next_achievements_visibility: settings.achievementsVisibility,
    next_activity_visibility: settings.activityVisibility,
    next_marathons_visibility: settings.marathonsVisibility,
    next_allow_friend_requests: settings.allowFriendRequests,
  });
  if (error) throw error;
  const row = data as DatabaseRow;
  return {
    profileId: stringValue(row, "profile_id"),
    discoverability: stringValue(row, "discoverability"),
    progressVisibility: stringValue(row, "progress_visibility"),
    achievementsVisibility: stringValue(row, "achievements_visibility"),
    activityVisibility: stringValue(row, "activity_visibility"),
    marathonsVisibility: stringValue(row, "marathons_visibility"),
    allowFriendRequests: Boolean(row.allow_friend_requests),
  } as SocialSettings;
}

export async function searchSocialProfiles(
  profileId: string,
  query: string,
  offset = 0,
): Promise<SocialSearchResult[]> {
  const { data, error } = await configuredClient().rpc("search_social_profiles", {
    acting_profile: profileId,
    search_text: query,
    result_limit: 20,
    result_offset: offset,
  });
  if (error) throw error;
  return ((data || []) as DatabaseRow[]).map((row) => ({
    ...identityFrom(row),
    relationship: stringValue(row, "relationship"),
  })) as SocialSearchResult[];
}

export async function loadSocialHub(profileId: string): Promise<SocialHubData> {
  const client = configuredClient();
  const [friendsQuery, requestsQuery, activityQuery] = await Promise.all([
    client.rpc("list_friends", { acting_profile: profileId }),
    client.rpc("list_friend_requests", { acting_profile: profileId }),
    client.rpc("list_friend_activity", { acting_profile: profileId, result_limit: 30 }),
  ]);

  const error = friendsQuery.error || requestsQuery.error || activityQuery.error;
  if (error) throw error;

  const friends = ((friendsQuery.data || []) as DatabaseRow[]).map((row): FriendSummary => ({
    ...identityFrom(row),
    completedTitles: numberOrNull(row, "completed_titles"),
    totalTitles: numberOrNull(row, "total_titles"),
    achievementCount: numberOrNull(row, "achievement_count"),
    friendsSince: stringValue(row, "friends_since"),
  }));

  const requests = ((requestsQuery.data || []) as DatabaseRow[]).map((row): FriendRequest => ({
    ...identityFrom(row),
    requestId: stringValue(row, "request_id"),
    direction: stringValue(row, "direction") as FriendRequest["direction"],
    createdAt: stringValue(row, "created_at"),
  }));

  const activity = ((activityQuery.data || []) as DatabaseRow[]).map((row): FriendActivity => ({
    ...identityFrom(row),
    eventType: stringValue(row, "event_type") as FriendActivity["eventType"],
    titleId: stringValue(row, "title_id") || null,
    payload: (row.payload || {}) as Record<string, unknown>,
    createdAt: stringValue(row, "created_at"),
  }));

  return { friends, requests, activity };
}

export async function loadFriendProfile(
  actingProfileId: string,
  handle: string,
): Promise<FriendProfile | null> {
  const { data, error } = await configuredClient().rpc("get_social_profile", {
    acting_profile: actingProfileId,
    requested_handle: handle,
  });
  if (error) throw error;
  const row = ((data || []) as DatabaseRow[])[0];
  if (!row) return null;

  return {
    ...identityFrom(row),
    relationship: stringValue(row, "relationship") as FriendProfile["relationship"],
    completedTitles: numberOrNull(row, "completed_titles"),
    totalTitles: numberOrNull(row, "total_titles"),
    completedMovies: numberOrNull(row, "completed_movies"),
    completedSeries: numberOrNull(row, "completed_series"),
    achievementCount: numberOrNull(row, "achievement_count"),
    friendsSince: stringValue(row, "friends_since") || null,
  };
}

export async function loadFriendComparison(
  actingProfileId: string,
  targetProfileId: string,
): Promise<FriendComparison> {
  const { data, error } = await configuredClient().rpc("compare_friend_progress", {
    acting_profile: actingProfileId,
    target_profile: targetProfileId,
  });
  if (error) throw error;
  return data as FriendComparison;
}

export async function sendFriendRequest(profileId: string, targetProfileId: string) {
  const { error } = await configuredClient().rpc("send_friend_request", {
    acting_profile: profileId,
    target_profile: targetProfileId,
  });
  if (error) throw error;
}

export async function answerFriendRequest(profileId: string, requestId: string, accept: boolean) {
  const { error } = await configuredClient().rpc("respond_friend_request", {
    acting_profile: profileId,
    request_id: requestId,
    accept_request: accept,
  });
  if (error) throw error;
}

export async function cancelFriendRequest(profileId: string, requestId: string) {
  const { error } = await configuredClient().rpc("cancel_friend_request", {
    acting_profile: profileId,
    request_id: requestId,
  });
  if (error) throw error;
}

export async function removeFriend(profileId: string, targetProfileId: string) {
  const { error } = await configuredClient().rpc("remove_friend", {
    acting_profile: profileId,
    target_profile: targetProfileId,
  });
  if (error) throw error;
}

export async function blockSocialProfile(profileId: string, targetProfileId: string) {
  const { error } = await configuredClient().rpc("block_social_profile", {
    acting_profile: profileId,
    target_profile: targetProfileId,
  });
  if (error) throw error;
}

export async function reportSocialProfile(
  profileId: string,
  targetProfileId: string,
  reason: string,
  details = "",
) {
  const { error } = await configuredClient().rpc("report_social_profile", {
    acting_profile: profileId,
    target_profile: targetProfileId,
    report_reason: reason,
    report_details: details,
  });
  if (error) throw error;
}

export function subscribeToSocialChanges(profileId: string, onChange: () => void): () => void {
  const client = getSupabase();
  if (!client) return () => undefined;

  const channel: RealtimeChannel = client
    .channel(`nexus-social-${profileId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, onChange)
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function socialErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error)
    return String((error as { message: unknown }).message);
  return "No se pudo completar la acción social";
}
