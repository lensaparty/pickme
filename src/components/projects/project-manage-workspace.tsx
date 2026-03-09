import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  FolderOpenDot,
  KeyRound,
  MessageCircleMore,
  ShieldCheck,
  TimerReset,
  Trash2,
} from "lucide-react";

import { deleteProjectAction } from "@/app/projects/[code]/actions";
import { ProjectSettingsForm } from "@/components/projects/project-settings-form";
import { ProjectShareActions } from "@/components/projects/project-share-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatDisplayDate,
  formatRelativeActivity,
  getDaysUntilExpiry,
  getProjectWorkflowHint,
  getProjectWorkflowLabel,
  getProjectWorkflowState,
  isExpiringSoon,
} from "@/lib/project-utils";
import { Photo, Project } from "@/lib/types";

const toneByWorkflow = {
  awaiting_client: "warning",
  in_progress: "neutral",
  submitted: "success",
  expired: "danger",
} as const;

export function ProjectManageWorkspace({
  project,
  selectedPhotos,
  clientPath,
  reviewPath,
  inviteMessage,
  inviteUrl,
}: {
  project: Project;
  selectedPhotos: Photo[];
  clientPath: string;
  reviewPath: string;
  inviteMessage: string;
  inviteUrl: string;
}) {
  const workflow = getProjectWorkflowState(project);
  const percent = Math.min(100, Math.round((project.selectedCount / project.selectionLimit) * 100));
  const expiringSoon = isExpiringSoon(project);
  const daysUntilExpiry = getDaysUntilExpiry(project);
  const deleteAction = deleteProjectAction.bind(null, project.code);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="space-y-4 sm:space-y-5">
        <Card className="overflow-hidden">
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-col gap-5 sm:gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="warning">PickMe by Lensaparty</Badge>
                  <Badge tone={toneByWorkflow[workflow]}>{getProjectWorkflowLabel(workflow)}</Badge>
                  {expiringSoon ? <Badge tone="danger">Expiring soon</Badge> : null}
                  {project.passwordProtected ? <Badge>Private gallery</Badge> : null}
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Manage project</p>
                    <h1 className="font-display text-[2.2rem] leading-[0.96] text-white sm:text-5xl">{project.name}</h1>
                  </div>
                  <p className="max-w-3xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
                    {project.clientName} • {project.eventType}. {getProjectWorkflowHint(project)}
                  </p>
                  <p className="text-sm text-stone-500">Last activity {formatRelativeActivity(project.lastActivity)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row xl:flex-col xl:min-w-[250px]">
                <Link href={`/client/${project.code}`}>
                  <Button className="w-full">
                    <ArrowUpRight className="h-4 w-4" /> Open client flow
                  </Button>
                </Link>
                <Link href={`/client/${project.code}/gallery`}>
                  <Button variant="secondary" className="w-full">
                    <FolderOpenDot className="h-4 w-4" /> Preview gallery
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-stone-500">Client progress</p>
              <p className="mt-2 text-2xl font-semibold text-white">{project.selectedCount}/{project.selectionLimit}</p>
              <div className="mt-4">
                <Progress value={percent} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-stone-500">Link expiry</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatDisplayDate(project.expiresAt)}</p>
              <p className="mt-2 text-sm text-stone-400">
                {daysUntilExpiry === null
                  ? "Expiry date unavailable"
                  : daysUntilExpiry < 0
                    ? "Link has already closed"
                    : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} remaining`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-stone-500">Access</p>
              <p className="mt-2 text-2xl font-semibold text-white">{project.passwordProtected ? "Protected" : "Open"}</p>
              <p className="mt-2 text-sm text-stone-400">
                {project.passwordProtected ? "Password gate enabled" : "Client enters directly"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-stone-500">Gallery source</p>
              <p className="mt-2 text-2xl font-semibold text-white">{project.folderCount} folders</p>
              <p className="mt-2 text-sm text-stone-400">{project.photoCount.toLocaleString()} photos linked from Drive</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5 sm:space-y-6">
          <Card>
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Client progress</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Shortlist state</h2>
                  <p className="mt-2 max-w-2xl text-[15px] leading-6 text-stone-400 sm:text-sm">
                    Track how far the client has moved through the gallery and keep the final shortlist within easy reach.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
                  {project.selectedCount} selected so far
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-stone-300">
                    <CheckCheck className="h-4 w-4 text-amber-100" />
                    Final selection
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">
                    {project.selectedCount > 0
                      ? `${project.selectedCount} photographs are already in the shortlist.`
                      : "No client selection has been submitted yet."}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-stone-300">
                    <MessageCircleMore className="h-4 w-4 text-amber-100" />
                    Handoff route
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">Client results are delivered through the built-in WhatsApp handoff.</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-stone-300">
                    <CalendarDays className="h-4 w-4 text-amber-100" />
                    Last movement
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">Updated {formatRelativeActivity(project.lastActivity)}.</p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                {selectedPhotos.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-medium text-white">Shortlist preview</h3>
                      <Link href={`/client/${project.code}/review`} className="text-sm text-stone-300 transition hover:text-white">
                        Open final review
                      </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedPhotos.slice(0, 3).map((photo) => (
                        <article key={photo.id} className="overflow-hidden rounded-[28px] border border-white/8 bg-white/4">
                          <div className="relative aspect-[4/5]">
                            <Image
                              src={photo.src}
                              alt={photo.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_34%,rgba(0,0,0,0.82))]" />
                            <div className="absolute inset-x-0 bottom-0 p-4">
                              <p className="text-base font-medium text-white">{photo.title}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-stone-400">{photo.id}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-white/8 bg-white/4 p-5 text-sm leading-6 text-stone-400">
                    This project has not reached the final shortlist stage yet. Once the client confirms their picks, a preview will appear here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 sm:p-7">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Editable settings</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Project settings</h2>
                <p className="mt-2 text-[15px] leading-6 text-stone-400 sm:text-sm">
                  Keep the operational details tidy without letting settings overpower the project itself.
                </p>
              </div>
              <div className="mt-6">
                <ProjectSettingsForm project={project} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Share and handoff</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Client delivery</h2>
              <p className="mt-2 text-[15px] leading-6 text-stone-400 sm:text-sm">
                Keep the share link, invite text, and client preview close without crowding the main workspace.
              </p>
              <div className="mt-6">
                <ProjectShareActions
                  clientPath={clientPath}
                  reviewPath={reviewPath}
                  inviteMessage={inviteMessage}
                  inviteUrl={inviteUrl}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Project details</p>
              <div className="mt-4 space-y-4 text-sm text-stone-300">
                <div className="flex items-start gap-3">
                  <TimerReset className="mt-0.5 h-4 w-4 text-stone-500" />
                  <div>
                    <p className="text-white">Expiry</p>
                    <p className="mt-1 text-stone-400">{formatDisplayDate(project.expiresAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircleMore className="mt-0.5 h-4 w-4 text-stone-500" />
                  <div>
                    <p className="text-white">WhatsApp destination</p>
                    <p className="mt-1 text-stone-400">{project.whatsapp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {project.passwordProtected ? <KeyRound className="mt-0.5 h-4 w-4 text-stone-500" /> : <ShieldCheck className="mt-0.5 h-4 w-4 text-stone-500" />}
                  <div>
                    <p className="text-white">Access state</p>
                    <p className="mt-1 text-stone-400">{project.passwordProtected ? "Password gate enabled" : "Open access"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-500/16 bg-[linear-gradient(180deg,rgba(127,29,29,0.12),rgba(255,255,255,0.03))]">
            <CardContent className="p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Destructive actions</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Delete project</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Remove this project only when the gallery and client handoff are no longer needed.
              </p>
              <form action={deleteAction} className="mt-5">
                <Button variant="danger" className="w-full">
                  <Trash2 className="h-4 w-4" /> Delete project
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
