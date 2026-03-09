import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

function resolveDataDir() {
  return process.env.PICKME_DATA_DIR?.trim()
    ? path.resolve(process.env.PICKME_DATA_DIR)
    : path.join(process.cwd(), "data");
}

async function ensureProjectsTable(sql) {
  await sql`
    create table if not exists projects (
      id text primary key,
      code text not null unique,
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
}

async function restoreToDatabase(projects) {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  try {
    await ensureProjectsTable(sql);

    for (const project of projects) {
      await sql`
        insert into projects (
          id,
          code,
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
          ${project.password || ""},
          ${project.allowDownloads},
          ${project.welcomeMessage},
          ${project.lastActivity}
        )
        on conflict (code) do update set
          name = excluded.name,
          client_name = excluded.client_name,
          event_type = excluded.event_type,
          created_at = excluded.created_at,
          expires_at = excluded.expires_at,
          selection_limit = excluded.selection_limit,
          selected_count = excluded.selected_count,
          selected_ids = excluded.selected_ids,
          folder_count = excluded.folder_count,
          photo_count = excluded.photo_count,
          drive_link = excluded.drive_link,
          drive_folder_id = excluded.drive_folder_id,
          whatsapp = excluded.whatsapp,
          status = excluded.status,
          password_protected = excluded.password_protected,
          password = excluded.password,
          allow_downloads = excluded.allow_downloads,
          welcome_message = excluded.welcome_message,
          last_activity = excluded.last_activity
      `;
    }
  } finally {
    await sql.end();
  }
}

async function restoreToFile(projects) {
  const dataDir = resolveDataDir();
  await mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, "projects.json");
  await writeFile(filePath, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: npm run restore:projects -- /absolute/or/relative/path/to/projects.json");
  }

  const raw = await readFile(path.resolve(inputPath), "utf8");
  const projects = JSON.parse(raw);

  if (!Array.isArray(projects)) {
    throw new Error("Backup file must contain an array of projects.");
  }

  if (process.env.DATABASE_URL?.trim()) {
    await restoreToDatabase(projects);
    console.info(`Restored ${projects.length} projects into Postgres.`);
    return;
  }

  await restoreToFile(projects);
  console.info(`Restored ${projects.length} projects into the local file store.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

