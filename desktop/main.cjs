const { app, BrowserWindow, dialog, ipcMain, Menu, net, protocol, safeStorage, shell, session } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { DatabaseSync } = require("node:sqlite");

protocol.registerSchemesAsPrivileged([
  { scheme: "nexus", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const rendererRoot = path.join(__dirname, "..", "desktop-dist", "renderer");
let cloudDatabase;

function getCloudDatabase() {
  if (cloudDatabase) return cloudDatabase;
  cloudDatabase = new DatabaseSync(path.join(app.getPath("userData"), "nexus-local.sqlite"));
  cloudDatabase.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS snapshots (
      profile_id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mutations (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_mutations_created_at ON mutations(created_at);
    CREATE TABLE IF NOT EXISTS secure_tokens (
      key TEXT PRIMARY KEY,
      encrypted_value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  cloudDatabase.exec("PRAGMA optimize;");
  return cloudDatabase;
}

function validStorageKey(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 240;
}

function validJsonPayload(value, maxBytes = 8 * 1024 * 1024) {
  try { return Buffer.byteLength(JSON.stringify(value), "utf8") <= maxBytes; } catch { return false; }
}

function validProgress(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.watched) || typeof value.episodes !== "object") return false;
  return value.watched.every((id) => typeof id === "string") && Object.values(value.episodes).every((episodes) => Array.isArray(episodes) && episodes.every(Number.isInteger));
}

function validMarathon(value) {
  return Boolean(value && value.version === 1 && typeof value.id === "string" && typeof value.name === "string" && Array.isArray(value.tasks) && value.tasks.length > 0 && value.tasks.every((task) => task && typeof task.itemId === "string" && (task.episode === undefined || Number.isInteger(task.episode))));
}

function createWindow() {
  const smokeScreenshot = process.env.NEXUS_SMOKE_SCREENSHOT;
  const smokeTargetZoom = Number(process.env.NEXUS_SMOKE_TARGET_ZOOM || 48);
  const window = new BrowserWindow({
    width: 1520,
    height: 940,
    minWidth: 1080,
    minHeight: 680,
    show: false,
    backgroundColor: "#08090c",
    title: "Nexus · Mapa del Multiverso",
    icon: path.join(__dirname, "assets", "nexus.ico"),
    titleBarStyle: "hidden",
    titleBarOverlay: { color: "#08090c", symbolColor: "#d9dce4", height: 46 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  window.once("ready-to-show", () => { if (!smokeScreenshot) window.show(); });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("nexus://app/")) event.preventDefault();
  });
  window.loadURL("nexus://app/index.html");

  if (smokeScreenshot) {
    window.webContents.once("did-finish-load", async () => {
      try {
      await window.webContents.insertCSS("*,*::before,*::after{transition:none!important;animation:none!important}");
      await new Promise((resolve) => setTimeout(resolve, 700));
      const initialHasDetails = await window.webContents.executeJavaScript(`Boolean(document.querySelector('.detail-panel'))`);
      const overviewImage = await window.webContents.capturePage();
      await fs.writeFile(smokeScreenshot.replace(/\.png$/i, "-overview.png"), overviewImage.toPNG());
      await window.webContents.executeJavaScript(`[...document.querySelectorAll('.app-nav button')].find(button => button.textContent.includes('Mapa'))?.click()`);
      await new Promise((resolve) => setTimeout(resolve, 250));
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const currentZoom = await window.webContents.executeJavaScript(`parseInt(document.querySelector('.zoom-tools span')?.textContent || '0', 10)`);
        if (currentZoom >= smokeTargetZoom) break;
        await window.webContents.executeJavaScript(`document.querySelectorAll('.zoom-tools button')[1]?.click()`);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      await window.webContents.executeJavaScript(`(() => {
        const viewport = document.querySelector('.map-viewport');
        const target = document.querySelector('[title^="Spider-Man: No Way Home"]');
        if (viewport && target) viewport.scrollTo({ left: target.offsetLeft - viewport.clientWidth * .57, top: 720 });
      })()`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const collisionPairs = await window.webContents.executeJavaScript(`(() => {
        const entries = [...document.querySelectorAll('.station')].map(station => {
          const card = station.querySelector('.station-card');
          const stationStyle = getComputedStyle(station);
          return {
            track: station.dataset.track,
            title: station.title,
            className: station.className,
            offset: stationStyle.getPropertyValue('--card-offset').trim(),
            shift: stationStyle.getPropertyValue('--label-shift').trim(),
            rect: card?.getBoundingClientRect(),
            transform: card ? getComputedStyle(card).transform : '',
            visible: card ? getComputedStyle(card).display !== 'none' : false
          };
        }).filter(entry => entry.visible && entry.rect);
        const collisions = [];
        for (let a = 0; a < entries.length; a += 1) for (let b = a + 1; b < entries.length; b += 1) {
          const one = entries[a], two = entries[b];
          if (one.track !== two.track) continue;
          const overlapX = Math.min(one.rect.right, two.rect.right) - Math.max(one.rect.left, two.rect.left);
          const overlapY = Math.min(one.rect.bottom, two.rect.bottom) - Math.max(one.rect.top, two.rect.top);
          if (overlapX > 2 && overlapY > 2) collisions.push({ one, two, overlapX, overlapY });
        }
        return collisions;
      })()`);
      const densityImage = await window.webContents.capturePage();
      await fs.writeFile(smokeScreenshot.replace(/\.png$/i, "-density.png"), densityImage.toPNG());
      await window.webContents.executeJavaScript(`document.querySelector('[title^="Loki · T1"]')?.click()`);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const episodeButtons = await window.webContents.executeJavaScript(`document.querySelectorAll('.episode-grid button').length`);
      await window.webContents.executeJavaScript(`document.querySelector('[title^="Spider-Man: No Way Home"]')?.click()`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const checks = await window.webContents.executeJavaScript(`(() => ({
        title: document.title,
        stations: document.querySelectorAll('.station').length,
        tracks: document.querySelectorAll('.track-core').length,
        hasMap: Boolean(document.querySelector('.map-viewport')),
        hasDetails: Boolean(document.querySelector('.detail-panel')),
        initialHasDetails: ${initialHasDetails},
        episodeButtons: ${episodeButtons},
        collisionPairs: ${JSON.stringify(collisionPairs)},
        hasSearch: Boolean(document.querySelector('#map-search')),
        viewport: { innerWidth, innerHeight, devicePixelRatio },
        detailRect: (() => { const r = document.querySelector('.detail-panel')?.getBoundingClientRect(); return r ? { left:r.left, right:r.right, width:r.width } : null })(),
        visibleText: document.body.innerText.slice(0, 800)
      }))()`);
      const image = await window.webContents.capturePage();
      await fs.writeFile(smokeScreenshot, image.toPNG());
      console.log(`NEXUS_SMOKE ${JSON.stringify(checks)}`);
      process.exitCode = checks.stations === 152 && checks.tracks === 14 && checks.hasMap && checks.hasDetails && !checks.initialHasDetails && checks.episodeButtons === 6 && checks.hasSearch && checks.collisionPairs.length === 0 ? 0 : 1;
      app.quit();
      } catch (error) {
        console.error("NEXUS_SMOKE_ERROR", error);
        process.exitCode = 1;
        app.quit();
      }
    });
  }
}

app.whenReady().then(() => {
  protocol.handle("nexus", (request) => {
    const url = new URL(request.url);
    const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const normalized = path.normalize(requested).replace(/^([/\\])+/, "");
    const target = path.resolve(rendererRoot, normalized);
    if (!target.startsWith(path.resolve(rendererRoot))) return new Response("Not found", { status: 404 });
    return net.fetch(pathToFileURL(target).toString());
  });
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  Menu.setApplicationMenu(null);
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("progress:export", async (_event, payload) => {
  if (!validProgress(payload)) return { ok: false, error: "Datos de progreso inválidos." };
  const result = await dialog.showSaveDialog({
    title: "Exportar progreso de Nexus",
    defaultPath: `nexus-progreso-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: "Archivo Nexus", extensions: ["json"] }],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  await fs.writeFile(result.filePath, JSON.stringify({ ...payload, exportedAt: new Date().toISOString() }, null, 2), "utf8");
  return { ok: true };
});

ipcMain.handle("progress:import", async () => {
  const result = await dialog.showOpenDialog({
    title: "Importar progreso de Nexus",
    properties: ["openFile"],
    filters: [{ name: "Archivo Nexus", extensions: ["json"] }],
  });
  if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true };
  try {
    const payload = JSON.parse(await fs.readFile(result.filePaths[0], "utf8"));
    if (!validProgress(payload)) return { ok: false, error: "El archivo no contiene un progreso válido." };
    return { ok: true, payload };
  } catch {
    return { ok: false, error: "No se pudo leer el archivo seleccionado." };
  }
});

ipcMain.handle("marathon:export", async (_event, payload) => {
  if (!validMarathon(payload)) return { ok:false, error:"El maratón no contiene títulos válidos." };
  const safeName = payload.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "maraton";
  const result = await dialog.showSaveDialog({ title:"Compartir maratón de Nexus", defaultPath:`${safeName}.nexus-marathon`, filters:[{ name:"Maratón de Nexus", extensions:["nexus-marathon"] }] });
  if (result.canceled || !result.filePath) return { ok:false, canceled:true };
  await fs.writeFile(result.filePath, JSON.stringify(payload, null, 2), "utf8");
  return { ok:true, filePath:result.filePath };
});

ipcMain.handle("marathon:import", async () => {
  const result = await dialog.showOpenDialog({ title:"Importar maratón de un amigo", properties:["openFile"], filters:[{ name:"Maratón de Nexus", extensions:["nexus-marathon","json"] }] });
  if (result.canceled || !result.filePaths[0]) return { ok:false, canceled:true };
  try {
    const payload = JSON.parse(await fs.readFile(result.filePaths[0], "utf8"));
    if (!validMarathon(payload)) return { ok:false, error:"El archivo no es un maratón de Nexus válido." };
    return { ok:true, payload };
  } catch { return { ok:false, error:"No se pudo leer el maratón seleccionado." }; }
});

ipcMain.handle("auth:get", async (_event, key) => {
  if (!validStorageKey(key)) return null;
  const row = getCloudDatabase().prepare("SELECT encrypted_value FROM secure_tokens WHERE key = ?").get(key);
  if (!row || !safeStorage.isEncryptionAvailable()) return null;
  try { return safeStorage.decryptString(Buffer.from(row.encrypted_value, "base64")); } catch { return null; }
});

ipcMain.handle("auth:set", async (_event, key, value) => {
  if (!validStorageKey(key) || typeof value !== "string" || value.length > 100000) throw new Error("Sesión inválida.");
  if (!safeStorage.isEncryptionAvailable()) throw new Error("El cifrado del sistema no está disponible.");
  const encrypted = safeStorage.encryptString(value).toString("base64");
  getCloudDatabase().prepare("INSERT INTO secure_tokens(key, encrypted_value, updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET encrypted_value=excluded.encrypted_value,updated_at=excluded.updated_at").run(key, encrypted, new Date().toISOString());
});

ipcMain.handle("auth:remove", async (_event, key) => {
  if (!validStorageKey(key)) return;
  getCloudDatabase().prepare("DELETE FROM secure_tokens WHERE key = ?").run(key);
});

ipcMain.handle("cloud:snapshot-save", async (_event, profileId, snapshot) => {
  if (!validStorageKey(profileId) || !snapshot || snapshot.profileId !== profileId || !validJsonPayload(snapshot)) throw new Error("Copia local inválida.");
  getCloudDatabase().prepare("INSERT INTO snapshots(profile_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(profile_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at").run(profileId, JSON.stringify(snapshot), snapshot.updatedAt || new Date().toISOString());
});

ipcMain.handle("cloud:snapshot-load", async (_event, profileId) => {
  if (!validStorageKey(profileId)) return null;
  const row = getCloudDatabase().prepare("SELECT payload FROM snapshots WHERE profile_id = ?").get(profileId);
  try { return row ? JSON.parse(row.payload) : null; } catch { return null; }
});

ipcMain.handle("cloud:mutation-add", async (_event, mutation) => {
  if (!mutation || !validStorageKey(mutation.id) || !validStorageKey(mutation.profileId) || !validJsonPayload(mutation)) throw new Error("Mutación local inválida.");
  getCloudDatabase().prepare("INSERT OR REPLACE INTO mutations(id,profile_id,created_at,payload) VALUES(?,?,?,?)").run(mutation.id, mutation.profileId, mutation.createdAt, JSON.stringify(mutation));
});

ipcMain.handle("cloud:mutation-list", async () => getCloudDatabase().prepare("SELECT payload FROM mutations ORDER BY created_at").all().map((row) => JSON.parse(row.payload)));
ipcMain.handle("cloud:mutation-complete", async (_event, id) => { if (validStorageKey(id)) getCloudDatabase().prepare("DELETE FROM mutations WHERE id = ?").run(id); });
