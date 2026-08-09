import { useCallback, useEffect, useMemo, useState } from "react";
import { MCU_ITEMS, POSTER_BY_WIKI, type MCUItem } from "../../mcu-data";
import {
  answerFriendRequest,
  blockSocialProfile,
  cancelFriendRequest,
  loadFriendComparison,
  loadFriendProfile,
  loadSocialHub,
  removeFriend,
  reportSocialProfile,
  resolveSocialContext,
  saveSocialHandle,
  saveSocialSettings,
  searchSocialProfiles,
  sendFriendRequest,
  socialErrorMessage,
  subscribeToSocialChanges,
} from "../../cloud/social-service";
import type {
  FriendComparison,
  FriendProfile,
  FriendRequest,
  FriendSummary,
  SocialContext,
  SocialHubData,
  SocialSearchResult,
  SocialSettings,
} from "../../cloud/social-types";
import "./friends.css";
import { browserDateLocale } from "../../i18n/locale";

type FriendsTab = "overview" | "friends" | "requests" | "search" | "privacy";

type Props = {
  localProfileId: string;
  requestedHandle: string | null;
  compareHandle: string | null;
  watched: Set<string>;
  spoilerSafe: boolean;
  onOpenFriend: (handle: string | null) => void;
  onCompare: (handle: string | null) => void;
  onCloseLayer: () => void;
  onOpenTitle: (titleId: string) => void;
  onOpenMarathons: () => void;
  notify: (message: string) => void;
};

const EMPTY_HUB: SocialHubData = { friends: [], requests: [], activity: [] };
const TITLE_BY_ID = new Map(MCU_ITEMS.map((item) => [item.id, item]));
const TRACK_LABELS: Record<string, string> = {
  mcu: "UCM · Películas",
  series: "UCM · Series",
  defenders: "The Defenders Saga",
  tobey: "Spider-Man de Sam Raimi",
  andrew: "The Amazing Spider-Man",
  sony: "Sony's Spider-Man Universe",
  xmen: "Universo X-Men",
  fantastic: "Fantastic Four",
  animation: "Multiverso animado",
  "animation-xmen": "X-Men animado",
  "animation-spider": "Spider-Man animado",
  "animation-teams": "Equipos animados",
  "animation-films": "Películas animadas",
  other: "Otros universos Marvel",
};

function posterForTitle(item: MCUItem) {
  const source = POSTER_BY_WIKI[item.wiki];
  if (!source?.startsWith("/posters/")) return source || "";
  const fileName = source.split("/").at(-1);
  return fileName ? `/posters/thumb/${fileName}` : source;
}

function percentage(completed: number | null, total: number | null) {
  if (completed === null || total === null || total <= 0) return null;
  return Math.round((completed / total) * 100);
}

function initials(name: string, fallback: string) {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallback
  );
}

function SocialAvatar({
  profile,
  large = false,
}: {
  profile: FriendSummary | FriendProfile | SocialSearchResult | FriendRequest;
  large?: boolean;
}) {
  return (
    <span
      className={`social-avatar ${large ? "large" : ""}`}
      style={{ "--profile-color": profile.color } as React.CSSProperties}
      aria-hidden="true"
    >
      {profile.avatar || initials(profile.name, "N")}
    </span>
  );
}

function EmptySocialState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="social-empty">
      <span aria-hidden="true">✦</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

export function FriendsView(props: Props) {
  const [context, setContext] = useState<SocialContext | null>(null);
  const [hub, setHub] = useState<SocialHubData>(EMPTY_HUB);
  const [tab, setTab] = useState<FriendsTab>("overview");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SocialSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [comparison, setComparison] = useState<FriendComparison | null>(null);
  const [settings, setSettings] = useState<SocialSettings | null>(null);
  const [handleDraft, setHandleDraft] = useState("");

  const incomingRequests = useMemo(
    () => hub.requests.filter((request) => request.direction === "received"),
    [hub.requests],
  );
  const outgoingRequests = useMemo(
    () => hub.requests.filter((request) => request.direction === "sent"),
    [hub.requests],
  );

  const refreshHub = useCallback(async (profileId: string) => {
    const next = await loadSocialHub(profileId);
    setHub(next);
    window.dispatchEvent(
      new CustomEvent("nexus:social-count", {
        detail: next.requests.filter((request) => request.direction === "received").length,
      }),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: () => void = () => undefined;

    async function start() {
      setLoading(true);
      setError("");
      try {
        const nextContext = await resolveSocialContext(props.localProfileId);
        if (cancelled) return;
        setContext(nextContext);
        setSettings(nextContext.settings);
        setHandleDraft(nextContext.identity.handle);
        await refreshHub(nextContext.identity.profileId);
        if (cancelled) return;
        unsubscribe = subscribeToSocialChanges(nextContext.identity.profileId, () => {
          void refreshHub(nextContext.identity.profileId);
        });
      } catch (nextError) {
        if (!cancelled) setError(socialErrorMessage(nextError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [props.localProfileId, refreshHub]);

  useEffect(() => {
    if (!context) return;
    const refreshOnFocus = () => void refreshHub(context.identity.profileId);
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [context, refreshHub]);

  useEffect(() => {
    if (!context || query.trim().length < 3) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const next = await searchSocialProfiles(context.identity.profileId, query.trim());
        if (!cancelled) setResults(next);
      } catch (nextError) {
        if (!cancelled) setError(socialErrorMessage(nextError));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [context, query]);

  useEffect(() => {
    if (!context || !props.requestedHandle) return;

    let cancelled = false;
    void loadFriendProfile(context.identity.profileId, props.requestedHandle)
      .then(async (profile) => {
        if (cancelled) return;
        setFriendProfile(profile);
        if (profile && props.compareHandle) {
          const nextComparison = await loadFriendComparison(
            context.identity.profileId,
            profile.profileId,
          );
          if (!cancelled) setComparison(nextComparison);
        } else {
          setComparison(null);
        }
      })
      .catch((nextError) => {
        if (!cancelled) setError(socialErrorMessage(nextError));
      });

    return () => {
      cancelled = true;
    };
  }, [context, props.compareHandle, props.requestedHandle]);

  const runAction = useCallback(
    async (key: string, action: () => Promise<void>, success: string) => {
      if (!context) return false;
      setBusy(key);
      setError("");
      try {
        await action();
        await refreshHub(context.identity.profileId);
        props.notify(success);
        return true;
      } catch (nextError) {
        const message = socialErrorMessage(nextError);
        setError(message);
        props.notify(message);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [context, props, refreshHub],
  );

  if (loading && !context) {
    return (
      <section className="friends-workspace social-loading" aria-busy="true">
        <div className="social-orbit" aria-hidden="true" />
        <strong>Conectando tu universo social…</strong>
      </section>
    );
  }

  if (!context) {
    return (
      <section className="friends-workspace social-locked">
        <div className="friends-hero compact">
          <span className="friends-kicker">COMUNIDAD NEXUS</span>
          <h1>Explorar juntos cambia la ruta.</h1>
          <p>Inicia sesión para agregar amigos, comparar avances y compartir maratones.</p>
          <button onClick={() => window.dispatchEvent(new Event("nexus:open-cloud"))}>
            Iniciar sesión
          </button>
          {error && <small>{error}</small>}
        </div>
      </section>
    );
  }

  if (props.requestedHandle) {
    const profileLoading =
      !friendProfile ||
      friendProfile.handle !== props.requestedHandle ||
      Boolean(props.compareHandle && !comparison);
    return (
      <FriendProfilePanel
        viewer={context}
        profile={friendProfile}
        comparison={comparison}
        loading={profileLoading}
        busy={busy}
        error={error}
        watched={props.watched}
        spoilerSafe={props.spoilerSafe}
        onBack={props.onCloseLayer}
        onCompare={() => props.onCompare(friendProfile?.handle || null)}
        onOpenTitle={props.onOpenTitle}
        onOpenMarathons={props.onOpenMarathons}
        onSend={() =>
          friendProfile &&
          runAction(
            `send-${friendProfile.profileId}`,
            () => sendFriendRequest(context.identity.profileId, friendProfile.profileId),
            "Solicitud enviada",
          )
        }
        onRemove={() =>
          friendProfile &&
          runAction(
            `remove-${friendProfile.profileId}`,
            () => removeFriend(context.identity.profileId, friendProfile.profileId),
            "Amistad eliminada",
          ).then((succeeded) => succeeded && props.onOpenFriend(null))
        }
        onBlock={() =>
          friendProfile &&
          runAction(
            `block-${friendProfile.profileId}`,
            () => blockSocialProfile(context.identity.profileId, friendProfile.profileId),
            "Perfil bloqueado",
          ).then((succeeded) => succeeded && props.onOpenFriend(null))
        }
        onReport={(reason) =>
          friendProfile &&
          runAction(
            `report-${friendProfile.profileId}`,
            () => reportSocialProfile(context.identity.profileId, friendProfile.profileId, reason),
            "Reporte enviado y perfil bloqueado",
          ).then((succeeded) => succeeded && props.onOpenFriend(null))
        }
      />
    );
  }

  return (
    <section className="friends-workspace">
      <header className="friends-hero">
        <div>
          <span className="friends-kicker">COMUNIDAD NEXUS</span>
          <h1>Tu equipo a través del multiverso.</h1>
          <p>
            Encuentra a tus amigos, compara rutas y descubre qué historia pueden continuar juntos.
          </p>
        </div>
        <div className="social-identity-card">
          <span
            className="social-avatar large"
            style={{ "--profile-color": context.identity.color } as React.CSSProperties}
          >
            {context.identity.avatar}
          </span>
          <span>
            <small>Tu identidad Nexus</small>
            <strong>{context.identity.name}</strong>
            <code>@{context.identity.handle}</code>
          </span>
        </div>
      </header>

      <nav className="friends-tabs" aria-label="Secciones de Amigos">
        {(
          [
            ["overview", "Resumen"],
            ["friends", `Amigos · ${hub.friends.length}`],
            ["requests", `Solicitudes · ${incomingRequests.length}`],
            ["search", "Buscar"],
            ["privacy", "Privacidad"],
          ] as Array<[FriendsTab, string]>
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="social-error" role="alert">
          <strong>No se pudo completar la acción</strong>
          <span>{error}</span>
          <button onClick={() => setError("")}>Cerrar</button>
        </div>
      )}

      {tab === "overview" && (
        <FriendsOverview
          hub={hub}
          incoming={incomingRequests}
          onOpenFriend={props.onOpenFriend}
          onRequests={() => setTab("requests")}
          onSearch={() => setTab("search")}
          onCompare={props.onCompare}
        />
      )}

      {tab === "friends" && (
        <FriendsGrid
          friends={hub.friends}
          onOpen={props.onOpenFriend}
          onCompare={props.onCompare}
          onSearch={() => setTab("search")}
        />
      )}

      {tab === "requests" && (
        <RequestsPanel
          incoming={incomingRequests}
          outgoing={outgoingRequests}
          busy={busy}
          onOpen={props.onOpenFriend}
          onAnswer={(request, accept) =>
            runAction(
              `${accept ? "accept" : "reject"}-${request.requestId}`,
              () => answerFriendRequest(context.identity.profileId, request.requestId, accept),
              accept ? "Ahora son amigos" : "Solicitud rechazada",
            )
          }
          onCancel={(request) =>
            runAction(
              `cancel-${request.requestId}`,
              () => cancelFriendRequest(context.identity.profileId, request.requestId),
              "Solicitud cancelada",
            )
          }
        />
      )}

      {tab === "search" && (
        <SearchPanel
          query={query}
          results={results}
          searching={searching}
          busy={busy}
          onQuery={(value) => {
            setQuery(value);
            setSearching(value.trim().length >= 3);
            if (value.trim().length < 3) {
              setResults([]);
              setSearching(false);
            }
          }}
          onOpen={props.onOpenFriend}
          onSend={(result) =>
            runAction(
              `send-${result.profileId}`,
              () => sendFriendRequest(context.identity.profileId, result.profileId),
              "Solicitud enviada",
            )
          }
        />
      )}

      {tab === "privacy" && settings && (
        <PrivacyPanel
          identity={context}
          value={settings}
          handle={handleDraft}
          busy={busy}
          onHandle={setHandleDraft}
          onChange={setSettings}
          onSaveHandle={() =>
            runAction(
              "handle",
              async () => {
                const handle = await saveSocialHandle(context.identity.profileId, handleDraft);
                setContext((current) =>
                  current ? { ...current, identity: { ...current.identity, handle } } : current,
                );
                setHandleDraft(handle);
              },
              "Identificador actualizado",
            )
          }
          onSaveSettings={() =>
            runAction(
              "settings",
              async () => setSettings(await saveSocialSettings(settings)),
              "Privacidad actualizada",
            )
          }
        />
      )}
    </section>
  );
}

function FriendsOverview({
  hub,
  incoming,
  onOpenFriend,
  onRequests,
  onSearch,
  onCompare,
}: {
  hub: SocialHubData;
  incoming: FriendRequest[];
  onOpenFriend: (handle: string) => void;
  onRequests: () => void;
  onSearch: () => void;
  onCompare: (handle: string) => void;
}) {
  const mostAdvanced = [...hub.friends]
    .filter((friend) => friend.completedTitles !== null)
    .sort(
      (left, right) =>
        (percentage(right.completedTitles, right.totalTitles) || 0) -
        (percentage(left.completedTitles, left.totalTitles) || 0),
    )[0];

  return (
    <div className="friends-overview-grid">
      <article className="social-feature-card requests">
        <small>SOLICITUDES</small>
        <strong>{incoming.length}</strong>
        <h2>
          {incoming.length === 1 ? "Una persona quiere unirse" : "Personas esperando respuesta"}
        </h2>
        <p>Revisa quién puede entrar a tu universo social.</p>
        <button onClick={onRequests}>Revisar solicitudes</button>
      </article>

      <article className="social-feature-card compare">
        <small>COMPARACIÓN RÁPIDA</small>
        {mostAdvanced ? (
          <>
            <SocialAvatar profile={mostAdvanced} />
            <h2>{mostAdvanced.name}</h2>
            <p>
              Tiene {mostAdvanced.completedTitles} títulos completados. Descubre dónde coinciden.
            </p>
            <button onClick={() => onCompare(mostAdvanced.handle)}>Comparar avance</button>
          </>
        ) : (
          <>
            <h2>Tu primera comparación</h2>
            <p>Agrega a alguien para descubrir películas y sagas compartidas.</p>
            <button onClick={onSearch}>Buscar amigos</button>
          </>
        )}
      </article>

      <article className="social-feature-card together">
        <small>RUTA COMPARTIDA</small>
        <strong>{hub.friends.length}</strong>
        <h2>{hub.friends.length === 1 ? "Aliado conectado" : "Aliados conectados"}</h2>
        <p>Invítalos a tus maratones y continúa una línea en equipo.</p>
        <button onClick={onSearch}>Encontrar a alguien</button>
      </article>

      <section className="social-activity-panel">
        <header>
          <span>
            <small>ACTIVIDAD AUTORIZADA</small>
            <h2>Últimos movimientos</h2>
          </span>
          <button onClick={onSearch}>Añadir amigo</button>
        </header>
        {hub.activity.length ? (
          <div className="social-activity-list">
            {hub.activity.slice(0, 8).map((entry, index) => {
              const title = entry.titleId ? TITLE_BY_ID.get(entry.titleId)?.title : null;
              return (
                <button
                  key={`${entry.profileId}-${entry.createdAt}-${index}`}
                  onClick={() => onOpenFriend(entry.handle)}
                >
                  <SocialAvatar
                    profile={{
                      ...entry,
                      completedTitles: null,
                      totalTitles: null,
                      achievementCount: null,
                      friendsSince: "",
                    }}
                  />
                  <span>
                    <strong>{entry.name}</strong>
                    <small>
                      {entry.eventType === "achievement"
                        ? "desbloqueó un logro"
                        : entry.eventType === "marathon_completed"
                          ? "completó un maratón"
                          : `vio ${title || "un título"}`}
                    </small>
                  </span>
                  <time>{new Date(entry.createdAt).toLocaleDateString(browserDateLocale())}</time>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptySocialState
            title="Todavía no hay actividad compartida"
            copy="La actividad aparecerá aquí cuando tus amigos permitan mostrarla."
          />
        )}
      </section>
    </div>
  );
}

function FriendsGrid({
  friends,
  onOpen,
  onCompare,
  onSearch,
}: {
  friends: FriendSummary[];
  onOpen: (handle: string) => void;
  onCompare: (handle: string) => void;
  onSearch: () => void;
}) {
  if (!friends.length)
    return (
      <EmptySocialState
        title="Tu equipo todavía está vacío"
        copy="Busca a alguien por su identificador Nexus para comenzar."
        action={<button onClick={onSearch}>Buscar amigos</button>}
      />
    );

  return (
    <div className="friend-card-grid">
      {friends.map((friend) => {
        const progress = percentage(friend.completedTitles, friend.totalTitles);
        return (
          <article key={friend.profileId} className="friend-card">
            <SocialAvatar profile={friend} large />
            <span className="friend-status">Amigos</span>
            <h2>{friend.name}</h2>
            <code>@{friend.handle}</code>
            {progress === null ? (
              <p className="private-progress">Progreso privado</p>
            ) : (
              <div className="friend-progress">
                <span>
                  <small>Progreso Marvel</small>
                  <strong>{progress}%</strong>
                </span>
                <i>
                  <b style={{ width: `${progress}%` }} />
                </i>
                <small>
                  {friend.completedTitles}/{friend.totalTitles} títulos
                </small>
              </div>
            )}
            <div className="friend-card-actions">
              <button onClick={() => onOpen(friend.handle)}>Ver perfil</button>
              {progress !== null && (
                <button onClick={() => onCompare(friend.handle)}>Comparar</button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RequestsPanel({
  incoming,
  outgoing,
  busy,
  onOpen,
  onAnswer,
  onCancel,
}: {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  busy: string | null;
  onOpen: (handle: string) => void;
  onAnswer: (request: FriendRequest, accept: boolean) => void;
  onCancel: (request: FriendRequest) => void;
}) {
  return (
    <div className="requests-layout">
      <section>
        <header>
          <small>RECIBIDAS</small>
          <strong>{incoming.length}</strong>
        </header>
        {incoming.length ? (
          incoming.map((request) => (
            <article key={request.requestId} className="request-card">
              <button className="request-person" onClick={() => onOpen(request.handle)}>
                <SocialAvatar profile={request} />
                <span>
                  <strong>{request.name}</strong>
                  <code>@{request.handle}</code>
                </span>
              </button>
              <div>
                <button disabled={Boolean(busy)} onClick={() => onAnswer(request, false)}>
                  Rechazar
                </button>
                <button disabled={Boolean(busy)} onClick={() => onAnswer(request, true)}>
                  Aceptar
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptySocialState
            title="Sin solicitudes pendientes"
            copy="Cuando alguien te agregue, aparecerá aquí."
          />
        )}
      </section>
      <section>
        <header>
          <small>ENVIADAS</small>
          <strong>{outgoing.length}</strong>
        </header>
        {outgoing.length ? (
          outgoing.map((request) => (
            <article key={request.requestId} className="request-card">
              <button className="request-person" onClick={() => onOpen(request.handle)}>
                <SocialAvatar profile={request} />
                <span>
                  <strong>{request.name}</strong>
                  <code>@{request.handle}</code>
                </span>
              </button>
              <div>
                <button disabled={Boolean(busy)} onClick={() => onCancel(request)}>
                  Cancelar
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptySocialState
            title="Ninguna solicitud enviada"
            copy="Busca a alguien utilizando su identificador Nexus."
          />
        )}
      </section>
    </div>
  );
}

function SearchPanel({
  query,
  results,
  searching,
  busy,
  onQuery,
  onOpen,
  onSend,
}: {
  query: string;
  results: SocialSearchResult[];
  searching: boolean;
  busy: string | null;
  onQuery: (value: string) => void;
  onOpen: (handle: string) => void;
  onSend: (result: SocialSearchResult) => void;
}) {
  return (
    <section className="social-search-panel">
      <header>
        <small>DIRECTORIO SOCIAL</small>
        <h2>Encuentra a alguien por su identidad Nexus</h2>
        <p>Escribe al menos tres caracteres. Los perfiles ocultos nunca aparecen.</p>
      </header>
      <label className="social-search-box">
        <span aria-hidden="true">⌕</span>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="@identificador o nombre"
        />
        {searching && <i aria-label="Buscando" />}
      </label>
      {query.trim().length < 3 ? (
        <EmptySocialState title="Busca por identificador" copy="Por ejemplo: @variante-616" />
      ) : results.length ? (
        <div className="social-search-results">
          {results.map((result) => (
            <article key={result.profileId}>
              <button onClick={() => onOpen(result.handle)}>
                <SocialAvatar profile={result} />
                <span>
                  <strong>{result.name}</strong>
                  <code>@{result.handle}</code>
                </span>
              </button>
              {result.relationship === "none" && (
                <button disabled={Boolean(busy)} onClick={() => onSend(result)}>
                  Agregar
                </button>
              )}
              {result.relationship === "sent" && <span>Solicitud enviada</span>}
              {result.relationship === "received" && (
                <button onClick={() => onOpen(result.handle)}>Responder</button>
              )}
              {result.relationship === "friends" && <span>Amigos</span>}
            </article>
          ))}
        </div>
      ) : !searching ? (
        <EmptySocialState
          title="No encontramos coincidencias"
          copy="Comprueba el identificador o pide a esa persona que habilite las búsquedas."
        />
      ) : null}
    </section>
  );
}

function PrivacyPanel({
  identity,
  value,
  handle,
  busy,
  onHandle,
  onChange,
  onSaveHandle,
  onSaveSettings,
}: {
  identity: SocialContext;
  value: SocialSettings;
  handle: string;
  busy: string | null;
  onHandle: (value: string) => void;
  onChange: (value: SocialSettings) => void;
  onSaveHandle: () => void;
  onSaveSettings: () => void;
}) {
  const set = <K extends keyof SocialSettings>(key: K, next: SocialSettings[K]) =>
    onChange({ ...value, [key]: next });
  const visibilityOptions = ["private", "friends", "public"] as const;

  return (
    <div className="social-privacy-layout">
      <section className="social-settings-card identity-settings">
        <small>IDENTIDAD PÚBLICA</small>
        <h2>Cómo pueden encontrarte</h2>
        <label>
          <span>Identificador Nexus</span>
          <div>
            <i>@</i>
            <input
              value={handle}
              maxLength={24}
              onChange={(event) =>
                onHandle(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
            />
          </div>
        </label>
        <p>Entre 3 y 24 caracteres. No se muestra tu correo.</p>
        <button
          disabled={Boolean(busy) || handle === identity.identity.handle}
          onClick={onSaveHandle}
        >
          Guardar identificador
        </button>
        <label>
          <span>Aparecer en búsquedas</span>
          <select
            value={value.discoverability}
            onChange={(event) =>
              set("discoverability", event.target.value as SocialSettings["discoverability"])
            }
          >
            <option value="hidden">Oculto</option>
            <option value="exact">Solo identificador exacto</option>
            <option value="searchable">Nombre e identificador</option>
          </select>
        </label>
        <button
          className={`privacy-toggle ${value.allowFriendRequests ? "active" : ""}`}
          onClick={() => set("allowFriendRequests", !value.allowFriendRequests)}
        >
          <span>
            <strong>Aceptar solicitudes</strong>
            <small>Permitir que otros perfiles te agreguen</small>
          </span>
          <i />
        </button>
      </section>
      <section className="social-settings-card visibility-settings">
        <small>DATOS COMPARTIDOS</small>
        <h2>Tú decides qué pueden ver</h2>
        {(
          [
            ["progressVisibility", "Progreso", "Películas, series y avance por líneas"],
            ["achievementsVisibility", "Logros", "Insignias y fecha de obtención"],
            ["activityVisibility", "Actividad", "Títulos vistos y logros recientes"],
            ["marathonsVisibility", "Maratones", "Maratones que decides compartir"],
          ] as const
        ).map(([key, label, copy]) => (
          <label key={key} className="visibility-row">
            <span>
              <strong>{label}</strong>
              <small>{copy}</small>
            </span>
            <select
              value={value[key]}
              onChange={(event) => set(key, event.target.value as SocialSettings[typeof key])}
            >
              {visibilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "private" ? "Solo yo" : option === "friends" ? "Amigos" : "Público"}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div className="privacy-notice">
          <strong>Siempre privados</strong>
          <p>
            Correo, contraseña, notas personales, dispositivos y datos de sincronización nunca se
            comparten.
          </p>
        </div>
        <button disabled={Boolean(busy)} onClick={onSaveSettings}>
          Guardar privacidad
        </button>
      </section>
    </div>
  );
}

function FriendProfilePanel({
  viewer,
  profile,
  comparison,
  loading,
  busy,
  error,
  watched,
  spoilerSafe,
  onBack,
  onCompare,
  onOpenTitle,
  onOpenMarathons,
  onSend,
  onRemove,
  onBlock,
  onReport,
}: {
  viewer: SocialContext;
  profile: FriendProfile | null;
  comparison: FriendComparison | null;
  loading: boolean;
  busy: string | null;
  error: string;
  watched: Set<string>;
  spoilerSafe: boolean;
  onBack: () => void;
  onCompare: () => void;
  onOpenTitle: (titleId: string) => void;
  onOpenMarathons: () => void;
  onSend: () => void;
  onRemove: () => void;
  onBlock: () => void;
  onReport: (reason: string) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  if (loading && !profile)
    return (
      <section className="friends-workspace social-loading">
        <div className="social-orbit" />
        <strong>Cargando perfil…</strong>
      </section>
    );
  if (!profile)
    return (
      <section className="friends-workspace">
        <button className="social-back" onClick={onBack}>
          ← Amigos
        </button>
        <EmptySocialState
          title="Perfil no disponible"
          copy={error || "El perfil puede estar oculto o ya no existir."}
        />
      </section>
    );
  if (comparison)
    return (
      <ComparisonView
        viewer={viewer}
        friend={profile}
        value={comparison}
        watched={watched}
        spoilerSafe={spoilerSafe}
        onBack={onBack}
        onOpenTitle={onOpenTitle}
      />
    );

  const progress = percentage(profile.completedTitles, profile.totalTitles);
  return (
    <section className="friends-workspace friend-profile-workspace">
      <button className="social-back" onClick={onBack}>
        ← Amigos
      </button>
      <header
        className="friend-profile-hero"
        style={{ "--profile-color": profile.color } as React.CSSProperties}
      >
        <SocialAvatar profile={profile} large />
        <div>
          <small>PERFIL NEXUS</small>
          <h1>{profile.name}</h1>
          <code>@{profile.handle}</code>
          {profile.friendsSince && (
            <p>
              Amigos desde {new Date(profile.friendsSince).toLocaleDateString(browserDateLocale())}
            </p>
          )}
        </div>
        <div className="friend-profile-actions">
          {profile.relationship === "none" && (
            <button disabled={Boolean(busy)} onClick={onSend}>
              Agregar amigo
            </button>
          )}
          {profile.relationship === "sent" && <span>Solicitud enviada</span>}
          {profile.relationship === "received" && <span>Solicitud pendiente en tu bandeja</span>}
          {profile.relationship === "friends" && (
            <>
              <button onClick={onCompare} disabled={progress === null}>
                Comparar avance
              </button>
              <button onClick={onOpenMarathons}>Invitar a maratón</button>
            </>
          )}
          <button className="more-button" onClick={() => setMoreOpen((current) => !current)}>
            •••
          </button>
          {moreOpen && (
            <div className="social-more-menu">
              {profile.relationship === "friends" && (
                <button onClick={onRemove}>Eliminar amistad</button>
              )}
              <button onClick={onBlock}>Bloquear perfil</button>
              <button onClick={() => onReport("other")}>Reportar y bloquear</button>
            </div>
          )}
        </div>
      </header>
      <div className="friend-profile-stats">
        <article>
          <small>PROGRESO</small>
          <strong>{progress === null ? "Privado" : `${progress}%`}</strong>
          <p>
            {progress === null
              ? "Esta persona no comparte su progreso."
              : `${profile.completedTitles} de ${profile.totalTitles} títulos`}
          </p>
        </article>
        <article>
          <small>PELÍCULAS</small>
          <strong>{profile.completedMovies ?? "—"}</strong>
          <p>Completadas</p>
        </article>
        <article>
          <small>SERIES</small>
          <strong>{profile.completedSeries ?? "—"}</strong>
          <p>Temporadas completadas</p>
        </article>
        <article>
          <small>LOGROS</small>
          <strong>{profile.achievementCount ?? "—"}</strong>
          <p>Insignias visibles</p>
        </article>
      </div>
      <section className="friend-profile-next">
        <small>ACCIONES COMPARTIDAS</small>
        <h2>Continúen el multiverso juntos</h2>
        <p>
          Compara sus rutas para descubrir coincidencias o abre tus maratones y comparte una
          invitación segura.
        </p>
        <div>
          {profile.relationship === "friends" && (
            <button onClick={onCompare} disabled={progress === null}>
              Ver comparación completa
            </button>
          )}
          <button onClick={onOpenMarathons}>Abrir mis maratones</button>
        </div>
      </section>
    </section>
  );
}

function ComparisonView({
  viewer,
  friend,
  value,
  watched,
  spoilerSafe,
  onBack,
  onOpenTitle,
}: {
  viewer: SocialContext;
  friend: FriendProfile;
  value: FriendComparison;
  watched: Set<string>;
  spoilerSafe: boolean;
  onBack: () => void;
  onOpenTitle: (titleId: string) => void;
}) {
  const visibleName = (id: string) => {
    const item = TITLE_BY_ID.get(id);
    if (!item) return "Título no disponible";
    return spoilerSafe && !watched.has(id) ? "Título protegido" : item.title;
  };
  const viewerPercent = Math.round(
    (value.viewerCompleted.length /
      Math.max(1, MCU_ITEMS.filter((item) => !item.upcoming).length)) *
      100,
  );
  const friendPercent = Math.round(
    (value.friendCompleted.length /
      Math.max(1, MCU_ITEMS.filter((item) => !item.upcoming).length)) *
      100,
  );

  return (
    <section className="comparison-workspace">
      <button className="social-back" onClick={onBack}>
        ← Perfil de {friend.name}
      </button>
      <header className="comparison-hero">
        <small>COMPARACIÓN DE UNIVERSOS</small>
        <h1>Dos recorridos. Una próxima historia.</h1>
        <div className="comparison-people">
          <span>
            <i
              className="social-avatar"
              style={{ "--profile-color": viewer.identity.color } as React.CSSProperties}
            >
              {viewer.identity.avatar}
            </i>
            <strong>{viewer.identity.name}</strong>
            <b>{viewerPercent}%</b>
          </span>
          <em>VS</em>
          <span>
            <i
              className="social-avatar"
              style={{ "--profile-color": friend.color } as React.CSSProperties}
            >
              {friend.avatar}
            </i>
            <strong>{friend.name}</strong>
            <b>{friendPercent}%</b>
          </span>
        </div>
      </header>
      <div className="comparison-summary">
        <article>
          <small>EN COMÚN</small>
          <strong>{value.sharedTitleIds.length}</strong>
          <p>Títulos vistos por ambos</p>
        </article>
        <article>
          <small>LOGROS COMPARTIDOS</small>
          <strong>{value.sharedAchievementIds.length}</strong>
          <p>Insignias coincidentes</p>
        </article>
        <article>
          <small>POR DESCUBRIR</small>
          <strong>{value.togetherPendingTitleIds.length}</strong>
          <p>Opciones para continuar</p>
        </article>
      </div>
      <section className="track-comparison">
        <header>
          <small>AVANCE POR LÍNEA</small>
          <h2>Dónde coincide cada recorrido</h2>
        </header>
        {value.trackProgress.map((track) => (
          <article key={track.trackId}>
            <span>
              <strong>{TRACK_LABELS[track.trackId] || track.trackId}</strong>
              <small>{track.total} títulos publicados</small>
            </span>
            <div>
              <i>
                <b
                  style={{
                    width: `${Math.round((track.viewerCompleted / Math.max(1, track.total)) * 100)}%`,
                  }}
                />
              </i>
              <small>Tú · {track.viewerCompleted}</small>
            </div>
            <div className="friend-line">
              <i>
                <b
                  style={{
                    width: `${Math.round((track.friendCompleted / Math.max(1, track.total)) * 100)}%`,
                  }}
                />
              </i>
              <small>
                {friend.name} · {track.friendCompleted}
              </small>
            </div>
          </article>
        ))}
      </section>
      <div className="comparison-lists">
        <ComparisonList
          title="Vieron ambos"
          ids={value.sharedTitleIds}
          visibleName={visibleName}
          onOpen={onOpenTitle}
        />
        <ComparisonList
          title="Solo tú"
          ids={value.onlyViewerTitleIds}
          visibleName={visibleName}
          onOpen={onOpenTitle}
        />
        <ComparisonList
          title={`Solo ${friend.name}`}
          ids={value.onlyFriendTitleIds}
          visibleName={visibleName}
          onOpen={onOpenTitle}
          locked={spoilerSafe}
        />
        <ComparisonList
          title="Pueden ver juntos"
          ids={value.togetherPendingTitleIds}
          visibleName={visibleName}
          onOpen={onOpenTitle}
          locked={spoilerSafe}
        />
      </div>
    </section>
  );
}

function ComparisonList({
  title,
  ids,
  visibleName,
  onOpen,
  locked = false,
}: {
  title: string;
  ids: string[];
  visibleName: (id: string) => string;
  onOpen: (id: string) => void;
  locked?: boolean;
}) {
  return (
    <section className="comparison-list">
      <header>
        <h3>{title}</h3>
        <strong>{ids.length}</strong>
      </header>
      {ids.length ? (
        <div>
          {ids.slice(0, 12).map((id) => {
            const item = TITLE_BY_ID.get(id);
            const protectedTitle = locked && visibleName(id) === "Título protegido";
            const poster = item ? posterForTitle(item) : "";
            return (
              <button
                key={id}
                onClick={() => !protectedTitle && onOpen(id)}
                disabled={protectedTitle}
              >
                {poster && !protectedTitle ? (
                  <img src={poster} alt="" loading="lazy" />
                ) : (
                  <span aria-hidden="true">?</span>
                )}
                <strong>{visibleName(id)}</strong>
                <small>{protectedTitle ? "Oculto por protección de spoilers" : item?.date}</small>
              </button>
            );
          })}
        </div>
      ) : (
        <p>Sin títulos en esta sección.</p>
      )}
    </section>
  );
}
