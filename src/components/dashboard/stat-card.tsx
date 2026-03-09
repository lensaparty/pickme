import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <Card
      className={cn(
        "overflow-hidden transition duration-200 hover:border-white/14 hover:bg-white/[0.07]",
        active
          ? "border-amber-200/24 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.12),transparent_42%),rgba(255,255,255,0.05)]"
          : undefined,
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{label}</p>
            <p className="text-[1.8rem] font-semibold tracking-tight text-white sm:text-[2.35rem]">{value}</p>
          </div>
          <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:justify-between sm:gap-3">
            <p className="max-w-[16rem] text-[14px] leading-6 text-stone-400 sm:text-[15px] sm:leading-7">{hint}</p>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em]",
                active
                  ? "border-amber-200/26 bg-amber-200/10 text-amber-100"
                  : "border-white/10 bg-white/5 text-stone-400",
              )}
            >
              {active ? "Active" : "Filter"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}
