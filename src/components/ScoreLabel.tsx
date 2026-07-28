import { formatScoreText } from "@/lib/score-display";

interface ScoreLabelProps {
  steps: number;
  hints?: number;
  className?: string;
  hintClassName?: string;
}

export function ScoreLabel({
  steps,
  hints = 0,
  className,
  hintClassName = "text-ladder-orange",
}: ScoreLabelProps) {
  const safeHints = Math.max(hints, 0);

  if (safeHints === 0) {
    return <span className={className}>{steps}</span>;
  }

  return (
    <span className={className}>
      {steps}
      <span className={hintClassName}> + {safeHints}</span>
    </span>
  );
}

export function scoreLabelPlain(steps: number, hints = 0): string {
  return formatScoreText(steps, hints);
}
