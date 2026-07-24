"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1419] px-4 text-[#e2e8f0]">
      <div className="max-w-md rounded-2xl border border-[#2d3a4f] bg-[#1a2332] p-8 text-center">
        <h1 className="mb-2 text-xl font-semibold">Bir hata oluştu</h1>
        <p className="mb-6 text-sm text-[#94a3b8]">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#3b82f6] px-5 py-2 font-medium text-white"
        >
          Tekrar dene
        </button>
      </div>
    </main>
  );
}
