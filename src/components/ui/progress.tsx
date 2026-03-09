import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", className)}>
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#f6d07e_0%,#d89f48_100%)] shadow-[0_0_18px_rgba(216,162,73,0.18)]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
