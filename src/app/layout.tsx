import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import { CookieConsent } from "@/components/CookieConsent";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kelimemerdiveni.com"),
  title: "Kelime Merdiveni - Word Ladder Türkçe",
  description:
    "Dünyaca ünlü Word Ladder oyununun Türkçe versiyonu Kelime Merdiveni! Başlangıç kelimesinden hedef kelimeye sadece tek harf değiştirerek ulaş. Hemen Word Ladder Türkçe oyna!",
  alternates: {
    canonical: "https://kelimemerdiveni.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Kelime Merdiveni - Günlük Kelime Oyunu",
    description: "Bugünün kelime merdivenini sen kaç adımda ineceksin?",
    url: "https://kelimemerdiveni.com",
    siteName: "Kelime Merdiveni",
    type: "website",
    locale: "tr_TR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kelime Merdiveni - Günlük Türkçe Kelime Oyunu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelime Merdiveni - Günlük Kelime Oyunu",
    description: "Bugünün kelime merdivenini sen kaç adımda ineceksin?",
    images: ["/og-image.png"],
  },
  verification: {
    google: "Gkcmp88GE5PcHSSljZDgkwRVujPDUkoQjJ5yzFOluHk",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kelime Merdiveni",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`dark h-full overflow-x-hidden ${inter.variable} ${outfit.variable}`}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full overflow-x-hidden overscroll-x-none bg-ladder-bg font-sans text-ladder-text antialiased [touch-action:manipulation]">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

