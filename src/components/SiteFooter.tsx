import Link from "next/link";

const CONTACT = {
  email: "kelimemerdiveni@gmail.com",
  xHandle: "KelimeMerdiveni",
  tiktokHandle: "kelime.merdiveni",
} as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ladder-border/80 bg-ladder-surface/50">
      <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
        <nav
          className="mb-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm"
          aria-label="Site alt menüsü"
        >
          <Link
            href="/#nasil-oynanir"
            className="text-ladder-text underline-offset-2 transition hover:text-ladder-accent hover:underline"
          >
            Nasıl Oynanır
          </Link>
          <Link
            href="/gizlilik"
            className="text-ladder-muted underline-offset-2 transition hover:text-ladder-text hover:underline"
          >
            Gizlilik
          </Link>
          <Link
            href="/cerezler"
            className="text-ladder-muted underline-offset-2 transition hover:text-ladder-text hover:underline"
          >
            Çerezler
          </Link>
        </nav>

        <div className="mb-5 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ladder-muted">
            İletişim
          </p>
          <ul className="space-y-1.5 text-sm text-ladder-text">
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="underline-offset-2 transition hover:text-ladder-accent hover:underline"
              >
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={`https://x.com/${CONTACT.xHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ladder-muted underline-offset-2 transition hover:text-ladder-text hover:underline"
              >
                X @{CONTACT.xHandle}
              </a>
            </li>
            <li>
              <a
                href={`https://www.tiktok.com/@${CONTACT.tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ladder-muted underline-offset-2 transition hover:text-ladder-text hover:underline"
              >
                TikTok @{CONTACT.tiktokHandle}
              </a>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-ladder-muted/90">
          © {new Date().getFullYear()} Kelime Merdiveni · kelimemerdiveni.com
        </p>
        <p className="mt-1 text-center text-[11px] text-ladder-muted/70">
          Günlük Türkçe kelime oyunu
        </p>
      </div>
    </footer>
  );
}
