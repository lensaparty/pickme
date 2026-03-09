import { notFound } from "next/navigation";

import { Topbar } from "@/components/layout/topbar";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectManageWorkspace } from "@/components/projects/project-manage-workspace";
import { readProjectPassword, requireAdminAccess } from "@/lib/auth";
import { getProjectGallery } from "@/lib/project-gallery";
import { buildClientPath, buildProjectInviteMessage, buildProjectInviteUrl } from "@/lib/project-utils";
import { getProjectByCode } from "@/lib/project-store";

export default async function ManageProjectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  await requireAdminAccess(`/projects/${code}`);
  const project = await getProjectByCode(code);

  if (!project) {
    notFound();
  }

  const gallery = await getProjectGallery(project);
  const selectedIds = new Set(project.selectedIds ?? []);
  const selectedPhotos = gallery.photos.filter((photo) => selectedIds.has(photo.id));
  const appOrigin = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const clientPath = buildClientPath(project.code);
  const clientLink = `${appOrigin}${clientPath}`;
  const inviteProject =
    project.passwordProtected && project.password
      ? { ...project, password: readProjectPassword(project) }
      : project;
  const inviteMessage = buildProjectInviteMessage(inviteProject, clientLink);
  const inviteUrl = buildProjectInviteUrl(inviteProject, clientLink);

  return (
    <AppShell>
      <Topbar />
      <ProjectManageWorkspace
        project={project}
        selectedPhotos={selectedPhotos}
        clientPath={clientPath}
        reviewPath={`${clientPath}/review`}
        inviteMessage={inviteMessage}
        inviteUrl={inviteUrl}
      />
    </AppShell>
  );
}
