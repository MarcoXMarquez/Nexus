"use client";

import dynamic from "next/dynamic";

const NexusApp = dynamic(
  () => import("../desktop/renderer").then((module) => module.App),
  { ssr: false, loading: () => <div className="nexus-loading" role="status">Preparando tu multiverso…</div> },
);

/**
 * La interfaz de escritorio es la experiencia canónica de Nexus. Esta página
 * la reutiliza en navegador para evitar que web y Electron evolucionen como
 * productos distintos.
 */
export default function HomePage() {
  return <NexusApp />;
}
