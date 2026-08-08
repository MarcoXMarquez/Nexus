"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const nextUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const nextKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
const url = nextUrl || viteEnv?.VITE_SUPABASE_URL || "";
const anonKey = nextKey || viteEnv?.VITE_SUPABASE_ANON_KEY || "";

export const cloudConfigured = Boolean(url && anonKey && /^https:\/\//.test(url));

const secureStorage = {
  async getItem(key: string) {
    if (typeof window === "undefined") return null;
    if (window.nexusDesktop?.authGet) return window.nexusDesktop.authGet(key);
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (window.nexusDesktop?.authSet) return window.nexusDesktop.authSet(key, value);
    localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (window.nexusDesktop?.authRemove) return window.nexusDesktop.authRemove(key);
    localStorage.removeItem(key);
  },
};

let singleton: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!cloudConfigured) return null;
  if (!singleton) {
    singleton = createClient(url, anonKey, {
      auth: {
        storage: secureStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: { "x-nexus-client": window.nexusDesktop ? "desktop" : "web" },
      },
    });
  }
  return singleton;
}

export function publicAppUrl() {
  const configuredUrl = (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_APP_URL : undefined) || viteEnv?.VITE_APP_URL;
  if (typeof window === "undefined") return configuredUrl || "http://localhost:3000";
  return configuredUrl || (window.location.protocol.startsWith("http") ? window.location.origin : "http://localhost:3000");
}
