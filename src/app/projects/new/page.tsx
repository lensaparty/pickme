import { NewProjectForm } from "@/components/forms/new-project-form";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth";

export default async function NewProjectPage() {
  await requireAdminAccess("/projects/new");

  return (
    <AppShell>
      <Topbar />
      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <Badge tone="warning">PickMe by Lensaparty</Badge>
          <div className="max-w-3xl space-y-3">
            <h1 className="font-display text-[2.45rem] leading-[0.96] text-white sm:text-6xl">Create a project with the same calm premium feel.</h1>
            <p className="max-w-2xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
              Set up the gallery, selection flow, and client handoff in a page that feels polished, quiet, and easy to complete.
            </p>
          </div>
        </div>
        <NewProjectForm />
      </section>
    </AppShell>
  );
}
