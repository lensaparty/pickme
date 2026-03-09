import * as React from "react";

import { cn } from "@/lib/utils";

const styles = {
  neutral: "border-white/10 bg-white/6 text-stone-200",
  success: "border-emerald-500/20 bg-emerald-500/12 text-emerald-200",
  warning: "border-amber-500/22 bg-amber-500/12 text-amber-100",
  danger: "border-rose-500/20 bg-rose-500/12 text-rose-100",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase",
        styles[tone],
        className,
      )}
      {...props}
    />
  );
}
