# dignum Downloads

A lean site where visitors download documents. Some documents are free; protected ones are unlocked once via an email confirmation link.

Stack: Next.js (App Router) · Tailwind CSS · Vercel Blob · Postgres (Drizzle) · Resend

## Development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Adding a document

1. Upload the file to the private Vercel Blob store under `public/…` or `protected/…`. The file name is what visitors download, e.g. `protected/dignum-risk-assessment.pdf`.
2. Add an entry to `src/content/documents.ts` (`access: "public"` or `"protected"`).

## Design

The design mockups live in `design/` (reference only). View them with `python3 -m http.server` inside a mockup folder.
