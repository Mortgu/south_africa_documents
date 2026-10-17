# dignum Downloads

A lean site where visitors download documents. Some documents are free; protected ones are unlocked once via an email confirmation link.

Stack: Next.js (App Router) · Tailwind CSS · Postgres (Drizzle) · Nodemailer (SMTP) · documents on the local file system

Runs on a single server behind a reverse proxy, see [`deploy/README.md`](deploy/README.md).

## Development

```bash
npm install
docker compose up -d         # Postgres + Mailpit, see compose.yml for the matching .env.local values
cp .env.example .env.local   # fill in values
npm run db:migrate           # create/update tables
npm run dev
```

Mails sent locally show up in Mailpit at http://localhost:8025. For development, point
`FILES_DIR` at the absolute path of the repo's `documents/` folder (contains `test.pdf` samples).
Never put documents below `public/`: Next.js serves that folder to everyone, bypassing the
access check.

## Adding a document

1. Put the file into `FILES_DIR` under `public/…` or `protected/…`. The file name is what visitors download, e.g. `protected/dignum-risk-assessment.pdf`.
2. Add an entry to `src/content/documents.ts` (`access: "public"` or `"protected"`).

## Design

The design mockups live in `design/` (reference only). View them with `python3 -m http.server` inside a mockup folder.

## Staff notifications

`/api/cron/notify` emails `NOTIFY_EMAILS` about each registration once `NOTIFY_DELAY_HOURS` have
passed since the email confirmation, including the documents downloaded since. It is meant to be
called hourly by a scheduler (see `deploy/README.md`). Trigger it manually with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notify
```

## Backups

`deploy/backup.sh` writes a full database dump plus CSV exports of subscribers and downloads to
`backups/<timestamp>/` (git-ignored).
