import { ReactNode } from "react";

import { ProjectCard } from "@/components/dashboard/project-card";
import { Project } from "@/lib/types";

export function ProjectGroup({
  title,
  description,
  count,
  projects,
  empty,
}: {
  title: string;
  description: string;
  count: number;
  projects: Project[];
  empty: ReactNode;
}) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-1 text-[14px] leading-6 text-stone-400 sm:text-[15px] sm:leading-7">{description}</p>
        </div>
        <p className="text-[14px] text-stone-500 sm:text-[15px]">{count} project{count === 1 ? "" : "s"}</p>
      </div>
      {projects.length ? <div className="grid gap-4 sm:gap-6">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : empty}
    </section>
  );
}
