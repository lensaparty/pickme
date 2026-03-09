# PickMe Deploy Guide

This guide is pragmatic on purpose. It covers the three deployment paths that make sense for PickMe right now:

- Vercel
- Railway / Render
- VPS with Node.js

## Before any deploy

Minimum requirements:

```bash
APP_SECRET=replace-with-a-long-random-secret
APP_URL=https://your-domain.com
ADMIN_PASSWORD=replace-with-a-strong-admin-password
DATABASE_URL=postgres://...
```

Recommended commands before release:

```bash
npm run test
npm run lint
npm run build
npm run check:production
```

## Option 1: Vercel

Best when:

- you want the simplest Next.js deployment flow
- you already plan to use managed Postgres elsewhere

Steps:

1. Import the repo into Vercel.
2. Set framework to Next.js if Vercel does not detect it automatically.
3. Add the production env vars from `.env.production.example`.
4. Set `APP_URL` to your final public domain.
5. Deploy.

Notes:

- Vercel filesystem is not suitable for persistent app data. Use `DATABASE_URL`.
- Do not rely on `PICKME_DATA_DIR` in Vercel production.
- See [`VERCEL.md`](./VERCEL.md) for the exact setup.

## Option 2: Railway / Render

Best when:

- you want app + Postgres in one managed place
- you want less infra work than a VPS

Steps:

1. Create a Postgres service.
2. Create a web service from this repo.
3. Set:
   - build command: `npm install && npm run build`
   - start command: `npm run start`
4. Add env vars from `.env.production.example`.
5. Map your custom domain and update `APP_URL`.

Notes:

- This is currently the most practical path for PickMe if you want a fast production setup.

## Option 3: VPS

Best when:

- you want full control
- you are comfortable managing Node, reverse proxy, and process lifecycle

Recommended stack:

- Ubuntu
- Node 22+
- Postgres
- Nginx
- PM2 or systemd

Basic flow:

```bash
git clone https://github.com/lensaparty/pickme.git
cd pickme
npm install
cp .env.production.example .env.production
# fill envs
npm run test
npm run build
npm run start
```

Then:

- run behind Nginx
- enable HTTPS
- use PM2 or systemd for restart persistence

## Storage recommendation

For real production, use:

- `DATABASE_URL`

Do not use:

- local file storage as your main production persistence

File storage is still useful for:

- local dev
- quick demos
- emergency fallback

## Release advice

Use this order:

1. deploy to staging
2. test admin login
3. test create project
4. test private gallery unlock
5. test client selection + WhatsApp handoff
6. confirm backup script works
7. go live
