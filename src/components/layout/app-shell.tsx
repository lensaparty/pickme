import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,203,118,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(201,122,74,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      <main className={cn("relative mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8", className)}>
        {children}
      </main>
    </div>
  );
}
