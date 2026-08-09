"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MCU_ITEMS, POSTER_BY_WIKI } from "../../mcu-data";
import { getSupabase } from "../../cloud/supabase";
import type { CloudMarathon } from "../../cloud/types";

export default function PublicMarathonPage() {
  const { slug } = useParams<{ slug: string }>();
  const [marathon, setMarathon] = useState<CloudMarathon | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      Promise.resolve().then(() => setError("Nexus Cloud todavía no está configurado."));
      return;
    }
    client
      .from("marathons")
      .select("*,marathon_items(*)")
      .eq("share_slug", slug)
      .eq("visibility", "public")
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError) setError("Este maratón no existe o dejó de ser público.");
        else setMarathon(data as CloudMarathon);
      });
  }, [slug]);
  const items = (marathon?.marathon_items || []).sort((a, b) => a.position - b.position);
  return (
    <main className="shared-marathon-page">
      <header>
        <Link href="/">NEXUS</Link>
        <span>Maratón compartido</span>
      </header>
      {error ? (
        <section className="shared-error">
          <h1>No pudimos abrir esta ruta</h1>
          <p>{error}</p>
          <Link href="/">Ir a Nexus</Link>
        </section>
      ) : !marathon ? (
        <section className="shared-error">
          <p>Cargando maratón…</p>
        </section>
      ) : (
        <>
          <section className="shared-hero">
            <span>Ruta creada en Nexus</span>
            <h1>{marathon.name}</h1>
            <p>
              {marathon.description || "Una selección para recorrer el multiverso en compañía."}
            </p>
            <div>
              <b>{items.length}</b> elementos
            </div>
          </section>
          <section className="shared-items">
            {items.map((entry, index) => {
              const item = MCU_ITEMS.find((candidate) => candidate.id === entry.title_id);
              if (!item) return null;
              return (
                <article key={entry.id}>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <img src={POSTER_BY_WIKI[item.wiki]} alt="" />
                  <span>
                    <small>
                      {item.type}
                      {entry.episode ? ` · capítulo ${entry.episode}` : ""}
                    </small>
                    <h2>{item.title}</h2>
                    <p>
                      {item.date} · {item.saga}
                    </p>
                  </span>
                </article>
              );
            })}
          </section>
          <footer>
            <Link href="/">Crear mi propio maratón</Link>
          </footer>
        </>
      )}
    </main>
  );
}
