import "server-only";

import {
  createProjectInFileStore,
  deleteProjectByCodeFromFileStore,
  getProjectByCodeFromFileStore,
  getProjectsFromFileStore,
  updateProjectByCodeInFileStore,
  updateProjectSelectionInFileStore,
} from "@/lib/project-store-file";
import {
  createProjectInPostgres,
  deleteProjectByCodeFromPostgres,
  getProjectByCodeFromPostgres,
  getProjectsFromPostgres,
  updateProjectByCodeInPostgres,
  updateProjectSelectionInPostgres,
} from "@/lib/project-store-postgres";
import { NewProjectInput, Project, ProjectSelectionPayload } from "@/lib/types";

function shouldUseDatabaseStore() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function getProjects() {
  return shouldUseDatabaseStore() ? getProjectsFromPostgres() : getProjectsFromFileStore();
}

export async function getProjectByCode(code: string) {
  return shouldUseDatabaseStore() ? getProjectByCodeFromPostgres(code) : getProjectByCodeFromFileStore(code);
}

export async function createProject(input: NewProjectInput) {
  return shouldUseDatabaseStore() ? createProjectInPostgres(input) : createProjectInFileStore(input);
}

export async function updateProjectSelection(projectId: string, payload: ProjectSelectionPayload) {
  return shouldUseDatabaseStore()
    ? updateProjectSelectionInPostgres(projectId, payload)
    : updateProjectSelectionInFileStore(projectId, payload);
}

export async function updateProjectByCode(
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
  return shouldUseDatabaseStore()
    ? updateProjectByCodeInPostgres(code, updates)
    : updateProjectByCodeInFileStore(code, updates);
}

export async function deleteProjectByCode(code: string) {
  return shouldUseDatabaseStore() ? deleteProjectByCodeFromPostgres(code) : deleteProjectByCodeFromFileStore(code);
}
