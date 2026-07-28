import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="page-atmosphere flex min-h-screen flex-col text-ladder-text">
      <div className="safe-top safe-bottom mx-auto w-full max-w-3xl flex-1 px-3 py-6 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-ladder-muted transition hover:text-ladder-text"
        >
          ← Ana sayfa
        </Link>
        <article className="rounded-2xl border border-ladder-border bg-ladder-surface/95 p-5 shadow-xl shadow-black/10 sm:p-8">
          <h1 className="font-display mb-6 text-2xl font-bold sm:text-3xl">
            {title}
          </h1>
          <div className="legal-prose space-y-4 text-sm leading-relaxed text-ladder-muted sm:text-base">
            {children}
          </div>
          <p className="mt-8 border-t border-ladder-border pt-4 text-xs text-ladder-muted">
            Son güncelleme: 28 Temmuz 2026
          </p>
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}
