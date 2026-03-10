"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, KeyRound, LockKeyhole, Mail } from "lucide-react";

import { AdminLoginState, loginWorkspaceAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AdminLoginState = {};

function AccountSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Opening workspace..." : "Sign in as admin"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function SuperSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" className="w-full" size="lg" disabled={pending}>
      {pending ? "Checking access..." : "Enter as super admin"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [accountState, accountAction] = useActionState(loginWorkspaceAction, initialState);
  const [superState, superAction] = useActionState(loginWorkspaceAction, initialState);

  return (
    <div className="space-y-6">
      <form action={accountAction} className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="mode" value="account" />
        <div className="space-y-3">
          <label className="text-sm font-medium text-white" htmlFor="admin-email">
            Admin email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input id="admin-email" name="email" type="email" className="pl-10" placeholder="nama@studio.com" />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-white" htmlFor="admin-password-account">
            Password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input id="admin-password-account" name="password" type="password" className="pl-10" placeholder="Enter your admin password" />
          </div>
          {accountState.error ? <p className="text-sm text-rose-200">{accountState.error}</p> : null}
        </div>
        <AccountSubmitButton />
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-stone-500">
        <span className="h-px flex-1 bg-white/8" />
        <span>Super admin</span>
        <span className="h-px flex-1 bg-white/8" />
      </div>

      <form action={superAction} className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="mode" value="super_admin" />
        <div className="space-y-3">
          <label className="text-sm font-medium text-white" htmlFor="super-admin-password">
            Master password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input id="super-admin-password" name="password" type="password" className="pl-10" placeholder="Deployment super admin password" />
          </div>
          {superState.error ? <p className="text-sm text-rose-200">{superState.error}</p> : null}
        </div>
        <SuperSubmitButton />
      </form>
    </div>
  );
}
