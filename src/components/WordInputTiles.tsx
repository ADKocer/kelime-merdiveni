import { toTurkishUpperCase } from "@/lib/word-input";

interface WordInputTilesProps {
  value: string;
  length: number;
  hintIndex?: number | null;
}

export function WordInputTiles({
  value,
  length,
  hintIndex = null,
}: WordInputTilesProps) {
  const slots = Array.from({ length }, (_, index) => value[index] ?? "");

  return (
    <div
      className="flex w-full max-w-full justify-center gap-1 sm:gap-2"
      role="group"
      aria-label={`Kelime girişi, ${value.length}/${length} harf`}
    >
      {slots.map((char, index) => {
        const isHint = hintIndex === index;
        return (
          <div
            key={index}
            className={`flex h-11 min-w-0 flex-1 max-w-12 items-center justify-center rounded-lg border-2 font-display text-base tracking-wide transition sm:h-12 sm:max-w-[3rem] sm:text-xl ${
              isHint
                ? "border-ladder-orange bg-ladder-orange/35 text-ladder-text ring-2 ring-ladder-orange/60"
                : char
                  ? "border-ladder-accent bg-ladder-accent/25 text-ladder-text"
                  : index === value.length
                    ? "border-ladder-accent/80 bg-ladder-bg text-ladder-muted"
                    : "border-ladder-border bg-ladder-bg/60 text-ladder-muted/60"
            }`}
            aria-hidden="true"
          >
            {char ? toTurkishUpperCase(char) : ""}
          </div>
        );
      })}
    </div>
  );
}
