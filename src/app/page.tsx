import { GameBoard } from "@/components/GameBoard";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="page-atmosphere flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden text-ladder-text">
      <div className="safe-top mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-8">
        <GameBoard />
      </div>
      <SiteFooter />
    </main>
  );
}
