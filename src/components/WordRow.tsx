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
    start: "border-ladder-accent/60 bg-ladder-accent/10",
    end: "border-ladder-success/60 bg-ladder-success/10",
    goal: "border-ladder-success/40 bg-ladder-success/5",
    step: "border-ladder-orange/60 bg-ladder-orange/15",
    default: "border-ladder-border bg-ladder-bg/50",
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
                ? "rounded bg-ladder-orange/30 px-0.5 text-ladder-orange"
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
