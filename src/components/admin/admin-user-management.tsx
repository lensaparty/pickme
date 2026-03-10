"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ShieldCheck, UserRound, UserRoundX } from "lucide-react";

import {
  AdminUserState,
  createAdminUserAction,
  resetAdminUserPasswordAction,
  toggleAdminUserStatusAction,
} from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";

const initialState: AdminUserState = {};

function CreateSubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Creating admin..." : "Create admin"}</Button>;
}

function ResetSubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Saving..." : "Reset password"}</Button>;
}

function UserPasswordForm({ userId }: { userId: string }) {
  const action = resetAdminUserPasswordAction.bind(null, userId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-[24px] border border-white/8 bg-white/4 p-4">
      <div>
        <p className="text-sm font-medium text-white">Reset password</p>
        <p className="mt-1 text-sm leading-6 text-stone-500">Set a new password for this admin account.</p>
      </div>
      <Input name="password" type="password" placeholder="New password" />
      {state.error ? <p className="text-sm text-rose-200">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-200">{state.success}</p> : null}
      <ResetSubmitButton />
    </form>
  );
}

function UserStatusForm({ user }: { user: User }) {
  const action = toggleAdminUserStatusAction.bind(null, user.id, !user.isActive);

  return (
    <form action={action}>
      <Button type="submit" variant="ghost" className="w-full justify-center">
        {user.isActive ? <UserRoundX className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
        {user.isActive ? "Deactivate admin" : "Reactivate admin"}
      </Button>
    </form>
  );
}

export function AdminUserManagement({ users }: { users: User[] }) {
  const [state, formAction] = useActionState(createAdminUserAction, initialState);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardContent className="space-y-5 p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Super admin</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Create admin account</h2>
            <p className="mt-2 text-[15px] leading-6 text-stone-400 sm:text-sm">
              Each admin gets its own login and only sees the projects assigned to its own workspace.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Admin name</label>
              <Input name="name" placeholder="LML Studio" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Admin email</label>
              <Input name="email" type="email" placeholder="admin@studio.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Temporary password</label>
              <Input name="password" type="password" placeholder="Create a strong password" />
            </div>
            {state.error ? <p className="text-sm text-rose-200">{state.error}</p> : null}
            {state.success ? <p className="text-sm text-emerald-200">{state.success}</p> : null}
            <CreateSubmitButton />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-7">
              <p className="text-base font-medium text-white">No admin accounts yet</p>
              <p className="mt-2 text-[15px] leading-7 text-stone-400">Create the first admin account so projects can start living under individual workspaces.</p>
            </CardContent>
          </Card>
        ) : null}

        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                    <Badge tone={user.isActive ? "success" : "neutral"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-400">{user.email}</p>
                </div>
                <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-stone-500">
                  Admin account
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <UserPasswordForm userId={user.id} />
                <div className="grid gap-3 lg:w-[220px]">
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-amber-200/14 p-2 text-amber-100">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Workspace scope</p>
                        <p className="mt-1 text-sm leading-6 text-stone-500">This admin only sees projects assigned to their own workspace.</p>
                      </div>
                    </div>
                  </div>
                  <UserStatusForm user={user} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
