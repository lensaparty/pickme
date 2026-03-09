import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">{title}</h2>
          {description ? <p className="max-w-2xl text-sm leading-7 text-stone-400 sm:text-base">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
