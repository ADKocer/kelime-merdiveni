import { toTurkishUpperCase } from "@/lib/word-input";

export interface ShareCardInput {
  puzzleNumber: number;
  path: string[];
  steps: number;
}

function WordRow({
  word,
  tileFill,
  tileBorder,
}: {
  word: string;
  tileFill: string;
  tileBorder: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
      {word.split("").map((char, index) => (
        <div
          key={index}
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            border: `2px solid ${tileBorder}`,
            backgroundColor: tileFill,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e2e8f0",
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: 30,
          }}
        >
          {toTurkishUpperCase(char)}
        </div>
      ))}
    </div>
  );
}

function MaskRow({ prev, next }: { prev: string; next: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
      {next.split("").map((_, index) => {
        const changed = prev[index] !== next[index];
        return (
          <div
            key={index}
            style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              backgroundColor: changed ? "#f97316" : "#2d3a4f",
            }}
          />
        );
      })}
    </div>
  );
}

export function ShareCard({
  puzzleNumber,
  path,
  steps,
}: ShareCardInput) {
  const stepCount = Math.max(path.length - 1, 0);
  const start = path[0] ?? "";
  const end = path[path.length - 1] ?? "";

  return (
    <div
      style={{
        width: 720,
        boxSizing: "border-box",
        padding: 48,
        backgroundColor: "#0f1419",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.18), rgba(59, 130, 246, 0) 60%)",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          border: "2px solid #2d3a4f",
          borderRadius: 28,
          backgroundColor: "#1a2332",
          padding: "32px 36px 48px",
        }}
      >
        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          KELİME MERDİVENİ
        </p>
        <p
          style={{
            margin: "8px 0 28px",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          #{puzzleNumber}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WordRow
            word={start}
            tileFill="rgba(59, 130, 246, 0.2)"
            tileBorder="#3b82f6"
          />

          {Array.from({ length: stepCount }, (_, index) => (
            <MaskRow
              key={index}
              prev={path[index]}
              next={path[index + 1]}
            />
          ))}

          <WordRow
            word={end}
            tileFill="rgba(34, 197, 94, 0.2)"
            tileBorder="#22c55e"
          />
        </div>

        <p
          style={{
            margin: "28px 0 0",
            textAlign: "center",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          {steps} adımda tamamladım
        </p>
      </div>
    </div>
  );
}
