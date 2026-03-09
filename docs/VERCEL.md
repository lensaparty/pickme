# PickMe on Vercel

This is the recommended deployment path if you want the fastest hosted setup for PickMe.

## What to use with Vercel

Use:

- Vercel for the Next.js app
- managed Postgres for data

Do not use in Vercel production:

- local JSON file storage
- `PICKME_DATA_DIR` as the main persistence strategy

## Recommended stack

- Vercel project for the app
- Neon / Supabase / Railway Postgres for `DATABASE_URL`
- optional Apps Script or Google Drive API for live gallery loading

## Vercel project setup

1. Import the GitHub repo into Vercel.
2. Root directory: project root
3. Framework preset: Next.js
4. Build command:

```bash
npm run build
```

5. Install command:

```bash
npm install
```

6. Output directory:

- leave default for Next.js

## Environment variables in Vercel

Add these in:

- Project Settings
- Environment Variables

Required:

```bash
APP_SECRET=replace-with-a-long-random-secret
APP_URL=https://your-final-domain.com
ADMIN_PASSWORD=replace-with-a-strong-admin-password
DATABASE_URL=postgres://user:password@host:5432/pickme
```

Optional:

```bash
GOOGLE_DRIVE_APPS_SCRIPT_URL=
GOOGLE_DRIVE_API_KEY=
MONITORING_WEBHOOK_URL=
```

## What each env does

- `APP_SECRET`
  - encrypts stored gallery passwords
  - signs admin and gallery access cookies
- `APP_URL`
  - used for client share links and WhatsApp handoff links
  - must match your real production domain
- `ADMIN_PASSWORD`
  - protects dashboard and admin pages
- `DATABASE_URL`
  - required for real persistent production data on Vercel
- `GOOGLE_DRIVE_APPS_SCRIPT_URL`
  - optional live gallery sync source
- `GOOGLE_DRIVE_API_KEY`
  - optional alternative live gallery source
- `MONITORING_WEBHOOK_URL`
  - optional error forwarding endpoint

## Suggested Vercel env values

If your final domain is:

```bash
https://pickme.lensaparty.com
```

Then use:

```bash
APP_URL=https://pickme.lensaparty.com
```

## Before first production deploy

Run locally:

```bash
npm run test
npm run lint
npm run build
npm run check:production
```

## After deploy

Test these in production:

1. admin login
2. dashboard load
3. create project
4. password-protected gallery access
5. client selection
6. review selection
7. WhatsApp handoff link

## Practical deployment advice

- deploy to preview first
- verify one full end-to-end project
- only then promote the production domain

