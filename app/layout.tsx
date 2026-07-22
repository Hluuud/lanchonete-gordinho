import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { Providers } from "@/app/providers";
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

export const metadata: Metadata = {
  title: {
    default: "Lanchonete do Gordinho",
    template: "%s · Lanchonete do Gordinho",
  },
  description:
    "Cardápio digital e autoatendimento da Lanchonete do Gordinho. Peça em segundos.",
};

export const viewport: Viewport = {
  themeColor: "#d62828",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
