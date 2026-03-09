import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-white/10 bg-black/24 px-4 text-sm text-stone-100 outline-none placeholder:text-stone-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus:border-amber-200/36 focus:bg-black/32 focus:ring-2 focus:ring-amber-200/16",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
