# Known issues and tech debt

State after the `feature/relational-schema` branch. Remove entries when fixed.

## Needs action before production

1. **Migrations not applied** (`20261007120000_user_settings_unique_matches`,
   `20261008090000_relational_model`, `20261008120000_profile_occupation`,
   `20261008130000_profile_goals`). The relational one drops the legacy
   tables after backfilling. Back up, run `pnpm db:deploy`, then
   `pnpm db:seed` (it also retires the old trait/hobby tags).
2. **Rotate the old credentials in `.env`** (Supabase password, Google key)
   before the repo or the DB becomes production-facing. The owner has
   deferred this knowingly.
3. **Webhook not registered.** After the first deploy call
   `POST /api/bot/setup` as an admin with `APP_URL` set.
4. `CRON_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN` must be set
   in the hosting environment; without the token every API call is a 500
   in production.

## Functional gaps

5. Matching config changed via `PUT /api/matching` is in-memory and resets
   on redeploy. Persist it in a table if admins need to tune it.
6. `preferredAgeMin/Max`, `preferredGender`, `skipNextRound` (in
   `user_settings`) and `profiles.gender` exist and are used by the engine,
   but no UI sets them yet. `plans`/`subscriptions`/`payments` have no UI
   either.
7. Notification preferences are stored but only `newMatches` has a sender
   (`MATCHING_NOTIFICATIONS`); messages, profile views, game invites and the
   weekly digest have no producer.
8. `photo` is stored as a base64 data URL (≤ 2 MB) in Postgres and returned
   in list responses (`/api/home`, `/api/meetings`, `/api/users`). Move to object storage
   before the user base grows.
9. `app/settings/profile/ProfileSettings.tsx` headings and buttons are
   hardcoded English; `AdminMenu` descriptions and `not-found` copy are
   hardcoded too.
10. `en.json` is never served (`locales = ["ru"]`), yet `Root` calls the
    `setLocale` server action on every load.
11. The UI `Profile` type (`models/types.ts`) is still the flat
    spreadsheet-era shape (`placesToVisit` as a comma string,
    `similarInterests`, `profile` meaning "about"); `lib/profileDto.ts`
    bridges it. The wizard reads tags/locations from the constants instead
    of `GET /api/reference`.
12. No step collects `placesToVisit`, `announcement` or `instagram` anymore;
    the columns stay empty for new users.
13. Pages wait for their first API call with no timeout. When the DB is
    unreachable Prisma takes several seconds to fail, so `/profile` shows
    "Загрузка..." until `GET /api/profile` errors out (it then opens an
    empty wizard). Consider a client-side timeout or a `/api/health` gate.
14. `WizardProvider` resets the form whenever `initialData` changes by
    reference. `Wizard` now passes a stable object, but
    `ProfileSettings` re-mounts the wizard per edit, which is fine today and
    fragile if props start changing.
15. Matching ignores `profiles.goals` (and `occupation`).
16. The legacy `profiles.goal` column is no longer written or read; drop it
    in a later migration.
17. Payments are not wired: `/settings/subscription` is a mock, referral
    rewards (+2 weeks / −20%) are text only, and complaints
    (`match_feedback.reason = "report"`) are only logged.
17a. The weekly cycle uses one timezone (`MEETINGS_TIMEZONE`, Asia/Bangkok)
    for every city.

## Code health

18. No ESLint config (`next lint` prompts), no Prettier, no tests, no CI.
    `pnpm typecheck` + `pnpm build` are the only gates.
19. Legacy `.theme-*` utilities and the new shadcn tokens coexist in
    `globals.css`; pick one when the redesign lands.
20. `hooks/useClientOnce.ts` and `hooks/useDidMount.ts` are no longer used.
21. Browserslist data is 17 months old (`npx update-browserslist-db@latest`).
22. Git history is mostly "up"/"upd".
