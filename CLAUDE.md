# CLAUDE.md — TravelMate (tm-cards)

Entry point for AI agents working in this repo. Read this first, then the
focused docs in `docs/`. Verified against the code on branch
`feature/platform-upgrade` (2026-10-07).

## What this is

TravelMate is a **Telegram Mini App** (Next.js 14 App Router, React 18,
TypeScript strict) for finding travel companions in South-East Asia
(Vietnam, Bali, Thailand, Sri Lanka). UI copy is Russian. Three product
areas:

1. **Icebreaker card game** (`/icebreaker`) — swipeable question cards, 102
   questions in 7 categories, fully client-side. Non-admins land here.
2. **Onboarding wizard + matches** (`/profile`, `/home`, `/profile/[userId]`,
   `/settings/*`) — 11-step react-hook-form wizard that autosaves each step
   to PostgreSQL; match list; notification and matching-schedule settings.
3. **Matching engine + bot** (`lib/matchingService.ts`, `lib/bot.ts`) —
   compatibility scoring over `MatchingUser`, run by Vercel Cron through
   `/api/cron/matching`; grammY bot in webhook mode that can notify users
   about new matches.

Admin gate: `config/constants.ts` → `ADMIN_TELEGRAM_IDS`. Admins see
`AdminMenu` on `/`; everyone else is redirected to `/icebreaker`. The same
list is enforced server-side by `requireAdmin()` in `lib/auth.ts`.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 14.2.4, App Router; every page is `"use client"` |
| Package manager | **pnpm** only (`pnpm-lock.yaml`) |
| DB | PostgreSQL (Supabase) via **Prisma 5**: `MatchingUser`, `MatchResult`, `UserSettings` |
| Auth | `@tma.js/init-data-node/web` validates `Authorization: tma <initDataRaw>` on every API route (`lib/auth.ts`) |
| Telegram SDK | `@tma.js/sdk-react` **v3** (snake_case user fields, `tgWebApp*` launch params) |
| Bot | **grammY** webhook (`/api/bot/webhook`), setup via `/api/bot/setup` |
| Scheduling | **Vercel Cron** (`vercel.json`) → `GET /api/cron/matching` with `CRON_SECRET` |
| Forms | react-hook-form 7 through `app/profile/ui/WizardContext.tsx` |
| UI | **shadcn/ui** primitives in `components/ui/` (Button, Card, Switch) on Tailwind 3 + lucide-react icons; custom wizard components in `components/`; CSS vars in `app/_assets/globals.css`. Telegram UI (TGUI) is **removed** |
| i18n | next-intl, `public/locales/{ru,en}.json`, only `ru` is served |
| Tests / lint | none / `next lint` not configured (prompts) |

## Commands

```bash
pnpm install --frozen-lockfile    # runs prisma generate
pnpm dev                          # http://localhost:3000, Telegram env mocked in dev
pnpm build                        # prisma generate && next build
pnpm typecheck                    # tsc --noEmit — THE verification step (0 errors expected)
pnpm db:migrate                   # prisma migrate dev (needs DIRECT_URL)
pnpm db:deploy                    # prisma migrate deploy (CI/prod)
pnpm db:studio
```

### Verification policy

- No tests. Run `pnpm typecheck` after every change; `pnpm build` for
  routing/config/Prisma changes. `.next/types` errors mean stale cache →
  `rm -rf .next`.
- UI: `pnpm dev`, open `http://localhost:3000`. `core/mockEnv.ts` fakes a
  Telegram launch with user `ADMIN_TELEGRAM_IDS[0]` (admin) in development.
  API calls work against the mock because `lib/auth.ts` accepts unsigned
  init data **in development only**.
- Do not run `next lint` unattended.

## Where things live

```
app/
  _assets/globals.css     shadcn HSL tokens + brand vars + .theme-* utilities
  api/                    route handlers — all authenticated except /api/health, /api/bot/webhook, /api/cron/*
  icebreaker/             card game; constants/questions.ts is the question bank
  profile/ui/             Wizard (entry) → FlexibleWizard (engine) → WizardContext (RHF),
                          wizardConfig.ts (ONBOARDING_STEPS), steps/Step*.tsx
  home/, profile/[userId], settings/{profile,notifications,matching-schedule,subscription}
components/ui/            shadcn primitives (button, card, switch)
components/               Input, NextButton, PhotoUpload, SelectedButton, SelectionCard,
                          SelectionGrid, StepContainer, Root, AdminMenu, FooterMenu, Error*
core/init.ts, mockEnv.ts  SDK v3 bootstrap and dev mock (called from Root)
core/i18n/                next-intl wiring
hooks/useAuth.ts          client view of the Telegram user (UI gating only)
lib/auth.ts               authenticate / requireAdmin / ensureUser (server)
lib/api.ts                apiFetch / api.get|post|put with the tma header (client)
lib/bot.ts                grammY bot, BOT_COMMANDS, notifyUser
lib/matchingService.ts    matching engine (singleton)
lib/profileDto.ts         MatchingUser → Profile mapper for API responses
lib/prisma.ts, dateUtils.ts, settingsService.ts (client), utils.ts (cn)
prisma/                   schema + migrations
config/constants.ts       ADMIN_TELEGRAM_IDS, MENU_ITEMS, APP_METADATA
models/types.ts           Profile/User/settings types + option lists
docs/                     agent docs; docs/guides (RHF, wizard context, theme); docs/archive (stale)
```

## Request flow in one paragraph

The client calls our API only through `lib/api.ts`, which attaches
`Authorization: tma <raw init data>`. Every route calls `authenticate()` (or
`requireAdmin()`), which validates the signature with `TELEGRAM_BOT_TOKEN`
and returns `{ id, isAdmin, ... }`. Routes never trust ids from the body or
URL: `POST /api/profile` writes the caller's own row, `/api/matches/[id]`
allows only the owner or an admin, `/api/users` and `/api/matching` are
admin-only. Details in `docs/DATA_AND_API.md`.

## Conventions (short; full list in docs/CONVENTIONS.md)

- Aliases `@/*` → root, `@public/*` → `public/`.
- New UI: shadcn primitives from `@/components/ui`, semantic Tailwind classes
  (`bg-card`, `text-muted-foreground`, `border-border`). Never raw greys.
- Wizard steps take only `{ onNext }` and use `useWizardContext()`
  (`register`, `watch`, `setValue`, `Controller`). Register in `wizardConfig.ts`.
- Strings via `useTranslations('<namespace>')`, keys in **both** locale files.
- Server-only modules (`lib/prisma.ts`, `lib/auth.ts`, `lib/bot.ts`,
  `lib/matchingService.ts`) are never imported from client components.
- API JSON shape: `{ error }` with a status on failure; `{ success, data }`
  for ops routes; the profile routes return a `Profile` (see `lib/profileDto.ts`).
- Server logs: emoji-prefixed one-line `console.log`.

## Environment variables

`.env.local` (gitignored) for local work; `.env.example` documents everything.
`.env` is still tracked in git with old Supabase/Google credentials: the
owner has accepted that while the project is pre-production, but do not add
anything new there.

| Var | Purpose |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Prisma runtime / migrations |
| `TELEGRAM_BOT_TOKEN` | init-data validation **and** the bot. Required in production; optional in dev (unsigned data accepted) |
| `TELEGRAM_WEBHOOK_SECRET` | checked by grammY on every webhook update |
| `APP_URL`, `MINI_APP_URL` | https URL of the deployment; webhook target and bot buttons |
| `CRON_SECRET` | `Authorization: Bearer` expected by `/api/cron/matching` |
| `MATCHING_NOTIFICATIONS` | `"true"` to message both users when a match is created |

## Gotchas

- Opening a production build outside Telegram fails by design (no mock).
- `lib/prisma.ts` returns a no-op proxy during `next build` without
  `DATABASE_URL`; at runtime every DB route needs the real URL.
- The matching config edited through `PUT /api/matching` lives in memory and
  resets on redeploy.
- `UserSettings` rows are created lazily; `ensureUser()` creates the parent
  `MatchingUser` first.
- `core/i18n/config.ts` has `locales = ["ru"]`; `en.json` is kept in sync
  but never served.
- `FooterMenu` is not in the layout; pages include it and add `pb-24`.
- Never add a `components.json` (or any `components.*` file) at the repo
  root: with the `@/*` alias it shadows the `components/` barrel import.

## Docs

- `docs/CODEBASE_MAP.md` — every directory and file, with status tags
- `docs/DATA_AND_API.md` — Prisma schema, auth, every API route, matching algorithm
- `docs/DEV_WORKFLOW.md` — setup, running, DB, bot/webhook, verification, deploy
- `docs/CONVENTIONS.md` — code patterns to follow
- `docs/KNOWN_ISSUES.md` — remaining tech debt
- `docs/guides/` — react-hook-form wizard guide, wizard context guide, theme guide
- `docs/archive/` — stale historical docs (Mongo/Sheets/telegraf era); do not trust
