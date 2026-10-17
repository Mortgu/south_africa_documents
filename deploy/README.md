# Deployment (single server, no pipeline)

The site runs as a plain `next start` process under systemd, listening on `127.0.0.1:3000` only.
A reverse proxy on the same server (run by someone else) terminates TLS for the public domain.

Paths used below (adjust if needed, but keep `deploy/dignum.service` in sync):

| What | Path |
|---|---|
| App checkout | `/srv/dignum/app` |
| Documents (`FILES_DIR`) | `/srv/dignum/files` |
| Config | `/srv/dignum/app/.env.local` |
| Service user | `dignum` |

## First-time setup

```bash
# 1. Packages: Node 24 LTS, git, Postgres client (for migrations nothing else is needed;
#    pg_dump/psql are for deploy/backup.sh and must be >= the database server version)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash -
sudo apt install -y nodejs git postgresql-client

# 2. Service user and folders
sudo useradd --system --create-home --home-dir /srv/dignum --shell /bin/bash dignum
sudo -u dignum mkdir -p /srv/dignum/files/public /srv/dignum/files/protected

# 3. Code
sudo -u dignum git clone https://github.com/Mortgu/south_africa_documents.git /srv/dignum/app

# 4. Config: copy the template and fill in every value (see comments in the file)
sudo -u dignum cp /srv/dignum/app/.env.example /srv/dignum/app/.env.local
sudo -u dignum chmod 600 /srv/dignum/app/.env.local
sudo -u dignum nano /srv/dignum/app/.env.local
#    APP_URL=https://<public domain>   FILES_DIR=/srv/dignum/files   NODE_ENV is set by systemd

# 5. Build and create the tables
cd /srv/dignum/app
sudo -u dignum npm ci
sudo -u dignum npm run db:migrate
sudo -u dignum npm run build

# 6. Service
sudo cp deploy/dignum.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now dignum

# 7. Smoke test
curl -I http://127.0.0.1:3000/
```

`next build` needs roughly 1–2 GB of RAM. On a 2 GB server add swap first if the build gets killed:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

## Uploading documents

Copy the files into `FILES_DIR` so that the path matches the `storageKey` in
`src/content/documents.ts`. The file name is the name visitors download.

```bash
scp dignum-risk-assessment.pdf <server>:/tmp/
ssh <server> 'sudo install -o dignum -g dignum -m 640 /tmp/dignum-risk-assessment.pdf /srv/dignum/files/protected/'
```

No restart is needed for new files; changes to `documents.ts` need an update (below).

## Updating

```bash
cd /srv/dignum/app
sudo -u dignum git pull
sudo -u dignum npm ci
sudo -u dignum npm run db:migrate   # only needed when drizzle/ has new migrations
sudo -u dignum npm run build
sudo systemctl restart dignum
```

## Reverse proxy (for whoever runs it)

- Upstream: `http://127.0.0.1:3000`
- Forward `Host`, `X-Forwarded-For` and `X-Forwarded-Proto: https`.
- Do not cache `/api/*` (downloads of protected documents are per visitor).
- `APP_URL` in `.env.local` must be the public `https://` URL; links in emails and redirects use it.

## Staff notifications (hourly)

The route `/api/cron/notify` needs to be called hourly with the `CRON_SECRET`. How it is triggered
is not decided yet. One option is a crontab entry for the `dignum` user (`sudo -u dignum crontab -e`):

```cron
0 * * * * curl -fsS -H "Authorization: Bearer <CRON_SECRET>" http://127.0.0.1:3000/api/cron/notify > /dev/null
```

Trigger it once by hand to test (prints `{"notified":…,"failed":…}`):

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" http://127.0.0.1:3000/api/cron/notify
```

## Backups

Run manually whenever needed (e.g. daily during the campaign and once at the end):

```bash
cd /srv/dignum/app && sudo -u dignum deploy/backup.sh
```

It writes `backups/<YYYY-MM-DD_HHMM>/` with `dignum.dump` (restore with
`pg_restore --no-owner -d <url> dignum.dump`) and `subscribers.csv` / `downloads.csv` for sales.
The folder contains personal data: it is git-ignored and readable by the `dignum` user only.
Copy it off the server with `scp -r <server>:/srv/dignum/app/backups/<timestamp> .`.

## Troubleshooting

- Logs: `journalctl -u dignum -f`
- App won't start with a Zod error: a variable in `.env.local` is missing or malformed.
- Mails fail with a timeout: Hetzner blocks outgoing ports 25 and 465 on new cloud servers.
  Use port 587 (STARTTLS) or ask Hetzner support to unblock the port.
- Confirmation link points to the wrong host: check `APP_URL`.
- Download returns 404 although the document is listed: the file is missing below `FILES_DIR`
  (the journal shows `Missing file for document …`).

## Fallback

The last Vercel version is on the `vercel` branch.
