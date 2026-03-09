import { CheckCircle2, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { ProjectSuccessActions } from "@/components/projects/project-success-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { readProjectPassword, requireAdminAccess } from "@/lib/auth";
import { buildClientPath, buildProjectInviteUrl, formatDisplayDate } from "@/lib/project-utils";
import { getProjectByCode, getProjects } from "@/lib/project-store";

export default async function ProjectSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  await requireAdminAccess("/projects/success");
  const { code } = await searchParams;
  const project = code ? await getProjectByCode(code) : (await getProjects())[0];

  if (!project) {
    notFound();
  }

  const clientPath = buildClientPath(project.code);
  const appOrigin = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const localClientLink = `${appOrigin}${clientPath}`;
  const shareProject = project.passwordProtected
    ? { ...project, password: readProjectPassword(project) }
    : project;
  const inviteUrl = buildProjectInviteUrl(shareProject, localClientLink);

  return (
    <AppShell className="max-w-6xl">
      <Topbar />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-[26px] bg-emerald-500/14 text-emerald-200 sm:h-14 sm:w-14 sm:rounded-3xl">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <Badge tone="success" className="mt-6">Project created</Badge>
            <h1 className="mt-5 font-display text-[2.45rem] leading-[0.96] text-white sm:text-6xl">Your client link is ready to share.</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-stone-400 sm:mt-4 sm:text-base sm:leading-7">
              Everything is prepared: the gallery path is ready, the client flow is in place, and the next step is clear.
            </p>

            <div className="mt-6 rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.14),transparent_40%),rgba(255,255,255,0.03)] p-4 sm:mt-8 sm:rounded-[30px] sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Client link</p>
              <div className="mt-3 rounded-[24px] border border-white/8 bg-black/25 p-4">
                <p className="text-base font-medium text-white break-all">{localClientLink}</p>
                <p className="mt-1 text-sm text-stone-500">Expires on {formatDisplayDate(project.expiresAt)}</p>
              </div>
            </div>

            <ProjectSuccessActions link={localClientLink} previewPath={clientPath} whatsappUrl={inviteUrl} />
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="space-y-3.5 p-5 sm:space-y-4 sm:p-6">
              <div className="flex items-start gap-3 rounded-[24px] border border-white/8 bg-white/5 p-4">
                <div className="rounded-2xl bg-amber-200/14 p-2 text-amber-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">PickMe by Lensaparty</p>
                  <p className="mt-1 text-sm leading-6 text-stone-400">Luxury photo workflow, built for modern photographers.</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Ready-to-share details</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  {project.clientName} • {project.eventType} • selection cap {project.selectionLimit} photos.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Client access</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  {project.passwordProtected ? "Password protection is enabled for this project." : "No password gate is enabled for this project."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 sm:p-6">
              <p className="text-sm font-medium text-white">What to do next</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-stone-400">
                <p>1. Send the client link while the project is still fresh.</p>
                <p>2. Preview the flow once if you want to check the handoff.</p>
                <p>3. Return to the dashboard when you are ready to continue.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
