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
  title: "Kelime Merdiveni",
  description:
    "Her gün yeni bir merdiven: başlangıç kelimesinden hedefe, her adımda bir harf değiştirerek ulaş.",
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
      </body>
    </html>
  );
}

