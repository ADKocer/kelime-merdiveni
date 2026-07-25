import { toTurkishUpperCase } from "@/lib/word-input";

interface WordRowProps {
  word: string;
  label: string;
  highlight?: "start" | "end" | "goal" | "step" | "default";
  hintIndex?: number | null;
}

export function WordRow({
  word,
  label,
  highlight = "default",
  hintIndex = null,
}: WordRowProps) {
  const styles = {
    start: "border-ladder-accent bg-ladder-accent/30",
    end: "border-ladder-success bg-ladder-success/30",
    goal: "border-ladder-success/70 bg-ladder-success/15",
    step: "border-ladder-orange bg-ladder-orange/30",
    default: "border-ladder-border bg-ladder-surface",
  };

  return (
    <div
      className={`animate-pop-in flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 ${styles[highlight]}`}
    >
      <span className="shrink-0 text-xs text-ladder-muted sm:text-sm">{label}</span>
      <span className="min-w-0 shrink font-display text-lg tracking-[0.12em] sm:text-2xl sm:tracking-[0.3em]">
        {word.split("").map((char, index) => (
          <span
            key={index}
            className={
              hintIndex === index
                ? "rounded bg-ladder-orange/45 px-0.5 text-ladder-orange"
                : undefined
            }
          >
            {toTurkishUpperCase(char)}
          </span>
        ))}
      </span>
    </div>
  );
}
