import Image from "next/image";
import { FolderHeart } from "lucide-react";

import { Folder } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FolderStrip({
  folders,
  activeFolderId,
  onSelect,
}: {
  folders: Folder[];
  activeFolderId: string;
  onSelect?: (folderId: string) => void;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500 sm:text-xs">Folder view</p>
          <p className="mt-1 hidden text-sm text-stone-400 sm:block">Move through the gallery by story, not by directory.</p>
        </div>
      </div>
      <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1.5 sm:gap-4 sm:pb-2">
      {folders.map((folder) => {
        const isActive = folder.id === activeFolderId;
        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelect?.(folder.id)}
            className={cn(
              "group min-w-[172px] max-w-[172px] snap-start overflow-hidden rounded-[22px] border text-left transition duration-300 sm:min-w-[300px] sm:max-w-[300px] sm:rounded-[30px]",
              isActive
                ? "border-amber-200/30 bg-white/8 shadow-[0_24px_60px_rgba(216,162,73,0.16)]"
                : "border-white/8 bg-white/4 hover:border-white/14 hover:bg-white/7",
            )}
          >
            <div className="relative h-24 overflow-hidden sm:h-40">
              <Image
                src={folder.cover}
                alt={folder.name}
                fill
                className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 85vw, 320px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.78))]" />
              <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/24 px-2 py-1 text-[10px] tracking-[0.2em] text-stone-200 backdrop-blur-xl sm:left-4 sm:top-4 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
                <FolderHeart className="h-3.5 w-3.5 text-amber-100" />
                Curated set
              </div>
            </div>
            <div className="space-y-1.5 p-3.5 sm:space-y-2 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white sm:text-base">{folder.name}</p>
                  <p className="mt-0.5 text-[13px] text-stone-400 sm:mt-1 sm:text-sm">{folder.photoCount} photos</p>
                </div>
                {isActive ? (
                  <span className="rounded-full border border-amber-200/30 bg-amber-200/14 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100">
                    Open
                  </span>
                ) : null}
              </div>
              {folder.highlight ? <p className="hidden text-sm leading-6 text-stone-300 sm:block">{folder.highlight}</p> : null}
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}
