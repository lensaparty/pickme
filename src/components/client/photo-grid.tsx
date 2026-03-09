import Image from "next/image";
import { CheckCircle2, Heart } from "lucide-react";

import { Photo } from "@/lib/types";
import { cn } from "@/lib/utils";

const mobileAspectClasses = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[5/7]",
  "aspect-[4/6]",
];

function getMobileAspectClass(id: string) {
  const total = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return mobileAspectClasses[total % mobileAspectClasses.length];
}

export function PhotoGrid({
  photos,
  selectedIds,
  onToggleSelection,
}: {
  photos: Photo[];
  selectedIds: string[];
  onToggleSelection: (photoId: string) => void;
}) {
  const selectedSet = new Set(selectedIds);

  return (
    <div className="columns-2 gap-2.5 sm:grid sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
      {photos.map((photo) => {
        const isSelected = selectedSet.has(photo.id);
        return (
          <article
            key={photo.id}
            className={cn(
              "group relative mb-2.5 break-inside-avoid overflow-hidden rounded-[24px] border bg-black/10 shadow-[0_16px_42px_rgba(0,0,0,0.2)] transition duration-300 sm:mb-0 sm:rounded-[32px] sm:bg-black/20 sm:shadow-[0_18px_50px_rgba(0,0,0,0.24)]",
              isSelected
                ? "border-amber-200/30 shadow-[0_24px_70px_rgba(216,162,73,0.18)]"
                : "border-white/8 hover:border-white/14",
            )}
          >
            <div className={cn("relative overflow-hidden sm:aspect-[4/5]", getMobileAspectClass(photo.id))}>
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1536px) 50vw, 33vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.01)_48%,rgba(0,0,0,0.2)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_24%,rgba(0,0,0,0.84)_100%)]" />
              {isSelected ? <div className="absolute inset-0 ring-1 ring-inset ring-amber-200/30" /> : null}

              <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
                {isSelected ? (
                  <span className="rounded-full border border-amber-200/30 bg-black/30 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100 backdrop-blur-xl sm:px-3">
                    Selected
                  </span>
                ) : null}
                {photo.favorite ? (
                  <span className="rounded-full border border-white/14 bg-black/35 p-2 text-rose-200">
                    <Heart className="h-4 w-4 fill-current" />
                  </span>
                ) : null}
              </div>

              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <button
                  type="button"
                  onClick={() => onToggleSelection(photo.id)}
                  className={cn(
                    "rounded-full border p-2.5 backdrop-blur-xl transition sm:p-3",
                    isSelected
                      ? "border-amber-200/40 bg-amber-200 text-slate-950"
                      : "border-white/14 bg-black/35 text-white hover:border-white/24",
                  )}
                  aria-pressed={isSelected}
                  aria-label={isSelected ? `Remove ${photo.title} from selection` : `Add ${photo.title} to selection`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className={cn("truncate text-sm font-medium text-white sm:text-lg", isSelected ? "opacity-100" : "opacity-0 sm:opacity-100")}>{photo.title}</p>
                    <p className="mt-1 hidden text-xs uppercase tracking-[0.24em] text-stone-400 sm:block">{photo.id}</p>
                  </div>
                  <span
                    className={cn(
                      "hidden rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em] sm:inline-flex",
                      isSelected ? "bg-amber-200/14 text-amber-100" : "bg-white/6 text-stone-400",
                    )}
                  >
                    {isSelected ? "Selected" : "Available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-5 py-4 sm:block">
              <p className="text-sm text-stone-300">{isSelected ? "Added to your selection" : "Tap to keep this frame"}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
