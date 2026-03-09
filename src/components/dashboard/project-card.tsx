import Link from "next/link";
import { CalendarDays, FolderOpenDot, KeyRound, ShieldCheck, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatDisplayDate,
  formatRelativeActivity,
  getDaysUntilExpiry,
  getProjectSecondaryActionLabel,
  getProjectWorkflowHint,
  getProjectWorkflowLabel,
  getProjectWorkflowState,
  isExpiringSoon,
} from "@/lib/project-utils";
import { Project } from "@/lib/types";

const toneByWorkflow = {
  awaiting_client: "warning",
  in_progress: "neutral",
  submitted: "success",
  expired: "danger",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const workflow = getProjectWorkflowState(project);
  const percent = Math.min(100, Math.round((project.selectedCount / project.selectionLimit) * 100));
  const expiringSoon = isExpiringSoon(project);
  const daysUntilExpiry = getDaysUntilExpiry(project);
  const primaryHref = `/projects/${project.code}`;
  const secondaryHref = `/client/${project.code}/gallery`;

  return (
    <Card className="overflow-hidden transition duration-200 hover:border-white/14 hover:bg-white/[0.055]">
      <CardContent className="p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={toneByWorkflow[workflow]}>{getProjectWorkflowLabel(workflow)}</Badge>
              {expiringSoon ? <Badge tone="danger">Expiring soon</Badge> : null}
              {project.passwordProtected ? <Badge>Password protected</Badge> : null}
              <span className="text-xs uppercase tracking-[0.22em] text-stone-500">{project.code}</span>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={primaryHref}
                  className="rounded-md transition hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]"
                >
                  <h3 className="text-[1.55rem] font-semibold leading-tight text-white sm:text-[1.9rem]">{project.name}</h3>
                </Link>
                <p className="text-[14px] text-stone-500 sm:text-[15px]">Last activity {formatRelativeActivity(project.lastActivity)}</p>
              </div>
              <p className="max-w-3xl text-[14px] leading-6 text-stone-400 sm:text-[15px] sm:leading-7">
                {project.clientName} • {project.eventType} • {getProjectWorkflowHint(project)}
              </p>
            </div>

            <div className="grid gap-3 text-sm text-stone-300 sm:grid-cols-2 lg:max-w-[560px]">
              <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3.5 sm:py-4">
                <p className="text-stone-500">Gallery</p>
                <p className="mt-1.5 font-medium text-white">
                  {project.photoCount.toLocaleString()} photos • {project.folderCount} folders
                </p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3.5 sm:py-4">
                <p className="text-stone-500">Selection</p>
                <p className="mt-1.5 font-medium text-white">
                  {project.selectedCount}/{project.selectionLimit} selected
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[440px] space-y-3.5 rounded-[24px] border border-white/8 bg-black/18 p-4 sm:rounded-[28px] sm:p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-stone-400">
                <span>Client progress</span>
                <span className="font-medium text-white">{project.selectedCount}/{project.selectionLimit}</span>
              </div>
              <Progress value={percent} />
              <p className="text-[14px] leading-6 text-stone-400 sm:text-[15px]">
                {percent === 0 ? "Shortlist has not started yet." : `${percent}% of the selection cap is already used.`}
              </p>
            </div>

            <div className="grid gap-3 text-sm text-stone-300 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3.5 sm:py-4">
                <div className="flex items-center gap-2 text-stone-400">
                  <CalendarDays className="h-4 w-4 text-stone-500" />
                  Expires
                </div>
                <p className="mt-2 text-base font-medium text-white">{formatDisplayDate(project.expiresAt)}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3.5 sm:py-4">
                <div className="flex items-center gap-2 text-stone-400">
                  {project.passwordProtected ? <KeyRound className="h-4 w-4 text-stone-500" /> : <ShieldCheck className="h-4 w-4 text-stone-500" />}
                  Access
                </div>
                <p className="mt-2 text-base font-medium text-white">{project.passwordProtected ? "Password gate" : "Open entry"}</p>
              </div>
            </div>

            {expiringSoon && daysUntilExpiry !== null ? (
              <div className="flex items-center gap-2 rounded-[22px] border border-rose-500/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <TimerReset className="h-4 w-4 shrink-0" />
                {daysUntilExpiry === 0
                  ? "This project expires today."
                  : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} left before the client link expires.`}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-[22px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-stone-400">
                <FolderOpenDot className="h-4 w-4 shrink-0 text-stone-500" />
                Client gallery is ready for review and sharing.
              </div>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link href={primaryHref} className="flex-[1.15]">
                <Button className="w-full">Manage project</Button>
              </Link>
              <Link href={secondaryHref} className="flex-1">
                <Button variant="secondary" className="w-full">{getProjectSecondaryActionLabel(project)}</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
