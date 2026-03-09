const required = ["APP_SECRET", "APP_URL", "ADMIN_PASSWORD"];
const recommended = ["DATABASE_URL"];
const optional = ["GOOGLE_DRIVE_APPS_SCRIPT_URL", "GOOGLE_DRIVE_API_KEY", "MONITORING_WEBHOOK_URL"];

let hasError = false;

for (const key of required) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing required env: ${key}`);
    hasError = true;
  }
}

for (const key of recommended) {
  if (!process.env[key]?.trim()) {
    console.warn(`Recommended env not set: ${key}`);
  }
}

if (!process.env.GOOGLE_DRIVE_APPS_SCRIPT_URL?.trim() && !process.env.GOOGLE_DRIVE_API_KEY?.trim()) {
  console.warn("No live Google Drive source is configured. Gallery will fall back to preview data.");
}

for (const key of optional) {
  if (process.env[key]?.trim()) {
    console.info(`Configured: ${key}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.info("Production env check passed.");

