import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
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
  openGraph: {
    title: "Kelime Merdiveni - Günlük Kelime Oyunu",
    description: "Bugünün kelime merdivenini sen kaç adımda ineceksin?",
    url: "https://kelimemerdiveni.com",
    type: "website",
    locale: "tr_TR",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-27R4HYNP2P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-27R4HYNP2P');
          `}
        </Script>
      </body>
    </html>
  );
}

