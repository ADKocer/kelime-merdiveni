"use client";

import { useState } from "react";

const PREVIEW_LENGTH = 180;

function previewText(text: string, maxLength = PREVIEW_LENGTH): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const lastComma = cut.lastIndexOf(", ");
  const breakAt = Math.max(lastSpace, lastComma);
  if (breakAt > maxLength * 0.55) {
    return `${cut.slice(0, breakAt).trim()}…`;
  }
  return `${cut.trim()}…`;
}

interface MeaningTextProps {
  text: string;
  className?: string;
}

export function MeaningText({ text, className = "" }: MeaningTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > PREVIEW_LENGTH;
  const visible = !isLong || expanded ? text : previewText(text);

  return (
    <span className={className}>
      <span className="break-words">{visible}</span>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="ml-1 inline text-ladder-accent underline-offset-2 hover:underline"
        >
          {expanded ? "kısalt" : "devamı"}
        </button>
      )}
    </span>
  );
}
