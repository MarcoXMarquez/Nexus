import type { Session, User } from "@supabase/supabase-js";

export type SyncState = "guest" | "offline" | "syncing" | "synced" | "error" | "conflict" | "unconfigured";

export type LocalProfile = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  child: boolean;
  guest?: boolean;
};

export type CloudProfile = {
  id: string;
  owner_id: string;
  local_key: string;
  name: string;
  avatar: string;
  color: string;
  child_mode: boolean;
  visibility: "private" | "shared" | "public";
  created_at: string;
  updated_at: string;
};

export type DeviceRecord = {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  app_version: string;
  last_seen_at: string;
  revoked_at: string | null;
};

export type CloudMarathon = {
  id: string;
  owner_profile_id: string;
  name: string;
  description: string;
  visibility: "private" | "invite" | "public";
  share_slug: string | null;
  cover_ids: string[];
  created_at: string;
  updated_at: string;
  marathon_items?: CloudMarathonItem[];
};

export type CloudMarathonItem = {
  id: string;
  marathon_id: string;
  position: number;
  title_id: string;
  episode: number | null;
  completed_at?: string | null;
};

export type LocalMarathon = {
  version: 1;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  author: string;
  tasks: Array<{ itemId: string; episode?: number }>;
  coverIds: string[];
};

export type NexusSnapshot = {
  version: 1;
  profileId: string;
  deviceId: string;
  updatedAt: string;
  revision: number;
  values: Record<string, unknown>;
};

export type QueuedMutation = {
  id: string;
  profileId: string;
  createdAt: string;
  kind: "snapshot" | "marathon" | "profile" | "achievement";
  payload: unknown;
  attempts: number;
};

export type CloudAccountState = {
  configured: boolean;
  session: Session | null;
  user: User | null;
  status: SyncState;
  message: string;
  lastSyncedAt: string | null;
  profiles: CloudProfile[];
  devices: DeviceRecord[];
  marathons: CloudMarathon[];
};

declare global {
  interface Window {
    nexusCloud?: {
      openAccount: () => void;
      shareMarathon: (marathon: LocalMarathon) => Promise<{ ok: boolean; url?: string; error?: string }>;
      importInvitation: (token: string) => Promise<{ ok: boolean; error?: string }>;
    };
  }
}

export {};
