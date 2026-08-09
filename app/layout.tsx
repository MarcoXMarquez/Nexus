import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./i18n/locale";
import { I18nProvider } from "./i18n/provider";
import "./globals.css";
import "../desktop/styles.css";
import "./cloud/cloud.css";
import "./features/discovery.css";
import "./legal/legal.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const storedLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(storedLocale) ? storedLocale : "es-419";
  const description =
    locale === "en-US"
      ? "Your interactive journey through Marvel movies, series, and multiverse branches."
      : "Tu recorrido interactivo por las películas, series y ramas del multiverso Marvel.";
  return {
    metadataBase,
    title: "Nexus · MCU Tracker",
    description,
    manifest: "/manifest.webmanifest",
    applicationName: "Nexus MCU Tracker",
    icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Nexus MCU" },
    openGraph: {
      title: "Nexus · MCU Tracker",
      description,
      images: [{ url: "/og.png", width: 2048, height: 1024 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Nexus · MCU Tracker",
      description,
      images: ["/og.png"],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a0d",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const storedLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(storedLocale) ? storedLocale : "es-419";
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nProvider initial={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
