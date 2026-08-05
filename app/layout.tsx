import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { Providers } from "@/app/providers";
import {
  brand,
  splashImagePath,
  splashMediaQuery,
  splashTargets,
  siteUrl,
} from "@/lib/brand";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Fonte de display da loja (Sprint 7): condensada e pesada, para títulos
 * curtos em caixa alta — o "grito" da fachada de hamburgueria. Peso único
 * (400 é o único da Anton); corpo de texto continua na Geist.
 */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Imagem única de compartilhamento (gerada por `pnpm brand:assets`). Páginas
 * que merecerem preview próprio — um produto, uma promoção — sobrescrevem
 * `openGraph.images` no seu próprio `metadata`.
 */
const ogImage = {
  url: "/brand/og-default.png",
  width: 1200,
  height: 630,
  alt: `${brand.name} — ${brand.tagline}`,
};

export const metadata: Metadata = {
  // Sem `metadataBase` o Next emite URL relativa no og:image e nenhuma rede
  // social consegue buscar a imagem.
  metadataBase: siteUrl(),
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: brand.shortName,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: brand.locale,
    title: brand.name,
    description: brand.description,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
    images: [ogImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: brand.colors.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      {/*
        Splash do PWA no iOS: o Safari só aceita `apple-touch-startup-image`
        via <link>, e só usa a imagem cuja media query casa exatamente com o
        aparelho — daí uma tag por resolução. No Android o manifest resolve.
      */}
      <head>
        {splashTargets.map((target) => (
          <link
            key={splashImagePath(target)}
            rel="apple-touch-startup-image"
            href={splashImagePath(target)}
            media={splashMediaQuery(target)}
          />
        ))}
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
