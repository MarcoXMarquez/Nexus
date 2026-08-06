import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { EPISODE_COUNTS, MCU_ITEMS, POSTER_BY_WIKI, type MCUItem } from "../app/mcu-data";
import "./styles.css";

type EpisodeState = Record<string, number[]>;
type MapItem = MCUItem & { releaseValue: number; trackId: string; order: number };
type IconName = "search" | "target" | "minus" | "plus" | "fit" | "check" | "film" | "route" | "download" | "upload" | "close" | "chevron";

const WATCHED_KEY = "nexus-desktop-watched-v1";
const EPISODES_KEY = "nexus-desktop-episodes-v1";
const YEAR_START = 1998;
const YEAR_END = 2028;
const YEAR_WIDTH = 190;
const MAP_LEFT = 250;
const MAP_WIDTH = MAP_LEFT + (YEAR_END - YEAR_START) * YEAR_WIDTH + 420;
const MAP_HEIGHT = 930;
const MIN_ZOOM = 0.18;
const MAX_ZOOM = 1.35;

const MONTHS: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
const TYPE_LABEL: Record<MCUItem["type"], string> = { movie: "Película", series: "Serie", animation: "Animación", special: "Especial" };

const TRACKS = [
  { id: "animation", label: "Universos animados", short: "Animación", color: "#25d0dd", y: 80 },
  { id: "xmen", label: "X-Men · Fox", short: "X-Men", color: "#3b88ff", y: 180 },
  { id: "fantastic", label: "Fantastic Four · legado", short: "Fantastic Four", color: "#ffb640", y: 280 },
  { id: "other", label: "Defensores y legado", short: "Otros legados", color: "#ff793f", y: 380 },
  { id: "tobey", label: "Spider-Man · Tobey", short: "Tobey", color: "#f24e86", y: 480 },
  { id: "andrew", label: "Spider-Man · Andrew", short: "Andrew", color: "#9c70ff", y: 580 },
  { id: "sony", label: "Sony Spider-Man Universe", short: "Sony", color: "#c757e7", y: 680 },
  { id: "mcu", label: "Universo Cinematográfico Marvel", short: "UCM películas", color: "#f24545", y: 780 },
  { id: "series", label: "UCM · series y especiales", short: "UCM series", color: "#58cf83", y: 880 },
] as const;

const ERAS = [
  { label: "Legado", year: 1998 },
  { label: "Inicio UCM", year: 2008 },
  { label: "Infinity", year: 2012 },
  { label: "Endgame", year: 2019 },
  { label: "Multiverso", year: 2021 },
  { label: "Ahora", year: 2025 },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    minus: <path d="M5 12h14"/>, plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    fit: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="m3 8 5-5M21 8l-5-5M3 16l5 5M21 16l-5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>, film: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4"/></>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    upload: <><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></>, close: <><path d="m6 6 12 12M18 6 6 18"/></>, chevron: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function releaseOf(item: MCUItem) {
  if (typeof item.release === "number") return item.release;
  const text = item.date.toLowerCase();
  const year = Number(text.match(/(?:19|20)\d{2}/)?.[0] ?? 2027);
  const month = Object.keys(MONTHS).find((key) => text.includes(key));
  return year + (month ? (MONTHS[month] + 0.5) / 12 : 0.5);
}

function trackOf(item: MCUItem) {
  if (item.lane === "spider") return item.id.includes("raimi") ? "tobey" : "andrew";
  if (item.lane) return item.lane;
  if (item.type === "animation") return "animation";
  return item.type === "movie" ? "mcu" : "series";
}

const ITEMS: MapItem[] = MCU_ITEMS.map((item, order) => ({ ...item, order, releaseValue: releaseOf(item), trackId: trackOf(item) })).sort((a, b) => a.releaseValue - b.releaseValue || a.order - b.order);
const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
const xOf = (release: number) => MAP_LEFT + (release - YEAR_START) * YEAR_WIDTH;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function posterFor(item: MCUItem) {
  const source = POSTER_BY_WIKI[item.wiki];
  return source ? `.${source}` : "./icon-512.png";
}

function useStoredProgress() {
  const [watched, setWatched] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]")); } catch { return new Set(); }
  });
  const [episodes, setEpisodes] = useState<EpisodeState>(() => {
    try { return JSON.parse(localStorage.getItem(EPISODES_KEY) || "{}"); } catch { return {}; }
  });
  useEffect(() => localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched])), [watched]);
  useEffect(() => localStorage.setItem(EPISODES_KEY, JSON.stringify(episodes)), [episodes]);
  return { watched, setWatched, episodes, setEpisodes };
}

function App() {
  const { watched, setWatched, episodes, setEpisodes } = useStoredProgress();
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [activeTrack, setActiveTrack] = useState("all");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.46);
  const [mapScroll, setMapScroll] = useState({ left: 0, top: 0, width: 1, height: 1 });
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const toastTimer = useRef<number | null>(null);

  const releasedItems = useMemo(() => ITEMS.filter((item) => !item.upcoming), []);
  const completedCount = releasedItems.filter((item) => watched.has(item.id)).length;
  const percent = Math.round((completedCount / releasedItems.length) * 100);
  const searchResults = useMemo(() => query.trim() ? ITEMS.filter((item) => normalize(item.title).includes(normalize(query))).slice(0, 7) : [], [query]);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const centerItem = useCallback((item: MapItem, open = true) => {
    const viewport = viewportRef.current;
    const track = TRACKS.find((entry) => entry.id === item.trackId);
    if (!viewport || !track) return;
    viewport.scrollTo({ left: xOf(item.releaseValue) * zoom - viewport.clientWidth / 2, top: track.y - viewport.clientHeight / 2, behavior: "smooth" });
    if (open) setSelected(item);
  }, [zoom]);

  const fitMap = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.max(MIN_ZOOM, Math.min(0.42, (viewport.clientWidth - 36) / MAP_WIDTH));
    setZoom(next);
    requestAnimationFrame(() => viewport.scrollTo({ left: 0, top: Math.max(0, MAP_HEIGHT - viewport.clientHeight) / 2, behavior: "smooth" }));
  }, []);

  const changeZoom = useCallback((nextValue: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextValue));
    const rect = viewport.getBoundingClientRect();
    const localX = clientX === undefined ? viewport.clientWidth / 2 : clientX - rect.left;
    const localY = clientY === undefined ? viewport.clientHeight / 2 : clientY - rect.top;
    const worldX = (viewport.scrollLeft + localX) / zoom;
    setZoom(next);
    requestAnimationFrame(() => viewport.scrollTo({ left: worldX * next - localX }));
  }, [zoom]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("#map-search")?.focus();
      } else if (event.key === "+" || event.key === "=") changeZoom(zoom + 0.1);
      else if (event.key === "-") changeZoom(zoom - 0.1);
      else if (event.key.toLowerCase() === "f" && document.activeElement?.tagName !== "INPUT") fitMap();
      else if (event.key === "Escape") { setSelected(null); setQuery(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeZoom, fitMap, zoom]);

  useEffect(() => { const timer = window.setTimeout(fitMap, 80); return () => window.clearTimeout(timer); }, [fitMap]);

  function toggleWatched(item: MapItem) {
    setWatched((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
    const total = EPISODE_COUNTS[item.id] || 0;
    if (total) setEpisodes((current) => ({ ...current, [item.id]: watched.has(item.id) ? [] : Array.from({ length: total }, (_, index) => index + 1) }));
  }

  function toggleEpisode(item: MapItem, episode: number) {
    const total = EPISODE_COUNTS[item.id] || 0;
    setEpisodes((current) => {
      const existing = new Set(current[item.id] || []);
      if (existing.has(episode)) existing.delete(episode); else existing.add(episode);
      const values = [...existing].sort((a, b) => a - b);
      setWatched((seen) => {
        const next = new Set(seen);
        if (values.length === total) next.add(item.id); else next.delete(item.id);
        return next;
      });
      return { ...current, [item.id]: values };
    });
  }

  function jumpToYear(year: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ left: xOf(year) * zoom - 70, behavior: "smooth" });
  }

  function nextPending() {
    const next = releasedItems.find((item) => !watched.has(item.id));
    if (next) { setActiveTrack("all"); centerItem(next); }
    else notify("Has completado todos los títulos publicados.");
  }

  async function exportProgress() {
    if (!window.nexusDesktop) return;
    const result = await window.nexusDesktop.exportProgress({ watched: [...watched], episodes });
    if (result.ok) notify("Progreso exportado correctamente."); else if (result.error) notify(result.error);
  }

  async function importProgress() {
    if (!window.nexusDesktop) return;
    const result = await window.nexusDesktop.importProgress();
    if (result.ok && result.payload) {
      setWatched(new Set(result.payload.watched));
      setEpisodes(result.payload.episodes);
      notify("Progreso importado correctamente.");
    } else if (result.error) notify(result.error);
  }

  const updateMapScroll = () => {
    const viewport = viewportRef.current;
    if (viewport) setMapScroll({ left: viewport.scrollLeft, top: viewport.scrollTop, width: viewport.clientWidth, height: viewport.clientHeight });
  };

  return (
    <main className="desktop-shell">
      <div className="native-titlebar"><div className="titlebar-brand"><span>N</span><strong>NEXUS</strong><small>MAPA DEL MULTIVERSO</small></div></div>
      <aside className="map-sidebar">
        <section className="journey-card">
          <div className="journey-head"><span>Tu recorrido</span><strong>{percent}%</strong></div>
          <div className="progress-bar"><i style={{ width: `${percent}%` }} /></div>
          <small>{completedCount} de {releasedItems.length} títulos publicados</small>
          <button className="next-button" onClick={nextPending}><Icon name="target" />Siguiente pendiente</button>
        </section>

        <div className="sidebar-heading"><span>Líneas del mapa</span><small>Enfoca un universo</small></div>
        <nav className="track-list">
          <button className={activeTrack === "all" ? "active" : ""} onClick={() => setActiveTrack("all")}><span className="all-lines"><i/><i/><i/></span><strong>Todo el multiverso</strong><small>{ITEMS.length}</small></button>
          {TRACKS.map((track) => {
            const items = ITEMS.filter((item) => item.trackId === track.id);
            const done = items.filter((item) => watched.has(item.id)).length;
            return <button key={track.id} className={activeTrack === track.id ? "active" : ""} onClick={() => { setActiveTrack(track.id); const first = items[0]; if (first) centerItem(first, false); }}><span className="track-swatch" style={{ "--track": track.color } as React.CSSProperties}/><strong>{track.short}</strong><small>{done}/{items.length}</small></button>;
          })}
        </nav>

        <div className="sidebar-tools">
          <button onClick={exportProgress}><Icon name="download"/>Exportar progreso</button>
          <button onClick={importProgress}><Icon name="upload"/>Importar progreso</button>
        </div>
        <div className="keyboard-hint"><kbd>Ctrl</kbd><kbd>F</kbd><span>buscar</span><kbd>F</kbd><span>encajar mapa</span></div>
      </aside>

      <section className="map-workspace">
        <header className="map-toolbar">
          <div className="search-wrap">
            <Icon name="search"/>
            <input id="map-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una película o serie…" />
            {query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")}><Icon name="close" size={15}/></button>}
            {searchResults.length > 0 && <div className="search-results">{searchResults.map((item) => <button key={item.id} onClick={() => { setQuery(""); setActiveTrack("all"); centerItem(item); }}><img src={posterFor(item)} alt=""/><span><strong>{item.title}</strong><small>{item.date} · {TRACKS.find((track) => track.id === item.trackId)?.short}</small></span><Icon name="chevron" size={15}/></button>)}</div>}
          </div>
          <div className="era-nav">{ERAS.map((era) => <button key={era.label} onClick={() => jumpToYear(era.year)}>{era.label}</button>)}</div>
          <div className="zoom-tools">
            <button title="Alejar" onClick={() => changeZoom(zoom - .1)}><Icon name="minus"/></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button title="Acercar" onClick={() => changeZoom(zoom + .1)}><Icon name="plus"/></button>
            <button title="Encajar todo (F)" onClick={fitMap}><Icon name="fit"/></button>
          </div>
        </header>

        <div
          ref={viewportRef}
          className={`map-viewport ${dragging ? "is-dragging" : ""} ${zoom < .38 ? "zoom-overview" : zoom < .78 ? "zoom-medium" : "zoom-close"}`}
          onScroll={updateMapScroll}
          onWheel={(event) => { if (event.ctrlKey) { event.preventDefault(); changeZoom(zoom - event.deltaY * .0012, event.clientX, event.clientY); } }}
          onPointerDown={(event) => { if ((event.target as HTMLElement).closest("button")) return; const viewport = viewportRef.current; if (!viewport) return; setDragging(true); dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }; viewport.setPointerCapture(event.pointerId); }}
          onPointerMove={(event) => { if (!dragging) return; const viewport = viewportRef.current; if (viewport) viewport.scrollTo({ left: dragRef.current.left - (event.clientX - dragRef.current.x), top: dragRef.current.top - (event.clientY - dragRef.current.y) }); }}
          onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
        >
          <div className="map-scale" style={{ width: MAP_WIDTH * zoom, height: MAP_HEIGHT }}>
            <div className="map-world" style={{ width: MAP_WIDTH * zoom, height: MAP_HEIGHT }}>
              <div className="map-years">{Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, index) => YEAR_START + index).map((year) => <div key={year} className={year % 5 === 0 || year === YEAR_START ? "major-year" : ""} style={{ left: xOf(year) * zoom }}><span>{year}</span></div>)}</div>
              <MapLines activeTrack={activeTrack} zoom={zoom} />
              {ITEMS.map((item) => {
                const track = TRACKS.find((entry) => entry.id === item.trackId)!;
                const trackItems = ITEMS.filter((entry) => entry.trackId === item.trackId);
                const trackIndex = trackItems.findIndex((entry) => entry.id === item.id);
                const below = trackIndex % 2 === 1;
                const labelOffset = 30 + (Math.floor((trackIndex % 4) / 2) * 28);
                const completed = watched.has(item.id);
                const isKey = ["no-way-home", "deadpool-wolverine", "endgame", "iron-man", "doomsday"].includes(item.id);
                const muted = activeTrack !== "all" && activeTrack !== item.trackId && !(isKey && item.trackId === "mcu");
                const episodeTotal = EPISODE_COUNTS[item.id] || 0;
                const episodeDone = episodes[item.id]?.length || 0;
                return <button key={item.id} className={`station ${below ? "station-below" : ""} ${completed ? "is-complete" : ""} ${selected?.id === item.id ? "is-selected" : ""} ${isKey ? "is-key" : ""} ${muted ? "is-muted" : ""}`} style={{ left: xOf(item.releaseValue) * zoom, top: track.y, "--station": track.color, "--card-offset": `${labelOffset}px` } as React.CSSProperties} onClick={() => setSelected(item)} title={`${item.title} · ${item.date}`}>
                  <span className="station-dot">{completed && <Icon name="check" size={11}/>}</span>
                  <span className="station-card">
                    <img className="station-poster" src={posterFor(item)} alt="" loading="lazy"/>
                    <span className="station-copy"><strong>{item.title}</strong><small>{item.date}</small>{episodeTotal > 0 && <i><b style={{ width: `${(episodeDone / episodeTotal) * 100}%` }}/></i>}</span>
                  </span>
                </button>;
              })}
              <div className="map-help"><Icon name="route"/><span>Arrastra para recorrer · Ctrl + rueda para zoom</span></div>
            </div>
          </div>
        </div>

        <MiniMap zoom={zoom} mapScroll={mapScroll} activeTrack={activeTrack} onNavigate={(ratio) => { const viewport = viewportRef.current; if (viewport) viewport.scrollTo({ left: ratio * MAP_WIDTH * zoom - viewport.clientWidth / 2, behavior: "smooth" }); }} />
      </section>

      {selected && <DetailPanel item={selected} watched={watched.has(selected.id)} episodes={episodes[selected.id] || []} onClose={() => setSelected(null)} onToggleWatched={() => toggleWatched(selected)} onToggleEpisode={(episode) => toggleEpisode(selected, episode)} />}
      {toast && <div className="toast"><Icon name="check"/>{toast}</div>}
    </main>
  );
}

function MapLines({ activeTrack, zoom }: { activeTrack: string; zoom: number }) {
  const noWayHome = ITEM_BY_ID.get("no-way-home")!;
  const deadpoolWolverine = ITEM_BY_ID.get("deadpool-wolverine")!;
  const endgame = ITEM_BY_ID.get("endgame") || ITEMS.find((item) => item.title === "Avengers: Endgame")!;
  const firstSeries = ITEMS.find((item) => item.trackId === "series")!;
  const xmenLast = ITEMS.filter((item) => item.trackId === "xmen" && item.releaseValue < deadpoolWolverine.releaseValue).at(-1)!;
  const pathFor = (trackId: string) => {
    const items = ITEMS.filter((item) => item.trackId === trackId);
    const track = TRACKS.find((entry) => entry.id === trackId)!;
    return { start: xOf(items[0].releaseValue), end: xOf(items.at(-1)!.releaseValue), y: track.y };
  };
  const mcuY = TRACKS.find((track) => track.id === "mcu")!.y;
  const seriesY = TRACKS.find((track) => track.id === "series")!.y;
  return <><svg className="track-svg" width={MAP_WIDTH * zoom} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
    <defs><filter id="lineGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {TRACKS.map((track) => {
      const line = pathFor(track.id);
      const muted = activeTrack !== "all" && activeTrack !== track.id && !(track.id === "mcu");
      return <g key={track.id} className={muted ? "line-muted" : ""}>
        <path className="track-glow" stroke={track.color} d={`M ${line.start} ${line.y} L ${line.end} ${line.y}`}/>
        <path className="track-core" stroke={track.color} d={`M ${line.start} ${line.y} L ${line.end} ${line.y}`}/>
      </g>;
    })}
    <Connection fromId="spiderman-raimi-3" toX={xOf(noWayHome.releaseValue)} toY={mcuY} color="#f24e86" active={activeTrack === "all" || activeTrack === "tobey"}/>
    <Connection fromId="amazing-spiderman-2" toX={xOf(noWayHome.releaseValue)} toY={mcuY} color="#9c70ff" active={activeTrack === "all" || activeTrack === "andrew"}/>
    <Connection fromId="venom-2" toX={xOf(noWayHome.releaseValue)} toY={mcuY} color="#c757e7" active={activeTrack === "all" || activeTrack === "sony"} dashed/>
    <Connection fromId={xmenLast.id} toX={xOf(deadpoolWolverine.releaseValue)} toY={mcuY} color="#3b88ff" active={activeTrack === "all" || activeTrack === "xmen"}/>
    <Connection fromId={ITEMS.filter((item) => item.trackId === "fantastic" && item.releaseValue < deadpoolWolverine.releaseValue).at(-1)?.id || "fantastic-four-2015"} toX={xOf(deadpoolWolverine.releaseValue)} toY={mcuY} color="#ffb640" active={activeTrack === "all" || activeTrack === "fantastic"} dashed/>
    <path className="branch-connector" stroke="#58cf83" d={`M ${xOf(endgame.releaseValue)} ${mcuY} C ${xOf(endgame.releaseValue) + 80} ${mcuY}, ${xOf(firstSeries.releaseValue) - 100} ${seriesY}, ${xOf(firstSeries.releaseValue)} ${seriesY}`}/>
    <g className="legend-key"><circle cx={xOf(noWayHome.releaseValue)} cy={mcuY} r="13"/><circle cx={xOf(deadpoolWolverine.releaseValue)} cy={mcuY} r="13"/></g>
  </svg>{TRACKS.map((track) => {
    const line = pathFor(track.id);
    const muted = activeTrack !== "all" && activeTrack !== track.id && track.id !== "mcu";
    return <span key={track.id} className={`track-name ${muted ? "line-muted" : ""}`} style={{ left: Math.max(18, line.start * zoom - 14), top: track.y - 27, color: track.color }}>{track.label}</span>;
  })}</>;
}

function Connection({ fromId, toX, toY, color, active, dashed = false }: { fromId: string; toX: number; toY: number; color: string; active: boolean; dashed?: boolean }) {
  const from = ITEM_BY_ID.get(fromId);
  if (!from) return null;
  const track = TRACKS.find((entry) => entry.id === from.trackId)!;
  const fromX = xOf(from.releaseValue);
  return <path className={`branch-connector ${active ? "" : "line-muted"} ${dashed ? "is-dashed" : ""}`} stroke={color} d={`M ${fromX} ${track.y} C ${fromX + 160} ${track.y}, ${toX - 220} ${toY}, ${toX} ${toY}`}/>;
}

function MiniMap({ zoom, mapScroll, activeTrack, onNavigate }: { zoom: number; mapScroll: { left: number; top: number; width: number; height: number }; activeTrack: string; onNavigate: (ratio: number) => void }) {
  const left = Math.max(0, Math.min(100, (mapScroll.left / zoom / MAP_WIDTH) * 100));
  const width = Math.min(100, (mapScroll.width / zoom / MAP_WIDTH) * 100);
  return <div className="minimap" onPointerDown={(event) => { const rect = event.currentTarget.getBoundingClientRect(); onNavigate((event.clientX - rect.left) / rect.width); }}>
    <span className="minimap-label">NAVEGADOR</span>
    <div className="minimap-lines">{TRACKS.map((track) => <i key={track.id} style={{ background: track.color, opacity: activeTrack === "all" || activeTrack === track.id ? .9 : .13 }}/>)}</div>
    <div className="minimap-window" style={{ left: `${left}%`, width: `${width}%` }}/>
  </div>;
}

function DetailPanel({ item, watched, episodes, onClose, onToggleWatched, onToggleEpisode }: { item: MapItem; watched: boolean; episodes: number[]; onClose: () => void; onToggleWatched: () => void; onToggleEpisode: (episode: number) => void }) {
  const total = EPISODE_COUNTS[item.id] || 0;
  const track = TRACKS.find((entry) => entry.id === item.trackId)!;
  return <aside className="detail-panel">
    <button className="panel-close" onClick={onClose} aria-label="Cerrar"><Icon name="close"/></button>
    <div className="detail-visual"><img src={posterFor(item)} alt={`Póster de ${item.title}`}/><div className="poster-shade"/></div>
    <div className="detail-body">
      <div className="branch-pill" style={{ "--branch": track.color } as React.CSSProperties}><i/>{track.label}</div>
      <h2>{item.title}</h2>
      <p className="detail-meta">{item.date}<span/> {TYPE_LABEL[item.type]}{item.phase ? <><span/>{item.phase}</> : null}</p>
      {item.saga && <p className="saga-name">{item.saga}</p>}
      {item.upcoming ? <div className="upcoming-note">Próximamente · todavía no cuenta para tu progreso</div> : <button className={`watch-button ${watched ? "is-watched" : ""}`} onClick={onToggleWatched}><Icon name={watched ? "check" : "film"}/>{watched ? "Completada" : total ? "Completar temporada" : "Marcar como vista"}</button>}
      {total > 0 && <section className="episodes-section">
        <div className="episode-heading"><div><span>Progreso de temporada</span><strong>{episodes.length}/{total} capítulos</strong></div><b>{Math.round((episodes.length / total) * 100)}%</b></div>
        <div className="episode-progress"><i style={{ width: `${(episodes.length / total) * 100}%` }}/></div>
        <div className="episode-grid">{Array.from({ length: total }, (_, index) => index + 1).map((episode) => <button key={episode} className={episodes.includes(episode) ? "complete" : ""} onClick={() => onToggleEpisode(episode)}><span>{episodes.includes(episode) ? <Icon name="check" size={14}/> : episode}</span><small>EP {String(episode).padStart(2, "0")}</small></button>)}</div>
      </section>}
      <div className="detail-facts"><div><span>Año</span><strong>{Math.floor(item.releaseValue)}</strong></div><div><span>Universo</span><strong>{track.short}</strong></div><div><span>Estado</span><strong>{item.upcoming ? "Próxima" : watched ? "Vista" : "Pendiente"}</strong></div></div>
    </div>
  </aside>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
