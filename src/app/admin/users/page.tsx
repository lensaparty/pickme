import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { AdminUserManagement } from "@/components/admin/admin-user-management";
import { Badge } from "@/components/ui/badge";
import { requireSuperAdminAccess } from "@/lib/auth";
import { getUsers } from "@/lib/user-store";

export default async function AdminUsersPage() {
  await requireSuperAdminAccess("/admin/users");
  const users = await getUsers();

  return (
    <AppShell>
      <Topbar />
      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <Badge tone="warning">PickMe by Lensaparty</Badge>
          <div className="max-w-3xl space-y-3">
            <h1 className="font-display text-[2.45rem] leading-[0.96] text-white sm:text-6xl">Manage admin workspaces.</h1>
            <p className="max-w-2xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
              Super admin creates each admin account here. Every admin then works inside its own client and project space.
            </p>
          </div>
        </div>
        <AdminUserManagement users={users} />
      </section>
    </AppShell>
  );
}
