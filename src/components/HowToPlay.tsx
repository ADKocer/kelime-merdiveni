"use client";

import { useEffect, useRef } from "react";
import { toTurkishUpperCase } from "@/lib/word-input";

const RULES_HASH = "#nasil-oynanir";

export function HowToPlay() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash !== RULES_HASH) return;
      const details = detailsRef.current;
      if (!details) return;
      details.open = true;
      window.requestAnimationFrame(() => {
        details.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <details
      id="nasil-oynanir"
      ref={detailsRef}
      className="scroll-mt-24 rounded-xl border border-ladder-border bg-ladder-bg/60"
    >
      <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-ladder-text sm:px-4 sm:py-3 [&::-webkit-details-marker]:hidden">
        Nasıl Oynanır · Kurallar
      </summary>
      <ul className="space-y-1 px-3 pb-2 text-sm text-ladder-muted sm:px-4">
        <li>Her adımda yalnızca 1 harf değişebilir.</li>
        <li>Kelime uzunluğu sabit kalmalıdır.</li>
        <li>Tüm kelimeler oyun sözlüğünde geçerli olmalıdır.</li>
        <li>Ek eklenerek türetilmiş kelimeler kabul edilmez.</li>
        <li>İpucu sınırsızdır; skor = adım sayısı + kullanılan ipucu sayısı.</li>
        <li>
          Onur tablosunda eşit skorda daha az ipucu kullanan oyuncu önde yer
          alır.
        </li>
      </ul>
      <p className="mx-3 mb-3 rounded-lg border border-ladder-border bg-ladder-bg/80 px-3 py-2 text-sm text-ladder-text sm:mx-4">
        <span className="text-ladder-muted">Örnek: </span>
        <span className="tracking-[0.1em] sm:tracking-[0.2em]">
          {toTurkishUpperCase("koyu")} → {toTurkishUpperCase("konu")} →{" "}
          {toTurkishUpperCase("koni")}
        </span>
        <span className="text-ladder-muted"> (y-n, o-i)</span>
      </p>
      <p className="mx-3 mb-3 border-t border-ladder-border/60 pt-3 text-center text-xs text-ladder-muted/80 sm:mx-4">
        Klasik Word Ladder oyununun Türkçe versiyonudur.
      </p>
    </details>
  );
}
