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
2. **Questionnaire** (`/profile`, «Анкета» tab) — until `isComplete` an
   11-step react-hook-form wizard that autosaves each step to PostgreSQL;
   afterwards my card in its template + city + meeting formats (`MyProfileView`).
   «Редактировать анкету» → `/profile/edit`: field list with current values,
   each opens one wizard step at `/profile/edit/[step]` (`Wizard editStep`,
   «Сохранить» saves only what changed). `/profile/[userId]` shows someone's
   questionnaire with their card template.
   «Профиль» tab (`/settings`): avatar + access status, then one list —
   «Редактировать анкету», «Локация» (→ `/profile/edit/location`),
   «Участие во встречах» (`/settings/participation`: participate / pause a week /
   pause until a date), «Уведомления от бота» (one switch, honoured by
   `notifyUser()`), «Управление подпиской», «Как работает приложение»,
   «Поддержка» (`SUPPORT_TELEGRAM_USERNAME`), «Админ-меню» for admins.
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

Launch flow: `/` sends users to onboarding (`/profile`) until
`profiles.isComplete`, then to `/meetings`; `/meetings` also bounces an
incomplete profile to `/profile` (matching skips incomplete profiles).

Admin gate: env `ADMIN_TELEGRAM_IDS` (comma-separated, read by `lib/admins.ts`).
`requireAdmin()` in `lib/auth.ts` enforces it on every `/api/admin/*` route; the
client learns it from `GET /api/me` (`useAuth().isAdmin`). Admins get an
«Админ-меню» item in the «Профиль» tab (`/settings`) that opens the admin
inside the Mini App (works stretched on desktop Telegram too):
`/admin` (KPIs), `/admin/funnel` (cohort funnel, wizard drop-off, weekly
cohorts; period + source filters), `/admin/users` (+ `[telegramId]` card: access, status, chat
with the bot + reply, meetings, event log), `/admin/matching` (preview, run, config, rounds,
cancel a pair), `/admin/broadcasts` (segment → test → send in batches).
`app/admin/layout.tsx` gates all of them; building blocks in `components/admin/`.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 14.2.4, App Router; every page is `"use client"` |
| Package manager | **pnpm** only (`pnpm-lock.yaml`) |
| DB | PostgreSQL (Supabase) via **Prisma 5**, relational model: `User`, `Profile`, `Location`, `Tag`/`ProfileTag`, `UserSettings`, `MatchRound`, `Match`, `MatchFeedback`, `Plan`, `Subscription`, `Payment` (snake_case tables) |
| Auth | `@tma.js/init-data-node/web` validates `Authorization: tma <initDataRaw>` on every API route (`lib/auth.ts`) |
| Telegram SDK | `@tma.js/sdk-react` **v3** (snake_case user fields, `tgWebApp*` launch params) |
| Bot | **grammY** webhook (`/api/bot/webhook`), setup via `/api/bot/setup` |
| Scheduling | None yet. Matching is weekly and started by hand: **GitHub Actions** `workflow_dispatch` (`.github/workflows/run-matching.yml`) → `GET /api/cron/matching` with `CRON_SECRET`. Later: a cron in `vercel.json` (today it only pins functions to `hnd1`, next to the Tokyo DB) |
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
pnpm db:migrate-photos            # one-off: base64 photos → Supabase Storage (--dry-run to count)
pnpm db:studio
```

### Verification policy

- No tests. Run `pnpm typecheck` after every change; `pnpm build` for
  routing/config/Prisma changes. `.next/types` errors mean stale cache →
  `rm -rf .next`.
- UI: `pnpm dev`, open `http://localhost:3000`. `core/mockEnv.ts` fakes a
  Telegram launch with user `DEV_MOCK_TELEGRAM_ID` in development; put that id
  into `ADMIN_TELEGRAM_IDS` in `.env.local` to see the admin.
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
  invitations/, profile/[userId], profile/edit (+ [step]), settings/{participation,subscription,how-it-works}
components/ui/            shadcn + XP primitives (button, card, switch, text-input, list-item, …), barrel index.ts
components/profile-templates/  profile card designs (artwork in public/profile-templates + ImageTemplate overlay) + registry (ProfileCard)
components/meetings/      meetings UI: WeekMatchView, MeetingList, StatCard, CelebrationScreen, Countdown, BottomAction, …
components/admin/         admin screens' building blocks (AdminUI, MatchCard, UserBadges, BroadcastProgress)
components/               Root, FooterMenu (+ feedback reminder), ErrorBoundary, ErrorPage (no barrel; import by path)
core/init.ts, mockEnv.ts  SDK v3 bootstrap and dev mock (called from Root)
core/i18n/                next-intl wiring
hooks/useAuth.ts          client view of the Telegram user (UI gating only)
lib/auth.ts               authenticate / requireAdmin / ensureUser (server)
lib/api.ts                apiFetch / api.get|post|put with the tma header (client)
lib/apiCache.ts           stale-while-revalidate GET cache (memory + localStorage per user), useCachedApi, prefetch from Root (client)
lib/bot.ts                grammY bot, BOT_COMMANDS, notifyUser
lib/matchingService.ts    matching engine (singleton); config in `app_config`, dry-run previewMatching()
lib/events.ts             track(): product/audit events → `events`, written after the response (waitUntil)
lib/admins.ts             ADMIN_TELEGRAM_IDS from env
lib/adminService.ts, adminMatching.ts, adminFunnel.ts, adminRoute.ts  admin read side, user actions, segments, route wrapper (server)
lib/broadcastService.ts   bot broadcasts: snapshot recipients, batched sending (server)
lib/botLog.ts             chat log (`bot_messages`): incoming via bot middleware, outgoing via an API transformer; withSendContext() labels the sender
lib/meetingsService.ts    access (subscription/trial), week phase, participation, feedback rules (server)
lib/weekMatchService.ts   this week's pair: accept, contacts, question of the week (server)
lib/weekCycle.ts          WEEK_SCHEDULE math: getWeekPhase, agreeDeadline, closing unagreed pairs (server)
lib/pendingFeedback.ts, telegramLinks.ts  feedback-reminder cache, openTgLink (client)
lib/profileDto.ts         users+profiles+tags → UI Profile mapper (read side)
lib/profileService.ts     profile upsert: location/tag resolution, referral, validation (write side)
lib/photoStorage.ts      profile photos in Supabase Storage (server)
lib/prisma.ts, dateUtils.ts (formatDayMonth), utils.ts (cn),
  imageUtils.ts           fileToResizedJpeg: client-side photo downscale (client)
prisma/                   schema, migrations, seed.ts (tags + locations)
config/constants.ts       DEV_MOCK_TELEGRAM_ID, MENU_ITEMS, APP_METADATA, schedule constants
models/types.ts           Profile/User/AccountSettings types + option lists
models/admin.ts           /api/admin/* response shapes, user filters, broadcast segments
docs/                     agent docs; docs/guides (RHF, wizard context, theme); docs/archive (stale)
```

## Data layer in one paragraph

PostgreSQL with a relational model (see `docs/DATA_AND_API.md`). `users`
(Telegram id externally, uuid internally, with `referralCode` and
`referrerId`) have one `profiles` row (name, date of birth, location FK,
occupation, private `goals[]`, about, photo (Supabase Storage URL), socials, card `theme`,
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
allow only the two participants, `/api/admin/*` are admin-only. Details in `docs/DATA_AND_API.md`.

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
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage for profile photos (server-only key); without them `POST /api/profile/photo` returns 503 |
| `SUPABASE_STORAGE_BUCKET` | public photo bucket, default `profile-photos` |
| `TELEGRAM_BOT_TOKEN` | init-data validation **and** the bot. Required in production; optional in dev (unsigned data accepted) |
| `TELEGRAM_WEBHOOK_SECRET` | checked by grammY on every webhook update |
| `APP_URL`, `MINI_APP_URL` | https URL of the deployment; webhook target and bot buttons |
| `TELEGRAM_MINI_APP_LINK` | `t.me/<bot>/<app>` base of referral links (`?startapp=ref_<code>`); optional, defaults to `t.me/<bot>` (main Mini App) |
| `CRON_SECRET` | `Authorization: Bearer` expected by `/api/cron/matching`; also a GitHub repo secret together with `APP_URL` |
| `ADMIN_TELEGRAM_IDS` | Telegram ids of admins, any non-digit separates them (quotes pasted into Vercel are fine); server only; without it nobody is admin |
| `MATCHING_NOTIFICATIONS` | default of «Присылать уведомление о новой паре» until the matching config is saved in the admin |
| `MEETINGS_PHASE` | testing only: `week` / `feedback` / `signup` forces the «Встречи» tab phase instead of `WEEK_SCHEDULE` (`lib/weekCycle.ts`); `week` also keeps «Хочу познакомиться» open until the end of the round's week |

## Gotchas

- Opening a production build outside Telegram fails by design (no mock).
- `lib/prisma.ts` returns a no-op proxy during `next build` without
  `DATABASE_URL`; at runtime every DB route needs the real URL.
- The matching config lives in `app_config` (key `matching`), edited on
  `/admin/matching`; defaults in `defaultMatchingConfig()`.
- Analytics/audit: call `track(name, userId, props)` from `lib/events.ts`
  (add the name to `EventName` and to `admin.events` in both locales). It never
  awaits the insert; do not await DB work for analytics on a request path.
- Telegram has no chat-history API: the admin «Переписка с ботом» shows only
  `bot_messages`, logged since that table shipped. Send through `sendToUser()`
  (or `notifyUser()`) and pass `context` so the log knows who sent it.
- No webhook = the bot receives nothing (no /start replies, no incoming chat
  log). The «Бот» block on `/admin` shows it and reconnects.
- The bot learns about blocks from `my_chat_member` updates and 403s
  (`users.botBlockedAt`); after changing `allowed_updates` re-run `POST /api/bot/setup`.
- `user_settings`/`profiles` rows are created lazily; `ensureUser()` creates
  the parent `users` row first and returns it. It memoises rows per server
  instance (10 min); call `forgetUser()` after writing `users` elsewhere.
- Latency is DB round trips: Supabase is in Tokyo, each pooled query costs ~4
  of them. Run independent queries in one `Promise.all`, keep nesting in a
  single `include` (`relationJoins`), and never add a write to a GET path.
- Dates: `profiles.dateOfBirth` is a DATE; the API accepts `YYYY-MM-DD` or
  `DD.MM.YYYY` and returns `YYYY-MM-DD`.
- The `20261008090000_relational_model` migration backfills and then drops
  the legacy tables; it is one-way. Back up before `pnpm db:deploy` on real data.
- `core/i18n/config.ts` has `locales = ["ru"]`; `en.json` is kept in sync
  but never served.
- `FooterMenu` is not in the layout; pages include it and add `pb-24`
  (`pb-48` with a `BottomAction aboveFooter`). It is a floating bar, plus the
  «Как прошло знакомство?» reminder when a meeting waits for feedback — only
  where the page passes `showReminder` (`/home`, `/home/meetings`).
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
