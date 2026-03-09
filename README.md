PickMe by Lensaparty is a premium photo selection workflow built with Next.js App Router, React, Tailwind, and a production-oriented admin/client flow.

## Local development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core commands

```bash
npm run lint
npm run test
npm run build
npm run check:production
```

## Storage

PickMe supports two storage modes:

- local file store by default
- Postgres when `DATABASE_URL` is set

## Production

Production setup, env, backup, and restore guidance:

- [`docs/PRODUCTION.md`](./docs/PRODUCTION.md)
- [`docs/DEPLOY.md`](./docs/DEPLOY.md)
- [`docs/VERCEL.md`](./docs/VERCEL.md)
- [`docs/GO-LIVE-CHECKLIST.md`](./docs/GO-LIVE-CHECKLIST.md)
- [`.env.production.example`](./.env.production.example)

## Backups

```bash
npm run backup:projects
npm run restore:projects -- ./backups/projects.json
```

## Notes

- Admin protection becomes active when `ADMIN_PASSWORD` is set.
- Private gallery passwords are encrypted at rest.
- Share links use `APP_URL` in production.
