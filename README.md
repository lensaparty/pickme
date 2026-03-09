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

## Backups

```bash
npm run backup:projects
npm run restore:projects -- ./backups/projects.json
```

## Notes

- Admin protection becomes active when `ADMIN_PASSWORD` is set.
- Private gallery passwords are encrypted at rest.
- Share links use `APP_URL` in production.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
