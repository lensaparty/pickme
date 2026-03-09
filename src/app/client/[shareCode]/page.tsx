import Link from "next/link";
import { Download, Images, LockKeyhole, MessageCircleMore, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasGalleryAccess } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/project-utils";
import { getProjectByCode } from "@/lib/project-store";

export default async function ClientEntryPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const project = await getProjectByCode(shareCode);

  if (!project) {
    notFound();
  }

  const selectHref =
    project.passwordProtected && !(await hasGalleryAccess(project))
      ? `/client/${project.code}/password`
      : `/client/${project.code}/gallery`;

  return (
    <AppShell className="max-w-6xl">
      <div className="grid gap-5 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <Badge tone="warning" className="w-fit">PickMe by Lensaparty</Badge>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-display text-[2.6rem] leading-[0.96] text-white sm:text-6xl">A calm place to choose what matters.</h1>
            <p className="max-w-2xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
              {project.welcomeMessage}
            </p>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm text-stone-400 sm:flex-wrap">
            <span className="min-w-max rounded-full border border-white/10 bg-white/5 px-3.5 py-2">{project.code}</span>
            <span className="min-w-max rounded-full border border-white/10 bg-white/5 px-3.5 py-2">Select up to {project.selectionLimit}</span>
            <span className="min-w-max rounded-full border border-white/10 bg-white/5 px-3.5 py-2">Expires {formatDisplayDate(project.expiresAt)}</span>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="grid gap-3 p-4 sm:gap-4 sm:p-7">
            <Link href={selectHref}>
              <div className="group rounded-[24px] border border-amber-200/18 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.14),transparent_42%),rgba(255,255,255,0.05)] p-4 transition hover:border-amber-200/24 hover:bg-white/8 sm:rounded-[28px] sm:p-5">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="rounded-2xl bg-amber-200/14 p-2.5 text-amber-100 sm:p-3">
                    <Images className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-base font-medium text-white sm:text-lg">Select photos</p>
                    <p className="text-[14px] leading-6 text-stone-400 sm:text-sm">
                      Browse the gallery, keep your favorites, then send the final shortlist back through WhatsApp.
                    </p>
                    <p className="pt-1 text-[11px] uppercase tracking-[0.22em] text-amber-100/90 sm:text-xs">
                      Start the selection flow
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            {project.allowDownloads ? (
              <Link href={`/client/${project.code}/gallery`}>
                <div className="group rounded-[24px] border border-white/8 bg-white/5 p-4 transition hover:border-white/16 hover:bg-white/8 sm:rounded-[28px] sm:p-5">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="rounded-2xl bg-white/8 p-2.5 text-stone-200 sm:p-3">
                      <Download className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-base font-medium text-white sm:text-lg">Download photos</p>
                      <p className="text-[14px] leading-6 text-stone-400 sm:text-sm">
                        Open the gallery directly if you want to browse folders or download original files.
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : null}
            <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.12),transparent_42%),rgba(255,255,255,0.04)] p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-500/14 p-2 text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Made to feel easy</p>
                  <p className="mt-1 text-[14px] leading-6 text-stone-400 sm:text-sm">The flow stays simple on purpose, so you can focus on the images instead of the interface.</p>
                </div>
              </div>
            </div>
            {project.passwordProtected ? (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <LockKeyhole className="h-4 w-4" /> This gallery uses a password before selection begins.
              </div>
            ) : null}
            <Button variant="ghost" className="h-10 w-full justify-center text-sm">
              <MessageCircleMore className="h-4 w-4" /> Need help opening the gallery?
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
