import { ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthActor, isSuperAdminAuthEnabled } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isSuperAdminAuthEnabled() && process.env.NODE_ENV === "production") {
    redirect("/");
  }

  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/") ? next : "/";
  const actor = await getAuthActor();

  if (actor) {
    redirect(nextPath);
  }

  return (
    <AppShell className="max-w-5xl justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4 sm:space-y-5">
          <Badge tone="warning">PickMe by Lensaparty</Badge>
          <div className="space-y-3">
            <h1 className="font-display text-[2.5rem] leading-[0.96] text-white sm:text-6xl">
              Enter the admin workspace.
            </h1>
            <p className="max-w-xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
              Super admin keeps the master controls. Each admin account signs in with its own email and only sees its own client work.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.12),transparent_42%),rgba(255,255,255,0.04)] p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-500/14 p-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Protected admin access</p>
                  <p className="mt-1 text-[14px] leading-6 text-stone-400 sm:text-sm">
                    Dashboard and project controls stay behind either a personal admin account or the master password.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/8 p-2 text-stone-200">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Per-admin ownership</p>
                  <p className="mt-1 text-[14px] leading-6 text-stone-400 sm:text-sm">
                    Admin accounts only see the projects and clients assigned to their own workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Workspace sign-in</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Unlock the workspace</h2>
            <p className="mt-2 text-[15px] leading-6 text-stone-400 sm:text-sm">
              Use an admin account for day-to-day work. Use the master password for super admin controls.
            </p>
            <div className="mt-6">
              <AdminLoginForm nextPath={nextPath} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
