"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../cloud/supabase";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Confirmando tu cuenta…");
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const client = getSupabase();
    if (!client || !code) {
      Promise.resolve().then(() => setMessage("El enlace no es válido o Supabase no está configurado."));
      return;
    }
    client.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setMessage(error.message);
      else { setMessage("Cuenta confirmada. Volviendo a Nexus…"); window.setTimeout(() => window.location.assign("/"), 700); }
    });
  }, []);
  return <main className="auth-route"><section><div className="auth-mark">N</div><h1>Nexus Cloud</h1><p>{message}</p><Link href="/">Volver a Nexus</Link></section></main>;
}
