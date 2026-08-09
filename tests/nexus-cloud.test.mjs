import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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
  const protectedTables = [
    "viewer_profiles",
    "profile_snapshots",
    "title_progress",
    "episode_progress",
    "marathons",
    "marathon_items",
    "devices",
    "user_achievements",
  ];
  for (const table of protectedTables)
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
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

test("Nexus exposes a persistent bilingual experience", async () => {
  const layout = await read("../app/layout.tsx");
  const provider = await read("../app/i18n/provider.tsx");
  const locale = await read("../app/i18n/locale.ts");
  const gate = await read("../app/cloud/auth-gate.tsx");
  const renderer = await read("../desktop/renderer.tsx");
  assert.match(layout, /I18nProvider/);
  assert.match(provider, /es-419/);
  assert.match(provider, /en-US/);
  assert.match(locale, /nexus-locale-v1/);
  assert.match(gate, /LanguageSwitcher/);
  assert.match(renderer, /localizeAchievements/);
});

test("every permanent achievement has dedicated English copy", async () => {
  const source = await read("../app/features/achievements/achievement-copy.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const catalog = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
  const badgeIds = JSON.parse(await read("../public/achievement-art/badge-index.json"));
  assert.equal(badgeIds.length, 126);
  assert.equal(Object.keys(catalog.ENGLISH_ACHIEVEMENTS).length, 126);
  for (const id of badgeIds) {
    assert.ok(catalog.ENGLISH_ACHIEVEMENTS[id], `missing English achievement copy for ${id}`);
    assert.ok(catalog.ENGLISH_ACHIEVEMENTS[id].title.trim());
    assert.ok(catalog.ENGLISH_ACHIEVEMENTS[id].description.trim());
  }
});

test("public legal, attribution, privacy, and contact pages are present", async () => {
  const legal = await read("../app/legal/legal-page.tsx");
  const sources = await read("../app/legal/source-directory.tsx");
  for (const route of ["about", "credits", "contact", "privacy", "terms"])
    assert.match(await read(`../app/${route}/page.tsx`), /LegalPage/);
  assert.match(legal, /marcomarquezherrera@gmail\.com/);
  assert.match(legal, /Marco Antonio Marquez Herrera/);
  assert.match(legal, /This product uses the TMDB API but is not endorsed or certified by TMDB\./);
  assert.match(legal, /not affiliated/i);
  assert.match(sources, /TITLE_LOGO_BY_ID/);
  assert.match(sources, /BACKDROP_BY_ID/);
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
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const codec = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
  const original = {
    name: "Trilogía de Tobey",
    description: "En orden",
    tasks: [
      { itemId: "spiderman-raimi-1" },
      { itemId: "spiderman-raimi-2" },
      { itemId: "spiderman-raimi-3" },
    ],
  };
  const code = codec.encodeMarathonCode(original);
  const decoded = codec.decodeMarathonCode(
    code,
    new Set(original.tasks.map((task) => task.itemId)),
  );
  assert.match(code, /^NXS1\./);
  assert.deepEqual(
    decoded.tasks.map((task) => task.itemId),
    original.tasks.map((task) => task.itemId),
  );
  assert.throws(() => codec.decodeMarathonCode(`${code.slice(0, -1)}X`), /modificado|incompleto/i);
});

test("personal marathons live in the library and open as reusable sequence maps", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const discovery = await read("../app/features/discovery-hub.tsx");
  const service = await read("../app/cloud/cloud-service.ts");
  assert.match(renderer, /Guardar en mi Biblioteca/);
  assert.match(renderer, /Maratones guardados/);
  assert.match(renderer, /function SequenceMapModal/);
  assert.match(renderer, /Ver como mapa/);
  assert.match(discovery, /Explorar mapa/);
  assert.match(discovery, /Ver viaje en el mapa/);
  assert.match(service, /removedRemoteIds/);
});

test("achievement artwork is independent from posters and keeps its provenance", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const art = await read("../app/features/achievement-art.ts");
  const manifest = JSON.parse(await read("../public/achievement-art/manifest.json"));
  const badgeIndex = JSON.parse(await read("../public/achievement-art/badge-index.json"));
  assert.match(renderer, /achievementArtFor/);
  assert.doesNotMatch(art, /posterFor|POSTER_BY_ID/);
  assert.match(art, /badges\/by-id\/256/);
  assert.match(art, /achievement-art\/heroes/);
  assert.equal(manifest.sfwReviewed, true);
  assert.equal(manifest.badgeCount, 126);
  assert.equal(badgeIndex.length, 126);
  assert.equal(manifest.heroes.length, 12);
  const [menuFiles, detailFiles] = await Promise.all([
    readdir(new URL("../public/achievement-art/badges/by-id/256/", import.meta.url)),
    readdir(new URL("../public/achievement-art/badges/by-id/512/", import.meta.url)),
  ]);
  const expectedFiles = badgeIndex.map((id) => `${id}.webp`).sort();
  assert.deepEqual(menuFiles.sort(), expectedFiles);
  assert.deepEqual(detailFiles.sort(), expectedFiles);
});

test("profile management is replaced by the personal archive experience", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const workspace = await read("../app/cloud/cloud-workspace.tsx");
  const discovery = await read("../app/features/discovery-hub.tsx");
  assert.match(renderer, /function MyProfileView/);
  assert.doesNotMatch(renderer, /Modo invitado/);
  assert.doesNotMatch(renderer, /Crear perfil/);
  assert.doesNotMatch(workspace, /id: "profiles"/);
  for (const feature of ["Eras", "Viajes", "Cartas", "Pósteres", "Sala 3D", "Logros"])
    assert.match(discovery, new RegExp(feature));
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

test("browser navigation serializes views, titles and social profiles", async () => {
  const source = await read("../app/features/navigation/url-state.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const navigation = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );

  const state = navigation.readNavigationState(
    "?view=map&title=iron-man&profile=marco&compare=marco",
  );
  assert.deepEqual(state, {
    view: "map",
    titleId: "iron-man",
    friendHandle: "marco",
    compareHandle: "marco",
  });
  assert.equal(
    navigation.navigationSearch(state),
    "?view=map&title=iron-man&profile=marco&compare=marco",
  );
  assert.equal(navigation.readNavigationState("?view=unknown").view, "dashboard");

  const renderer = await read("../desktop/renderer.tsx");
  const navigationHook = await read("../app/features/navigation/nexus-navigation.ts");
  const legalStyles = await read("../app/legal/legal.css");
  assert.match(renderer, /key=\{selected\.id\}/);
  assert.match(renderer, /closeTopLayer/);
  assert.match(navigationHook, /historyWriteMode/);
  assert.match(navigationHook, /currentTitleId && nextTitleId/);
  assert.match(legalStyles, /\.legal-page\s*\{[^}]*height:\s*100dvh/s);
  assert.match(legalStyles, /\.legal-page\s*\{[^}]*overflow-y:\s*auto/s);
});

test("the social graph uses explicit friendships and privacy-aware DTO functions", async () => {
  const sql = await read("../supabase/migrations/202608080004_social_graph.sql");
  const service = await read("../app/cloud/social-service.ts");

  for (const table of [
    "social_settings",
    "friend_requests",
    "friendships",
    "profile_blocks",
    "moderation_reports",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`, "i"));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }

  for (const operation of [
    "search_social_profiles",
    "send_friend_request",
    "respond_friend_request",
    "block_social_profile",
    "get_social_profile",
    "compare_friend_progress",
  ]) {
    assert.match(sql, new RegExp(`function public\\.${operation}`, "i"));
    assert.match(service, new RegExp(operation));
  }

  assert.match(sql, /event\.payload - 'note' - 'email' - 'deviceId'/);
  assert.match(sql, /profiles_are_blocked/);
  assert.match(sql, /revoke all on function public\.send_friend_request.*from public, anon/i);
  assert.doesNotMatch(service, /private_note|profile_snapshots|devices/);
});

test("the friends workspace is modular, navigable and privacy aware", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const view = await read("../app/features/friends/friends-view.tsx");
  const styles = await read("../app/features/friends/friends.css");

  assert.match(renderer, /<FriendsView/);
  assert.match(renderer, /social-nav-badge/);
  for (const section of ["Amigos", "Solicitudes", "Buscar", "Privacidad"])
    assert.match(view, new RegExp(section));
  assert.match(view, /spoilerSafe/);
  assert.match(view, /Comparar avance/);
  assert.match(styles, /\.friend-card-grid/);
  assert.match(styles, /\.comparison-lists/);
});

test("core models and local persistence are isolated from the renderer", async () => {
  const renderer = await read("../desktop/renderer.tsx");
  const models = await read("../app/core/models.ts");
  const localState = await read("../app/core/local-state.ts");

  assert.match(renderer, /from "\.\.\/app\/core\/models"/);
  assert.match(renderer, /from "\.\.\/app\/core\/local-state"/);
  assert.doesNotMatch(renderer, /function useStoredProgress/);
  assert.match(models, /export type SharedMarathon/);
  assert.match(localState, /export function useStoredProgress/);
  assert.match(localState, /nexus:snapshot-applied/);
});

test("guest entry creates an isolated variant and restores account data before login", async () => {
  const guest = await read("../app/cloud/guest-session.ts");
  const gate = await read("../app/cloud/auth-gate.tsx");
  const workspace = await read("../app/cloud/cloud-workspace.tsx");
  const renderer = await read("../desktop/renderer.tsx");

  assert.match(guest, /export function startFreshGuestSession/);
  assert.match(guest, /PROFILE_VALUE_KEYS/);
  assert.match(guest, /ACCOUNT_VALUE_KEYS/);
  assert.match(guest, /name: `Variante \$\{variantNumber\}`/);
  assert.match(guest, /crypto\.getRandomValues/);
  assert.match(guest, /export function endGuestSession/);
  assert.match(gate, /startFreshGuestSession\(\)/);
  assert.match(gate, /endGuestSession\(\);[\s\S]*upsertLocalProfiles/);
  assert.match(workspace, /endGuestSession\(\);[\s\S]*window\.location\.reload\(\)/);
  assert.match(renderer, /guest=\{Boolean\(guestSession\)\}/);
  assert.match(renderer, /Crear mi cuenta Nexus/);
  assert.doesNotMatch(renderer, /name: "Marco"/);

  const storageSource = await read("../app/cloud/storage-keys.ts");
  const storageJavascript = ts.transpileModule(storageSource, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const storageUrl = `data:text/javascript;base64,${Buffer.from(storageJavascript).toString("base64")}`;
  const guestJavascript = ts
    .transpileModule(guest, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replace('"./storage-keys"', JSON.stringify(storageUrl));

  class MemoryStorage {
    values = new Map();
    get length() {
      return this.values.size;
    }
    getItem(key) {
      return this.values.get(key) ?? null;
    }
    setItem(key, value) {
      this.values.set(key, String(value));
    }
    removeItem(key) {
      this.values.delete(key);
    }
    key(index) {
      return [...this.values.keys()][index] ?? null;
    }
  }

  const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  const memory = new MemoryStorage();
  let replacedPath = "";
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: memory });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: { replaceState: (_state, _title, path) => (replacedPath = path) },
      location: { pathname: "/" },
      dispatchEvent: () => true,
    },
  });

  try {
    memory.setItem("nexus-desktop-watched-v1", '["iron-man"]');
    memory.setItem("nexus-desktop-custom-marathons-v1", '[{"id":"mcu"}]');
    memory.setItem("nexus-desktop-profiles-v1", '[{"id":"principal","name":"Cuenta real"}]');
    const guestModule = await import(
      `data:text/javascript;base64,${Buffer.from(guestJavascript).toString("base64")}`
    );
    const session = guestModule.startFreshGuestSession();
    assert.match(session.profile.name, /^Variante \d{4}$/);
    assert.equal(session.profile.guest, true);
    assert.equal(memory.getItem("nexus-desktop-watched-v1"), null);
    assert.equal(memory.getItem("nexus-desktop-custom-marathons-v1"), null);
    assert.match(memory.getItem("nexus-desktop-profiles-v1"), /Cuenta real/);
    assert.equal(replacedPath, "/");

    memory.setItem("nexus-desktop-watched-v1", '["thor"]');
    guestModule.endGuestSession();
    assert.equal(memory.getItem("nexus-desktop-watched-v1"), '["iron-man"]');
    assert.equal(memory.getItem("nexus-desktop-custom-marathons-v1"), '[{"id":"mcu"}]');
    assert.equal(guestModule.getGuestSession(), null);
  } finally {
    if (localStorageDescriptor)
      Object.defineProperty(globalThis, "localStorage", localStorageDescriptor);
    else delete globalThis.localStorage;
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
    else delete globalThis.window;
  }
});
