"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSupabase } from "../../cloud/supabase";
import type { CloudProfile } from "../../cloud/types";

type PublicAchievement = { achievement_id: string; unlocked_at: string };

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<CloudProfile | null>(null);
  const [achievements, setAchievements] = useState<PublicAchievement[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      Promise.resolve().then(() => setError("Nexus Cloud todavía no está configurado."));
      return;
    }
    Promise.all([
      client.from("viewer_profiles").select("*").eq("id", id).eq("visibility", "public").single(),
      client
        .from("user_achievements")
        .select("achievement_id,unlocked_at")
        .eq("profile_id", id)
        .eq("visibility", "public")
        .order("unlocked_at", { ascending: false }),
    ]).then(([profileResult, achievementResult]) => {
      if (profileResult.error) setError("Este perfil es privado o ya no existe.");
      else setProfile(profileResult.data as CloudProfile);
      if (!achievementResult.error)
        setAchievements((achievementResult.data || []) as PublicAchievement[]);
    });
  }, [id]);
  return (
    <main className="public-profile-page">
      {error ? (
        <section className="public-profile-error">
          <h1>Perfil no disponible</h1>
          <p>{error}</p>
          <Link href="/">Abrir Nexus</Link>
        </section>
      ) : !profile ? (
        <section className="public-profile-error">
          <p>Cargando perfil…</p>
        </section>
      ) : (
        <>
          <header>
            <Link href="/">NEXUS</Link>
            <span>Perfil público</span>
          </header>
          <section
            className="public-profile-hero"
            style={{ "--profile": profile.color } as React.CSSProperties}
          >
            <div>{profile.avatar}</div>
            <span>
              <small>Explorador del multiverso</small>
              <h1>{profile.name}</h1>
              <p>{achievements.length} logros públicos</p>
            </span>
          </section>
          <section className="public-achievements">
            <h2>Logros desbloqueados</h2>
            {achievements.length ? (
              <div>
                {achievements.map((achievement) => (
                  <article key={achievement.achievement_id}>
                    <b>★</b>
                    <span>
                      <strong>{achievement.achievement_id.replace(/-/g, " ")}</strong>
                      <small>
                        {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
                          new Date(achievement.unlocked_at),
                        )}
                      </small>
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <p>Este perfil todavía no comparte logros.</p>
            )}
          </section>
          <footer>
            <Link href="/">Comenzar mi recorrido</Link>
          </footer>
        </>
      )}
    </main>
  );
}
