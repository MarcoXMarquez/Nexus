"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { MCU_ITEMS, POSTER_BY_WIKI } from "../mcu-data";
import {
  acceptInvitation,
  createCloudProfile,
  createInvitation,
  deleteCloudProfile,
  listDevices,
  listMarathons,
  registerDevice,
  requestAccountDeletion,
  revokeDevice,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  syncLocalMarathons,
  syncProfile,
  syncStructuredProfile,
  updateCloudProfile,
  uploadMarathon,
  upsertLocalProfiles,
} from "./cloud-service";
import { captureSnapshot, getDeviceId, saveLocalSnapshot } from "./local-repository";
import { LAST_SYNC_KEY, NEXUS_KEYS, PENDING_INVITE_KEY } from "./storage-keys";
import { cloudConfigured, getSupabase } from "./supabase";
import type { CloudMarathon, CloudProfile, DeviceRecord, LocalMarathon, LocalProfile, SyncState } from "./types";

type CloudTab = "account" | "profiles" | "marathons" | "achievements" | "devices" | "privacy";

type Props = {
  open: boolean;
  onClose: () => void;
  localProfiles: LocalProfile[];
  activeProfileId: string;
  onAddLocalProfile: (profile: LocalProfile) => void;
  onRemoveLocalProfile: (profileId: string) => void;
  onSwitchLocalProfile: (profileId: string) => void;
  notify: (message: string) => void;
};

const TAB_LABELS: Array<{ id: CloudTab; label: string }> = [
  { id: "account", label: "Cuenta" },
  { id: "profiles", label: "Perfiles" },
  { id: "marathons", label: "Maratones" },
  { id: "achievements", label: "Logros" },
  { id: "devices", label: "Dispositivos" },
  { id: "privacy", label: "Privacidad" },
];

function readableDate(value?: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String((error as { message: unknown }).message);
  return "No se pudo completar la operación.";
}

function localMarathons(): LocalMarathon[] {
  try { return JSON.parse(localStorage.getItem(NEXUS_KEYS.customMarathons) || "[]"); } catch { return []; }
}

function unlockedAchievementIds() {
  try { return JSON.parse(localStorage.getItem(NEXUS_KEYS.achievements) || "[]") as string[]; } catch { return []; }
}

function posterForId(id?: string) {
  const item = MCU_ITEMS.find((entry) => entry.id === id);
  return item ? POSTER_BY_WIKI[item.wiki] : undefined;
}

export function CloudWorkspace(props: Props) {
  const cloudActiveProfileId = props.activeProfileId;
  const cloudLocalProfiles = props.localProfiles;
  const addCloudLocalProfile = props.onAddLocalProfile;
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<CloudTab>(() => typeof window !== "undefined" && localStorage.getItem(PENDING_INVITE_KEY) ? "marathons" : "account");
  const [status, setStatus] = useState<SyncState>(cloudConfigured ? "guest" : "unconfigured");
  const [message, setMessage] = useState(cloudConfigured ? "Modo invitado · guardado en este dispositivo" : "Configura Supabase para activar la nube");
  const [lastSync, setLastSync] = useState<string | null>(() => typeof window === "undefined" ? null : localStorage.getItem(LAST_SYNC_KEY));
  const [profiles, setProfiles] = useState<CloudProfile[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [marathons, setMarathons] = useState<CloudMarathon[]>([]);
  const [busy, setBusy] = useState(false);
  const [formMode, setFormMode] = useState<"signin" | "signup" | "recover">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteToken, setInviteToken] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem(PENDING_INVITE_KEY) || "");
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileAvatar, setNewProfileAvatar] = useState("N");
  const [newProfileColor, setNewProfileColor] = useState("#f2454b");
  const [newProfileChild, setNewProfileChild] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const lastFingerprint = useRef("");
  const initializedAccount = useRef<string | null>(null);
  const syncInFlight = useRef(false);
  const syncAgain = useRef(false);

  const activeCloudProfile = useMemo(
    () => profiles.find((profile) => profile.local_key === props.activeProfileId) || profiles[0] || null,
    [profiles, props.activeProfileId],
  );

  const refreshCloudData = useCallback(async (activeSession: Session, knownProfiles?: CloudProfile[]) => {
    const nextProfiles = knownProfiles || await upsertLocalProfiles(activeSession, cloudLocalProfiles);
    setProfiles(nextProfiles);
    for (const profile of nextProfiles) {
      if (!cloudLocalProfiles.some((local) => local.id === profile.local_key)) {
        addCloudLocalProfile({ id: profile.local_key, name: profile.name, avatar: profile.avatar, color: profile.color, child: profile.child_mode });
      }
    }
    await registerDevice(activeSession);
    setDevices(await listDevices(activeSession));
    const selected = nextProfiles.find((profile) => profile.local_key === cloudActiveProfileId) || nextProfiles[0];
    if (selected) setMarathons(await listMarathons(selected.id));
    return nextProfiles;
  }, [addCloudLocalProfile, cloudActiveProfileId, cloudLocalProfiles]);

  const runSync = useCallback(async (preference: "merge" | "local" | "cloud" = "merge", knownProfiles?: CloudProfile[]) => {
    if (!session || !navigator.onLine) {
      setStatus(session ? "offline" : cloudConfigured ? "guest" : "unconfigured");
      setMessage(session ? "Sin conexión · los cambios quedan guardados localmente" : "Modo invitado · guardado en este dispositivo");
      return;
    }
    if (syncInFlight.current) {
      syncAgain.current = true;
      return;
    }
    syncInFlight.current = true;
    setStatus("syncing");
    setMessage("Sincronizando progreso…");
    try {
      const nextProfiles = knownProfiles?.length ? knownProfiles : profiles.length ? profiles : await refreshCloudData(session);
      const syncedAt = await syncProfile(session, nextProfiles, props.activeProfileId, preference);
      const selected = nextProfiles.find((profile) => profile.local_key === props.activeProfileId) || nextProfiles[0];
      if (selected) {
        await syncStructuredProfile(selected.id);
        await syncLocalMarathons(selected.id);
      }
      setLastSync(syncedAt);
      setStatus("synced");
      setMessage("Todo está sincronizado");
      lastFingerprint.current = JSON.stringify(captureSnapshot(props.activeProfileId).values);
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage(error));
      if (/desvinculado/i.test(errorMessage(error))) { await signOut("local"); setSession(null); }
    } finally {
      syncInFlight.current = false;
      if (syncAgain.current) {
        syncAgain.current = false;
        window.setTimeout(() => window.dispatchEvent(new CustomEvent("nexus:local-change")), 0);
      }
    }
  }, [profiles, props.activeProfileId, refreshCloudData, session]);

  useEffect(() => {
    const client = getSupabase();
    if (!client) return;
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        initializedAccount.current = null;
        setProfiles([]); setDevices([]); setMarathons([]); setStatus("guest"); setMessage("Modo invitado · guardado en este dispositivo");
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session || initializedAccount.current === session.user.id) return;
    initializedAccount.current = session.user.id;
    setStatus(navigator.onLine ? "syncing" : "offline");
    setMessage(navigator.onLine ? "Conectando con Nexus Cloud…" : "Sin conexión");
    refreshCloudData(session)
      .then((nextProfiles) => runSync("merge", nextProfiles))
      .catch((error) => { setStatus("error"); setMessage(errorMessage(error)); });
  }, [refreshCloudData, runSync, session]);

  useEffect(() => {
    const online = () => { if (session) void runSync(); };
    const offline = () => { setStatus("offline"); setMessage("Sin conexión · los cambios quedan guardados localmente"); };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, [runSync, session]);

  useEffect(() => {
    if (!session) return;
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void runSync("merge"), 550);
    };
    window.addEventListener("nexus:local-change", schedule);
    return () => { window.clearTimeout(timer); window.removeEventListener("nexus:local-change", schedule); };
  }, [runSync, session]);

  useEffect(() => {
    let fingerprint = "";
    const mirror = () => {
      const snapshot = captureSnapshot(props.activeProfileId);
      const next = JSON.stringify(snapshot.values);
      if (next !== fingerprint) { fingerprint = next; void saveLocalSnapshot(snapshot); }
    };
    mirror();
    const timer = window.setInterval(mirror, 15000);
    return () => window.clearInterval(timer);
  }, [props.activeProfileId]);

  useEffect(() => {
    window.nexusCloud = {
      openAccount: () => window.dispatchEvent(new CustomEvent("nexus:open-cloud")),
      shareMarathon: async (marathon) => {
        if (!session || !activeCloudProfile) return { ok: false, error: "Inicia sesión para compartir mediante enlace." };
        try {
          const result = await uploadMarathon(activeCloudProfile.id, marathon, "invite");
          const invitation = await createInvitation(result.marathon.id);
          await navigator.clipboard?.writeText(invitation.url);
          setMarathons(await listMarathons(activeCloudProfile.id));
          return { ok: true, url: invitation.url };
        } catch (error) { return { ok: false, error: errorMessage(error) }; }
      },
      importInvitation: async (token) => {
        if (!activeCloudProfile) return { ok: false, error: "Inicia sesión y selecciona un perfil." };
        try { await acceptInvitation(token, activeCloudProfile.id); setMarathons(await listMarathons(activeCloudProfile.id)); return { ok: true }; }
        catch (error) { return { ok: false, error: errorMessage(error) }; }
      },
    };
    return () => { delete window.nexusCloud; };
  }, [activeCloudProfile, session]);

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      if (formMode === "recover") {
        const { error } = await sendPasswordReset(email);
        if (error) throw error;
        setMessage("Revisa tu correo para cambiar la contraseña.");
      } else if (formMode === "signup") {
        const { data, error } = await signUp(email, password, displayName);
        if (error) throw error;
        setMessage(data.session ? "Cuenta creada." : "Cuenta creada. Revisa tu correo para confirmarla.");
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        setSession(data.session);
        if (data.session) {
          const nextProfiles = await refreshCloudData(data.session);
          setProfiles(nextProfiles);
          await runSync("merge", nextProfiles);
        }
      }
    } catch (error) { setStatus("error"); setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function addProfile() {
    if (!session || !newProfileName.trim()) return;
    setBusy(true);
    try {
      const created = await createCloudProfile(session, { name: newProfileName.trim(), avatar: newProfileAvatar.slice(0, 2).toUpperCase() || "N", color: newProfileColor, child: newProfileChild });
      setProfiles((current) => [...current, created]);
      props.onAddLocalProfile({ id: created.local_key, name: created.name, avatar: created.avatar, color: created.color, child: created.child_mode });
      setNewProfileName(""); setNewProfileAvatar("N"); setNewProfileChild(false);
      props.notify("Perfil creado y vinculado a tu cuenta");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function removeProfile(profile: CloudProfile) {
    if (!confirm(`¿Eliminar el perfil ${profile.name} y todo su progreso cloud?`)) return;
    setBusy(true);
    try {
      await deleteCloudProfile(profile.id);
      setProfiles((current) => current.filter((entry) => entry.id !== profile.id));
      props.onRemoveLocalProfile(profile.local_key);
      props.notify("Perfil eliminado");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function uploadLocalMarathon(marathon: LocalMarathon) {
    if (!activeCloudProfile) return;
    setBusy(true);
    try {
      const result = await uploadMarathon(activeCloudProfile.id, marathon, "invite");
      const invitation = await createInvitation(result.marathon.id);
      setMarathons(await listMarathons(activeCloudProfile.id));
      await navigator.clipboard?.writeText(invitation.url);
      props.notify("Maratón guardado e invitación copiada");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function inviteTo(marathon: CloudMarathon) {
    setBusy(true);
    try {
      const result = await createInvitation(marathon.id);
      await navigator.clipboard?.writeText(result.url);
      props.notify("Invitación copiada · válida por 7 días");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function importCloudMarathon(marathon: CloudMarathon) {
    const existing = localMarathons();
    const imported: LocalMarathon = {
      version: 1,
      id: `imported-${marathon.id}-${Date.now()}`,
      name: marathon.name,
      description: marathon.description,
      createdAt: new Date().toISOString(),
      author: "Nexus Cloud",
      coverIds: marathon.cover_ids || [],
      tasks: [...(marathon.marathon_items || [])].sort((a,b)=>a.position-b.position).map((item)=>({ itemId:item.title_id, ...(item.episode ? { episode:item.episode } : {}) })),
    };
    localStorage.setItem(NEXUS_KEYS.customMarathons, JSON.stringify([imported, ...existing]));
    props.notify("Copia importada al planificador");
  }

  async function joinMarathon() {
    if (!activeCloudProfile || !inviteToken.trim()) return;
    setBusy(true);
    try {
      await acceptInvitation(inviteToken.trim(), activeCloudProfile.id);
      localStorage.removeItem(PENDING_INVITE_KEY);
      setInviteToken("");
      setMarathons(await listMarathons(activeCloudProfile.id));
      props.notify("Te uniste al maratón");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "ELIMINAR") return;
    setBusy(true);
    try {
      await requestAccountDeletion();
      await signOut("local");
      setSession(null);
      setDeleteConfirmation("");
      props.notify("Tu cuenta cloud fue eliminada");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  const statusButton = (
    <button className={`cloud-status cloud-${status}`} onClick={() => window.dispatchEvent(new CustomEvent("nexus:open-cloud"))} title={message}>
      <i />
      <span><strong>{session ? session.user.email?.split("@")[0] : "Invitado"}</strong><small>{status === "synced" ? "Sincronizado" : status === "syncing" ? "Sincronizando…" : status === "offline" ? "Sin conexión" : status === "unconfigured" ? "Cloud sin configurar" : "Solo en este dispositivo"}</small></span>
    </button>
  );

  useEffect(() => {
    const handler = () => document.documentElement.dataset.cloudPanel = "open";
    window.addEventListener("nexus:open-cloud", handler);
    return () => window.removeEventListener("nexus:open-cloud", handler);
  }, []);

  return <>
    <div className="cloud-status-slot">{statusButton}</div>
    {props.open && <div className="cloud-layer" role="button" tabIndex={0} aria-label="Cerrar panel de cuenta" onKeyDown={(event) => { if (event.key === "Escape") props.onClose(); }} onMouseDown={(event) => { if (event.target === event.currentTarget) props.onClose(); }}>
      <aside className="cloud-panel" role="dialog" aria-modal="true" aria-label="Cuenta y Nexus Cloud">
        <header className="cloud-panel-header">
          <div><span>Nexus Cloud</span><h2>{session ? "Tu cuenta" : "Guarda tu multiverso"}</h2><p>{message}</p></div>
          <button onClick={props.onClose} aria-label="Cerrar">×</button>
        </header>

        {!cloudConfigured ? <CloudSetupNotice /> : !session ? <AuthView mode={formMode} onMode={setFormMode} email={email} password={password} displayName={displayName} onEmail={setEmail} onPassword={setPassword} onDisplayName={setDisplayName} onSubmit={submitAuth} busy={busy} message={message} /> : <>
          <nav className="cloud-tabs">{TAB_LABELS.map((entry) => <button key={entry.id} className={tab === entry.id ? "active" : ""} onClick={() => setTab(entry.id)}>{entry.label}</button>)}</nav>
          <div className="cloud-panel-scroll">
            {tab === "account" && <AccountTab session={session} status={status} lastSync={lastSync} onSignOut={async () => { await signOut(); localStorage.removeItem("nexus-guest-entry-v1"); window.location.reload(); }} onSignOutAll={async () => { await signOut("global"); localStorage.removeItem("nexus-guest-entry-v1"); window.location.reload(); }} />}
            {tab === "profiles" && <ProfilesTab profiles={profiles} activeLocalId={props.activeProfileId} onSwitch={props.onSwitchLocalProfile} onVisibility={async (profile, visibility) => { await updateCloudProfile(profile.id, { visibility }); setProfiles((current) => current.map((entry) => entry.id === profile.id ? { ...entry, visibility } : entry)); }} onDelete={removeProfile} name={newProfileName} avatar={newProfileAvatar} color={newProfileColor} child={newProfileChild} onName={setNewProfileName} onAvatar={setNewProfileAvatar} onColor={setNewProfileColor} onChild={setNewProfileChild} onCreate={addProfile} busy={busy} />}
            {tab === "marathons" && <MarathonsTab local={localMarathons()} cloud={marathons} inviteToken={inviteToken} onInviteToken={setInviteToken} onJoin={joinMarathon} onUpload={uploadLocalMarathon} onInvite={inviteTo} onCopy={importCloudMarathon} busy={busy} />}
            {tab === "achievements" && <AchievementsTab ids={unlockedAchievementIds()} profile={activeCloudProfile} />}
            {tab === "devices" && <DevicesTab devices={devices} currentId={getDeviceId()} onRevoke={async (id) => { await revokeDevice(id); if (session) setDevices(await listDevices(session)); }} />}
            {tab === "privacy" && <PrivacyTab confirmation={deleteConfirmation} onConfirmation={setDeleteConfirmation} onDelete={deleteAccount} busy={busy} />}
          </div>
        </>}
      </aside>
    </div>}
  </>;
}

function CloudSetupNotice() {
  return <div className="cloud-setup"><b>Modo invitado listo</b><p>Nexus ya funciona localmente. Para activar cuentas y sincronización crea tu proyecto gratuito de Supabase y copia las dos variables públicas indicadas en <code>.env.example</code>.</p><ol><li>Crea el proyecto.</li><li>Ejecuta la migración incluida.</li><li>Añade las variables.</li><li>Reinicia Nexus.</li></ol><small>No hace falta desplegar la web para probarlo localmente.</small></div>;
}

function AuthView(props: { mode:"signin"|"signup"|"recover"; onMode:(mode:"signin"|"signup"|"recover")=>void; email:string; password:string; displayName:string; onEmail:(value:string)=>void; onPassword:(value:string)=>void; onDisplayName:(value:string)=>void; onSubmit:(event:React.FormEvent)=>void; busy:boolean; message:string }) {
  return <div className="cloud-auth"><div className="cloud-auth-benefits"><b>Continúa en cualquier dispositivo</b><ul><li>Sincroniza películas y capítulos.</li><li>Comparte maratones por invitación.</li><li>Mantén perfiles y logros separados.</li><li>Usa Nexus sin conexión.</li></ul></div><form onSubmit={props.onSubmit}><div className="cloud-mode"><button type="button" className={props.mode==="signin"?"active":""} onClick={()=>props.onMode("signin")}>Entrar</button><button type="button" className={props.mode==="signup"?"active":""} onClick={()=>props.onMode("signup")}>Crear cuenta</button></div>{props.mode==="signup"&&<label><span>Nombre</span><input value={props.displayName} onChange={(event)=>props.onDisplayName(event.target.value)} required maxLength={50}/></label>}<label><span>Correo</span><input type="email" value={props.email} onChange={(event)=>props.onEmail(event.target.value)} required autoComplete="email"/></label>{props.mode!=="recover"&&<label><span>Contraseña</span><input type="password" value={props.password} onChange={(event)=>props.onPassword(event.target.value)} minLength={8} required autoComplete={props.mode==="signup"?"new-password":"current-password"}/></label>}<button className="cloud-primary" disabled={props.busy}>{props.busy?"Procesando…":props.mode==="signin"?"Iniciar sesión":props.mode==="signup"?"Crear mi cuenta":"Enviar enlace"}</button><button type="button" className="cloud-link" onClick={()=>props.onMode(props.mode==="recover"?"signin":"recover")}>{props.mode==="recover"?"Volver al inicio":"Olvidé mi contraseña"}</button>{props.message&&<p className="cloud-form-message">{props.message}</p>}</form></div>;
}

function AccountTab(props:{session:Session;status:SyncState;lastSync:string|null;onSignOut:()=>void;onSignOutAll:()=>void}) {
  return <section className="cloud-section"><div className="account-identity"><div>{(props.session.user.email||"N").slice(0,1).toUpperCase()}</div><span><strong>{props.session.user.user_metadata.display_name||"Cuenta Nexus"}</strong><small>{props.session.user.email}</small></span></div><div className="sync-card"><i className={`sync-dot ${props.status}`}/><span><strong>{props.status==="synced"?"Todo sincronizado":props.status==="syncing"?"Guardando cambios…":props.status==="offline"?"Trabajando sin conexión":"Revisar conexión"}</strong><small>{props.status==="offline"?"Se sincronizará automáticamente al volver":`Última sincronización: ${readableDate(props.lastSync)}`}</small></span></div><p className="section-copy">Nexus guarda automáticamente películas, capítulos, maratones, preferencias y logros. No necesitas pulsar ningún botón.</p><button className="cloud-secondary" onClick={props.onSignOut}>Cerrar sesión en este dispositivo</button><button className="cloud-secondary" onClick={props.onSignOutAll}>Cerrar todas las sesiones</button></section>;
}

function ProfilesTab(props:{profiles:CloudProfile[];activeLocalId:string;onSwitch:(id:string)=>void;onVisibility:(profile:CloudProfile,visibility:CloudProfile["visibility"])=>void;onDelete:(profile:CloudProfile)=>void;name:string;avatar:string;color:string;child:boolean;onName:(v:string)=>void;onAvatar:(v:string)=>void;onColor:(v:string)=>void;onChild:(v:boolean)=>void;onCreate:()=>void;busy:boolean}) {
  return <section className="cloud-section"><div className="cloud-profile-grid">{props.profiles.map((profile)=><article key={profile.id} className={profile.local_key===props.activeLocalId?"active":""} style={{"--profile":profile.color} as React.CSSProperties}><div className="cloud-avatar">{profile.avatar}</div><span><strong>{profile.name}</strong><small>{profile.child_mode?"Perfil infantil":"Perfil estándar"}</small></span><select value={profile.visibility} onChange={(event)=>props.onVisibility(profile,event.target.value as CloudProfile["visibility"])}><option value="private">Privado</option><option value="shared">Con invitación</option><option value="public">Público</option></select><div className="cloud-profile-actions">{profile.local_key!==props.activeLocalId&&<button onClick={()=>props.onSwitch(profile.local_key)}>Usar</button>}{profile.visibility==="public"&&!profile.child_mode&&<button onClick={async()=>{await navigator.clipboard?.writeText(`${location.origin}/profile/${profile.id}`)}}>Compartir</button>}</div>{props.profiles.length>1&&<button className="danger-icon" onClick={()=>props.onDelete(profile)}>×</button>}</article>)}</div><div className="new-cloud-profile"><h3>Nuevo perfil</h3><div><input placeholder="Nombre" value={props.name} onChange={(event)=>props.onName(event.target.value)}/><input className="avatar-field" maxLength={2} value={props.avatar} onChange={(event)=>props.onAvatar(event.target.value)}/><input type="color" value={props.color} onChange={(event)=>props.onColor(event.target.value)}/><label><input type="checkbox" checked={props.child} onChange={(event)=>props.onChild(event.target.checked)}/> Infantil</label><button onClick={props.onCreate} disabled={props.busy||!props.name.trim()}>Crear perfil</button></div></div></section>;
}

function MarathonsTab(props:{local:LocalMarathon[];cloud:CloudMarathon[];inviteToken:string;onInviteToken:(v:string)=>void;onJoin:()=>void;onUpload:(m:LocalMarathon)=>void;onInvite:(m:CloudMarathon)=>void;onCopy:(m:CloudMarathon)=>void;busy:boolean}) {
  return <section className="cloud-section"><div className="join-marathon"><h3>Unirse con invitación</h3><div><input value={props.inviteToken} onChange={(event)=>props.onInviteToken(event.target.value)} placeholder="Pega el código o token"/><button onClick={props.onJoin} disabled={props.busy||!props.inviteToken.trim()}>Unirme</button></div></div><h3>En este dispositivo</h3>{props.local.length?<div className="cloud-marathon-list">{props.local.map((marathon)=><article key={marathon.id}><div className="mini-collage">{marathon.coverIds.slice(0,4).map((id)=><span key={id} style={{backgroundImage:`url(${posterForId(id)||""})`}}/>)}</div><span><strong>{marathon.name}</strong><small>{marathon.tasks.length} elementos · todavía local</small></span><button onClick={()=>props.onUpload(marathon)}>Subir y compartir</button></article>)}</div>:<p className="cloud-empty">Crea un maratón desde el planificador para compartirlo.</p>}<h3>En Nexus Cloud</h3>{props.cloud.length?<div className="cloud-marathon-list">{props.cloud.map((marathon)=><article key={marathon.id}><div className="mini-collage">{marathon.cover_ids.slice(0,4).map((id)=><span key={id} style={{backgroundImage:`url(${posterForId(id)||""})`}}/>)}</div><span><strong>{marathon.name}</strong><small>{marathon.visibility==="public"?"Público":marathon.visibility==="invite"?"Con invitación":"Privado"} · {marathon.marathon_items?.length||0} elementos</small></span><div className="cloud-marathon-actions"><button onClick={()=>props.onCopy(marathon)}>Importar copia</button><button onClick={()=>props.onInvite(marathon)}>Invitar</button></div></article>)}</div>:<p className="cloud-empty">Todavía no tienes maratones en la nube.</p>}</section>;
}

function AchievementsTab({ids,profile}:{ids:string[];profile:CloudProfile|null}) {
  return <section className="cloud-section"><div className="achievement-cloud-summary"><strong>{ids.length}</strong><span><b>logros desbloqueados</b><small>{profile?.visibility==="public"?"Visibles en tu perfil público":"Privados hasta que cambies la visibilidad del perfil"}</small></span></div>{ids.length?<div className="achievement-cloud-list">{ids.map((id)=><span key={id}>★ {id.replace(/-/g," ")}</span>)}</div>:<p className="cloud-empty">Tus primeros logros aparecerán aquí cuando avances por el multiverso.</p>}</section>;
}

function DevicesTab({devices,currentId,onRevoke}:{devices:DeviceRecord[];currentId:string;onRevoke:(id:string)=>void}) {
  return <section className="cloud-section"><p className="section-copy">Aquí puedes reconocer y desvincular navegadores o computadoras. El progreso local del dispositivo no se borra al desvincularlo.</p><div className="device-list">{devices.map((device)=><article key={device.id}><i className={device.revoked_at?"revoked":""}/><span><strong>{device.name}{device.id===currentId?" · Este dispositivo":""}</strong><small>{device.platform} · Último uso {readableDate(device.last_seen_at)}</small></span>{device.id!==currentId&&!device.revoked_at&&<button onClick={()=>onRevoke(device.id)}>Desvincular</button>}</article>)}</div></section>;
}

function PrivacyTab(props:{confirmation:string;onConfirmation:(v:string)=>void;onDelete:()=>void;busy:boolean}) {
  return <section className="cloud-section"><div className="danger-zone"><h3>Eliminar la cuenta definitivamente</h3><p>Esta acción elimina la cuenta, sus perfiles, el progreso sincronizado y los maratones propios.</p><label>Escribe <b>ELIMINAR</b><input value={props.confirmation} onChange={(event)=>props.onConfirmation(event.target.value)}/></label><button disabled={props.busy||props.confirmation!=="ELIMINAR"} onClick={props.onDelete}>Eliminar mi cuenta cloud</button></div></section>;
}
