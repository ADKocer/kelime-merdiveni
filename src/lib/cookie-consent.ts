export const COOKIE_CONSENT_KEY = "km_cookie_consent";
export const GA_MEASUREMENT_ID = "G-27R4HYNP2P";

/** Zorunlu çerezler dışında analitik çerezler reddedildi. */
export type CookieConsentChoice = "essential" | "all";

export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "essential" || stored === "all") return stored;
  } catch {
    // localStorage kullanılamıyorsa banner gösterilir
  }
  return null;
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    // tercih kaydedilemezse yine de GA yüklenmez
  }
  if (choice === "all") {
    loadGoogleAnalytics();
  }
}

export function loadGoogleAnalytics(): void {
  if (typeof window === "undefined") return;
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaLoaded?: boolean;
  }
}
