import "server-only";

import postgres from "postgres";

import { buildProjectRecord, storeProjectPassword } from "@/lib/project-store-shared";
import { getProjectsFromFileStore } from "@/lib/project-store-file";
import { readUsersFromFileStore } from "@/lib/user-store-file";
import { normalizeShareCode } from "@/lib/project-utils";
import { NewProjectInput, Project, ProjectSelectionPayload } from "@/lib/types";

const DATABASE_URL = process.env.DATABASE_URL?.trim() || "";

const sql = postgres(DATABASE_URL, {
  max: 1,
  prepare: false,
});

let initPromise: Promise<void> | null = null;

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    code: String(row.code),
    ownerUserId: row.owner_user_id ? String(row.owner_user_id) : undefined,
    name: String(row.name),
    clientName: String(row.client_name),
    eventType: String(row.event_type),
    createdAt: new Date(String(row.created_at)).toISOString(),
    expiresAt: new Date(String(row.expires_at)).toISOString(),
    selectionLimit: Number(row.selection_limit),
    selectedCount: Number(row.selected_count),
    selectedIds: JSON.parse(String(row.selected_ids || "[]")) as string[],
    folderCount: Number(row.folder_count),
    photoCount: Number(row.photo_count),
    driveLink: String(row.drive_link),
    driveFolderId: String(row.drive_folder_id),
    whatsapp: String(row.whatsapp),
    status: String(row.status) as Project["status"],
    passwordProtected: Boolean(row.password_protected),
    password: String(row.password || ""),
    allowDownloads: Boolean(row.allow_downloads),
    welcomeMessage: String(row.welcome_message),
    lastActivity: new Date(String(row.last_activity)).toISOString(),
  };
}

async function insertProject(project: Project) {
  await sql`
    insert into projects (
      id,
      code,
      owner_user_id,
      name,
      client_name,
      event_type,
      created_at,
      expires_at,
      selection_limit,
      selected_count,
      selected_ids,
      folder_count,
      photo_count,
      drive_link,
      drive_folder_id,
      whatsapp,
      status,
      password_protected,
      password,
      allow_downloads,
      welcome_message,
      last_activity
    ) values (
      ${project.id},
      ${project.code},
      ${project.ownerUserId || null},
      ${project.name},
      ${project.clientName},
      ${project.eventType},
      ${project.createdAt},
      ${project.expiresAt},
      ${project.selectionLimit},
      ${project.selectedCount},
      ${JSON.stringify(project.selectedIds ?? [])},
      ${project.folderCount},
      ${project.photoCount},
      ${project.driveLink},
      ${project.driveFolderId},
      ${project.whatsapp},
      ${project.status},
      ${project.passwordProtected},
      ${project.password},
      ${project.allowDownloads},
      ${project.welcomeMessage},
      ${project.lastActivity}
    )
    on conflict (code) do nothing
  `;
}

async function ensureDatabaseReady() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await sql`
      create table if not exists users (
        id text primary key,
        name text not null,
        email text not null unique,
        password_hash text not null,
        role text not null,
        is_active boolean not null default true,
        created_at timestamptz not null,
        updated_at timestamptz not null
      )
    `;

    await sql`
      create table if not exists projects (
        id text primary key,
        code text not null unique,
        owner_user_id text,
        name text not null,
        client_name text not null,
        event_type text not null,
        created_at timestamptz not null,
        expires_at timestamptz not null,
        selection_limit integer not null,
        selected_count integer not null default 0,
        selected_ids text not null default '[]',
        folder_count integer not null default 0,
        photo_count integer not null default 0,
        drive_link text not null,
        drive_folder_id text not null,
        whatsapp text not null,
        status text not null,
        password_protected boolean not null default false,
        password text not null default '',
        allow_downloads boolean not null default true,
        welcome_message text not null,
        last_activity timestamptz not null
      )
    `;

    await sql`alter table projects add column if not exists owner_user_id text`;

    const existingUsers = await sql<{ count: string }[]>`select count(*) as count from users`;
    if (Number(existingUsers[0]?.count || 0) === 0) {
      const fileUsers = await readUsersFromFileStore();
      for (const user of fileUsers) {
        await sql`
          insert into users (id, name, email, password_hash, role, is_active, created_at, updated_at)
          values (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.role}, ${user.isActive}, ${user.createdAt}, ${user.updatedAt})
          on conflict (email) do nothing
        `;
      }
    }

    const existingProjects = await sql<{ count: string }[]>`select count(*) as count from projects`;
    if (Number(existingProjects[0]?.count || 0) > 0) return;

    const fileProjects = await getProjectsFromFileStore();
    for (const project of fileProjects) {
      await insertProject(project);
    }
  })();

  return initPromise;
}

export async function getProjectsFromPostgres() {
  await ensureDatabaseReady();
  const rows = await sql`
    select * from projects
    order by created_at desc
  `;
  return rows.map(mapProject);
}

export async function getProjectByCodeFromPostgres(code: string) {
  await ensureDatabaseReady();
  const normalized = normalizeShareCode(code);
  const rows = await sql`
    select * from projects
    where upper(code) = ${normalized}
    limit 1
  `;
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function createProjectInPostgres(input: NewProjectInput) {
  await ensureDatabaseReady();
  const existingProjects = await getProjectsFromPostgres();
  const project = buildProjectRecord(existingProjects, input);
  await insertProject(project);
  return project;
}

export async function updateProjectSelectionInPostgres(projectId: string, payload: ProjectSelectionPayload) {
  await ensureDatabaseReady();
  const rows = await sql`
    update projects
    set
      selected_count = ${payload.selectedCount},
      selected_ids = ${JSON.stringify(payload.selectedIds)},
      status = ${payload.selectedCount > 0 ? "awaiting" : "active"},
      last_activity = ${new Date().toISOString()}
    where id = ${projectId}
    returning *
  `;
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function updateProjectByCodeInPostgres(
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
  await ensureDatabaseReady();
  const existing = await getProjectByCodeFromPostgres(code);
  if (!existing) return null;

  const nextProject: Project = {
    ...existing,
    ...updates,
    ...(updates.password !== undefined ? { password: storeProjectPassword(updates.password) } : {}),
    lastActivity: new Date().toISOString(),
  };

  const rows = await sql`
    update projects
    set
      name = ${nextProject.name},
      owner_user_id = ${nextProject.ownerUserId || null},
      client_name = ${nextProject.clientName},
      event_type = ${nextProject.eventType},
      expires_at = ${nextProject.expiresAt},
      selection_limit = ${nextProject.selectionLimit},
      whatsapp = ${nextProject.whatsapp},
      password_protected = ${nextProject.passwordProtected},
      password = ${nextProject.password},
      allow_downloads = ${nextProject.allowDownloads},
      welcome_message = ${nextProject.welcomeMessage},
      last_activity = ${nextProject.lastActivity}
    where upper(code) = ${normalizeShareCode(code)}
    returning *
  `;

  return rows[0] ? mapProject(rows[0]) : null;
}

export async function deleteProjectByCodeFromPostgres(code: string) {
  await ensureDatabaseReady();
  const rows = await sql`
    delete from projects
    where upper(code) = ${normalizeShareCode(code)}
    returning id
  `;
  return rows.length > 0;
}
