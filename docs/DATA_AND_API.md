# Data, auth and API

Verified on branch `feature/relational-schema`.

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
  └──N:N── matches (user1Id/user2Id) ──N:1── match_rounds
                 └──1:N── match_feedback
```

### `User` (`users`)
`telegramId` unique, `username`, `firstName`, `lastName`, `languageCode`,
`referralCode` unique (cuid, generated on create), `referrerId` (self FK,
set once from `startapp=ref_<code>`), `status` (`active | hidden | banned`),
`lastMatchedAt`, timestamps.

### `Profile` (`profiles`, PK = `userId`)
`name`, `dateOfBirth` (DATE), `gender`, `locationId` → `locations`, `goal`,
`about`, `announcement`, `placesToVisit String[]`, `photo` (base64 data URL
for now), `socials Json` (`{ instagram }`), `theme`, `isComplete` (set when
the wizard finishes; only complete profiles are matched or listed).

### `Location` (`locations`) and `Tag` (`tags`)
Reference lists. `Location { country, region ("" for none), isActive, sortOrder }`
unique on `(country, region)`. `Tag { category: interest | hobby | trait,
label, isActive, sortOrder }` unique on `(category, label)`. `profile_tags`
is the M:N table. `prisma/seed.ts` fills both from the constants in
`models/types.ts`; unknown labels sent by clients are added on the fly.

### `UserSettings` (`user_settings`, PK = `userId`)
Notification flags, `matchingOption` + `matchingCustomDate` +
`matchingResumeDate`, matching preferences `preferredAgeMin/Max`,
`preferredGender`, `skipNextRound` (consumed by the next run).

### `MatchRound` (`match_rounds`) and `Match` (`matches`)
A round is a week (`weekStart` DATE unique, Monday UTC; `status open |
closed`). A match belongs to a round, stores `user1Id < user2Id` (by uuid),
`score`, `factors` Json snapshot, `status` (`pending | met | not_met |
expired`), `notifiedAt`, `expiresAt` (+7 d). Unique on
`(roundId, user1Id, user2Id)`; the same pair can recur in later rounds only
if the engine allows it (today it never re-pairs previous partners).

### `MatchFeedback` (`match_feedback`)
One row per participant per match: `met`, `rating 1..5?`, `text?`.

### `Plan`, `Subscription`, `Payment`
Tables only, no API yet. `Plan { code, title, priceStars, periodWeeks }`,
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

## Authentication (`lib/auth.ts`)

Unchanged: `Authorization: tma <initDataRaw>` validated with
`@tma.js/init-data-node/web`; `authenticate()` → `AuthUser`,
`requireAdmin()`, `authErrorResponse()`. `ensureUser(auth)` upserts the
`users` row (refreshing Telegram fields) and returns it; every write path
goes through it. Dev accepts unsigned mock data; prod is strict.

## API reference

### Profile
| Method & path | Who | Response |
|---|---|---|
| `GET /api/profile` | user | own `Profile`; 404 until something was saved |
| `POST /api/profile` | user | partial upsert via `lib/profileService.ts`. Accepts the UI `Profile` fields (`name, dateOfBirth, country, region, goal, profile \| about, announcement, placesToVisit, instagram, photo, interests, hobbies, personalityTraits`) plus `gender, theme, isComplete` (alias `isActive`) and `referralCode` (applied once). Country+region are upserted into `locations`; tag arrays replace that category's `profile_tags`. 400 on validation, 413 on photo > 2 MB |
| `GET /api/profile/[userId]` | user | another user's `Profile` (complete + active; owner/admin see incomplete) |
| `GET /api/users[?all=1]` | admin | complete profiles (or everyone) |

`Profile` shape is unchanged for the UI; `lib/profileDto.ts` builds it from
`users` + `profiles` + `locations` + `tags`.

### Matches
| Method & path | Who | Response |
|---|---|---|
| `GET /api/matches/[id]` | owner/admin (`id` = Telegram id) | partner `Profile` + `matchId, matchStatus, matchedAt, weekStart, score, myFeedback`, newest first |
| `POST /api/matches/[id]/feedback` | participant (`id` = match id) | body `{ met, rating?, text? }`; upserts the caller's feedback; status → `met` if anyone met, `not_met` if everyone says no |

### Settings (DB)
| Method & path | Body |
|---|---|
| `GET/PUT /api/settings/notifications` | 5 booleans |
| `GET/PUT /api/settings/matching-schedule` | `{ option, customDate? }` |

### Reference
`GET /api/reference` (user) → `{ tags: { interests, hobbies, personalityTraits },
locations: [{ country, regions }] }`, same shape as `models/types.ts` constants.

### Matching, cron, bot, ops
Unchanged paths: `/api/matching` (admin: status/stats/config, `run`,
`create-mock-users`, `cleanup`, PUT config), `GET /api/cron/matching`
(`CRON_SECRET`), `POST /api/bot/webhook`, `GET/POST /api/bot/setup`,
`GET /api/health`.

## Matching algorithm (`lib/matchingService.ts`)

1. Upsert the `MatchRound` for the current week (Monday UTC).
2. Reset settings whose pause expired.
3. Candidates: `status active`, `profile.isComplete`, has `locationId`,
   `lastMatchedAt` older than `cooldownHours` (24) or null, settings absent
   or `matchingOption active` and `skipNextRound false`.
4. Load all previous partners from `matches` for those users.
5. Group by country (region inside, except `countriesWithoutRegions`);
   score every pair not previously matched and passing mutual age/gender
   preferences; greedy pairing per pool; global sort; take
   `maxMatchesPerRun` (50).
6. Per pair: `matches` row with ordered ids + `lastMatchedAt` update in one
   transaction; optional Telegram notification (`notifiedAt`).
7. Clear `skipNextRound` for everyone.

Score = region (4 / 2 / 0.5) + 1 per common interest + 0.5 per hobby +
0.25 per trait + 0.5 per common destination + `max(0, 2 − |Δage|/5)`.
