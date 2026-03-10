import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { canAccessProject, requireAdminAccess } from "@/lib/auth";
import { getProjects } from "@/lib/project-store";

export default async function DashboardPage() {
  const actor = await requireAdminAccess("/");
  const projects = await getProjects();
  const visibleProjects = actor.kind === "super_admin" ? projects : projects.filter((project) => canAccessProject(actor, project));

  return (
    <AppShell className="max-w-[96rem]">
      <Topbar />
      <DashboardWorkspace projects={visibleProjects} actor={actor} />
    </AppShell>
  );
}
