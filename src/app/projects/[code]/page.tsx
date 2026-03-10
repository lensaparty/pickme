import { notFound } from "next/navigation";

import { Topbar } from "@/components/layout/topbar";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectManageWorkspace } from "@/components/projects/project-manage-workspace";
import { canAccessProject, readProjectPassword, requireAdminAccess } from "@/lib/auth";
import { getProjectGallery } from "@/lib/project-gallery";
import { buildClientPath, buildProjectInviteMessage, buildProjectInviteUrl } from "@/lib/project-utils";
import { getProjectByCode } from "@/lib/project-store";
import { getUsers } from "@/lib/user-store";

export default async function ManageProjectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const actor = await requireAdminAccess(`/projects/${code}`);
  const project = await getProjectByCode(code);

  if (!project || !canAccessProject(actor, project)) {
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
  const users = await getUsers();
  const activeAdmins = users.filter((user) => user.isActive);

  return (
    <AppShell>
      <Topbar />
      <ProjectManageWorkspace
        actor={actor}
        project={project}
        users={activeAdmins}
        selectedPhotos={selectedPhotos}
        clientPath={clientPath}
        reviewPath={`${clientPath}/review`}
        inviteMessage={inviteMessage}
        inviteUrl={inviteUrl}
      />
    </AppShell>
  );
}
