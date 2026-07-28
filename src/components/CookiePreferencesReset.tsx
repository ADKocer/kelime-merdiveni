"use client";

import { COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";

export function CookiePreferencesReset() {
  function resetPreferences() {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch {
      // sessizce devam
    }
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={resetPreferences}
      className="rounded-lg border border-ladder-border px-4 py-2 text-sm font-medium text-ladder-text transition hover:border-ladder-text"
    >
      Çerez tercihlerini yeniden seç
    </button>
  );
}
