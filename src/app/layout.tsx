import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { CookieConsent } from "@/components/shared/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ODTU Pusula - Ders ve Hoca Degerlendirme",
    template: "%s | ODTU Pusula",
  },
  description:
    "ODTU ogrencileri icin ders ve hoca degerlendirme platformu. Deneyimlerini paylas, en iyi dersleri ve hocalari kesfet.",
  keywords: [
    "ODTU",
    "METU",
    "ders degerlendirme",
    "hoca degerlendirme",
    "universite",
    "ogrenci",
    "pusula",
  ],
  authors: [{ name: "ODTU Pusula" }],
  creator: "ODTU Pusula",
  publisher: "ODTU Pusula",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "ODTU Pusula",
    title: "ODTU Pusula - Ders ve Hoca Degerlendirme",
    description:
      "ODTU ogrencileri icin ders ve hoca degerlendirme platformu. Deneyimlerini paylas, en iyi dersleri ve hocalari kesfet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ODTU Pusula",
    description: "ODTU ogrencileri icin ders ve hoca degerlendirme platformu",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
