# Data, auth and API

Verified on `feature/admin-panel` (2026-10-10).

## Store

PostgreSQL (Supabase) through Prisma (`lib/prisma.ts`). Prisma models are
PascalCase, tables are snake_case via `@@map`. Internal foreign keys use
`users.id` (uuid); the API addresses people by `users.telegramId`.

```
users ──1:1── profiles ──M:N── tags            (profile_tags)
  │              └──N:1── locations
  ├──1:1── user_settings
  ├──1:N── subscriptions ──1:N── payments ; subscriptions ──N:1── plans
  ├──self── referrer (users.referrerId)
  ├──N:N── matches (user1Id/user2Id) ──N:1── match_rounds
  │              └──1:N── match_feedback
  ├──1:N── events
  └──1:N── broadcast_deliveries ──N:1── broadcasts
app_config (key → Json)
```

### `User` (`users`)
`telegramId` unique, `username`, `firstName`, `lastName`, `languageCode`,
`referralCode` unique (cuid, generated on create), `referrerId` (self FK,
set once from `startapp=ref_<code>`), `status` (`active | hidden | banned`),
`lastMatchedAt`, `lastSeenAt` (refreshed by `ensureUser()` at most every 6 h,
off the response path), `botBlockedAt` (bot cannot reach the user: set on a 403
or a `my_chat_member` "kicked" update, cleared on /start or unblock), timestamps.

### `Profile` (`profiles`, PK = `userId`)
`name`, `dateOfBirth` (DATE), `gender`, `locationId` → `locations`,
`occupation` (varchar 80), `goals` (text[] of `GOAL_OPTIONS` ids, max 2,
private: `toProfile()` returns it only with `{ includePrivate: true }`, which
only `/api/profile` passes; legacy `goal` unused), `about`, `announcement`, `placesToVisit String[]`, `photo` (public Supabase Storage URL,
see `lib/photoStorage.ts`; legacy base64 rows until `pnpm db:migrate-photos`), `socials Json` (`{ instagram }`), `theme` (one of `PROFILE_THEMES`,
validated on write), `isComplete` (set when
the wizard finishes; only complete profiles are matched or listed),
`completedAt` (first completion, for the funnel; backfilled from `updatedAt`).

### `Event` (`events`)
`userId?`, `name`, `props Json?`, `createdAt`; indexes `(name, createdAt)` and
`(userId, createdAt)`. Written by `track()` (`lib/events.ts`) after the
response. Names (`EventName`): `app_visit`, `onboarding_step {step}`
(the wizard sends `onboardingStep` with each step's autosave),
`onboarding_completed`, `week_signup`, `week_skip`, `match_accepted`,
`match_mutual`, `feedback_left {outcome, reason?}`, `bot_started`,
`bot_blocked`, `bot_unblocked`, and the admin audit log `admin_*` (`props.by`
= admin Telegram id).

### `AppConfig` (`app_config`)
`key` → `value Json`, `updatedBy`. Key `matching` holds `MatchingConfig`.

### `Broadcast` (`broadcasts`) and `BroadcastDelivery` (`broadcast_deliveries`)
A broadcast stores `text` (HTML, `{name}` placeholder), `withAppButton`,
`segment Json` (`{ id, country? }`, ids in `BROADCAST_SEGMENTS`), `status
sending | done | cancelled`, `total`, `createdBy`. Creating it snapshots the
segment's reachable users into deliveries (`pending → sending → sent | blocked
| failed`, `error`, `sentAt`).

### `Location` (`locations`) and `Tag` (`tags`)
Reference lists. `Location { country, region ("" for none), isActive, sortOrder }`
unique on `(country, region)`; `isActive` mirrors `LocationOption.available`. `Tag { category: interest | value | format (old `trait`/`hobby` rows inactive),
label, isActive, sortOrder }` unique on `(category, label)`. `profile_tags`
is the M:N table. `prisma/seed.ts` fills both from the constants in
`models/types.ts` (`INTERESTS`, `VALUES`, `MEETING_FORMATS`, `LOCATIONS`) and
deactivates `trait`/`hobby` tags and interest tags no longer in `INTERESTS`; unknown labels sent by clients are added on the fly.

### `UserSettings` (`user_settings`, PK = `userId`)
Notification flags, `matchingOption` + `matchingCustomDate` +
`matchingResumeDate`, matching preferences `preferredAgeMin/Max`,
`preferredGender`, `skipNextRound` (consumed by the next run).

### `MatchRound` (`match_rounds`) and `Match` (`matches`)
A round is a week (`weekStart` DATE unique, Monday UTC; `status open |
closed`). A match belongs to a round, stores `user1Id < user2Id` (by uuid),
`score`, `factors` Json snapshot, `status` (`pending | met | not_met |
postponed | expired`), `notifiedAt`, `user1AcceptedAt` / `user2AcceptedAt`
(«Хочу познакомиться» per side; both set = mutual), `expiresAt` (+7 d). Unique on
`(roundId, user1Id, user2Id)`; the same pair can recur in later rounds only
if the engine allows it (today it never re-pairs previous partners).

Lifecycle (`lib/meetingsService.ts`, `lib/weekMatchService.ts`, `lib/weekCycle.ts`):
Times come from `WEEK_SCHEDULE` in `config/constants.ts` (day + hour in
`MEETINGS_TIMEZONE`; defaults: agree until Thursday 00:00, sign-up from
Friday 00:00) and are expected to change.
- Monday: the matching run creates `pending` pairs.
- Phase `week` (Monday → `agreeDeadline`): each side may accept. A pair not
  mutual by then becomes `not_met` (`closeUnagreedMatches()`: one raw
  `UPDATE` before every matching run, and lazily for the caller, by Telegram
  id and in parallel with `ensureUser()`, in `/api/home`, `/api/meetings`,
  `/api/meetings/current`, `/api/meetings/pending-feedback`).
- Phase `feedback` (`agreeDeadline` → `signupStart`): the «Встречи» tab shows
  the impression flow for this round's pair.
- Phase `signup` (`signupStart` → next Monday): opt-in for the next round.
- Feedback: «met» from either side → `met`; «not met» → `not_met` unless
  someone already said met; «later» (no feedback row) → `postponed`, which
  never expires and keeps feedback open.
- `pending` past `expiresAt` → `expired` (hidden from every list).

### `MatchFeedback` (`match_feedback`)
One row per participant per match (unique `(matchId, authorId)`): `met`,
`impressions text[]` (ids from `IMPRESSION_OPTIONS`, shown to the partner),
`reason?` (one of `NOT_MET_REASONS`, private; `report` is logged as a
complaint), `text?` (≤ 250), legacy `rating 1..5?` (no longer written).
Only `met = true` rows are ever shown to the partner.

### Access
`getAccess()` in `lib/meetingsService.ts`: an active `subscriptions` row
(`status active`, `endsAt` in the future) or `users.createdAt` within
`TRIAL_DAYS` (30). `subscribed` is true only for the paid case (unlocks
invitations). The matching run applies the same rule to candidates.

### `Plan`, `Subscription`, `Payment`
Tables only, no API yet (`/settings/subscription` is a mock picker). `Plan { code, title, priceStars, periodWeeks }`,
`Subscription { userId, planId, startedAt, weeks, endsAt, status }`,
`Payment { subscriptionId, amountStars, currency XTR, telegramChargeId
unique, providerChargeId, payload, paidAt }`.

### Migrations
`20251129091939_init` … `20261007120000_user_settings_unique_matches`
(legacy `MatchingUser`/`MatchResult`/`UserSettings`), then
`20261008090000_relational_model`: creates the tables above, **backfills**
users/profiles/locations/tags/settings/rounds/matches from the legacy
tables (including spreadsheet-era `previousMatches` pairs into a closed
legacy round dated 2024-12-30) and drops the legacy tables. Verified end to
end against PGlite with sample data; apply with `pnpm db:deploy`.
`20261008120000_profile_occupation` adds `profiles.occupation`;
`20261008130000_profile_goals` adds `profiles.goals`;
`20261008150000_feedback_impressions` adds `match_feedback.impressions` and
`reason`; `20261008170000_match_accept` adds `matches.user1AcceptedAt` and
`user2AcceptedAt`.

## Authentication (`lib/auth.ts`)

Unchanged: `Authorization: tma <initDataRaw>` validated with
`@tma.js/init-data-node/web`; `authenticate()` → `AuthUser`,
`requireAdmin()`, `authErrorResponse()`. `ensureUser(auth)` returns the
`users` row, creating it or refreshing Telegram fields only when they changed;
rows are memoised per server instance for 10 minutes (`forgetUser()` after
writing `users` elsewhere). Every write path goes through it. Dev accepts unsigned mock data; prod is strict.

## API reference

### Profile
| Method & path | Who | Response |
|---|---|---|
| `GET /api/profile` | user | own `Profile` (with private `goals` and `isComplete`); 404 until something was saved |
| `POST /api/profile` | user | partial upsert via `lib/profileService.ts`. Accepts the UI `Profile` fields (`name, dateOfBirth, country, region, goals, profile \| about, announcement, placesToVisit, instagram, photo, occupation, interests, values, meetingFormats`) plus `gender, theme, isComplete` (alias `isActive`), `referralCode` (applied once) and write-only `skipNextRound` (boolean, upserted into `user_settings`; sent by the onboarding "first meeting" screen). Country+region are upserted into `locations`; tag arrays replace that category's `profile_tags`. `photo` accepts only the caller's own Storage URL, an empty value (clears it and deletes the file) or the unchanged stored value. 400 on validation |
| `POST /api/profile/photo` | user | raw image body (JPEG/PNG/WebP by magic bytes, ≤ 2 MB). Uploads to the public bucket `SUPABASE_STORAGE_BUCKET` as `<users.id>/<uuid>.<ext>` with the service key, writes the URL to `profiles.photo`, deletes the previous file, returns `{ url }`. 413 too large, 400 bad format, 503 without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` |
| `GET /api/profile/[userId]` | user | another user's `Profile` (complete + active; owner/admin see incomplete) |

`Profile` is the flat UI shape from `models/types.ts`; `lib/profileDto.ts`
builds it from `users` + `profiles` + `locations` + `tags` (tag categories
`interest`/`value`/`format` → `interests`/`values`/`meetingFormats`).

### Meetings (people, feedback, weekly pair)
All routes act for the caller (`ensureUser`), never for an id from the body. Types in `models/types.ts`.

| Method & path | Response |
|---|---|
| `GET /api/home` | `HomeSummary`: `hasAccess`, `accessEndsAt`, last 4 meetings (`history`), met count + avatars, invited count + avatars, `awaitingFeedback` |
| `GET /api/meetings` | full log `Meeting[]` (expired hidden), newest first |
| `GET /api/meetings/[matchId]` | `MeetingDetails` (participant only): partner header, `me`, `myFeedback`, `partnerFeedback` (partner's «met» impression, visible right away) |
| `POST /api/meetings/[matchId]/feedback` | body `{ outcome: "met", impressions[≥1], text? } \| { outcome: "not_met", reason, text? } \| { outcome: "later" }`; once per participant (409 on repeat or closed match); «met» notifies the partner via the bot |
| `GET /api/meetings/current` | `MeetingsWeek`: `hasAccess`, `phase` (`week` / `feedback` / `signup` from `WEEK_SCHEDULE`, `MEETINGS_PHASE` overrides), `participating`, profile `location`, and in the `week` and `feedback` phases this round's `match: CurrentMatch` (common vibes, formats, deadline, accept flags, `contactUrl` once mutual, `canShareFeedback` 24 h after mutual) |
| `PUT /api/meetings/participation` | body `{ participating }`; `true` clears pauses and the skip (402 without access), `false` sets `skipNextRound` |
| `POST /api/meetings/[matchId]/accept` | «Хочу познакомиться»; idempotent; 409 after the deadline or on a closed match, 402 without access; the first click nudges the partner, the second sends both a direct contact through the bot. Returns `CurrentMatch` |
| `GET /api/meetings/[matchId]/question` | `WeeklyQuestion` from the icebreaker bank (no romance), same for both sides; 403 until mutual |
| `GET /api/meetings/pending-feedback` | `PendingFeedback \| null`: newest open match from the last 14 days without my feedback (the reminder above the tab bar) |
| `GET /api/invitations` | `InvitationsSummary`: `canInvite` (paid subscription only), `inviteLink` (`TELEGRAM_MINI_APP_LINK` or `t.me/<bot>` + `?startapp=ref_<code>`), invited users |

### Settings (DB)
| Method & path | Body |
|---|---|
| `GET/PUT /api/settings/notifications` | 5 booleans |
| `GET/PUT /api/settings/matching-schedule` | `{ option, customDate? }` |

### Reference
`GET /api/reference` (user) → `{ tags: { interests, values, meetingFormats },
locations: [{ country, regions }] }`, same shape as `models/types.ts` constants.

### Me
`GET /api/me` (user) → `{ isAdmin }`; no DB access.

### Admin (`requireAdmin()`; handlers wrapped by `adminRoute()` in `lib/adminRoute.ts`)
Shapes in `models/admin.ts`. Errors are `{ error }` with a status.

| Method & path | Response / body |
|---|---|
| `GET /api/admin/overview` | `AdminOverview`: user counts (total, new/active 7 d, complete, blocked), this week's pairs/mutual/met, next-round participants |
| `GET /api/admin/funnel?period=7\|30\|90\|365\|all&source=all\|referral\|organic` | `FunnelDto` (`lib/adminFunnel.ts`): cohort = sign-ups in the period without `mock_` users; steps users → started → completed → matched → accepted → mutual → met → subscribed (non-`manual` plan) from the core tables, plus feedback/referred/blocked; median sign-up→completion; wizard drop-off from `onboarding_step` events (base: sign-ups after the first such event); per-week cohorts. Timestamps are compared `AT TIME ZONE 'UTC'` |
| `GET /api/admin/users?q=&filter=&offset=` | `AdminUserList`, 50 per page; `q` matches Telegram id, @username, names; `filter` one of `USER_FILTERS` |
| `GET /api/admin/users/[telegramId]` | `AdminUserDetails`: profile, access, subscriptions, referrer, last 30 meetings, last 60 events |
| `POST /api/admin/users/[telegramId]` | `{ action: "setStatus", status } \| { action: "grantAccess", weeks } \| { action: "revokeAccess" }` → updated card. Granted access = subscription on the hidden zero-price `manual` plan, appended to the current one |
| `POST /api/admin/users/[telegramId]/message` | `{ text, withAppButton? }` → `{ ok }` or `{ ok: false, blocked, error }`; logged as `admin_message` |
| `GET /api/admin/matching` | `{ config, isRunning, rounds }` (last 20 rounds with counts) |
| `PUT /api/admin/matching` | partial `MatchingConfig` → saved full config (400 on bad values) |
| `POST /api/admin/matching?action=preview\|run\|mock-users` | `preview`: pairs a run would create now, nothing written; `run`: cleanup + `runMatching()` (same as the cron); `mock-users`: development only |
| `GET /api/admin/matching/rounds/[roundId]` | `AdminRoundDetails`: every pair with accepts and feedback |
| `POST /api/admin/matching/matches/[matchId]` | `{ action: "cancel" }`: pending/postponed pair → `expired` (hidden from users); returns the round |
| `GET /api/admin/broadcasts` | last 30 `BroadcastDto` with delivery counts |
| `POST /api/admin/broadcasts` | `{ text, withAppButton, segment }` → creates and snapshots recipients (users with `status active`, not `botBlockedAt`) |
| `GET /api/admin/broadcasts/audience?segment=&country=` | `{ total, reachable }` |
| `POST /api/admin/broadcasts/test` | `{ text, withAppButton }` sent to the calling admin |
| `GET /api/admin/broadcasts/[id]` | `BroadcastDetails` (+ up to 100 failed deliveries) |
| `POST /api/admin/broadcasts/[id]` | `{ action: "send" }`: sends for ~40 s at ~25 msg/s (rows claimed with `FOR UPDATE SKIP LOCKED`), marks `done` when nothing is pending; the admin screen repeats it while open. `{ action: "cancel" }` stops it |

### Cron, bot, ops
`GET /api/cron/matching` (`CRON_SECRET`), `POST /api/bot/webhook`,
`GET/POST /api/bot/setup` (subscribes to `message`, `callback_query`,
`my_chat_member`), `GET /api/health`.

## Matching algorithm (`lib/matchingService.ts`)

0. (Callers run `cleanupExpiredMatches()` first: unagreed pairs past their
   deadline → `not_met`, pending past `expiresAt` → `expired`.)
1. Upsert the `MatchRound` for the current week (Monday UTC).
2. Reset settings whose pause expired.
3. Candidates: `status active`, `profile.isComplete`, has `locationId`,
   `lastMatchedAt` older than `cooldownHours` (24) or null, settings absent
   or `matchingOption active` (or a pause whose resume date passed) and
   `skipNextRound false`, and with access:
   an active `subscriptions` row (`endsAt` in the future) or `createdAt`
   within `TRIAL_DAYS` (30) — the same rule as `getAccess()` in `lib/meetingsService.ts`.
4. Load all previous partners from `matches` for those users.
5. Group by country (region inside, except `countriesWithoutRegions`);
   score every pair not previously matched and passing mutual age/gender
   preferences; greedy pairing per pool; global sort; take
   `maxMatchesPerRun` (50).
6. Per pair: `matches` row with ordered ids + `lastMatchedAt` update in one
   transaction; optional Telegram notification (`notifiedAt`).
7. Clear `skipNextRound` for everyone.

Score = region (4 / 2 / 0.5) + 1 per common interest +
0.25 per common value + 0.5 per common meeting format + 0.5 per common destination + `max(0, 2 − |Δage|/5)`.
`goals`, `occupation` and `theme` do not affect the score.
