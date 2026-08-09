"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PENDING_INVITE_KEY } from "../../cloud/storage-keys";

export default function InvitationPage() {
  const params = useParams<{ token: string }>();
  useEffect(() => {
    if (params.token) localStorage.setItem(PENDING_INVITE_KEY, params.token);
  }, [params.token]);
  return (
    <main className="auth-route">
      <section>
        <div className="auth-mark">N</div>
        <h1>Te invitaron a un maratón</h1>
        <p>Abre Nexus, inicia sesión y el código estará preparado en la sección Maratones.</p>
        <Link
          href="/"
          onClick={() =>
            window.setTimeout(() => window.dispatchEvent(new CustomEvent("nexus:open-cloud")), 500)
          }
        >
          Abrir Nexus
        </Link>
      </section>
    </main>
  );
}
