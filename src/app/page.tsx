import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { requireAdminAccess } from "@/lib/auth";
import { getProjects } from "@/lib/project-store";

export default async function DashboardPage() {
  await requireAdminAccess("/");
  const projects = await getProjects();

  return (
    <AppShell className="max-w-[96rem]">
      <Topbar />
      <DashboardWorkspace projects={projects} />
    </AppShell>
  );
}
