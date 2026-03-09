"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PickMe global error", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
          <div className="w-full rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">PickMe by Lensaparty</p>
            <h1 className="mt-4 font-display text-[2.4rem] leading-[0.96] text-white sm:text-5xl">
              Something went wrong.
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
              The workspace hit an unexpected error. Try again first. If this keeps happening, check the server logs.
            </p>
            <div className="mt-6">
              <Button onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
