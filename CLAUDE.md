# CLAUDE.md — TravelMate (tm-cards)

Entry point for AI agents working in this repo. Read this first, then the
focused docs in `docs/`. Verified against the code on branch
`feature/relational-schema` (2026-10-08).

## What this is

TravelMate is a **Telegram Mini App** (Next.js 14 App Router, React 18,
TypeScript strict) for finding travel companions in South-East Asia
(Vietnam, Bali, Thailand, Sri Lanka). UI copy is Russian. Product areas:

1. **Icebreaker card game** (`/icebreaker`) — swipeable question cards, 102
   questions in 7 categories, fully client-side.
2. **Questionnaire** (`/profile`, «Анкета» tab, `/settings/*`) — until
   `isComplete` an 11-step react-hook-form wizard that autosaves each step to
   PostgreSQL; afterwards my card in its template + city + meeting formats,
   «Редактировать анкету» reopens the wizard prefilled (`MyProfileView`);
   notification and matching-schedule settings. `/profile/[userId]` shows
   someone's questionnaire with their card template.
3. **Weekly meetings** — tab bar «Люди / Приглашения / Встречи / Анкета /
   Профиль» (`components/FooterMenu.tsx`):
   - `/meetings`, by phase of `WEEK_SCHEDULE` (`config/constants.ts`, all
     times adjustable): `week` — this round's pair, «Хочу познакомиться»,
     timer to `agreeDeadline`, contact once mutual, question of the week
     (`/meetings/[matchId]/question`); `feedback` — the impression flow for
     that pair; `signup` — opt-in («Участвую» / «Пропускаю неделю»).
   - `/home` («Люди»): meeting history, counters; `/home/meetings` full log;
     `/home/meetings/[matchId]` leave / read impressions.
   - `/invitations`: referral link (paid subscribers only).
   - Access = subscription or 30-day trial (`getAccess`); otherwise
     «Выбрать подписку» → `/settings/subscription` (mock, no payments yet).
4. **Matching engine + bot** (`lib/matchingService.ts`, `lib/bot.ts`) —
   compatibility scoring, run weekly by hand (GitHub Actions) through
   `/api/cron/matching`; grammY bot in webhook mode that notifies users
   about matches, accepts and impressions.

Admin gate: `config/constants.ts` → `ADMIN_TELEGRAM_IDS`. Admins see
`AdminMenu` on `/`; everyone else is redirected to `/meetings`. The same
list is enforced server-side by `requireAdmin()` in `lib/auth.ts`.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 14.2.4, App Router; every page is `"use client"` |
| Package manager | **pnpm** only (`pnpm-lock.yaml`) |
| DB | PostgreSQL (Supabase) via **Prisma 5**, relational model: `User`, `Profile`, `Location`, `Tag`/`ProfileTag`, `UserSettings`, `MatchRound`, `Match`, `MatchFeedback`, `Plan`, `Subscription`, `Payment` (snake_case tables) |
| Auth | `@tma.js/init-data-node/web` validates `Authorization: tma <initDataRaw>` on every API route (`lib/auth.ts`) |
| Telegram SDK | `@tma.js/sdk-react` **v3** (snake_case user fields, `tgWebApp*` launch params) |
| Bot | **grammY** webhook (`/api/bot/webhook`), setup via `/api/bot/setup` |
| Scheduling | None yet. Matching is weekly and started by hand: **GitHub Actions** `workflow_dispatch` (`.github/workflows/run-matching.yml`) → `GET /api/cron/matching` with `CRON_SECRET`. Later: a `vercel.json` cron |
| Forms | react-hook-form 7 through `app/profile/ui/WizardContext.tsx` |
| UI | **shadcn/ui**-style primitives in `components/ui/` (Button, Card, Switch, TextInput, TextArea, WindowTitleBar, ListItem, InterestChip, …; barrel `components/ui/index.ts`) on Tailwind 3 + lucide-react icons; wizard steps wrap them in `app/profile/ui/StepWindow.tsx`; profile card designs in `components/profile-templates/`; **XP Foundations** tokens (colors, Inter, type/spacing/radius scales) in `app/_assets/globals.css` + `tailwind.config.ts`, see `docs/guides/THEME_SYSTEM_GUIDE.md`. Telegram UI (TGUI) is **removed** |
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
pnpm db:seed                      # tags + locations reference data (idempotent)
pnpm db:cleanup-tags              # one-off: drop legacy trait/hobby tags (irreversible)
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
  _assets/globals.css     XP foundation tokens → shadcn aliases → legacy --theme-* aliases
  api/                    route handlers — all authenticated except /api/health, /api/bot/webhook, /api/cron/*
  icebreaker/             card game; constants/questions.ts is the question bank
  profile/ui/             Wizard (entry) → FlexibleWizard (engine) → WizardContext (RHF),
                          wizardConfig.ts (ONBOARDING_STEPS), StepWindow.tsx (step shell),
                          useLimitedSelection.ts (capped multi-select), steps/Step*.tsx
  meetings/                «Встречи» tab + [matchId]/question
  home/                    «Люди» tab, meetings/ (log), meetings/[matchId] (feedback flow)
  invitations/, profile/[userId], settings/{profile,notifications,matching-schedule,subscription}
components/ui/            shadcn + XP primitives (button, card, switch, text-input, list-item, …), barrel index.ts
components/profile-templates/  profile card designs (artwork in public/profile-templates + ImageTemplate overlay) + registry (ProfileCard)
components/meetings/      meetings UI: WeekMatchView, MeetingList, StatCard, CelebrationScreen, Countdown, BottomAction, …
components/               Root, AdminMenu, FooterMenu (+ feedback reminder), ErrorBoundary, ErrorPage (no barrel; import by path)
core/init.ts, mockEnv.ts  SDK v3 bootstrap and dev mock (called from Root)
core/i18n/                next-intl wiring
hooks/useAuth.ts          client view of the Telegram user (UI gating only)
lib/auth.ts               authenticate / requireAdmin / ensureUser (server)
lib/api.ts                apiFetch / api.get|post|put with the tma header (client)
lib/bot.ts                grammY bot, BOT_COMMANDS, notifyUser
lib/matchingService.ts    matching engine (singleton)
lib/meetingsService.ts    access (subscription/trial), week phase, participation, feedback rules (server)
lib/weekMatchService.ts   this week's pair: accept, contacts, question of the week (server)
lib/weekCycle.ts          WEEK_SCHEDULE math: getWeekPhase, agreeDeadline, closing unagreed pairs (server)
lib/pendingFeedback.ts, telegramLinks.ts  feedback-reminder cache, openTgLink (client)
lib/profileDto.ts         users+profiles+tags → UI Profile mapper (read side)
lib/profileService.ts     profile upsert: location/tag resolution, referral, validation (write side)
lib/prisma.ts, dateUtils.ts, settingsService.ts (client), utils.ts (cn),
  imageUtils.ts           fileToResizedDataUrl: client-side photo downscale (client)
prisma/                   schema, migrations, seed.ts (tags + locations)
config/constants.ts       ADMIN_TELEGRAM_IDS, MENU_ITEMS, APP_METADATA
models/types.ts           Profile/User/settings types + option lists
docs/                     agent docs; docs/guides (RHF, wizard context, theme); docs/archive (stale)
```

## Data layer in one paragraph

PostgreSQL with a relational model (see `docs/DATA_AND_API.md`). `users`
(Telegram id externally, uuid internally, with `referralCode` and
`referrerId`) have one `profiles` row (name, date of birth, location FK,
occupation, private `goals[]`, about, photo, socials, card `theme`,
`isComplete`) and M:N `tags` (categories `interest`, `value`, `format`)
through `profile_tags`; `locations` and `tags` are reference lists seeded by
`prisma/seed.ts` from `models/types.ts`. `user_settings` holds notification flags, matching pause
and preferences. Matching writes `matches` into weekly `match_rounds`;
`match_feedback` stores each participant's verdict. `plans`,
`subscriptions`, `payments` exist for Telegram Stars but have no API yet.
`lib/profileDto.ts` maps all of this back to the flat UI `Profile` type, so
the frontend did not change shape. Matches also carry per-side
`user1AcceptedAt`/`user2AcceptedAt`; feedback carries `impressions` and a
private `reason`. Lifecycle and every meetings route: `docs/DATA_AND_API.md`.

## Request flow in one paragraph

The client calls our API only through `lib/api.ts`, which attaches
`Authorization: tma <raw init data>`. Every route calls `authenticate()` (or
`requireAdmin()`), which validates the signature with `TELEGRAM_BOT_TOKEN`
and returns `{ id, isAdmin, ... }`. Routes never trust ids from the body or
URL: `POST /api/profile` writes the caller's own row, `/api/meetings/[matchId]/*`
allow only the two participants, `/api/users` and `/api/matching` are
admin-only. Details in `docs/DATA_AND_API.md`.

## Conventions (short; full list in docs/CONVENTIONS.md)

- Aliases `@/*` → root, `@public/*` → `public/`.
- New UI: shadcn primitives from `@/components/ui`, semantic Tailwind classes
  (`bg-card`, `text-muted-foreground`, `border-border`). Never raw greys.
- Wizard steps take only `{ onNext }`, render inside `<StepWindow>` and use
  `useWizardContext()` (`register`, `watch`, `setValue`) or
  `useLimitedSelection()` for capped multi-selects. Register in `wizardConfig.ts`.
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
| `TELEGRAM_MINI_APP_LINK` | `t.me/<bot>/<app>` base of referral links (`?startapp=ref_<code>`); optional, defaults to `t.me/<bot>` (main Mini App) |
| `CRON_SECRET` | `Authorization: Bearer` expected by `/api/cron/matching`; also a GitHub repo secret together with `APP_URL` |
| `MATCHING_NOTIFICATIONS` | `"true"` to message both users when a match is created |
| `MEETINGS_PHASE` | testing only: `week` / `feedback` / `signup` forces the «Встречи» tab phase instead of `WEEK_SCHEDULE` (`lib/weekCycle.ts`) |

## Gotchas

- Opening a production build outside Telegram fails by design (no mock).
- `lib/prisma.ts` returns a no-op proxy during `next build` without
  `DATABASE_URL`; at runtime every DB route needs the real URL.
- The matching config edited through `PUT /api/matching` lives in memory and
  resets on redeploy.
- `user_settings`/`profiles` rows are created lazily; `ensureUser()` creates
  the parent `users` row first and returns it.
- Dates: `profiles.dateOfBirth` is a DATE; the API accepts `YYYY-MM-DD` or
  `DD.MM.YYYY` and returns `YYYY-MM-DD`.
- The `20261008090000_relational_model` migration backfills and then drops
  the legacy tables; it is one-way. Back up before `pnpm db:deploy` on real data.
- `core/i18n/config.ts` has `locales = ["ru"]`; `en.json` is kept in sync
  but never served.
- `FooterMenu` is not in the layout; pages include it and add `pb-24`
  (`pb-48` with a `BottomAction aboveFooter`). It is a floating bar, plus the
  «Как прошло знакомство?» reminder when a meeting waits for feedback.
- Weekly cycle: `WEEK_SCHEDULE` in `MEETINGS_TIMEZONE` (Asia/Bangkok for
  now), both in `config/constants.ts`; set `MEETINGS_PHASE=week|feedback|signup`
  to test the «Встречи» tab on any weekday.
- Never add a `components.json` (or any `components.*` file) at the repo
  root: with the `@/*` alias it can shadow the `components/` directory.
- `globals.css` gives every `h1`–`h6` and `p` a bottom margin (`1rem`) and a
  color; new components put `m-0` on headings and paragraphs.

## Docs

- `docs/ARCHITECTURE.md` — logical and deployment diagrams (Mermaid) with what is live vs planned
- `docs/CODEBASE_MAP.md` — every directory and file, with status tags
- `docs/DATA_AND_API.md` — Prisma schema, auth, every API route, matching algorithm
- `docs/DEV_WORKFLOW.md` — setup, running, DB, bot/webhook, verification, deploy
- `docs/CONVENTIONS.md` — code patterns to follow
- `docs/KNOWN_ISSUES.md` — remaining tech debt
- `docs/guides/` — react-hook-form wizard guide, wizard context guide, theme guide
- `docs/archive/` — stale historical docs (Mongo/Sheets/telegraf era); do not trust
