"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCookieConsent,
  loadGoogleAnalytics,
  setCookieConsent,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === "all") {
      loadGoogleAnalytics();
      return;
    }
    if (consent === null) {
      setVisible(true);
    }
  }, []);

  function choose(choice: CookieConsentChoice) {
    setCookieConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-ladder-border bg-ladder-surface/95 p-4 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-5">
        <h2
          id="cookie-consent-title"
          className="mb-2 text-sm font-semibold text-ladder-text sm:text-base"
        >
          Çerez tercihleri
        </h2>
        <p
          id="cookie-consent-desc"
          className="mb-4 text-xs leading-relaxed text-ladder-muted sm:text-sm"
        >
          Oyunun çalışması için zorunlu çerezler kullanılır. Ziyaret
          istatistiklerini anlamak için Google Analytics çerezleri isteğe
          bağlıdır; yalnızca onay vermeniz hâlinde yüklenir. Ayrıntılar için{" "}
          <Link
            href="/cerezler"
            className="text-ladder-accent underline-offset-2 hover:underline"
          >
            Çerez Politikası
          </Link>
          nı inceleyebilirsiniz.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-lg border border-ladder-border px-4 py-2.5 text-sm font-medium text-ladder-text transition hover:border-ladder-text"
          >
            Yalnızca zorunlu
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-lg bg-ladder-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Analitik çerezleri kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
