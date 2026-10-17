# Spec: Umzug von Vercel auf einen eigenen Hetzner-Server, Resend → Nodemailer

> Status: **ready-for-agent** · Erstellt am 2026-10-16 aus einer Grilling-Session · Ausgangsstand `main` = `d8a062f`
> Die Umsetzung ist bewusst noch **nicht** gestartet.

## Problem Statement

Die Download-Seite (öffentliche und per E-Mail-Bestätigung geschützte Dokumente, Registrierungsformular, Staff-Benachrichtigung) läuft heute auf Vercel und nutzt dort mehrere Vercel-eigene Dienste: Vercel Blob für die Dateien, Vercel Cron für die stündliche Staff-Benachrichtigung, BotID als Bot-Schutz und Neon (über die Vercel-Integration) als Datenbank. Mails gehen über Resend.

Die Seite soll stattdessen auf einem **eigenen Hetzner-Server** laufen. Die Datenbank ist ein **Postgres, für das der Betreiber Zugangsdaten bekommt**, und Mails gehen per **SMTP über Nodemailer** mit Zugangsdaten, die ebenfalls gestellt werden. Die Seite ist nur **wenige Tage (ca. eine Woche) online** und wird danach nicht weiterentwickelt. Deshalb wird auf Pipeline, Docker, CDN und automatische Backups verzichtet. Deployment, Betrieb und Datensicherung sollen trotzdem nachvollziehbar dokumentiert und von Hand einfach durchführbar sein.

## Solution

- Der Code läuft nach dem Umbau **nur noch auf einem normalen Node-Server** (harter Wechsel). Der bisherige Vercel-Stand ist auf dem Branch `vercel` gesichert und gepusht (`origin/vercel` = `d8a062f`).
- **Dateien** liegen in einem Ordner im Dateisystem des Servers. Die Download-Route prüft den Zugang wie bisher und liefert die Datei selbst als Download aus. Es gibt keine signierte Fremd-URL mehr.
- **Mails** gehen über Nodemailer an einen SMTP-Server. Die React-Email-Templates bleiben und werden zu HTML (und Text) gerendert.
- **Datenbank**: beliebiges Postgres über eine Connection-URL. Die neue DB startet **leer** und wird mit den vorhandenen Drizzle-Migrationen angelegt. Aus Neon werden keine Daten übernommen, dort liegen nur Testdaten.
- **Bot-Schutz**: BotID, Honeypot und Mindest-Ausfüllzeit werden entfernt. Es bleibt das bestehende Rate-Limit (max. 3 Bestätigungsmails pro E-Mail-Adresse und Stunde) plus der Double-Opt-in.
- **Betrieb**: `git pull && npm ci && npm run build`, der Prozess läuft als systemd-Service und lauscht nur auf `127.0.0.1:3000`. Davor sitzt ein Reverse Proxy, den **eine andere Person** zusammen mit Domain und TLS betreibt.
- **Staff-Benachrichtigung**: Die Cron-Route bleibt unverändert. *Wie* sie stündlich ausgelöst wird, entscheidet der Betreiber später, sobald die Seite läuft. Die Anleitung bietet Crontab + curl als Option an.
- **Datensicherung**: kein automatisches Backup. Stattdessen gibt es ein **manuell auszuführendes Backup-Skript**, das einen vollständigen Dump und CSV-Exporte in einen Ordner mit Zeitstempel schreibt.
- **Dokumentation**: eine Schritt-für-Schritt-Anleitung für Einrichtung, Update, Dokumente-Upload und Backup, dazu eine systemd-Unit im Repo.

## User Stories

**Besucher**

1. As a visitor, I want to download public documents with one click, so that I get the file without registering.
2. As a visitor, I want the file to be offered as a download with its proper file name (e.g. `dignum-risk-assessment.pdf`), so that it is not opened inline under a cryptic name.
3. As a visitor, I want to register with name, company, optional job title/phone and email, so that I can unlock protected documents.
4. As a visitor, I want to receive the confirmation email promptly and reliably (not in spam), so that I can confirm my address.
5. As a visitor, I want the confirmation link in the email to point to the public domain (not `127.0.0.1` or `localhost`), so that the link works.
6. As a visitor, I want to be redirected back to the public site after clicking the confirmation link, already signed in, so that I can download protected documents immediately.
7. As a visitor, I want the page I left open to notice my confirmation (session polling), so that I don't have to reload manually.
8. As a signed-in visitor, I want to download protected documents for 30 days without re-confirming, so that I don't have to register again.
9. As a visitor without a session, I want to be sent back to the start page when I open a protected download URL, so that I see the registration form instead of an error.
10. As a visitor, I want a clear error message when the email could not be sent, so that I know I should try again later.
11. As a visitor, I want a clear message when I've requested too many confirmation emails, so that I understand why nothing arrives.
12. As a visitor, I want registration to work without invisible third-party bot checks, so that the form works the same in every browser and setup.

**Staff (Vertrieb)**

13. As a staff member, I want to receive one email per registration once the configured delay (default 24 h) has passed after confirmation, so that I can follow up on leads.
14. As a staff member, I want that email to list the documents the lead downloaded since confirming, so that I know what they're interested in.
15. As a staff member, I want to reply directly to the lead from the notification email (Reply-To = lead), so that follow-up is quick.
16. As a staff member, I want returning registrations to be marked as such, so that I don't treat them as new leads.
17. As a staff member, I want not to receive duplicate notifications for the same confirmation, so that my inbox stays clean (guaranteed by `notifiedAt`, not by a mail-provider idempotency key).

**Betreiber (Entwickler, der deployt)**

18. As the operator, I want a step-by-step guide in the repo for setting up a fresh server, so that I don't have to rely on memory or a pipeline.
19. As the operator, I want to update the site with `git pull && npm ci && npm run build && systemctl restart …`, so that a deploy takes a minute without extra tooling.
20. As the operator, I want the app to restart automatically after crashes and server reboots, so that the site stays online during the campaign week.
21. As the operator, I want the app to listen only on `127.0.0.1:3000`, so that it's reachable only through the reverse proxy.
22. As the operator, I want a single `.env.local` in the project directory as the only configuration source (read by Next.js, Drizzle and the backup script), so that there's exactly one place for secrets.
23. As the operator, I want the app to fail with a clear validation error when a required environment variable is missing or malformed, so that I notice misconfiguration immediately.
24. As the operator, I want to configure SMTP with host, port, user, password and sender, with TLS mode derived from the port, so that I can use the credentials I'm given as-is.
25. As the operator, I want to point the app at any Postgres via one connection URL, so that it doesn't matter who hosts the database.
26. As the operator, I want to create the schema in the new database with the existing `npm run db:migrate`, so that I don't need manual SQL.
27. As the operator, I want to upload documents by copying files into the documents folder (e.g. via `scp`) under `public/…` or `protected/…`, so that adding documents needs no storage console.
28. As the operator, I want the folder for documents to be configurable via one absolute path, so that it can live outside the repo checkout and survive re-clones.
29. As the operator, I want a missing document file to produce a clean 404 and a log entry instead of a crash, so that a forgotten upload is easy to diagnose.
30. As the operator, I want a backup script I run by hand that writes a full DB dump plus CSV exports into a timestamped folder, so that I can back up or hand over leads whenever I choose.
31. As the operator, I want backup output to be git-ignored, so that personal data never ends up in the **public** GitHub repo.
32. As the operator, I want to trigger the staff notification manually with curl and the cron secret, so that I can test it and later wire it to whatever scheduler I choose.
33. As the operator, I want logs available via `journalctl`, so that I can debug mail and DB errors on the server.
34. As the operator, I want all Vercel-specific code, config and dependencies removed, so that nothing silently depends on a platform that's no longer there.
35. As the operator, I want the old Vercel version to remain available on the `vercel` branch, so that I can fall back to it if the migration fails.

**Proxy-/Domain-Betreiber (andere Person)**

36. As the person running the reverse proxy, I want to be told exactly one upstream (`127.0.0.1:3000` on the same server) and which headers to forward, so that the setup is unambiguous.
37. As the person running the reverse proxy, I want the app to work correctly behind TLS termination, so that cookies are set as secure and redirects use `https`.

**Datenschutz / Ende der Laufzeit**

38. As the data owner, I want to export all subscribers and downloads as CSV at the end of the campaign, so that sales can keep working with the leads.
39. As the data owner, I want the database not to be deleted automatically, so that I decide myself when data is removed.

## Implementation Decisions

**Mail-Modul (Resend → Nodemailer)**
- Die öffentliche Schnittstelle des Mail-Moduls bleibt bis auf eine Ausnahme gleich: „Bestätigungsmail senden (an, Vorname, Bestätigungs-URL)“ und „Lead-Benachrichtigung senden (Empfängerliste, Props)“. **Die Ausnahme:** Der Idempotency-Key-Parameter der Lead-Benachrichtigung entfällt. Der Aufrufer im Benachrichtigungsmodul wird entsprechend angepasst. Doppelte Mails verhindert weiterhin `notifiedAt`. Das Restrisiko (Mail ist raus, aber das DB-Update auf `notifiedAt` schlägt fehl → beim nächsten Lauf geht die Mail erneut raus) wird bewusst in Kauf genommen.
- Ein Nodemailer-Transport wird lazy erzeugt und wiederverwendet (wie bisher der Resend-Client).
- TLS ergibt sich aus dem Port: **465 → direktes TLS (`secure: true`)**, sonst STARTTLS. Empfehlung für die Umsetzung: TLS bei STARTTLS **erzwingen** (`requireTLS`), damit die Zugangsdaten nie im Klartext übertragen werden.
- Die Templates (React Email: Verify-Mail, Lead-Notification) bleiben. Gerendert wird mit `@react-email/render`, das bereits als Dependency vorhanden ist: HTML plus eine Plain-Text-Variante.
- Absender bleibt `EMAIL_FROM`, Reply-To der Lead-Mail bleibt die Adresse des Leads, die Betreffzeilen bleiben unverändert.
- Der Fehlervertrag bleibt gleich: Senden schlägt fehl → das Modul wirft einen Error. Die Aufrufer (Registrierungs-Action, Benachrichtigungsjob) behandeln das bereits.
- Dependencies: `nodemailer` (+ `@types/nodemailer` als devDependency) hinzu, `resend` entfernen.
- Hinweis aus dem Grilling: Hetzner sperrt bei neuen Cloud-Servern ausgehend standardmäßig die Ports 25 und 465. Port 587 (STARTTLS) zu einem externen SMTP-Server funktioniert. Falls die gestellten Zugangsdaten Port 465 vorsehen, muss beim Hetzner-Support eine Freischaltung beantragt oder auf 587 ausgewichen werden.

**Storage-Modul (Vercel Blob → Dateisystem)**
- Das Storage-Modul war schon als einziger Zugriffspunkt angelegt („swap it out“). Neue Schnittstelle: Es liefert zu einem `storageKey` die Datei als **streambaren Body plus Metadaten** (Dateiname = Basename des Keys, Größe, Content-Type). Bisher lieferte es eine signierte URL.
- Ablage: `FILES_DIR/<storageKey>`. Die `storageKey`-Werte in der Dokumentenliste behalten ihr Format (`public/…`, `protected/…`) und bleiben unverändert.
- Sicherheit: Der aufgelöste Pfad muss innerhalb von `FILES_DIR` liegen, sonst wird abgelehnt. Die Keys kommen zwar aus dem Code und nicht aus User-Input, die Prüfung ist trotzdem Pflicht.
- Fehlt die Datei → Fehler, den die Route als 404 behandelt, plus Log-Eintrag.
- Content-Type nach Dateiendung (mindestens `application/pdf`, Fallback `application/octet-stream`).
- Dependency `@vercel/blob` entfernen.

**Download-Route**
- Ablauf bleibt: Dokument per Slug finden (404, wenn unbekannt) → Subscriber aus der Session laden → geschützt und ohne Session → Redirect auf die Startseite → Download loggen (darf den Download nie blockieren) → ausliefern.
- **Neu:** Statt Redirect auf eine Blob-URL **streamt die Route die Datei selbst** mit `Content-Disposition: attachment; filename="<basename>"`, `Content-Type`, `Content-Length` und `Cache-Control: no-store` bzw. `private`. Geschützte Dateien dürfen von keinem Proxy oder CDN gecacht werden.
- Reihenfolge: Erst prüfen, ob die Datei existiert, dann loggen, damit fehlgeschlagene Downloads nicht als Download gezählt werden. (Kleine Verbesserung gegenüber heute, gehört in den Umbau.)

**Bot-Schutz entfernen**
- BotID komplett entfernen: Config-Wrapper in der Next-Config, Client-Instrumentation-Datei (wird gelöscht), Server-Check in der Registrierungs-Action, Dependency `botid`.
- Ebenfalls entfernen: Honeypot-Feld samt Refs im Formular, Mindest-Ausfüllzeit und den `SpamSignals`-Parameter der Registrierungs-Action. Die Action nimmt wieder nur die Registrierungsdaten entgegen.
- Für diese Teile entspricht der Zielzustand dem Code von `87ea717`, also vor dem BotID-Commit.
- **Bleibt:** das Rate-Limit `MAX_REQUESTS_PER_HOUR = 3` pro E-Mail-Adresse über `verification_tokens`. Es war schon vor dem BotID-Commit drin.

**Datenbank**
- Treiber und ORM bleiben (`postgres` + Drizzle). `prepare: false` und der Kommentar zu Neon/PgBouncer werden entfernt. Pool-Größe `max: 5` bleibt.
- Migrationen nutzen nur noch `DIGNUM_DATABASE_URL`, der Fallback auf `DIGNUM_DATABASE_URL_UNPOOLED` entfällt.
- Variablenname `DIGNUM_DATABASE_URL` bleibt, um unnötige Änderungen zu vermeiden.
- Falls die gestellte DB SSL verlangt, kommt das über die URL (`?sslmode=require`). Dafür ist keine Code-Änderung vorgesehen.
- Keine Schema-Änderungen. Die bestehenden Migrationen `0000`–`0003` legen die leere DB an.

**Umgebungsvariablen (Zielzustand)**
- Pflicht (validiert, lazy geparst wie bisher): `APP_URL` (öffentliche https-Domain), `DIGNUM_DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT` (Zahl), `EMAIL_FROM`, `SMTP_USER`/`SMTP_PASSWORD` (optional, leer = ohne Auth für lokale Mail-Catcher), `SESSION_SECRET` (≥ 32 Zeichen), `FILES_DIR` (absoluter Pfad).
- Benachrichtigung (separat validiert wie bisher): `NOTIFY_EMAILS`, `NOTIFY_DELAY_HOURS` (Default 24), `CRON_SECRET` (≥ 16).
- Entfallen: `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `DIGNUM_DATABASE_URL_UNPOOLED`.
- Einzige Quelle auf dem Server: **`.env.local` im Projektverzeichnis**. Next.js lädt sie im Produktionsbetrieb selbst, Drizzle-Kit und das Backup-Skript lesen sie ebenfalls. Die systemd-Unit braucht deshalb kein eigenes `EnvironmentFile`. (Das ist eine Verfeinerung gegenüber dem Grilling, wo noch `EnvironmentFile` stand. Ziel: eine einzige Quelle.)
- `.env.example` wird auf genau diese Variablen umgeschrieben, die Hinweise auf Vercel und Neon fliegen raus.

**Vercel-Reste**
- `vercel.json` (Cron-Definition) löschen.
- Den Fallback auf `VERCEL_PROJECT_PRODUCTION_URL` für die `metadataBase` entfernen: `APP_URL` → sonst `http://localhost:3000`.
- Den Kommentar in der Cron-Route neutral formulieren („stündlich von einem externen Scheduler aufgerufen, Bearer = CRON_SECRET“). Die Logik bleibt unverändert.
- README: Den Stack und die Abschnitte „Adding a document“ und „Staff notifications“ auf Dateisystem, SMTP und manuellen Trigger umschreiben.

**Prozess und Netzwerk**
- Das Start-Skript startet Next.js gebunden an `127.0.0.1`, Port `3000` (`next start -H 127.0.0.1 -p 3000`).
- systemd-Unit: eigener, unprivilegierter Benutzer, `WorkingDirectory` = Checkout, `Restart=always`, `NODE_ENV=production`, startet über `npm start`. Logs landen im Journal.
- Node 24 LTS auf dem Server (lokal entwickelt mit v24.12).
- Gebaut wird auf dem Server. Kleine Server (2 GB RAM) können beim `next build` knapp werden. Die Anleitung erwähnt eine Swap-Datei als Abhilfe.
- **Reverse Proxy (Fremdbetrieb):** Upstream `127.0.0.1:3000` auf demselben Server. Der Proxy muss `Host` (bzw. `X-Forwarded-Host`) und `X-Forwarded-Proto: https` weiterreichen.
  - **Offenes Risiko / Empfehlung für die Umsetzung:** Die Verify-Route und die Download-Route bauen ihre Redirect-Ziele heute aus `request.url`. Leitet der Proxy den Host nicht korrekt weiter, zeigen die Redirects auf `127.0.0.1:3000`. Empfehlung: Redirect-Ziele in diesen Routen aus `APP_URL` bilden, dann hängt das nicht vom Proxy ab. Beim Start der Umsetzung kurz bestätigen lassen.
- Das Session-Cookie ist bei `NODE_ENV=production` bereits `secure`. Hinter TLS-Terminierung funktioniert das, weil der Browser HTTPS spricht.

**Staff-Benachrichtigung**
- Die Route `/api/cron/notify` und das Benachrichtigungsmodul bleiben (bis auf den wegfallenden Idempotency-Key) unverändert.
- Der Auslöser ist **bewusst offen** (siehe Out of Scope). Die Anleitung dokumentiert den manuellen Aufruf per curl mit Bearer-Token und, als Option, eine stündliche Crontab-Zeile.

**Backup-Skript**
- Ein Shell-Skript zum manuellen Ausführen. Es liest `DIGNUM_DATABASE_URL` aus `.env.local` und legt `backups/<YYYY-MM-DD_HHMM>/` an mit:
  - einem vollständigen `pg_dump` im Custom-Format (`-Fc`), wiederherstellbar per `pg_restore`,
  - CSV-Exporten von `subscribers` und `downloads` (mit Header, über `psql \copy`).
- `backups/` kommt in `.gitignore`. Das ist wichtig, weil das Repo **öffentlich** ist.
- Voraussetzung auf dem Server: `postgresql-client` in einer Version ≥ der Server-Version (sonst verweigert `pg_dump`). Steht in der Anleitung.
- Das Skript bricht bei Fehlern ab (`set -euo pipefail`) und gibt am Ende den Zielordner aus.

**Deploy-Doku im Repo**
- Ein `deploy/`-Bereich mit drei Dateien:
  - Anleitung (`README.md`) für Ersteinrichtung, Update, Dokumente hochladen, Backup, Cron-Option, Hinweise für den Proxy-Betreiber und Troubleshooting (journalctl, SMTP-Ports).
  - systemd-Unit.
  - Backup-Skript.
- Ersteinrichtung laut Anleitung: Benutzer anlegen → Node 24 + Git + `postgresql-client` installieren → Repo klonen → `.env.local` anlegen → `FILES_DIR` mit `public/` und `protected/` anlegen und PDFs hochladen → `npm ci` → `npm run db:migrate` → `npm run build` → Unit installieren, `enable --now` → Smoke-Test über `curl 127.0.0.1:3000`.

**Git**
- Alle Änderungen gehen direkt auf `main` (kein Feature-Branch, kein PR). Der Backup-Branch `vercel` existiert bereits auf `origin`.

## Testing Decisions

- Im Repo gibt es **kein Test-Framework und keine bestehenden Tests**, also auch keine Vorlage, an der man sich orientieren könnte. Die Seite lebt etwa eine Woche und wird nicht weiterentwickelt. Deshalb wird **kein** Test-Framework eingeführt.
- **Ein einziger Test-Ansatzpunkt (höchstmöglicher):** die laufende App über HTTP, lokal mit `npm run build && npm start` gegen ein lokales Postgres und einen lokalen SMTP-Catcher (z. B. Mailpit auf Port 1025, ohne TLS), danach derselbe Ablauf auf dem Server. Getestet wird nur **äußeres Verhalten** (HTTP-Statuscodes, Header, Redirect-Ziele, empfangene Mails, DB-Zeilen), keine Interna.
- Für den lokalen Test gegen Mailpit braucht der SMTP-Transport ggf. eine Ausnahme für das erzwungene TLS, z. B. nur, wenn der Host `localhost` ist. Das wird bei der Umsetzung entschieden. Die Produktion bleibt bei erzwungenem TLS.
- Statische Prüfung: `npm run build` (inkl. Typecheck) und `npm run lint` müssen fehlerfrei durchlaufen. Danach dürfen im Code weder `@vercel/blob`, `botid` noch `resend` vorkommen.
- **Smoke-Test-Checkliste** (lokal und nach dem Deploy auf dem Server):
  1. Die Startseite lädt, keine Fehler im Journal.
  2. Öffentlicher Download: 200, `Content-Disposition: attachment` mit korrektem Dateinamen, die PDF ist intakt, eine Zeile in `downloads` mit `subscriber_id = NULL`.
  3. Geschützter Download ohne Session: Redirect auf die Startseite mit öffentlicher Domain.
  4. Registrierung: Die Bestätigungsmail kommt an (HTML + Text), der Link zeigt auf `APP_URL`.
  5. Klick auf den Link: Redirect auf `/?verified=1#protected` mit öffentlicher Domain, das Cookie `dl_session` ist gesetzt (secure in Produktion), die Zeile in `subscribers` existiert.
  6. Geschützter Download mit Session: 200, die Zeile in `downloads` hat eine `subscriber_id`.
  7. Viermal hintereinander registrieren mit derselben Adresse: Beim vierten Mal kommt die Rate-Limit-Meldung.
  8. Dokument, dessen Datei fehlt: 404 und Log-Eintrag, keine Zeile in `downloads`.
  9. `curl` auf `/api/cron/notify` ohne bzw. mit falschem Token: 401. Mit Token und `NOTIFY_DELAY_HOURS=0`: Die Lead-Mail kommt an, Reply-To = Lead, `notified_at` ist gesetzt. Ein zweiter Aufruf schickt nichts.
  10. `systemctl restart` sowie ein Server-Neustart: Die App kommt von selbst wieder hoch.
  11. Das Backup-Skript erzeugt den Ordner mit Zeitstempel, Dump und zwei CSVs. Der Dump lässt sich per `pg_restore --list` lesen.
  12. Port 3000 ist von außen nicht erreichbar.

## Out of Scope

- **Auslöser der stündlichen Staff-Benachrichtigung** (Crontab, systemd-Timer, In-Process-Timer). Klärt der Betreiber, sobald die Seite läuft. Die Anleitung nennt nur Optionen.
- **Domain, DNS, TLS-Zertifikate und Reverse-Proxy-Konfiguration**: übernimmt eine andere Person.
- **Bereitstellung von Postgres und SMTP**: Die Zugangsdaten werden gestellt. Wer die DB hostet und ob sie auf demselben Server liegt, ist noch nicht abschließend geklärt und für den Code egal.
- Datenübernahme aus Neon (nur Testdaten).
- Automatische Backups, Hetzner-Server-Backups, Monitoring und Alerting.
- Docker, CI/CD, Pipeline, Preview-Deployments, Zero-Downtime-Deploys.
- Bot-Schutz über Rate-Limit und Proof-of-Work hinaus (BotID, Turnstile, Honeypot, Mindest-Ausfüllzeit).
  - **Nachtrag 2026-10-17:** Ergänzt wurde ein selbst gehosteter Proof-of-Work (`altcha-lib`, PBKDF2/SHA-256, cost 1000, Zähler 2.000–4.000, Challenge 10 min gültig, signiert mit aus `SESSION_SECRET` abgeleiteten Schlüsseln, jede Lösung nur einmal gültig, gespeichert im Prozessspeicher). Er läuft in einem zusätzlichen Bestätigungsschritt nach „Submit & unlock“: Der Besucher klickt „Send confirmation link“, der Browser löst die Aufgabe, erst dann wird die Mail angefordert. „Resend the link“ löst ebenfalls eine neue Aufgabe.
- Weiterhin auf Vercel lauffähig bleiben (dafür gibt es den Branch `vercel`).
- Austausch der Platzhalter-Dokumente und -Texte in der Dokumentenliste (alle Einträge zeigen derzeit auf `public/test.pdf` bzw. `protected/test.pdf`).
- Abschalten bzw. Löschen des Vercel-Projekts und des Neon-Projekts. Das erledigt der Betreiber von Hand, **nachdem** die Hetzner-Version läuft.
- Löschkonzept und Aufbewahrungsfrist der Leads nach Kampagnenende (DSGVO). Die DB wird nicht automatisch gelöscht. Die Entscheidung liegt beim Datenverantwortlichen.

## Further Notes

**Entscheidungsprotokoll aus dem Grilling (2026-10-16)**

| # | Frage | Entscheidung |
|---|---|---|
| Q1 | Grund / Neon | Grund unerheblich. Neon wird durch ein normales Postgres ersetzt. |
| Q2 | Server | Eigener Server, Details noch offen. |
| Q3 | Deployment | `git pull && npm run build`, keine Pipeline (kurze Laufzeit, keine Weiterentwicklung). |
| Q4 | SMTP | Zugangsdaten werden gestellt. |
| Q5/Q17 | BotID-Arbeit | Committed als `d8a062f`, gesichert auf `vercel`. Auf `main` werden BotID **und** Honeypot **und** Mindest-Ausfüllzeit entfernt. |
| Q6 | Postgres | Zugangsdaten werden voraussichtlich gestellt. |
| Q7 | Dateien | Lokales Dateisystem, die Route streamt die Datei. |
| Q8 | Prozess | systemd. |
| Q9 | Domain/TLS | Übernimmt eine andere Person. |
| Q10 | Cron-Auslöser | Später klären. Die Route bleibt. |
| Q11 | Zusätzlicher Bot-Schutz | Nicht nötig. Das bestehende Rate-Limit bleibt. |
| Q12 | Harter Wechsel | Ja. Backup-Branch `vercel` liegt auf origin. |
| Q13 | Backups / Ende | Keine automatischen Backups, DB wird nicht sofort gelöscht. Stattdessen ein Skript zum manuellen Ausführen. |
| Q14 | Proxy-Standort | Gleicher Server, Upstream `127.0.0.1:3000`. |
| Q15 | Neon-Daten | Nicht relevant, die neue DB startet leer. |
| Q16 | Server-Setup | Der Betreiber richtet ihn selbst ein. Anleitung und systemd-Unit kommen ins Repo. |
| Q18 | Backup-Branch | Erledigt (`origin/vercel`). Änderungen direkt auf `main`. |
| Q19 | Backup-Format | `pg_dump` (Custom-Format) **und** CSV, in einem Ordner mit Zeitstempel. |
| Q20 | Variablennamen | `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`, `EMAIL_FROM` bleibt, `FILES_DIR`. |

**Für die Umsetzung zu beachten**
- Laut `AGENTS.md` ist das Next.js 16.3 mit Breaking Changes. Vor dem Coden die mitgelieferten Docs lesen, insbesondere den Self-Hosting-Guide (`node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`; Abschnitte Reverse Proxy, Environment Variables, Streaming) und die Route-Handler-Docs zum Streamen von Responses.
- Das Repo ist **öffentlich** (`github.com/Mortgu/south_africa_documents`). `.env*` ist schon ignoriert, `backups/` muss dazukommen. Keine echten Zugangsdaten in Doku-Beispiele schreiben.
- Bei der Umsetzung entschieden (2026-10-17): (1) Redirect-Ziele werden aus `APP_URL` statt `request.url` gebildet. (2) STARTTLS wird erzwungen, außer für `localhost`/`127.0.0.1` (lokaler Mail-Catcher). (3) Die Datenschutzerklärung nennt Hetzner als Hoster; DB- und Mail-Anbieter stehen als Platzhalter `[DATABASE PROVIDER]`/`[EMAIL PROVIDER]` drin, bis sie feststehen.

**Anhang: Codebase-Snapshot (Stand `d8a062f`, kann veralten)**
- `src/lib/email.ts`: Resend-Client; `sendVerificationEmail`, `sendLeadNotification(to, props, idempotencyKey)`.
- `src/lib/notifications.ts`: `notifyDueSubscribers()`. Ruft `sendLeadNotification` mit Key `notify-<id>-<ts>` auf und setzt danach `notifiedAt`. Batches von 50.
- `src/lib/storage.ts`: `getDownloadUrl(pathname)` über `issueSignedToken`/`presignUrl` von `@vercel/blob`, TTL 5 min, `?download=1`.
- `src/app/api/download/[slug]/route.ts`: Slug → Zugangsprüfung → `getDownloadUrl` → loggt in `downloads` → Redirect.
- `src/app/api/verify/route.ts`: Token-Hash prüfen (nicht single-use wegen Mail-Scannern, TTL 30 min), Upsert in `subscribers`, Cookie setzen, Redirect `/?verified=1#protected` über `request.url`.
- `src/app/api/session/route.ts`: wird vom Formular gepollt, `{ verified }`.
- `src/app/api/cron/notify/route.ts`: Bearer-Check gegen `CRON_SECRET` → `notifyDueSubscribers()`.
- `src/actions/requestAccess.ts`: Zod-Validierung, Rate-Limit 3/h pro Adresse, Token anlegen, Mail senden. Enthält derzeit `checkBotId`, `SpamSignals`, `MIN_FILL_TIME_MS`.
- `src/components/AccessPanel.tsx`: Registrierungsformular. Enthält derzeit Honeypot-Feld, `honeypotRef`, `renderedAtRef`.
- `src/instrumentation-client.ts`: nur `initBotId` (wird gelöscht).
- `next.config.ts`: `withBotId(nextConfig)`.
- `src/lib/env.ts`: zwei lazy validierte Zod-Schemata (`env()`, `notifyEnv()`).
- `src/lib/db/index.ts`: `postgres(url, { prepare: false, max: 5 })`.
- `drizzle.config.ts`: lädt `.env.local`, URL = `…_UNPOOLED ?? DIGNUM_DATABASE_URL`.
- `src/lib/session.ts`: JWT-Cookie `dl_session`, 30 Tage, `secure` bei `NODE_ENV=production`.
- `src/app/layout.tsx`: `siteUrl` = `APP_URL || VERCEL_PROJECT_PRODUCTION_URL || localhost`.
- `src/content/documents.ts`: 6 Platzhalter-Einträge, `storageKey` `public/test.pdf` bzw. `protected/test.pdf`.
- `vercel.json`: Cron `0 * * * *` → `/api/cron/notify`.
- `.env.example`, `README.md`: beschreiben noch Vercel Blob, Neon, Resend und Vercel Cron.
- Dependencies, die wegfallen: `@vercel/blob`, `botid`, `resend`. Neu: `nodemailer`, `@types/nodemailer`.
