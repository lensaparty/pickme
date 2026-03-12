import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { buildProjectRecord, storeProjectPassword } from "@/lib/project-store-shared";
import { Project, ProjectSelectionPayload, NewProjectInput } from "@/lib/types";
import { normalizeShareCode } from "@/lib/project-utils";

const dataDir = process.env.PICKME_DATA_DIR?.trim()
  ? path.resolve(process.env.PICKME_DATA_DIR)
  : path.join(process.cwd(), "data");
const projectsFile = path.join(dataDir, "projects.json");

async function ensureProjectsFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(projectsFile, "utf8");
  } catch {
    await writeFile(projectsFile, "[]\n", "utf8");
  }
}

async function writeProjects(projects: Project[]) {
  await ensureProjectsFile();
  const tempFile = `${projectsFile}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
  await rename(tempFile, projectsFile);
}

export async function readProjectsSnapshot(): Promise<Project[]> {
  try {
    const raw = await readFile(projectsFile, "utf8");
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export async function readProjectsFromFileStore(): Promise<Project[]> {
  await ensureProjectsFile();
  const raw = await readFile(projectsFile, "utf8");
  return JSON.parse(raw) as Project[];
}

export async function getProjectsFromFileStore() {
  const projects = await readProjectsFromFileStore();
  return [...projects].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getProjectByCodeFromFileStore(code: string) {
  const normalized = normalizeShareCode(code);
  const projects = await readProjectsFromFileStore();
  return projects.find((project) => normalizeShareCode(project.code) === normalized) ?? null;
}

export async function createProjectInFileStore(input: NewProjectInput) {
  const projects = await readProjectsFromFileStore();
  const project = buildProjectRecord(projects, input);
  projects.unshift(project);
  await writeProjects(projects);
  return project;
}

export async function updateProjectSelectionInFileStore(projectId: string, payload: ProjectSelectionPayload) {
  const projects = await readProjectsFromFileStore();
  const index = projects.findIndex((project) => project.id === projectId);
  if (index < 0) return null;

  projects[index] = {
    ...projects[index],
    selectedCount: payload.selectedCount,
    selectedIds: payload.selectedIds,
    status: payload.selectedCount > 0 ? "awaiting" : projects[index].status,
    lastActivity: new Date().toISOString(),
  };

  await writeProjects(projects);
  return projects[index];
}

export async function updateProjectByCodeInFileStore(
  code: string,
  updates: Partial<
    Pick<
      Project,
      | "name"
      | "ownerUserId"
      | "clientName"
      | "eventType"
      | "expiresAt"
      | "selectionLimit"
      | "whatsapp"
      | "passwordProtected"
      | "allowDownloads"
      | "welcomeMessage"
    >
  > & { password?: string },
) {
  const normalized = normalizeShareCode(code);
  const projects = await readProjectsFromFileStore();
  const index = projects.findIndex((project) => normalizeShareCode(project.code) === normalized);
  if (index < 0) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    ...(updates.password !== undefined ? { password: storeProjectPassword(updates.password) } : {}),
    lastActivity: new Date().toISOString(),
  };

  await writeProjects(projects);
  return projects[index];
}

export async function deleteProjectByCodeFromFileStore(code: string) {
  const normalized = normalizeShareCode(code);
  const projects = await readProjectsFromFileStore();
  const nextProjects = projects.filter((project) => normalizeShareCode(project.code) !== normalized);

  if (nextProjects.length === projects.length) {
    return false;
  }

  await writeProjects(nextProjects);
  return true;
}
