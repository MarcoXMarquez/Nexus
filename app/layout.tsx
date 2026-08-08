import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "../desktop/styles.css";
import "./cloud/cloud.css";
import "./features/discovery.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const description = "Tu recorrido interactivo por las películas, series y ramas del multiverso Marvel.";
  return {
    metadataBase,
    title: "Nexus · MCU Tracker",
    description,
    manifest: "/manifest.webmanifest",
    applicationName: "Nexus MCU Tracker",
    icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Nexus MCU" },
    openGraph: { title: "Nexus · MCU Tracker", description, images: [{ url: "/og.png", width: 2048, height: 1024 }], type: "website" },
    twitter: { card: "summary_large_image", title: "Nexus · MCU Tracker", description, images: ["/og.png"] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a0d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
