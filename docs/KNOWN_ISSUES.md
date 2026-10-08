# Known issues and tech debt

State after the `feature/platform-upgrade` branch. Remove entries when fixed.

## Needs action before production

1. **Migration not applied.** `prisma/migrations/20261007120000_user_settings_unique_matches`
   was written by hand because the Supabase direct port (5432, `DIRECT_URL`)
   was unreachable from the development machine; the pooled port (6543)
   answered intermittently. Run `pnpm db:deploy` from a network that can
   reach 5432 and check `prisma migrate status`. Until then `UserSettings`
   queries fail at runtime (the settings pages fall back to defaults).
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
6. `preferredAgeMin/Max`, `preferredGender`, `gender` and `skip` exist in
   the schema and in the algorithm but no UI sets them.
7. Notification preferences are stored but only `newMatches` has a sender
   (`MATCHING_NOTIFICATIONS`); messages, profile views, game invites and the
   weekly digest have no producer.
8. `photo` is stored as a base64 data URL (≤ 2 MB) in Postgres and returned
   in list responses (`/api/matches`, `/api/users`). Move to object storage
   before the user base grows.
9. `app/settings/profile/ProfileSettings.tsx` headings and buttons are
   hardcoded English; `AdminMenu` descriptions, `not-found` copy and
   `StepContainer`/`SelectionGrid` labels are hardcoded too.
10. `en.json` is never served (`locales = ["ru"]`), yet `Root` calls the
    `setLocale` server action on every load.
11. `Profile.placesToVisit` is a comma string in the UI type but `String[]`
    in the DB; `models/types.ts` `User` still carries spreadsheet-era fields
    (`similarInterests`, `previousMatch`, `nextMatch`, `skip: number`).
12. No step collects `placesToVisit`, `announcement` or `occupation`
    anymore; the DB columns stay empty for new users.
13. Pages wait for their first API call with no timeout. When the DB is
    unreachable Prisma takes several seconds to fail, so `/profile` shows
    "Загрузка..." until `GET /api/profile` errors out (it then opens an
    empty wizard). Consider a client-side timeout or a `/api/health` gate.
14. `WizardProvider` resets the form whenever `initialData` changes by
    reference. `Wizard` now passes a stable object, but
    `ProfileSettings` re-mounts the wizard per edit, which is fine today and
    fragile if props start changing.

## Code health

15. No ESLint config (`next lint` prompts), no Prettier, no tests, no CI.
    `pnpm typecheck` + `pnpm build` are the only gates.
16. Legacy `.theme-*` utilities and the new shadcn tokens coexist in
    `globals.css`; pick one when the redesign lands.
17. `hooks/useClientOnce.ts` and `hooks/useDidMount.ts` are no longer used.
18. Browserslist data is 17 months old (`npx update-browserslist-db@latest`).
19. Git history is mostly "up"/"upd".
