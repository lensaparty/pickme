# PickMe Production Guide

## Minimum env

Set these before production deploy:

```bash
APP_SECRET=replace-with-a-strong-random-secret
APP_URL=https://your-domain.com
ADMIN_PASSWORD=replace-with-a-strong-admin-password
DATABASE_URL=postgres://...
```

Optional env:

```bash
GOOGLE_DRIVE_APPS_SCRIPT_URL=
GOOGLE_DRIVE_API_KEY=
MONITORING_WEBHOOK_URL=
PICKME_DATA_DIR=
```

## Recommended production flow

1. Set `DATABASE_URL` so production does not use local JSON storage.
2. Set `APP_SECRET` for encrypted passwords and signed cookies.
3. Set `ADMIN_PASSWORD` so admin pages require login.
4. Set `APP_URL` so client share links point to the real domain.
5. Run:

```bash
npm run check:production
npm run build
```

## Backup

Create a JSON backup:

```bash
npm run backup:projects
```

Optional custom output:

```bash
npm run backup:projects -- ./backups/pickme-backup.json
```

## Restore

Restore a backup into the current configured storage backend:

```bash
npm run restore:projects -- ./backups/pickme-backup.json
```

- If `DATABASE_URL` is set, restore goes into Postgres.
- If `DATABASE_URL` is not set, restore writes to the local file store.

## Migration from local file to Postgres

If `DATABASE_URL` is set and the `projects` table is empty, PickMe will bootstrap from the local file store automatically on first access.

Safer explicit flow:

```bash
npm run backup:projects -- ./backups/pre-migration.json
DATABASE_URL=postgres://... npm run restore:projects -- ./backups/pre-migration.json
```

## Monitoring

Structured JSON logs are written to stdout/stderr.

For external error notifications, set:

```bash
MONITORING_WEBHOOK_URL=https://your-monitoring-endpoint
```

Only error-level logs are forwarded there.

## Current production checklist

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run check:production`
- verify admin login
- verify private gallery unlock
- verify project create / update / delete
- verify WhatsApp handoff link generation
