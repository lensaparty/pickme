"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { AdminLoginState, loginAdminAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AdminLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Opening workspace..." : "Enter workspace"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      <div className="space-y-3">
        <label className="text-sm font-medium text-white" htmlFor="admin-password">
          Admin password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input id="admin-password" name="password" type="password" className="pl-10" placeholder="Enter your admin password" />
        </div>
        {state.error ? <p className="text-sm text-rose-200">{state.error}</p> : null}
      </div>
      <SubmitButton />
    </form>
  );
}

