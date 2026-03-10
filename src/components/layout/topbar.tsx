import Link from "next/link";
import { Camera, LayoutDashboard, ShieldCheck, Sparkles, Users } from "lucide-react";

import { logoutAdminAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { getAuthActor, getActorLabel, isSuperAdminAuthEnabled } from "@/lib/auth";

export async function Topbar() {
  const actor = await getAuthActor();
  const showLogout = Boolean(actor) && (isSuperAdminAuthEnabled() || actor?.kind === "admin");
  const showUsers = actor?.kind === "super_admin";

  return (
    <header className="mb-5 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-black/20 px-3.5 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:mb-8 sm:gap-4 sm:rounded-[30px] sm:px-6 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(248,217,139,0.24),rgba(216,162,73,0.52))] text-slate-950 shadow-[0_16px_36px_rgba(216,162,73,0.22)] sm:h-12 sm:w-12">
          <Camera className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-stone-500">PickMe by Lensaparty</p>
          <div className="mt-0.5 flex items-center gap-2">
            <h1 className="font-display text-[1.45rem] leading-none text-white sm:text-[2rem]">Luxury photo workflow</h1>
            <Sparkles className="hidden h-4 w-4 text-amber-200 sm:block" />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-stone-500 sm:mt-1 sm:text-sm">
            <span>Built for modern photographers.</span>
            {actor ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-stone-400">
                <ShieldCheck className="h-3.5 w-3.5" /> {getActorLabel(actor)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
        <Link href="/projects/new">
          <Button className="h-10 w-full px-4 text-sm sm:h-11 sm:w-auto sm:px-5">Start a project</Button>
        </Link>
        {showUsers ? (
          <Link href="/admin/users" className="col-span-2 sm:col-span-1">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <Users className="h-4 w-4" /> Admin users
            </Button>
          </Link>
        ) : null}
        {showLogout ? (
          <form action={logoutAdminAction} className={showUsers ? "col-span-2 sm:col-span-1" : "col-span-2 sm:col-span-1"}>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              Sign out
            </Button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
