import type { CSSProperties } from "react";
import { toTurkishUpperCase } from "@/lib/word-input";

interface WordRowProps {
  word: string;
  label: string;
  highlight?: "start" | "end" | "goal" | "step" | "default";
  hintIndex?: number | null;
  /** Değişen harf (kalıcı turuncu vurgu) */
  changedIndex?: number | null;
  /** Yeni basamak kayarak gelsin */
  animateIn?: boolean;
  /** Tamamlama pulse */
  celebrate?: boolean;
  /** Son kelime: tüm harfler yeşil (turuncu vurgu yok) */
  glowAllLetters?: boolean;
  /** Tamamlandıktan sonra anlam gösterimi */
  meaningEnabled?: boolean;
  meaning?: string | null;
  meaningOpen?: boolean;
  onToggleMeaning?: () => void;
}

const PARTICLE_OFFSETS = [
  { dx: "-42px", dy: "-36px", delay: "0ms" },
  { dx: "38px", dy: "-40px", delay: "40ms" },
  { dx: "-28px", dy: "30px", delay: "70ms" },
  { dx: "46px", dy: "22px", delay: "20ms" },
  { dx: "0px", dy: "-48px", delay: "55ms" },
  { dx: "-50px", dy: "8px", delay: "90ms" },
  { dx: "52px", dy: "-8px", delay: "110ms" },
  { dx: "12px", dy: "42px", delay: "130ms" },
  { dx: "-14px", dy: "-28px", delay: "150ms" },
  { dx: "24px", dy: "34px", delay: "75ms" },
] as const;

export function WordRow({
  word,
  label,
  highlight = "default",
  hintIndex = null,
  changedIndex = null,
  animateIn = true,
  celebrate = false,
  glowAllLetters = false,
  meaningEnabled = false,
  meaning = null,
  meaningOpen = false,
  onToggleMeaning,
}: WordRowProps) {
  const styles = {
    start: "border-ladder-accent bg-ladder-accent/30",
    end: "border-ladder-success bg-ladder-success/30",
    goal: "border-ladder-success/70 bg-ladder-success/15",
    step: "border-ladder-orange bg-ladder-orange/30",
    default: "border-ladder-border bg-ladder-surface",
  };

  const motionClass = celebrate
    ? "animate-celebrate"
    : animateIn
      ? highlight === "step" || highlight === "end"
        ? "animate-step-in"
        : "animate-pop-in"
      : "";

  const canShowMeaning = meaningEnabled && Boolean(meaning) && onToggleMeaning;
  const rowClassName = `relative flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-colors duration-300 sm:px-4 sm:py-3 ${styles[highlight]} ${motionClass} ${
    canShowMeaning
      ? "cursor-pointer hover:border-ladder-text/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ladder-accent"
      : ""
  } ${meaningOpen ? "ring-1 ring-ladder-accent/60" : ""}`;

  const rowContent = (
    <>
      {celebrate && (
        <span className="celebrate-particles" aria-hidden="true">
          {PARTICLE_OFFSETS.map((particle, index) => (
            <span
              key={index}
              className="celebrate-particle"
              style={
                {
                  "--dx": particle.dx,
                  "--dy": particle.dy,
                  animationDelay: particle.delay,
                } as CSSProperties
              }
            />
          ))}
        </span>
      )}

      <span className="relative z-[1] shrink-0 text-xs text-ladder-muted sm:text-sm">
        {label}
      </span>
      <span className="relative z-[1] min-w-0 shrink font-display text-lg tracking-[0.12em] sm:text-2xl sm:tracking-[0.3em]">
        {word.split("").map((char, index) => {
          const isHint = hintIndex === index;
          const isChanged = !glowAllLetters && changedIndex === index;
          let letterClass: string | undefined;
          if (glowAllLetters) {
            letterClass = celebrate
              ? "animate-letter-celebrate"
              : "letter-celebrated";
          } else if (celebrate) {
            letterClass = "animate-letter-celebrate";
          } else if (isChanged) {
            letterClass = animateIn ? "animate-letter-flash" : "letter-changed";
          } else if (isHint) {
            letterClass = "text-ladder-orange";
          }
          return (
            <span
              key={index}
              className={letterClass}
              style={
                glowAllLetters && celebrate
                  ? { animationDelay: `${index * 55}ms` }
                  : undefined
              }
            >
              {toTurkishUpperCase(char)}
            </span>
          );
        })}
      </span>
    </>
  );

  return (
    <div className="flex min-w-0 flex-col gap-0">
      {canShowMeaning ? (
        <button
          type="button"
          onClick={onToggleMeaning}
          aria-expanded={meaningOpen}
          aria-label={`${toTurkishUpperCase(word)} anlamını ${meaningOpen ? "gizle" : "göster"}`}
          className={rowClassName}
        >
          {rowContent}
        </button>
      ) : (
        <div className={rowClassName}>{rowContent}</div>
      )}

      {meaningOpen && meaning && (
        <p className="animate-pop-in px-1 pt-2 text-sm leading-relaxed text-ladder-muted">
          {meaning}
        </p>
      )}
    </div>
  );
}
