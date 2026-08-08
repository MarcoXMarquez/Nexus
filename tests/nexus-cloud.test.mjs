import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("web and desktop use the same canonical Nexus application", async () => {
  const page = await read("../app/page.tsx");
  const renderer = await read("../desktop/renderer.tsx");
  assert.match(page, /desktop\/renderer/);
  assert.match(renderer, /export function App/);
  assert.match(renderer, /CloudWorkspace/);
});

test("the cloud schema protects every private product table with RLS", async () => {
  const sql = await read("../supabase/migrations/202608080001_nexus_cloud.sql");
  const protectedTables = ["viewer_profiles", "profile_snapshots", "title_progress", "episode_progress", "marathons", "marathon_items", "devices", "user_achievements"];
  for (const table of protectedTables) assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  assert.match(sql, /accept_marathon_invitation/);
  assert.match(sql, /digest\(invitation_token, 'sha256'\)/);
});

test("Vercel and PWA handoff files are present", async () => {
  const manifest = JSON.parse(await read("../public/manifest.webmanifest"));
  const env = await read("../.env.example");
  const deployment = await read("../DEPLOYMENT-VERCEL.md");
  assert.equal(manifest.display, "standalone");
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(deployment, /Vercel/i);
  assert.match(deployment, /Supabase/i);
});
