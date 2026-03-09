# PickMe Go-Live Checklist

## Config

- `APP_SECRET` is set
- `APP_URL` points to the final production domain
- `ADMIN_PASSWORD` is set
- `DATABASE_URL` is set
- optional Google Drive env is configured if live ingestion is required
- optional `MONITORING_WEBHOOK_URL` is set

## Code health

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run check:production`

## Data safety

- create a backup with `npm run backup:projects`
- confirm restore path with `npm run restore:projects -- ./backups/your-backup.json`
- confirm Postgres is reachable

## Admin flow

- admin login works
- dashboard loads
- create project works
- manage project update works
- delete project works only when intended

## Client flow

- open client entry page
- password-protected gallery unlock works
- gallery loads
- selection limit works
- review page works
- WhatsApp handoff opens the expected message

## Google Drive

- valid folder loads
- invalid/private folder degrades gracefully
- fallback behavior is acceptable if live source fails

## Observability

- server logs are visible
- error logs are forwarded if monitoring webhook is configured

## Final release

- custom domain resolves
- HTTPS works
- `APP_URL` matches live domain exactly
- one real end-to-end test project succeeds

If deploying on Vercel:

- follow [`VERCEL.md`](./VERCEL.md)
