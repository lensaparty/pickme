import { ReactNode } from "react";

import { Label } from "@/components/ui/label";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[15px] text-stone-100">{label}</Label>
        {hint ? <p className="text-sm leading-6 text-stone-500">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
