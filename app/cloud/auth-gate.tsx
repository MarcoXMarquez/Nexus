"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { signIn, signUp, sendPasswordReset, syncProfile, upsertLocalProfiles } from "./cloud-service";
import { NEXUS_KEYS } from "./storage-keys";
import { cloudConfigured, getSupabase } from "./supabase";
import type { LocalProfile } from "./types";

const GUEST_ENTRY_KEY = "nexus-guest-entry-v1";

type Screen = "checking" | "welcome" | "signin" | "signup" | "recover" | "app";

function messageOf(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String((error as { message: unknown }).message);
  return "No se pudo completar la operación.";
}

function localProfiles(): LocalProfile[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(NEXUS_KEYS.profiles) || "[]") as LocalProfile[];
    if (parsed.length) return parsed;
  } catch { /* se crea el perfil inicial */ }
  return [{ id: "principal", name: "Usuario", avatar: "N", color: "#f2454b", child: false }];
}

async function prepareAccount(session: Session) {
  const profiles = await upsertLocalProfiles(session, localProfiles());
  await syncProfile(session, profiles, localStorage.getItem(NEXUS_KEYS.activeProfile) || "principal", "merge");
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      queueMicrotask(() => setScreen(localStorage.getItem(GUEST_ENTRY_KEY) ? "app" : "welcome"));
      return;
    }
    let mounted = true;
    client.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        try { await prepareAccount(data.session); } catch { /* CloudWorkspace reintentará en segundo plano */ }
        if (mounted) setScreen("app");
      } else {
        setScreen(localStorage.getItem(GUEST_ENTRY_KEY) ? "app" : "welcome");
      }
    });
    return () => { mounted = false; };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (screen === "recover") {
        const { error } = await sendPasswordReset(email);
        if (error) throw error;
        setMessage("Te enviamos un enlace para recuperar tu contraseña.");
        return;
      }
      if (screen === "signup") {
        const { data, error } = await signUp(email, password, name);
        if (error) throw error;
        if (!data.session) {
          setMessage("Cuenta creada. Revisa tu correo y confirma el registro.");
          return;
        }
        localStorage.removeItem(GUEST_ENTRY_KEY);
        await prepareAccount(data.session);
        setScreen("app");
        return;
      }
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      if (!data.session) throw new Error("No se pudo iniciar la sesión.");
      localStorage.removeItem(GUEST_ENTRY_KEY);
      await prepareAccount(data.session);
      setScreen("app");
    } catch (error) {
      setMessage(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  if (screen === "app") return <>{children}</>;
  if (screen === "checking") return <div className="nexus-auth-loading"><span>N</span><p>Preparando Nexus…</p></div>;

  return <main className="nexus-auth-gate">
    <div className="auth-backdrop" aria-hidden="true"><i/><i/><i/></div>
    <section className="auth-gate-card">
      <header className="auth-gate-brand"><span>N</span><div><strong>NEXUS</strong><small>MCU TRACKER</small></div></header>
      {screen === "welcome" ? <>
        <div className="auth-gate-copy"><small>TU MULTIVERSO, SIEMPRE CONTIGO</small><h1>Continúa donde lo dejaste.</h1><p>Guarda películas, capítulos, maratones y logros en todos tus dispositivos.</p></div>
        <div className="auth-gate-actions">
          <button className="auth-primary" onClick={() => setScreen("signin")} disabled={!cloudConfigured}>Iniciar sesión</button>
          <button className="auth-guest" onClick={() => { localStorage.setItem(GUEST_ENTRY_KEY, "true"); setScreen("app"); }}>Seguir como invitado</button>
          {!cloudConfigured && <p>La nube no está configurada. Puedes continuar como invitado.</p>}
        </div>
      </> : <>
        <button className="auth-back" onClick={() => { setScreen("welcome"); setMessage(""); }} aria-label="Volver">← Volver</button>
        <div className="auth-form-heading"><small>{screen === "signup" ? "CREA TU IDENTIDAD" : screen === "recover" ? "RECUPERAR ACCESO" : "BIENVENIDO DE NUEVO"}</small><h1>{screen === "signup" ? "Crear cuenta" : screen === "recover" ? "Recuperar contraseña" : "Iniciar sesión"}</h1></div>
        <form className="auth-gate-form" onSubmit={submit}>
          {screen === "signup" && <label><span>Nombre</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={60}/></label>}
          <label><span>Correo electrónico</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required/></label>
          {screen !== "recover" && <label><span>Contraseña</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={screen === "signup" ? "new-password" : "current-password"} minLength={8} required/></label>}
          <button className="auth-primary" disabled={busy}>{busy ? "Conectando…" : screen === "signup" ? "Crear mi cuenta" : screen === "recover" ? "Enviar enlace" : "Entrar a Nexus"}</button>
          {message && <p className="auth-gate-message" role="status">{message}</p>}
        </form>
        <div className="auth-form-links">
          {screen === "signin" && <><button onClick={() => { setScreen("recover"); setMessage(""); }}>¿Olvidaste tu contraseña?</button><p>¿Aún no tienes cuenta? <button onClick={() => { setScreen("signup"); setMessage(""); }}>Regístrate</button></p></>}
          {screen === "signup" && <p>¿Ya tienes cuenta? <button onClick={() => { setScreen("signin"); setMessage(""); }}>Inicia sesión</button></p>}
          {screen === "recover" && <button onClick={() => { setScreen("signin"); setMessage(""); }}>Volver a iniciar sesión</button>}
        </div>
      </>}
    </section>
  </main>;
}
