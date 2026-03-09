import Link from "next/link";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { PasswordGate } from "@/components/client/password-gate";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasGalleryAccess } from "@/lib/auth";
import { getProjectByCode } from "@/lib/project-store";

export default async function ClientPasswordPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const project = await getProjectByCode(shareCode);

  if (!project) {
    notFound();
  }

  if (!project.passwordProtected) {
    redirect(`/client/${project.code}/gallery`);
  }

  if (await hasGalleryAccess(project)) {
    redirect(`/client/${project.code}/gallery`);
  }

  return (
    <AppShell className="max-w-5xl justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-6">
        <div className="space-y-4 sm:space-y-5">
          <Badge tone="warning">PickMe by Lensaparty</Badge>
          <div className="space-y-3">
            <h1 className="font-display text-[2.5rem] leading-[0.96] text-white sm:text-6xl">Private gallery access</h1>
            <p className="max-w-xl text-[15px] leading-6 text-stone-400 sm:text-base sm:leading-7">
              This gallery is protected for a more private viewing experience. Enter the password to continue.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.12),transparent_42%),rgba(255,255,255,0.04)] p-4 sm:rounded-[28px] sm:p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-500/14 p-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Protected entry</p>
                <p className="mt-1 text-sm leading-6 text-stone-400">A small privacy step before the gallery opens.</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-[26px] bg-amber-200/14 text-amber-100 sm:h-14 sm:w-14 sm:rounded-3xl">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div className="mt-5 space-y-2 sm:mt-6">
              <div className="flex items-center gap-2 text-stone-500">
                <Sparkles className="h-4 w-4 text-amber-100" />
                <span className="text-xs uppercase tracking-[0.28em]">Private viewing</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Enter gallery password</h2>
              <p className="text-sm leading-6 text-stone-400">Ask your photographer if you do not have it yet.</p>
            </div>
            <PasswordGate shareCode={project.code} />
            <div className="mt-3">
              <Link href={`/client/${project.code}`}>
                <Button variant="secondary" className="w-full">Back</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
