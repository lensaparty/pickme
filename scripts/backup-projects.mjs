import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

function resolveDataDir() {
  return process.env.PICKME_DATA_DIR?.trim()
    ? path.resolve(process.env.PICKME_DATA_DIR)
    : path.join(process.cwd(), "data");
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function mapRow(row) {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    clientName: String(row.client_name),
    eventType: String(row.event_type),
    createdAt: new Date(String(row.created_at)).toISOString(),
    expiresAt: new Date(String(row.expires_at)).toISOString(),
    selectionLimit: Number(row.selection_limit),
    selectedCount: Number(row.selected_count),
    selectedIds: JSON.parse(String(row.selected_ids || "[]")),
    folderCount: Number(row.folder_count),
    photoCount: Number(row.photo_count),
    driveLink: String(row.drive_link),
    driveFolderId: String(row.drive_folder_id),
    whatsapp: String(row.whatsapp),
    status: String(row.status),
    passwordProtected: Boolean(row.password_protected),
    password: String(row.password || ""),
    allowDownloads: Boolean(row.allow_downloads),
    welcomeMessage: String(row.welcome_message),
    lastActivity: new Date(String(row.last_activity)).toISOString(),
  };
}

async function readProjects() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    const sql = postgres(databaseUrl, { max: 1, prepare: false });
    try {
      const rows = await sql`select * from projects order by created_at desc`;
      return rows.map(mapRow);
    } finally {
      await sql.end();
    }
  }

  const filePath = path.join(resolveDataDir(), "projects.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const backupDir = path.join(process.cwd(), "backups");
  await mkdir(backupDir, { recursive: true });

  const outputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(backupDir, `projects-${timestamp()}.json`);

  const projects = await readProjects();
  await writeFile(outputPath, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
  console.info(`Projects backup written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

