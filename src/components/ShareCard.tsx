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
            color: "#f1f5f9",
            fontFamily: "Outfit, Inter, system-ui, sans-serif",
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

/** Spoiler’sız ara basamak: tüm kutular aynı renk. */
function StepRow({ length }: { length: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
      {Array.from({ length }, (_, index) => (
        <div
          key={index}
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            border: "2px solid #3b4c66",
            backgroundColor: "rgba(96, 165, 250, 0.12)",
          }}
        />
      ))}
    </div>
  );
}

export function ShareCard({ puzzleNumber, path, steps }: ShareCardInput) {
  const start = path[0] ?? "";
  const end = path[path.length - 1] ?? "";
  const wordLength = start.length || end.length || 4;
  const middleSteps = Math.max(steps - 1, 0);

  return (
    <div
      style={{
        width: 720,
        boxSizing: "border-box",
        padding: 48,
        backgroundColor: "#0c1118",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.22), rgba(96, 165, 250, 0) 60%)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div
        style={{
          border: "2px solid #3b4c66",
          borderRadius: 28,
          backgroundColor: "#1e293b",
          padding: "32px 36px 36px",
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
            fontFamily: "Outfit, Inter, system-ui, sans-serif",
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          #{puzzleNumber}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WordRow
            word={start}
            tileFill="rgba(96, 165, 250, 0.25)"
            tileBorder="#60a5fa"
          />

          {Array.from({ length: middleSteps }, (_, index) => (
            <StepRow key={index} length={wordLength} />
          ))}

          <WordRow
            word={end}
            tileFill="rgba(52, 211, 153, 0.25)"
            tileBorder="#34d399"
          />
        </div>
      </div>
    </div>
  );
}
