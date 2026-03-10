"use client";

import { useMemo, useState } from "react";
import { FolderHeart, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

import { DashboardControls } from "@/components/dashboard/dashboard-controls";
import { ProjectGroup } from "@/components/dashboard/project-group";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDaysUntilExpiry, getProjectWorkflowState, isExpiringSoon } from "@/lib/project-utils";
import { AuthActor, Project } from "@/lib/types";

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="p-6 sm:p-7">
        <p className="text-base font-medium text-white">{title}</p>
        <p className="mt-2 text-[15px] leading-7 text-stone-400">{body}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardWorkspace({ projects, actor }: { projects: Project[]; actor: AuthActor }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [quickFilter, setQuickFilter] = useState("all");

  const summary = useMemo(() => {
    const awaitingClient = projects.filter((project) => getProjectWorkflowState(project) === "awaiting_client").length;
    const inProgress = projects.filter((project) => getProjectWorkflowState(project) === "in_progress").length;
    const submitted = projects.filter((project) => getProjectWorkflowState(project) === "submitted").length;
    const expiring = projects.filter((project) => isExpiringSoon(project)).length;

    return [
      { label: "Needs client action", value: String(awaitingClient), hint: "Links sent but no shortlist yet" },
      { label: "In progress", value: String(inProgress), hint: "Client is actively choosing photos" },
      { label: "Submitted", value: String(submitted), hint: "Ready for your follow-up or edit flow" },
      { label: "Expiring soon", value: String(expiring), hint: "Needs attention before the link closes" },
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const workflow = getProjectWorkflowState(project);
      const matchesSearch =
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.clientName.toLowerCase().includes(term) ||
        project.code.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "all" || workflow === statusFilter;

      const matchesQuick =
        quickFilter === "all" ||
        (quickFilter === "expiring" && isExpiringSoon(project)) ||
        (quickFilter === "submitted" && workflow === "submitted") ||
        (quickFilter === "protected" && project.passwordProtected);

      return matchesSearch && matchesStatus && matchesQuick;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "recent") return Date.parse(b.lastActivity) - Date.parse(a.lastActivity);
      if (sortBy === "expiry") {
        const left = getDaysUntilExpiry(a) ?? Number.MAX_SAFE_INTEGER;
        const right = getDaysUntilExpiry(b) ?? Number.MAX_SAFE_INTEGER;
        return left - right;
      }

      const rank = {
        awaiting_client: 0,
        in_progress: 1,
        submitted: 2,
        expired: 3,
      } as const;

      const leftState = getProjectWorkflowState(a);
      const rightState = getProjectWorkflowState(b);
      const leftUrgency = isExpiringSoon(a) ? -1 : 0;
      const rightUrgency = isExpiringSoon(b) ? -1 : 0;

      return leftUrgency - rightUrgency || rank[leftState] - rank[rightState] || Date.parse(b.lastActivity) - Date.parse(a.lastActivity);
    });

    return sorted;
  }, [projects, quickFilter, search, sortBy, statusFilter]);

  const grouped = useMemo(() => {
    const groups = {
      attention: [] as Project[],
      active: [] as Project[],
      submitted: [] as Project[],
      expired: [] as Project[],
    };

    filteredProjects.forEach((project) => {
      const workflow = getProjectWorkflowState(project);
      if (workflow === "expired") {
        groups.expired.push(project);
        return;
      }
      if (workflow === "submitted") {
        groups.submitted.push(project);
        return;
      }
      if (workflow === "awaiting_client" || isExpiringSoon(project)) {
        groups.attention.push(project);
        return;
      }
      groups.active.push(project);
    });

    return groups;
  }, [filteredProjects]);

  const totalVisible = filteredProjects.length;
  const showExpiredOnly = statusFilter === "expired";
  const hasActiveFilters = search.length > 0 || statusFilter !== "all" || quickFilter !== "all" || sortBy !== "priority";

  return (
    <div className="space-y-7 sm:space-y-10">
      <section className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.14fr_0.86fr]">
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-8 lg:p-9">
              <Badge tone="warning">PickMe by Lensaparty</Badge>
              <div className="mt-3 max-w-3xl space-y-2.5 sm:mt-5 sm:space-y-4">
                <h2 className="font-display text-[2.2rem] leading-[0.96] text-white sm:text-6xl">
                  Client photo selection, elevated.
                </h2>
                <p className="max-w-2xl text-[14px] leading-6 text-stone-300 sm:text-[1.05rem] sm:leading-8">
                  Manage live galleries, review client choices, and keep every selection beautifully organized in a workflow that feels calm, polished, and premium.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
                <Link href="/projects/new">
                  <Button size="lg" className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-[15px]">
                    <Plus className="h-4 w-4" /> Start a project
                  </Button>
                </Link>
                <Link href="/client/LUNA-ARYA">
                  <Button size="lg" variant="secondary" className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-[15px]">
                    <FolderHeart className="h-4 w-4" /> Preview client flow
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2.5 sm:gap-4">
            <Card className="overflow-hidden">
              <CardContent className="p-3.5 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-amber-200/14 p-2.5 text-amber-100">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Calm rhythm</p>
                    <p className="mt-1 text-[13px] leading-6 text-stone-400 sm:text-[15px] sm:leading-7">
                      Open galleries, review responses, and keep the day moving without turning the homepage noisy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-3.5 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/8 p-2.5 text-stone-200">
                    <FolderHeart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Focused queue</p>
                    <p className="mt-1 text-[13px] leading-6 text-stone-400 sm:text-[15px] sm:leading-7">
                      Homepage stays centered on live project work. Expired or secondary views appear only when you ask for them.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={summary[0].label}
            value={summary[0].value}
            hint={summary[0].hint}
            active={statusFilter === "awaiting_client"}
            onClick={() => {
              setStatusFilter("awaiting_client");
              setQuickFilter("all");
            }}
          />
          <StatCard
            label={summary[1].label}
            value={summary[1].value}
            hint={summary[1].hint}
            active={statusFilter === "in_progress"}
            onClick={() => {
              setStatusFilter("in_progress");
              setQuickFilter("all");
            }}
          />
          <StatCard
            label={summary[2].label}
            value={summary[2].value}
            hint={summary[2].hint}
            active={statusFilter === "submitted" || quickFilter === "submitted"}
            onClick={() => {
              setStatusFilter("submitted");
              setQuickFilter("submitted");
            }}
          />
          <StatCard
            label={summary[3].label}
            value={summary[3].value}
            hint={summary[3].hint}
            active={quickFilter === "expiring"}
            onClick={() => {
              setStatusFilter("all");
              setQuickFilter("expiring");
            }}
          />
        </div>
      </section>

      <section className="space-y-3.5 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">Project queue</h3>
            <p className="mt-1 text-[14px] leading-6 text-stone-400 sm:text-[15px] sm:leading-7">
              {actor.kind === "super_admin" ? "Find what needs attention and step back into work quickly." : "Step back into the projects assigned to your own client workspace."}
            </p>
          </div>
          <p className="text-[14px] text-stone-500 sm:text-[15px]">{totalVisible} visible project{totalVisible === 1 ? "" : "s"}</p>
        </div>
        <DashboardControls
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
        />
      </section>

      {showExpiredOnly ? (
        <section className="space-y-8 sm:space-y-9">
          <ProjectGroup
            title="Expired"
            description="Expired projects stay here when you filter for them, away from the live homepage queue."
            count={grouped.expired.length}
            projects={grouped.expired}
            empty={<EmptyState title="No expired projects in view" body="Try another filter to return to active project work." />}
          />
        </section>
      ) : (
        <section className="space-y-8 sm:space-y-9">
          <ProjectGroup
            title="Needs action"
            description="Start here for galleries waiting on the client or nearing expiry."
            count={grouped.attention.length}
            projects={grouped.attention}
            empty={<EmptyState title="Nothing urgent right now" body="No galleries are currently waiting on the client or nearing expiry." />}
          />
          <ProjectGroup
            title="Active work"
            description="Projects already in motion and easy to continue."
            count={grouped.active.length}
            projects={grouped.active}
            empty={<EmptyState title="No active work in this view" body="Adjust the filters to bring more live galleries back into the workspace." />}
          />
          <ProjectGroup
            title="Submitted"
            description="Selections already returned and ready for the next step."
            count={grouped.submitted.length}
            projects={grouped.submitted}
            empty={<EmptyState title="No submitted selections yet" body="Returned client selections will appear here as they come in." />}
          />
        </section>
      )}

      <div className="flex flex-col gap-3 border-t border-white/8 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-stone-500 sm:text-[15px]">Homepage stays focused on live project work.</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("expired");
              setQuickFilter("all");
            }}
          >
            View expired projects
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSortBy("priority");
                setQuickFilter("all");
              }}
            >
              Reset filters
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
