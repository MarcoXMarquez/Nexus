const { app, BrowserWindow, dialog, ipcMain, Menu, net, protocol, shell, session } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

protocol.registerSchemesAsPrivileged([
  { scheme: "nexus", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const rendererRoot = path.join(__dirname, "..", "desktop-dist", "renderer");

function validProgress(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.watched) || typeof value.episodes !== "object") return false;
  return value.watched.every((id) => typeof id === "string") && Object.values(value.episodes).every((episodes) => Array.isArray(episodes) && episodes.every(Number.isInteger));
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
      process.exitCode = checks.stations === 112 && checks.tracks === 9 && checks.hasMap && checks.hasDetails && !checks.initialHasDetails && checks.episodeButtons === 6 && checks.hasSearch && checks.collisionPairs.length === 0 ? 0 : 1;
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
    return { ok: true, payload: { watched: payload.watched, episodes: payload.episodes } };
  } catch {
    return { ok: false, error: "No se pudo leer el archivo seleccionado." };
  }
});
