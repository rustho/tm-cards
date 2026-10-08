# Development workflow

## Setup

```bash
pnpm install --frozen-lockfile   # runs prisma generate
cp .env.example .env.local       # then fill in values
```

Use pnpm only. Toolchain seen working: Node 23.x, pnpm 9.14, Prisma 5.22.

## Environment

All config in `.env.local` (gitignored); `.env.example` lists every variable.
`.env` is still tracked and holds old credentials; leave it alone.

Minimum for the UI + API locally:

```
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.com:5432/postgres
```

`TELEGRAM_BOT_TOKEN` is optional in development: without it (or with the
browser mock's unsigned data) `lib/auth.ts` logs a warning and accepts the
request. In production it is mandatory.

## Database

```bash
pnpm db:migrate --name <change>  # after editing prisma/schema.prisma (uses DIRECT_URL)
pnpm db:deploy                   # apply committed migrations (CI / prod)
pnpm db:studio
```

Two migrations are pending on the shared database (both written offline
because Supabase port 5432 was unreachable from the dev machine):
`20261007120000_user_settings_unique_matches` and
`20261008090000_relational_model`. The second one **backfills and drops**
the legacy `MatchingUser`/`MatchResult`/`UserSettings` tables, so take a
backup first, then:

```bash
pnpm db:deploy   # applies both
pnpm db:seed     # tags + locations reference lists
pnpm db:cleanup-tags  # one-off: drop legacy trait/hobby tags and links to inactive tags (irreversible)
```

Fake data: `POST /api/matching?action=create-mock-users` (admin) creates
complete profiles with real tags and locations.

## Running

```bash
pnpm dev          # http://localhost:3000
pnpm dev:https    # self-signed HTTPS; needs ./certificates (gitignored)
```

In a plain browser `core/mockEnv.ts` fakes the Telegram launch
(development only): user `ADMIN_TELEGRAM_IDS[0]`, platform `tdesktop`, light
theme. To test as a non-admin, change the id in `mockEnv.ts`; `/` then
redirects to `/meetings`. Eruda loads with `start_param=debug` on
iOS/Android or always in dev.

Admin API calls from a terminal need a real `Authorization: tma <initDataRaw>`
header; copy it from the browser's network tab.

### Bot and webhook

1. Create a bot in @BotFather, put the token in `TELEGRAM_BOT_TOKEN`, pick a
   random `TELEGRAM_WEBHOOK_SECRET`.
2. Expose the app over https (`cloudflared tunnel --url http://localhost:3000`
   or a Vercel preview) and set `APP_URL` / `MINI_APP_URL` to that URL.
3. As an admin, call `POST /api/bot/setup` (from the Mini App session or
   with the tma header). It registers `${APP_URL}/api/bot/webhook` and the
   command list. `GET /api/bot/setup` shows the current webhook info.
4. Set the same URL as the Mini App URL in BotFather.

The bot never polls; `bot.start()` must not be used.

### Matching

- Manual: `POST /api/matching?action=run` (admin).
- Weekly round, started by hand: GitHub → Actions → "Run matching" → Run
  workflow (`.github/workflows/run-matching.yml`). It calls
  `GET /api/cron/matching` with `Authorization: Bearer <CRON_SECRET>`. Set
  `CRON_SECRET` in the Vercel project and add repo secrets `APP_URL` and
  `CRON_SECRET` (same value) in GitHub. There is no schedule yet; to automate,
  add `{"crons":[{"path":"/api/cron/matching","schedule":"0 9 * * 1"}]}` to
  `vercel.json` (weekly fits the Hobby plan) and delete the workflow.
- Notifications to both users on a new match: `MATCHING_NOTIFICATIONS=true`
  (needs the bot and users who pressed /start).

## Verification before you finish

1. `pnpm typecheck` — 0 errors.
2. `pnpm build` for routing/config/Prisma changes.
3. Browser check for UI work in light and dark (`document.documentElement.classList.toggle("dark")`).
4. For wizard/API changes, walk `/profile` end to end and confirm the row via
   `GET /api/profile` or Prisma Studio.
5. No tests exist. If you add a runner, wire it into `package.json` and
   document it here.

Do not run `pnpm lint` / `next lint` unattended: no ESLint config exists and
the command opens a setup prompt.

## Git

- Branch `main`, remote `git@github.com:rustho/tm-cards.git`, PR workflow.
- Write descriptive commit messages (history has many "upd").

## Deployment (Vercel)

- Set `DATABASE_URL`, `DIRECT_URL`, `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_WEBHOOK_SECRET`, `APP_URL`, `MINI_APP_URL`, `CRON_SECRET`,
  optionally `MATCHING_NOTIFICATIONS`.
- Run `pnpm db:deploy` against the production DB before the first deploy of
  a schema change.
- After deploy, call `POST /api/bot/setup` once to point the webhook at the
  new URL.
- Since July 2026 Mini App methods are restricted to the Mini App's own
  domain: keep one production domain and avoid redirects.
