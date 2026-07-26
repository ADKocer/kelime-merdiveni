import { GameBoard } from "@/components/GameBoard";

export default function Home() {
  return (
    <main className="page-atmosphere min-h-screen w-full max-w-[100vw] overflow-x-hidden text-ladder-text">
      <div className="safe-top safe-bottom mx-auto flex min-h-screen w-full min-w-0 max-w-5xl flex-col px-3 py-4 sm:px-6 sm:py-8">
        <GameBoard />
      </div>
    </main>
  );
}
