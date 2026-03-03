# Kno.li

Kno.li let's you host portfolios and linkfolios for you, your brand or SaaS with stunning templates. It also includes per-profile analytics, custom domains, customization and cool og images. 

## Tech Stack

- Bun + Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL
- NextAuth
- Polar (checkout, portal, webhook billing flows)

## Getting Started

### 1) Install dependencies

```bash
bun install
```

### 2) Configure environment

Create `.env` from `.env.example` and fill values:

```bash
cp .env.example .env
```

Environment variables used:

- `SITE_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`
- `NEXT_PUBLIC_POLAR_PRODUCT_PRO_MONTHLY`
- `NEXT_PUBLIC_POLAR_PRODUCT_PRO_YEARLY`
- `NEXT_PUBLIC_POLAR_PRODUCT_ULTRA_MONTHLY`
- `NEXT_PUBLIC_POLAR_PRODUCT_ULTRA_YEARLY`

### 3) Run migrations

```bash
bun run db:generate
bun run db:migrate
```

### 4) Start development server

```bash
bun run dev
```

App runs at `http://localhost:3000`.

## Scripts

- `bun run dev` - Start local dev server
- `bun run build` - Build production app
- `bun run start` - Run built app
- `bun run lint` - Run ESLint
- `bun run db:generate` - Generate drizzle migration files
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema to database

## Path and Folder Structure

The tree below reflects the current tracked repository structure.

```text
.
├── app/
│   ├── [username]/
│   │   ├── opengraph-image.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── analytics/
│   │   │   └── collect/
│   │   │       └── route.ts
│   │   ├── apps/
│   │   │   ├── [appId]/
│   │   │   │   ├── analytics/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── content/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── domains/
│   │   │   │   │   ├── [domainId]/
│   │   │   │   │   │   ├── verify/
│   │   │   │   │   │   │   └── route.ts
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── og/
│   │   │   └── [username]/
│   │   │       └── route.tsx
│   │   └── polar/
│   │       ├── checkout/
│   │       │   └── route.ts
│   │       ├── portal/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── route.ts
│   ├── compare/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── create-app/
│   │   │   └── page.tsx
│   │   ├── manage-apps/
│   │   │   ├── [appId]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── plan/
│   │   │   ├── page.tsx
│   │   │   └── plan-client.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/
│   │   ├── login-providers.tsx
│   │   └── page.tsx
│   ├── preview/
│   │   └── page.tsx
│   ├── templates/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   ├── tnc/
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── opengraph-image.tsx
│   └── page.tsx
├── assets/
│   └── fonts/
│       └── GeistPixel-Square.ttf
├── components/
│   ├── analytics/
│   │   └── profile-link-tracker.tsx
│   ├── dashboard/
│   │   ├── app-actions-menu.tsx
│   │   ├── app-domains-card.tsx
│   │   ├── header.tsx
│   │   ├── icon-picker.tsx
│   │   ├── sidebar.tsx
│   │   ├── stat-card.tsx
│   │   └── theme-toggle.tsx
│   ├── errors/
│   │   ├── index.ts
│   │   ├── invalid-config.tsx
│   │   └── not-found.tsx
│   ├── landing/
│   │   ├── domains-section.tsx
│   │   ├── facts-section.tsx
│   │   ├── github-pill.tsx
│   │   ├── hero-section.tsx
│   │   ├── how-to-section.tsx
│   │   ├── portfolios-section.tsx
│   │   ├── pricing-section.tsx
│   │   ├── site-footer.tsx
│   │   ├── stats-section.tsx
│   │   ├── templates-section.tsx
│   │   ├── theme-toggle.tsx
│   │   └── website-links.tsx
│   ├── ui/
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── multi-step-form.tsx
│   │   ├── popover.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── auth-session-provider.tsx
│   ├── expandable-gallery.tsx
│   ├── icons.tsx
│   ├── pricing-card.tsx
│   ├── status-button.tsx
│   └── theme-provider.tsx
├── data/
│   └── hosted-profiles.json
├── db/
│   ├── analytics.ts
│   ├── apps.ts
│   ├── auth.ts
│   ├── billing.ts
│   ├── enums.ts
│   └── schema.ts
├── drizzle/
│   ├── meta/
│   │   ├── 0000_snapshot.json
│   │   ├── 0001_snapshot.json
│   │   ├── 0002_snapshot.json
│   │   └── _journal.json
│   ├── 0000_gigantic_captain_midlands.sql
│   ├── 0001_schema_rebuild.sql
│   ├── 0002_app_status_two_values.sql
│   └── 0003_analytics_dedup.sql
├── hooks/
│   └── use-outside-click.ts
├── lib/
│   ├── api/
│   │   └── response.ts
│   ├── gating/
│   │   └── plan-features.ts
│   ├── og/
│   │   ├── main-site-image.tsx
│   │   ├── profile-template-image.tsx
│   │   ├── profile-template-visuals.tsx
│   │   └── shared.ts
│   ├── repositories/
│   │   ├── analytics-repo.ts
│   │   ├── apps-repo.ts
│   │   ├── billing-repo.ts
│   │   └── domains-repo.ts
│   ├── services/
│   │   ├── analytics-service.ts
│   │   ├── apps-service.ts
│   │   └── domains-service.ts
│   ├── tracking/
│   │   ├── geo.ts
│   │   └── visitor-fingerprint.ts
│   ├── utils/
│   │   └── validation.ts
│   ├── validators/
│   │   ├── app-schema.ts
│   │   └── domain-schema.ts
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── current-user.ts
│   ├── db-errors.ts
│   ├── db.ts
│   ├── dummy-profile.ts
│   ├── hosted-profiles.ts
│   ├── icons.ts
│   ├── profile-theme.ts
│   ├── profile.ts
│   ├── rate-limit.ts
│   ├── sfx.ts
│   ├── types.ts
│   ├── username-policy.ts
│   └── utils.ts
├── public/
│   ├── flat_logo.png
│   └── logo.png
├── templates/
│   ├── linkfolio/
│   │   ├── 1/
│   │   │   ├── banner.png
│   │   │   ├── dummy.json
│   │   │   ├── index.tsx
│   │   │   ├── og-image.tsx
│   │   │   └── req.ts
│   │   ├── 2/
│   │   │   ├── banner.png
│   │   │   ├── dummy.json
│   │   │   ├── index.tsx
│   │   │   ├── og-image.tsx
│   │   │   └── req.ts
│   │   └── og-image.tsx
│   ├── portfolio/
│   │   ├── 1/
│   │   │   ├── banner.png
│   │   │   ├── dummy.json
│   │   │   ├── index.tsx
│   │   │   ├── og-image.tsx
│   │   │   └── req.ts
│   │   ├── 2/
│   │   │   ├── banner.png
│   │   │   ├── dummy.json
│   │   │   ├── index.tsx
│   │   │   ├── og-image.tsx
│   │   │   └── req.ts
│   │   ├── 3/
│   │   │   ├── banner.png
│   │   │   ├── dummy.json
│   │   │   ├── index.tsx
│   │   │   └── req.ts
│   │   └── og-image.tsx
│   ├── index.ts
│   └── types.ts
├── types/
│   ├── google-identity.d.ts
│   └── next-auth.d.ts
├── .gitignore
├── README.md
├── bun.lock
├── components.json
├── drizzle.config.ts
├── eslint.config.mjs
├── main.json
├── next.config.ts
├── package-lock.json
├── package.json
├── plan.md
├── postcss.config.mjs
├── proxy.ts
├── tsconfig.json
```
