# Admin Panel Setup

The admin panel lets you create and manage pages with full **language support** (24 locales) while keeping your current setup intact.

## Stack

- **Prisma** + SQLite (or PostgreSQL)
- **Next.js API routes** for CRUD
- Admin UI at `/twojastara` (skips i18n middleware)
- Public pages at `/[locale]/pages/[slug]`

## Setup

1. **Create `.env`** in the `unit/` folder:

```bash
cd unit
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL="file:./prisma/dev.db"
```

For PostgreSQL (production):

```
DATABASE_URL="postgresql://user:password@localhost:5432/calculinohub?schema=public"
```

2. **Install dependencies and run migrations**:

```bash
pnpm install
pnpm prisma:migrate
```

3. **Start dev server** (Next.js admin):

```bash
npm run dev:next
# or: pnpm run dev:next
```

4. **Open admin panel**:

- http://localhost:3000/twojastara

## Admin Routes

| Route | Description |
|-------|-------------|
| `/twojastara` | Dashboard |
| `/twojastara/pages` | List all pages |
| `/twojastara/pages/new` | Create new page with translations |
| `/twojastara/pages/[id]/edit` | Edit page |

## Public Pages & Sitemap

- **Published checkbox must be checked** for a page to appear on the public site and in `sitemap.xml`.
- Pages created **locally** (localhost) stay in your local database — they do not sync to production. Create pages on the **live site** (e.g. https://calculinohub.com/twojastara) to have them on production and in the sitemap.

Pages created in the admin are published at:

- English: `/calculators/[category]/[slug]` (e.g. `/calculators/math/adding-fractions`)
- Other locales: `/[locale]/calculators/[category]/[slug]` (e.g. `/de/calculators/math/adding-fractions`)

Category and slug are both required. Choose category from the dropdown (math, electric, biology, etc.).

## Database Schema

- **Page**: slug, category, published, calculatorCode, linkedCalculatorPath
- **PageTranslation**: locale, title (SEO), description (meta), content (Markdown)

## Add Page Form

- **Category** — Dropdown (math, electric, biology, conversion, physics, etc.)
- **SEO Title** — Page title for search results
- **Meta Description** — SEO meta description (150–160 chars)
- **Add Calculator Code** — Collapsible section:
  - Link to existing calculator (dropdown)
  - Calculator code (TSX/JS) — shown on /pages/[slug]/calculator subpage

## Security

Admin panel requires login. Credentials are stored in the database.

**Default user** (created by seed):
- Email: `slavomir.gorecki@gmail.com`
- Password: `Test456`

1. Set `ADMIN_SESSION_SECRET` in `.env` (use a long random string in production)
2. Run `npm run prisma:seed` to create/update the admin user

## Prisma Commands

```bash
pnpm prisma:migrate   # Run migrations (dev)
pnpm prisma:generate  # Generate client
pnpm prisma:studio    # Open Prisma Studio (DB GUI)
```
