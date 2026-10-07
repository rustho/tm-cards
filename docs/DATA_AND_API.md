# Data, auth and API

Verified on branch `feature/platform-upgrade`.

## Store

One store: PostgreSQL (Supabase) through Prisma (`lib/prisma.ts`). Three
tables, all keyed by the Telegram user id (`telegramId`, string).

### `MatchingUser`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `telegramId` | String @unique | the user key everywhere |
| `username`, `name` | String? | seeded from Telegram by `Wizard` / `ensureUser()` |
| `age` | Int? | computed from `dateOfBirth` in `POST /api/profile` |
| `dateOfBirth` | String? | `YYYY-MM-DD` (or `DD.MM.YYYY`, parsed for age) |
| `gender` | String? | not set by the UI yet |
| `country`, `region` | String? | Russian labels from `LOCATIONS` |
| `interests`, `hobbies`, `personalityTraits` | String[] | max 4 each in the UI |
| `placesToVisit` | String[] | API accepts array or comma string; responses join with `, ` |
| `instagram`, `photo`, `announcement`, `goal`, `profile` | String? | `photo` is a base64 data URL (≤ 2 000 000 chars); `profile` = "about" |
| `isActive` | Boolean =true | set `true` when the wizard finishes; read routes hide inactive users |
| `lastMatchTime`, `totalMatches`, `previousMatches: String[]` | | maintained by `runMatching()` |
| `skip` | Boolean | excluded from pairing |
| `preferredAgeMin/Max` (18/65), `preferredGender` ("any") | | not set by the UI yet |
| `settings` | relation | optional `UserSettings` |

### `UserSettings` (1:1, created lazily)

`telegramId` PK/FK (cascade), `notifyNewMatches`, `notifyMessages`,
`notifyProfileViews`, `notifyGameInvites`, `notifyWeeklyDigest` (booleans),
`matchingOption` (`active | pause_week | pause_month | pause_custom |
pause_indefinite`), `matchingCustomDate`, `matchingResumeDate`,
`createdAt`, `updatedAt`. `runMatching()` skips users whose option is not
`active` and auto-resets options whose `matchingResumeDate` has passed.

### `MatchResult`

`user1Id`, `user2Id` (FK → `MatchingUser.telegramId`, stored with
`user1Id < user2Id`, **unique pair**), `compatibilityScore`,
`matchingFactors` Json (`[{factor, score}]`), `matchingRound`,
`status` (`pending | accepted | declined | expired`), `notificationSent`,
`createdAt`, `expiresAt` (+7 days).

Migrations: `20251129091939_init`, `20251129102932_remove` (dropped
`BotLog`), `20251130095539_add_goal_field`, `20251130102725_add_profile_field`,
`20261007120000_user_settings_unique_matches` (dedupes pairs, unique index,
`UserSettings`).

## Authentication (`lib/auth.ts`)

- Client (`lib/api.ts`) sends `Authorization: tma <initDataRaw>` where the
  raw string comes from `retrieveRawInitData()`.
- `authenticate(request)` validates the signature with
  `@tma.js/init-data-node/web` against `TELEGRAM_BOT_TOKEN` (24 h max age),
  parses the user and returns `AuthUser { id, numericId, username,
  firstName, lastName, languageCode, isAdmin }`.
- In **development** a failed or impossible validation (missing token or
  mocked data) logs a warning and continues. In production it is a 401.
- `requireAdmin()` adds a 403 check against `ADMIN_TELEGRAM_IDS`.
- `ensureUser()` upserts a minimal `MatchingUser` so `UserSettings` can be
  written before the profile exists.
- `authErrorResponse(e)` turns `AuthError` into `{ error }` + status.

Public routes: `GET /api/health`, `POST /api/bot/webhook` (grammY checks
`TELEGRAM_WEBHOOK_SECRET`), `GET /api/cron/matching` (`CRON_SECRET`).

## API reference

### Profile / users / matches

| Method & path | Who | Response |
|---|---|---|
| `GET /api/profile` | user | own `Profile` or 404 |
| `POST /api/profile` | user | partial upsert of **own** row; body may contain `username, name, dateOfBirth, country, region, interests, hobbies, personalityTraits, goal, placesToVisit, instagram, photo, announcement, profile \| about, gender, isActive`. Strings are length-capped, arrays ≤ 20 items. Returns `{ success, profile }`. 400 on type errors, 413 on oversized photo |
| `GET /api/profile/[userId]` | user | another user's `Profile` (active only) or 404 |
| `GET /api/users` | admin | all active `Profile`s, newest first |
| `GET /api/matches/[userId]` | owner or admin | `Profile[]` from `previousMatches`, most recent first; `[]` if none |

`Profile` (see `lib/profileDto.ts`) = `{ id, username, name, goal, country,
region, interests, hobbies, personalityTraits, similarInterests: "",
announcement, profile, placesToVisit (string), instagram, photo, dateOfBirth }`.

### Settings (DB-backed)

| Method & path | Body | Notes |
|---|---|---|
| `GET /api/settings/notifications` | | 5 booleans; defaults if no row |
| `PUT /api/settings/notifications` | all 5 booleans | 400 on non-boolean |
| `GET /api/settings/matching-schedule` | | `{ option, customDate, resumeDate, lastUpdated }` |
| `PUT /api/settings/matching-schedule` | `{ option, customDate? }` | computes `resumeDate` (+7 d / +1 m / custom / null) |

### Matching (admin)

| Method | `?action=` | Effect |
|---|---|---|
| GET | *(none)* | `{ isRunning, lastRun, config }` |
| GET | `stats` | counts, avg score, `lastRun`, config |
| GET | `config` | current `MatchingConfig` |
| POST | `run` | expire old + `runMatching()`; returns `RunResult` |
| POST | `create-mock-users` body `{count}` (1–100) | fake users using the Russian `LOCATIONS`/`INTERESTS`/`HOBBIES` |
| POST | `cleanup` | pending + expired → `expired` |
| PUT | body partial `MatchingConfig` | in-memory until redeploy |

### Cron, bot, ops

| Method & path | Auth | Effect |
|---|---|---|
| `GET /api/cron/matching` | `Authorization: Bearer <CRON_SECRET>` | cleanup + run; configured in `vercel.json` every 4 h |
| `POST /api/bot/webhook` | Telegram secret token | grammY `webhookCallback(bot, "std/http")` |
| `GET /api/bot/setup` | admin | `getMe` + `getWebhookInfo` |
| `POST /api/bot/setup` | admin | `setWebhook(${APP_URL}/api/bot/webhook)` + `setMyCommands` |
| `GET /api/health` | public | `SELECT 1` → 200 / 503 |

## Matching algorithm (`lib/matchingService.ts`)

1. Reset expired pauses in `UserSettings`.
2. Eligible = `isActive`, has `country`, past `cooldownHours` (24) since
   `lastMatchTime`, and no settings row or `matchingOption === "active"`.
3. Group by country; `countriesWithoutRegions` form one pool, others are
   split by region.
4. In each pool: drop `skip`, skip previously matched pairs, require mutual
   age-range/gender preferences, score every pair, sort desc, greedily take
   pairs with both users free and score ≥ `minCompatibilityScore` (0.3).
5. Merge all pools, sort by score, take the top `maxMatchesPerRun` (50).
6. Per pair in one transaction: create `MatchResult` (ordered ids), update
   both users (`lastMatchTime`, `totalMatches`, `previousMatches`). If
   `enableNotifications`, send a Telegram message to both via `notifyUser()`.

Score = region (4 same / 2 same country / 0.5) + 1 per common interest +
0.5 per common hobby + 0.5 per common destination + `max(0, 2 − |Δage|/5)`.

## Bot (`lib/bot.ts`)

grammY `Bot` singleton, webhook-only. Commands: `/start`, `/app` (welcome +
"Открыть TravelMate" web-app button when `MINI_APP_URL` is https), `/help`;
any other text gets a hint. `notifyUser(telegramId, html)` fails softly
when the bot is unconfigured or the user never started it.
