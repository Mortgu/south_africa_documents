# Deployment (Hetzner webhosting / managed server, no pipeline)

The hosting runs a fixed Node.js script for the domain and routes all requests of the domain to
it (TLS and domain are managed by the hoster):

| What | Path |
|---|---|
| Script started by the hosting | `~/public_html/atf_dignum_co_za/app.js` (copy of `deploy/hetzner-app.js`) |
| Log file | `~/node.log` |
| App checkout | `~/apps/dignum` |
| Documents (`FILES_DIR`) | `~/files` (absolute path, see `echo $HOME`) |
| Config | `~/apps/dignum/.env.local` |

`app.js` only starts the built Next.js app from `~/apps/dignum`. Keep the checkout, `.env.local`
and the documents **outside** `public_html`.

## First-time setup

```bash
# 1. Code and folders
cd ~
git clone https://github.com/Mortgu/south_africa_documents.git apps/dignum
mkdir -p ~/files/public ~/files/protected

# 2. Config: copy the template and fill in every value (see comments in the file)
cd ~/apps/dignum
cp .env.example .env.local && chmod 600 .env.local
nano .env.local
#    APP_URL=https://<public domain>   FILES_DIR=<output of `echo $HOME`>/files   SMTP_PORT=587

# 3. Build and create the tables
npm ci
npm run db:migrate
npm run build

# 4. Replace the hosting's start script with the launcher (keep a copy of the old one)
cp ~/public_html/atf_dignum_co_za/app.js ~/app.js.bak
cp deploy/hetzner-app.js ~/public_html/atf_dignum_co_za/app.js

# 5. Restart (see below) and watch the log
tail -f ~/node.log      # expect "> dignum ready on port …"
```

## Restarting

The hosting starts `app.js` again when the process is gone. To restart after an update, stop
the running process and open the site once:

```bash
pkill -u "$USER" -f 'node .*app.js'
curl -sI https://<domain>/ | head -1
tail -n 20 ~/node.log
```

If the site stays down after that, the restart has to be triggered in konsoleH
(Node.js configuration → deactivate / activate) by someone with access.

## Uploading documents

Copy the files into `FILES_DIR` so that the path matches the `storageKey` in
`src/content/documents.ts`. The file name is the name visitors download.

```bash
scp dignum-risk-assessment.pdf <server>:files/protected/
```

No restart is needed for new files; changes to `documents.ts` need an update (below).

## Updating

```bash
cd ~/apps/dignum
git pull
npm ci
npm run db:migrate   # only needed when drizzle/ has new migrations
npm run build
cp deploy/hetzner-app.js ~/public_html/atf_dignum_co_za/app.js   # only if it changed
```

Then restart (above).

## Staff notifications (hourly)

`/api/cron/notify` needs to be called hourly with the `CRON_SECRET`. Add a crontab entry
(`crontab -e`):

```cron
0 * * * * curl -fsS -H "Authorization: Bearer <CRON_SECRET>" https://<domain>/api/cron/notify > /dev/null
```

Trigger it once by hand to test (prints `{"notified":…,"failed":…}`):

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://<domain>/api/cron/notify
```

## Backups

Run manually whenever needed (e.g. daily during the campaign and once at the end):

```bash
cd ~/apps/dignum && deploy/backup.sh
```

It writes `backups/<YYYY-MM-DD_HHMM>/` with `dignum.dump` (restore with
`pg_restore --no-owner -d <url> dignum.dump`) and `subscribers.csv` / `downloads.csv` for sales.
It needs `pg_dump`/`psql` at least as new as the database server. The folder contains personal
data: it is git-ignored and readable by you only. Copy it off the server with
`scp -r <server>:apps/dignum/backups/<timestamp> .`.

## Troubleshooting

- Logs: `tail -f ~/node.log`
- `Cannot find module 'next'`: `npm ci` was not run in `~/apps/dignum`, or the checkout is elsewhere
  (set `DIGNUM_APP_DIR`).
- `Could not find a production build`: run `npm run build` in `~/apps/dignum`.
- Zod error on the first request: a variable in `.env.local` is missing or malformed.
- Mails fail with a timeout: use port 587 (STARTTLS); Hetzner blocks outgoing 25 and 465.
- Confirmation link points to the wrong host: check `APP_URL`.
- Download returns 404 although the document is listed: the file is missing below `FILES_DIR`
  (the log shows `Missing file for document …`).

## Fallback

The last Vercel version is on the `vercel` branch.
