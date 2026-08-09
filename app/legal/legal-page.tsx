"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useI18n } from "../i18n/provider";
import { LanguageSwitcher } from "../i18n/language-switcher";
import { LegalLinks } from "./legal-links";
import { SourceDirectory } from "./source-directory";

export type LegalPageKind = "about" | "credits" | "contact" | "privacy" | "terms";

const project = {
  creator: "Marco Marquez",
  legalName: "Marco Antonio Marquez Herrera",
  location: "Arequipa, Peru",
  email: "marcomarquezherrera@gmail.com",
  github: "https://github.com/MarcoXMarquez/Nexus",
  linkedin: "https://www.linkedin.com/in/mmarquezhe/",
};

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="legal-section">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function About() {
  const { locale } = useI18n();
  const en = locale === "en-US";
  return (
    <>
      <Section
        eyebrow={en ? "THE PROJECT" : "EL PROYECTO"}
        title={
          en
            ? "A fan's journey through the Marvel multiverse"
            : "Un recorrido de fans por el multiverso Marvel"
        }
      >
        <p>
          {en
            ? "Nexus is an independent, student-built tracker for movies, series, episodes, timelines, achievements, and shared watch marathons. It was designed to make a large audiovisual catalog easier and more enjoyable to explore."
            : "Nexus es un tracker independiente desarrollado por un estudiante para películas, series, capítulos, líneas temporales, logros y maratones compartidos. Fue diseñado para hacer que un catálogo audiovisual enorme sea más sencillo y agradable de explorar."}
        </p>
        <div className="legal-callout">
          <strong>{en ? "Unoﬃcial prototype" : "Prototipo no oficial"}</strong>
          <p>
            {en
              ? "Nexus is not affiliated with, endorsed, sponsored, or approved by Marvel, The Walt Disney Company, Sony Pictures, or their affiliates."
              : "Nexus no está afiliado, respaldado, patrocinado ni aprobado por Marvel, The Walt Disney Company, Sony Pictures ni sus filiales."}
          </p>
        </div>
      </Section>
      <Section eyebrow={en ? "CREATOR" : "CREADOR"} title={project.creator}>
        <p>
          {en
            ? `Nexus was created by ${project.legalName}, a student and independent developer based in ${project.location}. The project is currently free, with no advertising, purchases, or subscriptions.`
            : `Nexus fue creado por ${project.legalName}, estudiante y desarrollador independiente de ${project.location}. Actualmente el proyecto es gratuito y no contiene publicidad, compras ni suscripciones.`}
        </p>
        <div className="legal-actions">
          <a href={project.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={project.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${project.email}`}>{en ? "Email Marco" : "Escribir a Marco"}</a>
        </div>
      </Section>
      <Section
        eyebrow={en ? "PURPOSE" : "PROPÓSITO"}
        title={en ? "Built for learning and for fans" : "Creado para aprender y para los fans"}
      >
        <p>
          {en
            ? "The goal is to keep Nexus available as a free fan experience, use it as a professional portfolio project, and seek the appropriate permissions or a possible future collaboration with the relevant rights holders."
            : "El objetivo es mantener Nexus como una experiencia gratuita para fans, utilizarlo como proyecto de portafolio profesional y solicitar los permisos adecuados o una posible colaboración futura con los titulares de derechos."}
        </p>
      </Section>
    </>
  );
}

function Credits() {
  const { locale } = useI18n();
  const en = locale === "en-US";
  return (
    <>
      <Section
        eyebrow={en ? "RIGHTS" : "DERECHOS"}
        title={en ? "Ownership and attribution" : "Titularidad y atribución"}
      >
        <p>
          {en
            ? "Marvel names, characters, logos, movie and series artwork, and related marks belong to their respective rights holders. Marvel and related properties are associated with Marvel Entertainment and The Walt Disney Company; some Spider-Man productions and imagery are controlled by Sony Pictures; legacy productions may involve additional studios and licensors."
            : "Los nombres, personajes, logos, imágenes de películas y series de Marvel y demás marcas relacionadas pertenecen a sus respectivos titulares. Marvel y sus propiedades están relacionadas con Marvel Entertainment y The Walt Disney Company; algunas producciones e imágenes de Spider-Man son controladas por Sony Pictures; las producciones heredadas pueden involucrar estudios y licenciantes adicionales."}
        </p>
        <p>
          {en
            ? "Identification of a source or owner is attribution, not a claim of permission, endorsement, or ownership by Nexus. Rights holders may request correction or removal through the contact page."
            : "Identificar una fuente o titular constituye atribución; no significa que Nexus tenga permiso, respaldo o propiedad sobre el material. Los titulares pueden solicitar una corrección o retirada desde la página de contacto."}
        </p>
      </Section>
      <Section eyebrow="TMDB" title="The Movie Database">
        <a
          className="tmdb-official-link"
          href="https://www.themoviedb.org/about/logos-attribution"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/brand/tmdb-approved.svg"
            alt="The Movie Database (TMDB)"
            width={220}
            height={16}
          />
          {en ? "Official logos & attribution" : "Logos y atribución oficial"}
        </a>
        <div className="legal-callout tmdb">
          <strong>This product uses the TMDB API but is not endorsed or certified by TMDB.</strong>
        </div>
        <p>
          {en
            ? "Nexus uses TMDB as a recorded source for part of its posters, backdrops, title logos, and audiovisual metadata. TMDB does not claim ownership of third-party movie imagery."
            : "Nexus utiliza TMDB como fuente registrada de parte de sus pósteres, fondos, logos de títulos y metadatos audiovisuales. TMDB no afirma ser propietario de las imágenes cinematográficas de terceros."}
        </p>
      </Section>
      <Section
        eyebrow={en ? "DATA" : "DATOS"}
        title={en ? "Wikipedia and public references" : "Wikipedia y referencias públicas"}
      >
        <p>
          {en
            ? "Selected runtimes, episode information, release details, and summaries were assembled from linked Wikipedia pages, TVmaze, official announcements, and other public references. Wikipedia text is available under Creative Commons licenses; Nexus records source links and does not reproduce full articles."
            : "Determinadas duraciones, datos de episodios, estrenos y resúmenes fueron recopilados desde páginas enlazadas de Wikipedia, TVmaze, anuncios oficiales y otras referencias públicas. El texto de Wikipedia está disponible bajo licencias Creative Commons; Nexus conserva los enlaces y no reproduce artículos completos."}
        </p>
      </Section>
      <Section
        eyebrow={en ? "ORIGINAL ART" : "ARTE ORIGINAL"}
        title={en ? "Artwork created for Nexus" : "Imágenes creadas para Nexus"}
      >
        <p>
          {en
            ? "The 126 achievement badges and 12 panoramic achievement backgrounds were generated specifically for Nexus with OpenAI image-generation tools and reviewed as SFW application artwork. The green timeline-tree background was also created as a Nexus visual asset. These images do not grant Nexus rights over Marvel characters or trademarks depicted or referenced by the surrounding product."
            : "Los 126 badges de logros y los 12 fondos panorámicos de logros fueron generados específicamente para Nexus con herramientas de generación de imágenes de OpenAI y revisados como arte SFW para la aplicación. El fondo verde del árbol temporal también fue creado como recurso visual de Nexus. Estas imágenes no otorgan a Nexus derechos sobre personajes o marcas de Marvel representados o mencionados por el producto."}
        </p>
      </Section>
      <Section
        eyebrow={en ? "AUDIT STATUS" : "ESTADO DE AUDITORÍA"}
        title={
          en ? "Internet-sourced promotional artwork" : "Material promocional obtenido de internet"
        }
      >
        <p>
          {en
            ? "Some promotional posters and legacy assets were collected from public internet sources before a complete rights inventory existed. They remain under review. Assets without verifiable provenance will be replaced, removed, or included in a permission request before any commercial use."
            : "Algunos pósteres promocionales y recursos heredados se recopilaron desde fuentes públicas de internet antes de existir un inventario completo. Continúan bajo revisión. Los recursos sin procedencia verificable serán reemplazados, retirados o incluidos en una solicitud de permiso antes de cualquier uso comercial."}
        </p>
      </Section>
      <SourceDirectory />
    </>
  );
}

function Contact() {
  const { locale } = useI18n();
  const en = locale === "en-US";
  const mail = (subject: string) =>
    `mailto:${project.email}?subject=${encodeURIComponent(subject)}`;
  return (
    <>
      <Section
        eyebrow={en ? "CONTACT" : "CONTACTO"}
        title={en ? "How can we help?" : "¿En qué podemos ayudar?"}
      >
        <p>
          {en
            ? "Nexus is maintained independently by Marco Marquez. Choose the most relevant contact reason so the request can be reviewed clearly."
            : "Nexus es mantenido de forma independiente por Marco Marquez. Elige el motivo más adecuado para que la solicitud pueda revisarse claramente."}
        </p>
        <div className="contact-grid">
          <a href={mail("Nexus — Rights holder request")}>
            <strong>{en ? "Rights holder" : "Titular de derechos"}</strong>
            <span>
              {en
                ? "Request attribution correction, restriction, or removal."
                : "Solicitar corrección de atribución, restricción o retirada."}
            </span>
          </a>
          <a href={mail("Nexus — Privacy request")}>
            <strong>{en ? "Privacy" : "Privacidad"}</strong>
            <span>
              {en
                ? "Ask about personal data, access, or deletion."
                : "Consultar sobre datos personales, acceso o eliminación."}
            </span>
          </a>
          <a href={mail("Nexus — Data correction")}>
            <strong>{en ? "Catalog correction" : "Corrección del catálogo"}</strong>
            <span>
              {en
                ? "Report an incorrect date, episode, title, or connection."
                : "Reportar una fecha, episodio, título o conexión incorrecta."}
            </span>
          </a>
          <a href={mail("Nexus — Partnership inquiry")}>
            <strong>{en ? "Partnership" : "Colaboración"}</strong>
            <span>
              {en
                ? "Discuss permissions or a professional collaboration."
                : "Conversar sobre permisos o colaboración profesional."}
            </span>
          </a>
        </div>
        <div className="legal-callout">
          <strong>{project.email}</strong>
          <p>
            {en
              ? "Requests are reviewed by the independent project creator."
              : "Las solicitudes son revisadas por el creador independiente del proyecto."}
          </p>
        </div>
      </Section>
      <Section
        eyebrow={en ? "RIGHTS REQUESTS" : "SOLICITUDES DE DERECHOS"}
        title={en ? "Information to include" : "Información que debes incluir"}
      >
        <ul>
          <li>
            {en
              ? "Your name, organization, and relationship to the material."
              : "Tu nombre, organización y relación con el material."}
          </li>
          <li>
            {en
              ? "The exact Nexus page, title, or asset involved."
              : "La página, título o recurso exacto de Nexus involucrado."}
          </li>
          <li>
            {en
              ? "The requested action and a reliable way to reply."
              : "La acción solicitada y un medio fiable para responder."}
          </li>
          <li>
            {en
              ? "Evidence of authority when requesting removal on behalf of a rights holder."
              : "Evidencia de autoridad cuando solicites una retirada en nombre de un titular."}
          </li>
        </ul>
      </Section>
      <Section
        eyebrow={en ? "OFFICIAL CHANNELS" : "CANALES OFICIALES"}
        title={en ? "Marvel, Disney, and Sony" : "Marvel, Disney y Sony"}
      >
        <p>
          {en
            ? "Nexus cannot grant rights in Marvel, Disney, or Sony properties. Licensing and permission requests must be sent to the relevant rights holder through an official channel."
            : "Nexus no puede conceder derechos sobre propiedades de Marvel, Disney o Sony. Las solicitudes de licencia y permiso deben enviarse al titular correspondiente mediante un canal oficial."}
        </p>
        <div className="legal-actions">
          <a
            href="https://disneypermissions.my.salesforce-sites.com/WelcomeIntakePage/"
            target="_blank"
            rel="noreferrer"
          >
            Disney Permissions
          </a>
          <a href="https://www.marvel.com/corporate/advertising" target="_blank" rel="noreferrer">
            Marvel Partnerships
          </a>
          <a href="https://www.sonypictures.com/corp/help.html" target="_blank" rel="noreferrer">
            Sony Pictures Licensing
          </a>
        </div>
      </Section>
    </>
  );
}

function Privacy() {
  const { locale } = useI18n();
  const en = locale === "en-US";
  return (
    <>
      <Section
        eyebrow={en ? "PRIVACY" : "PRIVACIDAD"}
        title={en ? "Your progress belongs to you" : "Tu progreso te pertenece"}
      >
        <p>
          {en
            ? "Nexus stores only the information needed to provide accounts, synchronization, profiles, progress, achievements, marathons, and social features. It does not sell personal information and currently has no advertising or payment system."
            : "Nexus almacena únicamente la información necesaria para cuentas, sincronización, perfiles, progreso, logros, maratones y funciones sociales. No vende información personal y actualmente no contiene publicidad ni sistemas de pago."}
        </p>
      </Section>
      <Section
        eyebrow={en ? "COLLECTED DATA" : "DATOS RECOPILADOS"}
        title={en ? "What Nexus stores" : "Qué guarda Nexus"}
      >
        <ul>
          <li>
            {en
              ? "Account email, authentication identifiers, and profile name."
              : "Correo de cuenta, identificadores de autenticación y nombre de perfil."}
          </li>
          <li>
            {en
              ? "Watched titles and episodes, dates, ratings, favorites, notes, and preferences."
              : "Títulos y capítulos vistos, fechas, calificaciones, favoritos, notas y preferencias."}
          </li>
          <li>
            {en
              ? "Marathons, achievements, device records, invitations, and synchronization status."
              : "Maratones, logros, dispositivos, invitaciones y estado de sincronización."}
          </li>
          <li>
            {en
              ? "Friend relationships and the visibility settings you choose."
              : "Relaciones de amistad y la visibilidad que elijas."}
          </li>
        </ul>
      </Section>
      <Section
        eyebrow={en ? "STORAGE" : "ALMACENAMIENTO"}
        title={en ? "Local and cloud processing" : "Procesamiento local y en la nube"}
      >
        <p>
          {en
            ? "Guest progress is stored in the browser. Signed-in progress is synchronized with Supabase. The website is hosted on Vercel. These providers process technical information required to deliver their services under their own privacy terms."
            : "El progreso de invitados se guarda en el navegador. El progreso de usuarios registrados se sincroniza con Supabase. La web está alojada en Vercel. Estos proveedores procesan información técnica necesaria para prestar sus servicios bajo sus propias políticas."}
        </p>
        <div className="legal-actions">
          <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">
            Supabase Privacy
          </a>
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
            Vercel Privacy
          </a>
        </div>
      </Section>
      <Section
        eyebrow={en ? "YOUR CONTROL" : "TU CONTROL"}
        title={en ? "Access and deletion" : "Acceso y eliminación"}
      >
        <p>
          {en
            ? "You can change social visibility, sign out devices, and permanently delete your cloud account from Nexus. You may also email the project address to request access, correction, or deletion. Deleting local browser data separately removes guest-only progress from that device."
            : "Puedes cambiar la visibilidad social, desvincular dispositivos y eliminar definitivamente tu cuenta cloud desde Nexus. También puedes escribir al correo del proyecto para solicitar acceso, corrección o eliminación. Borrar por separado los datos del navegador elimina el progreso de invitado de ese dispositivo."}
        </p>
        <a
          className="legal-primary-action"
          href={`mailto:${project.email}?subject=${encodeURIComponent("Nexus — Privacy request")}`}
        >
          {en ? "Send a privacy request" : "Enviar solicitud de privacidad"}
        </a>
      </Section>
      <p className="legal-updated">
        {en ? "Last updated: August 8, 2026" : "Última actualización: 8 de agosto de 2026"}
      </p>
    </>
  );
}

function Terms() {
  const { locale } = useI18n();
  const en = locale === "en-US";
  return (
    <>
      <Section
        eyebrow={en ? "TERMS" : "TÉRMINOS"}
        title={en ? "Using Nexus responsibly" : "Uso responsable de Nexus"}
      >
        <p>
          {en
            ? "Nexus is an independent, experimental fan project provided without charge and on an as-is basis. By using it, you agree not to misuse accounts, invitations, social features, or the rights of other people."
            : "Nexus es un proyecto experimental e independiente de fans, ofrecido gratuitamente y en su estado actual. Al utilizarlo aceptas no hacer un uso indebido de cuentas, invitaciones, funciones sociales ni derechos de terceros."}
        </p>
      </Section>
      <Section
        eyebrow={en ? "ACCOUNTS" : "CUENTAS"}
        title={en ? "Your responsibilities" : "Tus responsabilidades"}
      >
        <ul>
          <li>
            {en
              ? "Provide accurate account information and protect your password."
              : "Proporcionar información correcta y proteger tu contraseña."}
          </li>
          <li>
            {en
              ? "Do not harass, impersonate, scrape, attack, or attempt unauthorized access."
              : "No acosar, suplantar, extraer datos, atacar ni intentar accesos no autorizados."}
          </li>
          <li>
            {en
              ? "Do not share unlawful, infringing, or harmful marathon names or profile content."
              : "No compartir nombres de maratones o contenido de perfil ilegal, infractor o dañino."}
          </li>
          <li>
            {en
              ? "Respect spoiler and privacy choices made by other users."
              : "Respetar las decisiones de spoilers y privacidad de otros usuarios."}
          </li>
        </ul>
      </Section>
      <Section
        eyebrow={en ? "CONTENT" : "CONTENIDO"}
        title={
          en
            ? "Entertainment information, not an official guide"
            : "Información de entretenimiento, no guía oficial"
        }
      >
        <p>
          {en
            ? "Dates, connections, runtimes, recommendations, availability, and narrative routes may contain mistakes or change. Nexus does not guarantee uninterrupted service, permanent storage, or availability of any specific title or image."
            : "Las fechas, conexiones, duraciones, recomendaciones, disponibilidad y rutas narrativas pueden contener errores o cambiar. Nexus no garantiza servicio ininterrumpido, almacenamiento permanente ni disponibilidad de un título o imagen específicos."}
        </p>
      </Section>
      <Section
        eyebrow={en ? "INTELLECTUAL PROPERTY" : "PROPIEDAD INTELECTUAL"}
        title={en ? "No transfer of third-party rights" : "No se transfieren derechos de terceros"}
      >
        <p>
          {en
            ? "Using Nexus does not grant rights in Marvel, Disney, Sony, studio, performer, artist, or other third-party intellectual property. Nexus may remove or replace material while permissions and provenance are reviewed."
            : "Usar Nexus no concede derechos sobre propiedad intelectual de Marvel, Disney, Sony, estudios, intérpretes, artistas u otros terceros. Nexus puede retirar o reemplazar material mientras se revisan permisos y procedencias."}
        </p>
      </Section>
      <p className="legal-updated">
        {en ? "Last updated: August 8, 2026" : "Última actualización: 8 de agosto de 2026"}
      </p>
    </>
  );
}

function LegalContent({ kind }: { kind: LegalPageKind }) {
  const { locale, t } = useI18n();
  const en = locale === "en-US";
  const titles: Record<LegalPageKind, [string, string]> = {
    about: [
      en ? "About Nexus" : "Acerca de Nexus",
      en ? "The project, its creator, and its purpose." : "El proyecto, su creador y su propósito.",
    ],
    credits: [
      en ? "Credits & rights" : "Créditos y derechos",
      en
        ? "Sources, ownership, original art, and audit status."
        : "Fuentes, titulares, arte original y estado de auditoría.",
    ],
    contact: [
      en ? "Contact" : "Contacto",
      en
        ? "Corrections, privacy, rights requests, and partnerships."
        : "Correcciones, privacidad, solicitudes de derechos y colaboraciones.",
    ],
    privacy: [
      en ? "Privacy policy" : "Política de privacidad",
      en
        ? "How Nexus stores and synchronizes your information."
        : "Cómo Nexus guarda y sincroniza tu información.",
    ],
    terms: [
      en ? "Terms of use" : "Términos de uso",
      en
        ? "The rules for using this independent prototype."
        : "Las reglas de uso de este prototipo independiente.",
    ],
  };
  const [title, subtitle] = titles[kind];
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <a className="legal-brand" href={`/?lang=${en ? "en" : "es"}`}>
          <span>N</span>
          <div>
            <strong>NEXUS</strong>
            <small>MCU TRACKER</small>
          </div>
        </a>
        <LanguageSwitcher compact />
      </header>
      <section className="legal-hero">
        <small>{t("unofficial")}</small>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
      <LegalLinks className="legal-page-nav" />
      <article className="legal-content">
        {kind === "about" && <About />}
        {kind === "credits" && <Credits />}
        {kind === "contact" && <Contact />}
        {kind === "privacy" && <Privacy />}
        {kind === "terms" && <Terms />}
      </article>
      <footer className="legal-footer">
        <span>
          © 2026 Nexus · {project.creator} · {project.location}
        </span>
        <a href={`/?lang=${en ? "en" : "es"}`}>{t("backToNexus")}</a>
      </footer>
    </main>
  );
}

export function LegalPage({ kind }: { kind: LegalPageKind }) {
  return <LegalContent kind={kind} />;
}
