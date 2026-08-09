"use client";

import { useMemo, useState } from "react";
import { BACKDROP_BY_ID } from "../backdrop-data";
import { MCU_ITEMS } from "../mcu-data";
import { TITLE_METADATA } from "../mcu-metadata";
import { TITLE_LOGO_BY_ID } from "../title-logo-data";
import { useI18n } from "../i18n/provider";

type SourceEntry = { id: string; title: string; kind: string; source: string };

const TITLE_BY_ID = new Map(MCU_ITEMS.map((item) => [item.id, item.title]));

const ENTRIES: SourceEntry[] = [
  ...Object.entries(TITLE_LOGO_BY_ID).map(([id, value]) => ({
    id,
    title: TITLE_BY_ID.get(id) || id,
    kind: "Logo",
    source: value.source,
  })),
  ...Object.entries(BACKDROP_BY_ID).map(([id, value]) => ({
    id,
    title: TITLE_BY_ID.get(id) || id,
    kind: "Backdrop",
    source: value.source,
  })),
  ...Object.entries(TITLE_METADATA).flatMap(([id, value]) =>
    value.sourceUrl
      ? [
          {
            id,
            title: TITLE_BY_ID.get(id) || id,
            kind: value.sourceLabel || "Metadata",
            source: value.sourceUrl,
          },
        ]
      : [],
  ),
];

export function SourceDirectory() {
  const { locale } = useI18n();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];
    return ENTRIES.filter((entry) =>
      `${entry.title} ${entry.id} ${entry.kind}`.toLowerCase().includes(normalized),
    ).slice(0, 60);
  }, [query]);

  return (
    <section className="source-directory">
      <header>
        <span>{locale === "en-US" ? "SOURCE DIRECTORY" : "DIRECTORIO DE FUENTES"}</span>
        <h2>
          {locale === "en-US"
            ? "Find a title's recorded sources"
            : "Consulta las fuentes registradas de un título"}
        </h2>
        <p>
          {locale === "en-US"
            ? `${ENTRIES.length} metadata and artwork source records are currently indexed.`
            : `Actualmente hay ${ENTRIES.length} registros de fuentes de metadatos e imágenes.`}
        </p>
      </header>
      <label>
        <span className="sr-only">{locale === "en-US" ? "Search sources" : "Buscar fuentes"}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            locale === "en-US" ? "Search Iron Man, Loki, X-Men…" : "Busca Iron Man, Loki, X-Men…"
          }
        />
      </label>
      {query.trim().length >= 2 && (
        <div className="source-results">
          {results.length ? (
            results.map((entry, index) => (
              <article key={`${entry.id}-${entry.kind}-${index}`}>
                <div>
                  <strong>{entry.title}</strong>
                  <small>{entry.kind}</small>
                </div>
                <a href={entry.source} target="_blank" rel="noreferrer">
                  {locale === "en-US" ? "Open source" : "Abrir fuente"}
                </a>
              </article>
            ))
          ) : (
            <p>
              {locale === "en-US"
                ? "No recorded source matches that search."
                : "No hay fuentes registradas que coincidan."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
