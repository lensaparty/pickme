import Image from "next/image";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function ReviewList({
  photos,
  onRemove,
}: {
  photos: Photo[];
  onRemove: (photoId: string) => void;
}) {
  return (
    <div className="columns-2 gap-3 sm:grid sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
      {photos.map((photo, index) => (
        <article
          key={photo.id}
          className={cn(
            "group relative mb-3 break-inside-avoid overflow-hidden rounded-[24px] border border-white/10 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:mb-0 sm:rounded-[32px] sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] sm:shadow-[0_24px_80px_rgba(0,0,0,0.3)]",
          )}
        >
          <div className={cn("relative overflow-hidden sm:aspect-[4/5]", getMobileAspectClass(photo.id))}>
            <Image
              src={photo.src}
              alt={photo.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_34%,rgba(0,0,0,0.74)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_20%,rgba(0,0,0,0.86)_100%)]" />
            <div className="absolute inset-0 ring-1 ring-inset ring-amber-200/24" />
            <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
              <Badge className="bg-black/28 px-2.5 py-1 text-[11px] backdrop-blur-xl sm:px-3">
                {String(index + 1).padStart(2, "0")}
              </Badge>
              <span className="rounded-full border border-amber-200/24 bg-black/26 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-100 backdrop-blur-xl sm:px-3 sm:text-[11px]">
                Shortlisted
              </span>
            </div>
            <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border border-white/12 bg-black/24 text-white backdrop-blur-xl hover:bg-black/32 sm:h-10 sm:w-10"
                aria-label={`Remove ${photo.title}`}
                onClick={() => onRemove(photo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
              <div className="space-y-1.5">
                <h3 className="truncate text-sm font-medium text-white sm:text-xl">{photo.title}</h3>
                <p className="hidden text-sm text-stone-300 sm:block">Ready for your final shortlist.</p>
              </div>
            </div>
          </div>
          <div className="hidden border-t border-white/8 px-5 py-4 sm:block">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{photo.id}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
