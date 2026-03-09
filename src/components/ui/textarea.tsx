import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-28 w-full rounded-3xl border border-white/10 bg-black/24 px-4 py-3.5 text-sm leading-6 text-stone-100 outline-none placeholder:text-stone-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus:border-amber-200/36 focus:bg-black/32 focus:ring-2 focus:ring-amber-200/16",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
