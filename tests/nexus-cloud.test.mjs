import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

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

test("the app starts behind an account or guest gate", async () => {
  const page = await read("../app/page.tsx");
  const gate = await read("../app/cloud/auth-gate.tsx");
  assert.match(page, /AuthGate/);
  assert.match(gate, /Iniciar sesión/);
  assert.match(gate, /Seguir como invitado/);
  assert.match(gate, /Regístrate/);
});

test("catalog progress is normalized and synchronized automatically", async () => {
  const migration = await read("../supabase/migrations/202608080002_catalog_and_event_sync.sql");
  const cloud = await read("../app/cloud/cloud-workspace.tsx");
  const service = await read("../app/cloud/cloud-service.ts");
  assert.match(migration, /create table if not exists public\.catalog_titles/i);
  assert.match(migration, /create table if not exists public\.catalog_episodes/i);
  assert.match(migration, /title_progress_catalog_fk/i);
  assert.match(migration, /episode_progress_catalog_fk/i);
  assert.match(cloud, /nexus:local-change/);
  assert.match(service, /syncStructuredProfile/);
  assert.doesNotMatch(cloud, /Sincronizar ahora/);
});

test("unwatch operations remain explicit cloud tombstones", async () => {
  const migration = await read("../supabase/migrations/202608080003_progress_tombstones.sql");
  const service = await read("../app/cloud/cloud-service.ts");
  const renderer = await read("../desktop/renderer.tsx");
  const repository = await read("../app/cloud/local-repository.ts");
  assert.match(migration, /alter column watched_at drop not null/i);
  assert.match(migration, /device_id text/i);
  assert.match(service, /status: ignored\.has\(titleId\).*"pending"/s);
  assert.match(service, /completed: localEpisodeKeys\.has\(key\)/);
  assert.match(renderer, /else delete next\[item\.id\]/);
  assert.match(repository, /nexus:snapshot-applied/);
});

test("portable marathon codes preserve title order and reject tampering", async () => {
  const source = await read("../app/features/marathon-code.ts");
  const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  const codec = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  const original = { name: "Trilogía de Tobey", description: "En orden", tasks: [{ itemId: "spiderman-raimi-1" }, { itemId: "spiderman-raimi-2" }, { itemId: "spiderman-raimi-3" }] };
  const code = codec.encodeMarathonCode(original);
  const decoded = codec.decodeMarathonCode(code, new Set(original.tasks.map((task) => task.itemId)));
  assert.match(code, /^NXS1\./);
  assert.deepEqual(decoded.tasks.map((task) => task.itemId), original.tasks.map((task) => task.itemId));
  assert.throws(() => codec.decodeMarathonCode(`${code.slice(0, -1)}X`), /modificado|incompleto/i);
});

test("profile management is replaced by the personal archive experience", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const workspace = await read("../app/cloud/cloud-workspace.tsx");
  const discovery = await read("../app/features/discovery-hub.tsx");
  assert.match(renderer, /function MyProfileView/);
  assert.doesNotMatch(renderer, /Modo invitado/);
  assert.doesNotMatch(renderer, /Crear perfil/);
  assert.doesNotMatch(workspace, /id: "profiles"/);
  for (const feature of ["Eras", "Viajes", "Cartas", "Pósteres", "Sala 3D", "Logros"]) assert.match(discovery, new RegExp(feature));
});

test("achievements are visual, searchable and grouped by characters", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const styles = await read("../desktop/styles.css");
  assert.match(renderer, /El asombroso Spider-Man/);
  assert.match(renderer, /Personajes y equipos/);
  assert.match(renderer, /Buscar personaje, equipo, saga o logro/);
  assert.match(renderer, /achievement-detail-art/);
  assert.match(renderer, /achievement-thumb/);
  assert.match(styles, /\.achievement-group-rail/);
  assert.match(styles, /\.achievement-detail-art/);
});

test("spoiler modes use dedicated tabs and the temporal tree artwork", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const styles = await read("../desktop/styles.css");
  assert.match(renderer, /Universo completo/);
  assert.match(renderer, /Ruta protegida/);
  assert.match(renderer, /nexus-mode-tabs/);
  assert.match(styles, /loki-time-tree-v1\.webp/);
  assert.doesNotMatch(styles, /--story-art:url\("\/backdrops\/hero\/doctor-strange\.webp"\)/);
});
