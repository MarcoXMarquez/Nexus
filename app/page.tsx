"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EPISODE_COUNTS, MCU_ITEMS, POSTER_BY_WIKI, type MCUItem } from "./mcu-data";

type View = "home" | "timeline" | "series" | "watched";
type EpisodeState = Record<string, number[]>;

const WATCHED_KEY = "mcu-multiverse-axis-98-v1";
const EPISODES_KEY = "mcu-multiverse-episodes-v1";
const TYPE_LABEL: Record<MCUItem["type"], string> = {
  movie: "Película",
  series: "Serie",
  animation: "Animación",
  special: "Especial",
};
const MONTHS: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};
const LANES = [
  { id: "spider", label: "Spider-Man · Tobey y Andrew", tone: "pink" },
  { id: "sony", label: "Sony · Venom y villanos", tone: "violet" },
  { id: "xmen", label: "X-Men · Fox y Deadpool", tone: "blue" },
  { id: "fantastic", label: "Fantastic Four · clásicos", tone: "amber" },
  { id: "other", label: "Blade, Daredevil y otros", tone: "orange" },
  { id: "mcu", label: "UCM · películas", tone: "red" },
  { id: "series", label: "UCM · series y especiales", tone: "green" },
  { id: "animation", label: "Multiverso animado", tone: "cyan" },
];

function releaseOf(item: MCUItem) {
  if (typeof item.release === "number") return item.release;
  const text = item.date.toLowerCase();
  const year = Number(text.match(/(?:19|20)\d{2}/)?.[0] ?? 2027);
  const month = Object.keys(MONTHS).find((key) => text.includes(key));
  return year + (month ? (MONTHS[month] + 0.5) / 12 : 0.5);
}

function laneOf(item: MCUItem) {
  return item.lane || (item.type === "animation" ? "animation" : item.type === "movie" ? "mcu" : "series");
}

const ALL_ITEMS = MCU_ITEMS.map((item) => ({ ...item, releaseValue: releaseOf(item), laneValue: laneOf(item) }))
  .sort((a, b) => a.releaseValue - b.releaseValue);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [watched, setWatched] = useState<Set<string>>(() => new Set());
  const [episodes, setEpisodes] = useState<EpisodeState>({});
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<(typeof ALL_ITEMS)[number] | null>(null);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("all");
  const [type, setType] = useState("all");
  const [saga, setSaga] = useState("all");
  const [scale, setScale] = useState(1);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedWatched = new Set<string>(JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]"));
      const storedEpisodes = JSON.parse(localStorage.getItem(EPISODES_KEY) || "{}") as EpisodeState;
      Object.entries(EPISODE_COUNTS).forEach(([id, total]) => {
        if (storedWatched.has(id) && !Array.isArray(storedEpisodes[id])) {
          storedEpisodes[id] = Array.from({ length: total }, (_, index) => index + 1);
        }
      });
      setWatched(storedWatched);
      setEpisodes(storedEpisodes);
    } catch {
      setWatched(new Set());
      setEpisodes({});
    }
    setReady(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched]));
  }, [ready, watched]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(EPISODES_KEY, JSON.stringify(episodes));
  }, [ready, episodes]);

  const released = useMemo(() => ALL_ITEMS.filter((item) => !item.upcoming), []);
  const watchedReleased = released.filter((item) => watched.has(item.id));
  const percent = released.length ? Math.round((watchedReleased.length / released.length) * 100) : 0;
  const phases = useMemo(() => [...new Set(ALL_ITEMS.map((item) => item.phase || "Sin fase indicada"))], []);
  const sagas = useMemo(() => [...new Set(ALL_ITEMS.map((item) => item.saga || "Sin saga indicada"))], []);

  const completedFor = (id: string) => new Set(episodes[id] || []).size;
  const filtered = useMemo(() => {
    const text = normalize(query.trim());
    return ALL_ITEMS.filter((item) =>
      (!text || normalize(item.title).includes(text)) &&
      (phase === "all" || (item.phase || "Sin fase indicada") === phase) &&
      (type === "all" || item.type === type) &&
      (saga === "all" || (item.saga || "Sin saga indicada") === saga)
    );
  }, [query, phase, type, saga]);

  const partialSeries = released.filter((item) => {
    const total = EPISODE_COUNTS[item.id];
    const done = completedFor(item.id);
    return total && done > 0 && done < total;
  });
  const nextItem = partialSeries[0] || released.find((item) => !watched.has(item.id)) || released[0];
  const continueItems = [...partialSeries, ...released.filter((item) => !watched.has(item.id) && !partialSeries.some((entry) => entry.id === item.id))].slice(0, 8);

  function toggleWatched(item: (typeof ALL_ITEMS)[number], force?: boolean) {
    if (item.upcoming) return;
    const nextValue = force ?? !watched.has(item.id);
    setWatched((current) => {
      const next = new Set(current);
      nextValue ? next.add(item.id) : next.delete(item.id);
      return next;
    });
    const total = EPISODE_COUNTS[item.id];
    if (total) {
      setEpisodes((current) => ({
        ...current,
        [item.id]: nextValue ? Array.from({ length: total }, (_, index) => index + 1) : [],
      }));
    }
  }

  function toggleEpisode(item: (typeof ALL_ITEMS)[number], episode: number) {
    const total = EPISODE_COUNTS[item.id];
    if (!total) return;
    setEpisodes((current) => {
      const done = new Set(current[item.id] || []);
      done.has(episode) ? done.delete(episode) : done.add(episode);
      const values = [...done].sort((a, b) => a - b);
      setWatched((currentWatched) => {
        const next = new Set(currentWatched);
        values.length === total ? next.add(item.id) : next.delete(item.id);
        return next;
      });
      return { ...current, [item.id]: values };
    });
  }

  function clearFilters() {
    setQuery("");
    setPhase("all");
    setType("all");
    setSaga("all");
  }

  function selectFromSearch(value: string) {
    setQuery(value);
    const exact = ALL_ITEMS.find((item) => normalize(item.title) === normalize(value));
    if (exact) {
      setView("timeline");
      setSelected(exact);
      requestAnimationFrame(() => {
        document.getElementById(`timeline-${exact.id}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      });
    }
  }

  function updateTimelinePosition() {
    const element = timelineRef.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    setTimelinePosition(max > 0 ? Math.round((element.scrollLeft / max) * 100) : 0);
  }

  function setTimelineFromRange(value: number) {
    setTimelinePosition(value);
    const element = timelineRef.current;
    if (element) element.scrollTo({ left: ((element.scrollWidth - element.clientWidth) * value) / 100, behavior: "smooth" });
  }

  const laneLayouts = useMemo(() => {
    const result = new Map<string, { item: (typeof ALL_ITEMS)[number]; row: number }[]>();
    LANES.forEach((lane) => {
      const rowEnds: number[] = [];
      const entries = filtered.filter((item) => item.laneValue === lane.id).map((item) => {
        let row = rowEnds.findIndex((end) => item.releaseValue - end >= 0.84);
        if (row < 0) row = rowEnds.length;
        rowEnds[row] = item.releaseValue;
        return { item, row };
      });
      result.set(lane.id, entries);
    });
    return result;
  }, [filtered]);

  function Poster({ item, className = "" }: { item: (typeof ALL_ITEMS)[number]; className?: string }) {
    const poster = POSTER_BY_WIKI[item.wiki];
    if (!poster) return <div className={`poster-fallback ${className}`}>{item.title.slice(0, 1)}</div>;
    return <img className={className} src={poster} alt={`Póster de ${item.title}`} loading="lazy" decoding="async" />;
  }

  function MediaCard({ item, compact = false }: { item: (typeof ALL_ITEMS)[number]; compact?: boolean }) {
    const total = EPISODE_COUNTS[item.id] || 0;
    const done = completedFor(item.id);
    const isWatched = watched.has(item.id);
    return (
      <article className={`media-card ${compact ? "compact" : ""} ${isWatched ? "is-watched" : ""}`}>
        <button className="poster-button" onClick={() => setSelected(item)} aria-label={`Abrir ${item.title}`}>
          <Poster item={item} className="poster-image" />
          {isWatched && <span className="watched-stamp">✓</span>}
          {item.upcoming && <span className="upcoming-stamp">Próx.</span>}
        </button>
        <div className="card-copy">
          <button className="title-button" onClick={() => setSelected(item)}>{item.title}</button>
          <span className="card-meta">{item.date} · {TYPE_LABEL[item.type]}</span>
          {total > 0 && (
            <>
              <div className="micro-progress"><span style={{ width: `${(done / total) * 100}%` }} /></div>
              <span className="card-meta">{done}/{total} capítulos</span>
            </>
          )}
          {!item.upcoming && (
            <button className={`quick-action ${isWatched ? "active" : ""}`} onClick={() => toggleWatched(item)}>
              {isWatched ? "Vista" : total ? "Completar" : "Marcar vista"}
            </button>
          )}
        </div>
      </article>
    );
  }

  const navItems: { id: View; label: string; short: string }[] = [
    { id: "home", label: "Inicio", short: "Inicio" },
    { id: "timeline", label: "Línea temporal", short: "Timeline" },
    { id: "series", label: "Series", short: "Series" },
    { id: "watched", label: "Completado", short: "Visto" },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("home")} aria-label="Ir al inicio">
          <span className="brand-mark">N</span><span><strong>NEXUS</strong><small>MCU TRACKER</small></span>
        </button>
        <nav className="side-nav" aria-label="Secciones">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
              <span className="nav-dot" />{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-progress">
          <span className="eyebrow">Tu recorrido</span>
          <strong>{percent}%</strong>
          <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
          <small>{watchedReleased.length} de {released.length} títulos</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Universo cinematográfico de Marvel</span>
            <h1>{view === "home" ? "Tu viaje" : navItems.find((item) => item.id === view)?.label}</h1>
          </div>
          <label className="global-search">
            <span className="sr-only">Buscar título</span>
            <input list="mcu-titles" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && selectFromSearch(query)} placeholder="Buscar película o serie…" />
            <datalist id="mcu-titles">{ALL_ITEMS.map((item) => <option key={item.id} value={item.title} />)}</datalist>
          </label>
        </header>

        <div className="content-scroll">
          {view === "home" && (
            <div className="home-view">
              <section className="hero-panel">
                <div className="hero-copy">
                  <span className="eyebrow">Continúa desde donde lo dejaste</span>
                  <h2>{nextItem?.title}</h2>
                  <p>{nextItem ? `${nextItem.date} · ${TYPE_LABEL[nextItem.type]} · ${nextItem.phase || "Sin fase indicada"}` : "Tu recorrido está completo."}</p>
                  {nextItem && <button className="primary-button" onClick={() => setSelected(nextItem)}>Continuar recorrido</button>}
                </div>
                <div className="hero-progress" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}>
                  <div><strong>{percent}%</strong><span>completado</span></div>
                </div>
              </section>

              <section className="stat-strip" aria-label="Resumen">
                <div><span>Pendientes</span><strong>{released.length - watchedReleased.length}</strong></div>
                <div><span>Completados</span><strong>{watchedReleased.length}</strong></div>
                <div><span>Capítulos vistos</span><strong>{Object.values(episodes).reduce((sum, values) => sum + values.length, 0)}</strong></div>
                <div><span>Próximos</span><strong>{ALL_ITEMS.filter((item) => item.upcoming).length}</strong></div>
              </section>

              <section className="section-block">
                <div className="section-heading"><div><span className="eyebrow">Tu cola personal</span><h2>Continuar viendo</h2></div><button onClick={() => setView("timeline")}>Ver timeline →</button></div>
                <div className="poster-rail">{continueItems.map((item) => <MediaCard key={item.id} item={item} compact />)}</div>
              </section>

              <section className="section-block">
                <div className="section-heading"><div><span className="eyebrow">El multiverso en un vistazo</span><h2>Ramas principales</h2></div></div>
                <div className="branch-grid">
                  {LANES.map((lane) => {
                    const laneItems = ALL_ITEMS.filter((item) => item.laneValue === lane.id);
                    const laneWatched = laneItems.filter((item) => watched.has(item.id)).length;
                    return <button key={lane.id} className={`branch-card tone-${lane.tone}`} onClick={() => { setView("timeline"); setType("all"); }}><span>{lane.label}</span><strong>{laneItems.length}</strong><small>{laneWatched} vistos</small></button>;
                  })}
                </div>
              </section>
            </div>
          )}

          {view === "timeline" && (
            <div className="timeline-view">
              <section className="filter-bar">
                <label><span>Fase</span><select value={phase} onChange={(event) => setPhase(event.target.value)}><option value="all">Todas</option>{phases.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">Todos</option>{Object.entries(TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label><span>Saga</span><select value={saga} onChange={(event) => setSaga(event.target.value)}><option value="all">Todas</option>{sagas.map((value) => <option key={value}>{value}</option>)}</select></label>
                <button className="subtle-button" onClick={clearFilters}>Limpiar</button>
                <div className="zoom-control"><button onClick={() => setScale((value) => Math.max(.75, value - .1))}>−</button><span>{Math.round(scale * 100)}%</span><button onClick={() => setScale((value) => Math.min(1.35, value + .1))}>+</button></div>
              </section>
              <div className="timeline-summary"><span>{filtered.length} títulos visibles</span><input aria-label="Posición en la línea temporal" type="range" min="0" max="100" value={timelinePosition} onChange={(event) => setTimelineFromRange(Number(event.target.value))} /></div>
              <div className="desktop-timeline" ref={timelineRef} onScroll={updateTimelinePosition} style={{ "--timeline-scale": scale } as React.CSSProperties}>
                <div className="timeline-canvas">
                  <div className="year-axis">{Array.from({ length: 31 }, (_, index) => 1998 + index).map((year) => <span key={year}>{year}</span>)}</div>
                  {LANES.map((lane) => {
                    const entries = laneLayouts.get(lane.id) || [];
                    const rows = Math.max(1, ...entries.map((entry) => entry.row + 1));
                    return <section key={lane.id} className={`timeline-lane tone-${lane.tone}`} style={{ height: `${72 + rows * 218}px` }}><h3>{lane.label}</h3><div className="lane-line" />{entries.map(({ item, row }) => {
                      const x = ((item.releaseValue - 1998) / 30) * 100;
                      const total = EPISODE_COUNTS[item.id] || 0;
                      const done = completedFor(item.id);
                      return <button id={`timeline-${item.id}`} key={item.id} className={`timeline-node ${watched.has(item.id) ? "is-watched" : ""}`} style={{ left: `${x}%`, top: `${58 + row * 218}px` }} onClick={() => setSelected(item)}><Poster item={item} className="timeline-poster" /><span className="timeline-title">{item.title}</span><small>{item.date}</small>{total > 0 && <span className="node-progress"><i style={{ width: `${(done / total) * 100}%` }} /></span>}</button>;
                    })}</section>;
                  })}
                </div>
              </div>
              <div className="mobile-timeline">
                {filtered.map((item, index) => {
                  const previousYear = index ? Math.floor(filtered[index - 1].releaseValue) : null;
                  const year = Math.floor(item.releaseValue);
                  const total = EPISODE_COUNTS[item.id] || 0;
                  const done = completedFor(item.id);
                  return <div key={item.id}>{year !== previousYear && <h3 className="mobile-year">{year}</h3>}<button className={`mobile-timeline-card tone-${LANES.find((lane) => lane.id === item.laneValue)?.tone || "red"}`} onClick={() => setSelected(item)}><Poster item={item} className="mobile-poster" /><span><strong>{item.title}</strong><small>{item.date} · {TYPE_LABEL[item.type]}</small><small>{item.phase || "Sin fase indicada"}</small>{total > 0 && <span className="mobile-episode-progress">{done}/{total} capítulos</span>}</span></button></div>;
                })}
              </div>
            </div>
          )}

          {view === "series" && (
            <div className="library-view">
              <div className="section-heading"><div><span className="eyebrow">Capítulo por capítulo</span><h2>Tus series</h2></div><span>{ALL_ITEMS.filter((item) => EPISODE_COUNTS[item.id]).length} temporadas</span></div>
              <div className="library-grid">{ALL_ITEMS.filter((item) => EPISODE_COUNTS[item.id]).map((item) => <MediaCard key={item.id} item={item} />)}</div>
            </div>
          )}

          {view === "watched" && (
            <div className="library-view">
              <div className="section-heading"><div><span className="eyebrow">Tu archivo personal</span><h2>Completado</h2></div><span>{watchedReleased.length} títulos</span></div>
              {watchedReleased.length ? <div className="library-grid">{watchedReleased.map((item) => <MediaCard key={item.id} item={item} />)}</div> : <div className="empty-state"><strong>Tu archivo está esperando.</strong><p>Marca una película o completa una temporada para verla aquí.</p><button className="primary-button" onClick={() => setView("timeline")}>Explorar timeline</button></div>}
            </div>
          )}
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Secciones">
        {navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span className="nav-dot" />{item.short}</button>)}
      </nav>

      {selected && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <aside className="detail-drawer" aria-modal="true" role="dialog" aria-labelledby="drawer-title">
            <button className="drawer-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
            <div className="drawer-hero"><Poster item={selected} className="drawer-poster" /><div><span className="eyebrow">{TYPE_LABEL[selected.type]}</span><h2 id="drawer-title">{selected.title}</h2><p>{selected.date} · {selected.phase || "Sin fase indicada"}</p><p>{selected.saga || "Sin saga indicada"}</p></div></div>
            {EPISODE_COUNTS[selected.id] ? (
              <div className="episode-section">
                <div className="episode-heading"><div><span className="eyebrow">Progreso de temporada</span><strong>{completedFor(selected.id)} de {EPISODE_COUNTS[selected.id]} capítulos</strong></div><button onClick={() => toggleWatched(selected, completedFor(selected.id) !== EPISODE_COUNTS[selected.id])}>{completedFor(selected.id) === EPISODE_COUNTS[selected.id] ? "Desmarcar" : "Completar todo"}</button></div>
                <div className="drawer-progress"><span style={{ width: `${(completedFor(selected.id) / EPISODE_COUNTS[selected.id]) * 100}%` }} /></div>
                <div className="episode-list">{Array.from({ length: EPISODE_COUNTS[selected.id] }, (_, index) => index + 1).map((episode) => <label key={episode} className={(episodes[selected.id] || []).includes(episode) ? "checked" : ""}><input type="checkbox" checked={(episodes[selected.id] || []).includes(episode)} onChange={() => toggleEpisode(selected, episode)} /><span>Capítulo {episode}</span><b>✓</b></label>)}</div>
              </div>
            ) : (
              <div className="movie-action"><p>Registra este título en tu recorrido personal.</p><button className="primary-button" disabled={selected.upcoming} onClick={() => toggleWatched(selected)}>{selected.upcoming ? "Próximo estreno" : watched.has(selected.id) ? "Marcar como pendiente" : "Marcar como vista"}</button></div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
