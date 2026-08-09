"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  ACCOUNT_VALUE_KEYS,
  CLOUD_REVISION_KEY,
  DEVICE_ID_KEY,
  LAST_SYNC_KEY,
  NEXUS_KEYS,
  PROFILE_VALUE_KEYS,
} from "./storage-keys";
import type { NexusSnapshot, QueuedMutation } from "./types";

interface NexusLocalSchema extends DBSchema {
  snapshots: {
    key: string;
    value: NexusSnapshot;
  };
  mutations: {
    key: string;
    value: QueuedMutation;
    indexes: { "by-created": string };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let databasePromise: Promise<IDBPDatabase<NexusLocalSchema>> | null = null;

function database() {
  if (!databasePromise) {
    databasePromise = openDB<NexusLocalSchema>("nexus-mcu-local", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("snapshots")) db.createObjectStore("snapshots");
        if (!db.objectStoreNames.contains("mutations")) {
          const mutations = db.createObjectStore("mutations", { keyPath: "id" });
          mutations.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return databasePromise;
}

function parseStored(value: string | null): unknown {
  if (value == null) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function serialized(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function getDeviceId(): string {
  let value = localStorage.getItem(DEVICE_ID_KEY);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, value);
  }
  return value;
}

export function activeProfileId(): string {
  return localStorage.getItem(NEXUS_KEYS.activeProfile) || "principal";
}

export function captureSnapshot(profileId = activeProfileId()): NexusSnapshot {
  const isActive = profileId === activeProfileId();
  const values: Record<string, unknown> = {};
  for (const key of PROFILE_VALUE_KEYS) {
    const source = isActive ? key : `nexus-profile-${profileId}-${key}`;
    values[key] = parseStored(localStorage.getItem(source));
  }
  for (const key of ACCOUNT_VALUE_KEYS) values[key] = parseStored(localStorage.getItem(key));
  values[NEXUS_KEYS.profiles] = parseStored(localStorage.getItem(NEXUS_KEYS.profiles));
  const revision =
    Math.max(0, Number(localStorage.getItem(`${CLOUD_REVISION_KEY}:${profileId}`)) || 0) + 1;
  localStorage.setItem(`${CLOUD_REVISION_KEY}:${profileId}`, String(revision));
  return {
    version: 1,
    profileId,
    deviceId: getDeviceId(),
    updatedAt: new Date().toISOString(),
    revision,
    values,
  };
}

export function applySnapshot(snapshot: NexusSnapshot, profileId = snapshot.profileId) {
  const currentActive = activeProfileId();
  for (const key of PROFILE_VALUE_KEYS) {
    const value = snapshot.values[key];
    const target = profileId === currentActive ? key : `nexus-profile-${profileId}-${key}`;
    if (value == null) localStorage.removeItem(target);
    else localStorage.setItem(target, serialized(value));
  }
  for (const key of ACCOUNT_VALUE_KEYS) {
    const value = snapshot.values[key];
    if (value != null) localStorage.setItem(key, serialized(value));
  }
  if (snapshot.values[NEXUS_KEYS.profiles]) {
    localStorage.setItem(NEXUS_KEYS.profiles, serialized(snapshot.values[NEXUS_KEYS.profiles]));
  }
  localStorage.setItem(`${CLOUD_REVISION_KEY}:${profileId}`, String(snapshot.revision));
  localStorage.setItem(LAST_SYNC_KEY, snapshot.updatedAt);
  window.dispatchEvent(
    new CustomEvent("nexus:snapshot-applied", {
      detail: { profileId, revision: snapshot.revision },
    }),
  );
}

export async function saveLocalSnapshot(snapshot: NexusSnapshot) {
  if (window.nexusDesktop?.cloudSaveSnapshot) {
    await window.nexusDesktop.cloudSaveSnapshot(snapshot.profileId, snapshot);
    return;
  }
  await (await database()).put("snapshots", snapshot, snapshot.profileId);
}

export async function loadLocalSnapshot(profileId: string): Promise<NexusSnapshot | null> {
  if (window.nexusDesktop?.cloudLoadSnapshot) {
    return await window.nexusDesktop.cloudLoadSnapshot(profileId);
  }
  return (await (await database()).get("snapshots", profileId)) || null;
}

export async function queueSnapshot(snapshot: NexusSnapshot) {
  await saveLocalSnapshot(snapshot);
  const mutation: QueuedMutation = {
    id: crypto.randomUUID(),
    profileId: snapshot.profileId,
    createdAt: snapshot.updatedAt,
    kind: "snapshot",
    payload: snapshot,
    attempts: 0,
  };
  if (window.nexusDesktop?.cloudQueueMutation) {
    await window.nexusDesktop.cloudQueueMutation(mutation);
    return mutation;
  }
  await (await database()).put("mutations", mutation);
  return mutation;
}

export async function pendingMutations(): Promise<QueuedMutation[]> {
  if (window.nexusDesktop?.cloudPendingMutations)
    return window.nexusDesktop.cloudPendingMutations();
  return (await database()).getAllFromIndex("mutations", "by-created");
}

export async function completeMutation(id: string) {
  if (window.nexusDesktop?.cloudCompleteMutation) {
    await window.nexusDesktop.cloudCompleteMutation(id);
    return;
  }
  await (await database()).delete("mutations", id);
}

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readJsonFile(file: File): Promise<unknown> {
  return JSON.parse(await file.text());
}
