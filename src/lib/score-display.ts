export function getTotalScore(steps: number, hints = 0): number {
  return steps + Math.max(hints, 0);
}

export function formatScoreText(steps: number, hints = 0): string {
  const safeHints = Math.max(hints, 0);
  if (safeHints === 0) return String(steps);
  return `${steps} + ${safeHints}`;
}

export function formatScoreWithAdim(steps: number, hints = 0): string {
  const safeHints = Math.max(hints, 0);
  if (safeHints === 0) return `${steps} adım`;
  return `${steps} + ${safeHints} adım`;
}

export function isBetterScore(
  steps: number,
  hints: number,
  otherSteps: number,
  otherHints: number,
): boolean {
  const total = getTotalScore(steps, hints);
  const otherTotal = getTotalScore(otherSteps, otherHints);
  if (total !== otherTotal) return total < otherTotal;
  return hints < otherHints;
}
