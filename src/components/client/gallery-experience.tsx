"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Download,
  FolderKanban,
  Images,
  Link2,
  Sparkles,
  Trash2,
} from "lucide-react";

import { FolderStrip } from "@/components/client/folder-strip";
import { PhotoGrid } from "@/components/client/photo-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectSelection } from "@/hooks/use-project-selection";
import { Folder, Photo, Project, ProjectGallery } from "@/lib/types";
import { cn, formatPhotoCount, formatSelectionCount } from "@/lib/utils";

const sourceLabel: Record<ProjectGallery["source"], string> = {
  drive_api: "Live from Google Drive",
  apps_script: "Synced from Apps Script",
  fallback: "Preview gallery data",
};

export function GalleryExperience({
  project,
  folders,
  photos,
  gallerySource,
  totalPhotoCount,
}: {
  project: Project;
  folders: Folder[];
  photos: Photo[];
  gallerySource: ProjectGallery["source"];
  totalPhotoCount: number;
}) {
  const {
    activeFolderId,
    setActiveFolderId,
    visiblePhotos,
    selectedCount,
    selectedIds,
    remainingCount,
    toggleSelection,
    clearSelection,
    limitMessage,
  } = useProjectSelection({
    shareCode: project.code,
    initialPhotos: photos,
    selectionLimit: project.selectionLimit,
  });

  const activeFolder =
    activeFolderId === "all" ? null : folders.find((folder) => folder.id === activeFolderId);

  return (
    <section className="space-y-4 pb-28 sm:space-y-6">
      <div className="space-y-2.5 sm:space-y-4">
        <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(248,217,139,0.1),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:gap-4 sm:rounded-[30px] sm:p-6 sm:shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2.5 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/client/${project.code}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-300 transition hover:border-white/16 hover:bg-white/8 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
                <Badge tone="warning" className="hidden sm:inline-flex">PickMe by Lensaparty</Badge>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-300 sm:hidden">
                  {selectedCount}/{project.selectionLimit}
                </div>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="hidden text-xs uppercase tracking-[0.3em] text-stone-500 sm:block">Luxury photo workflow</p>
                  <h1 className="font-display text-[1.9rem] leading-[0.98] text-white sm:text-5xl">Browse the gallery with ease.</h1>
                </div>
                <p className="max-w-2xl text-[14px] leading-6 text-stone-400 sm:max-w-3xl sm:text-base sm:leading-7">{project.welcomeMessage}</p>
              </div>
            </div>
            <div className="hidden min-w-full grid-cols-3 gap-2.5 sm:grid sm:gap-3 lg:min-w-[360px] lg:max-w-[440px]">
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Selected</p>
                <p className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{selectedCount}</p>
                <p className="mt-1 text-[13px] text-stone-400 sm:text-sm">of {project.selectionLimit}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Gallery</p>
                <p className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{totalPhotoCount}</p>
                <p className="mt-1 text-[13px] text-stone-400 sm:text-sm">photos</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Open set</p>
                <p className="mt-2 truncate text-base font-semibold text-white sm:mt-3 sm:text-lg">{activeFolder?.name ?? "All photos"}</p>
                <p className="mt-1 text-[13px] text-stone-400 sm:text-sm">{visiblePhotos.length} in view</p>
              </div>
            </div>
          </div>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div className="min-w-max rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-stone-300 lg:min-w-0 lg:rounded-[24px] lg:px-4 lg:py-3">
            <div className="flex items-center gap-2 text-stone-200">
              <Clock3 className="h-4 w-4 text-amber-100" />
              <span>Closes {new Date(project.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>
          <div className="min-w-max rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-stone-300 lg:min-w-0 lg:rounded-[24px] lg:px-4 lg:py-3">
            <div className="flex items-center gap-2 text-stone-200">
              <Sparkles className="h-4 w-4 text-amber-100" />
              <span>{selectedCount}/{project.selectionLimit} selected</span>
            </div>
          </div>
          <div className="min-w-max rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-stone-300 lg:min-w-0 lg:rounded-[24px] lg:px-4 lg:py-3">
            <div className="flex items-center gap-2 text-stone-200">
              <Link2 className="h-4 w-4 text-amber-100" />
              <span>{sourceLabel[gallerySource]}</span>
            </div>
          </div>
        </div>
      </div>

      <FolderStrip folders={folders} activeFolderId={activeFolderId} onSelect={setActiveFolderId} />

      <Card className="overflow-visible border-0 bg-transparent shadow-none backdrop-blur-0 sm:overflow-hidden sm:border sm:border-white/10 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] sm:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:backdrop-blur-xl">
        <CardContent className="p-0 sm:p-6">
          <div className="mb-3 flex flex-col gap-2.5 sm:mb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2 sm:space-y-3">
              <div className="hidden flex-wrap items-center gap-3 text-sm text-stone-400 sm:flex">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <FolderKanban className="h-4 w-4" />
                  {activeFolder?.name ?? "All photos"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Images className="h-4 w-4" />
                  {formatPhotoCount(visiblePhotos.length)} in view
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white sm:text-2xl">Choose the frames you want to keep.</h2>
                <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-stone-400 sm:mt-2 sm:text-sm sm:leading-6">
                  Tap each image to build your shortlist. The selection stays visible, but the photographs remain the focus.
                </p>
              </div>
            </div>
            {project.allowDownloads ? (
              <Button variant="secondary" className="hidden self-start lg:self-auto">
                <Download className="h-4 w-4" /> Download this set
              </Button>
            ) : null}
          </div>
          <PhotoGrid photos={visiblePhotos} selectedIds={selectedIds} onToggleSelection={toggleSelection} />
        </CardContent>
      </Card>

      <div
        className={cn(
          "fixed inset-x-0 bottom-4 z-40 px-4 sm:px-6",
          selectedCount === 0 ? "pointer-events-none opacity-0 sm:pointer-events-auto sm:opacity-100" : "opacity-100",
        )}
      >
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.12),transparent_40%),rgba(12,12,12,0.9)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={selectedCount > 0 ? "warning" : "neutral"}>{formatSelectionCount(selectedCount, project.selectionLimit)}</Badge>
                <span className="text-sm text-stone-400">
                  {selectedCount === 0
                    ? "Select the photographs you want to keep, then continue to review."
                    : `${remainingCount} more can still be added before you review.`}
                </span>
              </div>
              {limitMessage ? <p className="text-sm text-amber-100">{limitMessage}</p> : null}
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              {selectedCount > 0 ? (
                <Button variant="ghost" onClick={clearSelection} className="justify-center sm:justify-center">
                  <Trash2 className="h-4 w-4" /> Clear selection
                </Button>
              ) : null}
              <Link href={`/client/${project.code}/review`} className="w-full sm:w-auto">
                <Button className="w-full sm:min-w-[210px]">Review selection</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
