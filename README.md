# MarineYard

**MarineYard** (https://marineyard.com) is a global marketplace for ship spare parts and marine equipment, with a Resources section of marine engineering articles.

- **Marketplace** — anyone can create an account and list parts (`/listings`, `/dashboard/listings/new`). Free accounts get 90 credits (9 listings, 10 credits each); paid plans add a monthly allowance plus featured / top placement.
- **Buyer ↔ seller contact** — signed-in members see seller contact details and can send inquiries that land in the seller's dashboard (`/dashboard/inquiries`).
- **Resources** — the CMS-driven article section (`/resources`, articles at `/<slug>`), published from Admin → Pages or Writerfy.
- **Admin** (`/admin`) — listing moderation, pages, homepage blocks, menus, theme, SEO health, indexing report (Google + Bing + IndexNow), rank tracker, ads, subscriptions.

## Stack

Next.js 13.5 (App Router, standalone output) · PostgreSQL 16 · Better Auth (email + Google) · Paddle subscriptions · Tailwind CSS.

## Local development

```bash
npm ci --legacy-peer-deps
# a local Postgres, e.g. docker run -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16-alpine
export DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres
export BETTER_AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
export NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm run db:migrate
npm run dev
```

`db/schema.sql` is idempotent and is applied on every container start.

## Deployment (Hetzner + Coolify)

`docker-compose.yml` is the Coolify resource (app + Postgres). See the comments at the top of that file for every optional environment variable (Google sign-in, GA4, Search Console / Bing verification, Paddle, Writerfy).

DNS: point `marineyard.com` and `www.marineyard.com` (A records) at the server's IP.

## Plans

| Plan | Price | Listings |
| --- | --- | --- |
| Free | $0 | 9 (one-time) |
| Starter | $4.99/mo | 12 / month |
| Explorer | $9.99/mo | 55 / month + featured placement |
| Pro | $19.99/mo | 120 / month + top placement + priority support |

All paid plans: 7-day free trial, 50% off the first month, 14-day money-back guarantee, cancel anytime.
