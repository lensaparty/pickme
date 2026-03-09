"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  MessageCircleMore,
  SendHorizonal,
  Sparkles,
} from "lucide-react";

import { ReviewList } from "@/components/client/review-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectSelection } from "@/hooks/use-project-selection";
import { buildWhatsAppSelectionMessage, buildWhatsAppUrl } from "@/lib/project-utils";
import { Photo, Project, ProjectGallery } from "@/lib/types";
import { formatPhotoCount, formatSelectionCount } from "@/lib/utils";

const sourceLabel: Record<ProjectGallery["source"], string> = {
  drive_api: "Live from Google Drive",
  apps_script: "Synced from Apps Script",
  fallback: "Preview gallery data",
};

export function ReviewExperience({
  project,
  photos,
  gallerySource,
}: {
  project: Project;
  photos: Photo[];
  gallerySource: ProjectGallery["source"];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { hydrated, selectedPhotos, removeSelection, selectedIds } = useProjectSelection({
    shareCode: project.code,
    initialPhotos: photos,
    selectionLimit: project.selectionLimit,
  });

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(project, selectedPhotos), [project, selectedPhotos]);
  const whatsappMessage = useMemo(
    () => buildWhatsAppSelectionMessage(project, selectedPhotos),
    [project, selectedPhotos],
  );

  async function handleSend() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${project.id}/selection`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedIds,
          selectedCount: selectedPhotos.length,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync project selection.");
      }

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while preparing the WhatsApp handoff.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyList() {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the shortlist right now.");
    }
  }

  return (
    <section className="space-y-5 pb-28 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(248,217,139,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:rounded-[30px] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/client/${project.code}/gallery`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-300 transition hover:border-white/16 hover:bg-white/8 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit selection
                </Link>
                <Badge tone="warning">Final review</Badge>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">PickMe by Lensaparty</p>
                  <h1 className="font-display text-[2.2rem] leading-[0.96] text-white sm:text-5xl">Your shortlisted photos.</h1>
                </div>
                <p className="max-w-3xl text-[15px] leading-7 text-stone-400 sm:text-base">
                  Take one last look before sending. This final view stays calm and photo-first so your shortlist is easy to confirm.
                </p>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-stone-300">
              {selectedPhotos.length} of {project.selectionLimit} selected
            </div>
          </div>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm text-stone-400">
          <div className="inline-flex min-w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-amber-100" />
            Final WhatsApp handoff
          </div>
          <div className="inline-flex min-w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            {sourceLabel[gallerySource]}
          </div>
          <div className="inline-flex min-w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Closes {new Date(project.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {hydrated && selectedPhotos.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Final gallery review</h2>
                <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-stone-400 sm:mt-2 sm:text-sm sm:leading-6">
                  These are the photographs you have chosen to send. Remove anything that no longer belongs, then continue with the handoff.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
                {formatPhotoCount(selectedPhotos.length)}
              </span>
            </div>
            <ReviewList photos={selectedPhotos} onRemove={removeSelection} />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-10">
              <h2 className="text-2xl font-semibold text-white">No shortlisted photos yet</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-6 text-stone-400 sm:text-sm">
                Return to the gallery to begin selecting the images you want to keep. This review stays quiet until there is something worth confirming.
              </p>
              <div className="mt-6">
                <Link href={`/client/${project.code}/gallery`}>
                  <Button variant="secondary">
                    <ArrowLeft className="h-4 w-4" /> Back to gallery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hidden h-fit xl:sticky xl:top-6 xl:block">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Send shortlist</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Ready when you are.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              Your selected frames will be prepared in a clean WhatsApp summary for the photographer.
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
                <p className="text-sm text-stone-500">Selection</p>
                <p className="mt-1 text-lg font-medium text-white">{selectedPhotos.length} photos ready</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">Any last removal here will update the final handoff instantly.</p>
              </div>
            </div>
            {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
            <div className="mt-6 flex flex-col gap-3">
              <Button className="w-full" disabled={submitting || selectedPhotos.length === 0} onClick={handleSend}>
                <SendHorizonal className="h-4 w-4" /> {submitting ? "Preparing handoff..." : "Send shortlist via WhatsApp"}
              </Button>
              <Link href={`/client/${project.code}/gallery`}>
                <Button variant="secondary" className="w-full">
                  <ArrowLeft className="h-4 w-4" /> Edit selection
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={handleCopyList} disabled={selectedPhotos.length === 0}>
                <Copy className="h-4 w-4" /> {copied ? "Shortlist copied" : "Copy shortlist"}
              </Button>
              <Button variant="ghost" className="w-full justify-center">
                <MessageCircleMore className="h-4 w-4" /> Contact photographer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {hydrated && selectedPhotos.length > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4 xl:hidden">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.12),transparent_40%),rgba(12,12,12,0.9)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <Badge tone="warning">{formatSelectionCount(selectedPhotos.length, project.selectionLimit)}</Badge>
                  <p className="text-sm text-stone-400">Ready to send in a clean WhatsApp shortlist.</p>
                </div>
                <Button onClick={handleSend} disabled={submitting} className="min-w-[176px]">
                  <SendHorizonal className="h-4 w-4" /> {submitting ? "Preparing..." : "Send shortlist"}
                </Button>
              </div>
              {error ? <p className="text-sm text-rose-200">{error}</p> : null}
              <div className="flex items-center justify-between gap-4 text-sm text-stone-400">
                <Link href={`/client/${project.code}/gallery`} className="text-stone-300 transition hover:text-white">
                  Edit selection
                </Link>
                <button
                  type="button"
                  onClick={handleCopyList}
                  className="text-stone-300 transition hover:text-white"
                >
                  {copied ? "Shortlist copied" : "Copy shortlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
