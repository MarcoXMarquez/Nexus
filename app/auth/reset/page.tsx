"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePassword } from "../../cloud/cloud-service";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Escribe una contraseña nueva para Nexus.");
  const [done, setDone] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setDone(true);
      setMessage("Contraseña actualizada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar.");
    }
  }
  return (
    <main className="auth-route">
      <section>
        <div className="auth-mark">N</div>
        <h1>Nueva contraseña</h1>
        <p>{message}</p>
        {!done && (
          <form onSubmit={submit}>
            <input
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
            <button>Cambiar contraseña</button>
          </form>
        )}
        <Link href="/">Volver a Nexus</Link>
      </section>
    </main>
  );
}
