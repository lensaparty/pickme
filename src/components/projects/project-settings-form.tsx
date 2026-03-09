"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { ManageProjectFormState, updateProjectSettingsAction } from "@/app/projects/[code]/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving changes..." : "Save project settings"}
    </Button>
  );
}

export function ProjectSettingsForm({ project }: { project: Project }) {
  const initialState: ManageProjectFormState = { error: "", success: "" };
  const updateAction = updateProjectSettingsAction.bind(null, project.code);
  const [state, formAction] = useActionState(updateAction, initialState);

  return (
    <form action={formAction} className="space-y-4 sm:space-y-5">
      <FormError message={state.error} />
      {state.success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Project name</label>
          <Input name="name" defaultValue={project.name} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Client name</label>
          <Input name="clientName" defaultValue={project.clientName} />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Event type</label>
          <Input name="eventType" defaultValue={project.eventType} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Selection limit</label>
          <Input name="selectionLimit" type="number" min="1" defaultValue={String(project.selectionLimit)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Link expiry</label>
          <Input name="expiresAt" type="date" defaultValue={project.expiresAt.slice(0, 10)} />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">WhatsApp handoff</label>
          <div className="relative">
            <MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input name="whatsapp" className="pl-10" defaultValue={project.whatsapp} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Gallery password</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input name="password" className="pl-10" placeholder="Leave blank to keep the current password" />
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-[24px] border border-white/8 bg-white/4 p-4">
          <Checkbox name="passwordProtected" defaultChecked={project.passwordProtected} />
          <span className="space-y-1">
            <span className="block text-sm font-medium text-white">Private entry</span>
            <span className="block text-sm leading-6 text-stone-500">Require a password before the client can enter the gallery.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-[24px] border border-white/8 bg-white/4 p-4">
          <Checkbox name="allowDownloads" defaultChecked={project.allowDownloads} />
          <span className="space-y-1">
            <span className="block text-sm font-medium text-white">Allow downloads</span>
            <span className="block text-sm leading-6 text-stone-500">Keep direct downloads available alongside photo selection.</span>
          </span>
        </label>
      </div>

      <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.1),transparent_40%),rgba(255,255,255,0.04)] p-4 sm:rounded-[28px] sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-200/14 p-2 text-amber-100">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium text-white">Client-facing note</p>
              <p className="mt-1 text-sm leading-6 text-stone-400">Keep the message short, warm, and easy to follow.</p>
            </div>
            <Textarea name="welcomeMessage" defaultValue={project.welcomeMessage} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-stone-400">
          <ShieldCheck className="h-4 w-4 text-stone-500" />
          Saved changes update both the admin view and client-facing flow.
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
