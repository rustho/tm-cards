# Codebase map

Branch `feature/relational-schema`. Status tags: **LIVE** = user-facing path ·
**OPS** = admin/cron/bot backend · **DEV** = development only · **DEMO** =
example code.

## Root

| Path | Status | Notes |
|---|---|---|
| `package.json` | LIVE | name `travelmate`; scripts `dev`, `build` (prisma generate && next build), `typecheck`, `db:migrate`, `db:deploy`, `db:studio`, `health:check` |
| `pnpm-lock.yaml` | LIVE | the only lockfile |
| `next.config.mjs` | LIVE | next-intl plugin + `serverComponentsExternalPackages: ['@prisma/client','prisma']` |
| `tsconfig.json` | LIVE | strict, aliases `@/*`, `@public/*` |
| `tailwind.config.ts` | LIVE | `darkMode: ["class"]`, shadcn HSL tokens + brand palette, `tailwindcss-animate` |
| `postcss.config.js` | LIVE | tailwind + autoprefixer |
| `.github/workflows/run-matching.yml` | OPS | manual (`workflow_dispatch`) GitHub Actions run → `/api/cron/matching`; no schedule yet |
| `vercel.json` | OPS | `regions: ["hnd1"]`: functions next to the Tokyo DB |
| `prisma/schema.prisma`, `prisma/migrations/` | LIVE | relational model (users, profiles, locations, tags, profile_tags, user_settings, match_rounds, matches, match_feedback, plans, subscriptions, payments); 8 migrations: `20261008090000_relational_model` backfills from the legacy tables, then `…_profile_occupation` and `…_profile_goals` add columns |
| `prisma/seed.ts` | DEV | idempotent tags + locations seed (`pnpm db:seed`); deactivates `trait`/`hobby` tags, interest tags not in `INTERESTS` and unavailable locations |
| `.env.example` | DEV | documents every variable |
| `.env` | ⚠️ | tracked with old credentials; untouched on purpose |
| `.claude/launch.json` | DEV | dev-server config for the Claude browser pane |
| `CLAUDE.md`, `AGENTS.md`, `docs/` | docs | agent documentation; `docs/archive` is stale history |

## `app/`

| Route / file | Status | Notes |
|---|---|---|
| `layout.tsx` | LIVE | server component: locale, `I18nProvider`, `Root`; imports normalize.css + `globals.css`; Inter font var |
| `fonts.ts` | LIVE | `next/font/google` Inter 400/700 (latin+cyrillic) → `--font-inter` |
| `page.tsx` | LIVE | `/` (launch): `/profile` until the profile `isComplete`, then `/meetings` |
| `admin/layout.tsx` | LIVE | gate for every `/admin/*` page (`useAuth().isAdmin` from `/api/me`) |
| `admin/page.tsx` | LIVE | `/admin`: section links + KPIs from `/api/admin/overview` (linked from `/settings`) |
| `admin/funnel/page.tsx` | LIVE | cohort funnel bars, wizard drop-off, weekly cohort table; period/source chips |
| `admin/users/page.tsx`, `admin/users/[telegramId]/page.tsx` | LIVE | user search/filters; user card: access, status, bot message, meetings, events |
| `admin/matching/page.tsx`, `admin/matching/[roundId]/page.tsx` | LIVE | preview/run matching, config, rounds; pairs of a round with cancel |
| `admin/broadcasts/page.tsx`, `admin/broadcasts/[id]/page.tsx` | LIVE | composer (segment, country, text, test) + history; progress page drives the batched sending |
| `error.tsx`, `not-found.tsx` | LIVE | |
| `_assets/globals.css` | LIVE | XP foundation tokens (`--color-*`, `--radius-*`), shadcn aliases, legacy `--theme-*` aliases and `.theme-*` utilities; base `h1`–`h6`/`p` margins (new components use `m-0`) |
| `/icebreaker` (`page.tsx`, `ui/{startGame,game,endGame}.tsx`, `constants/questions.ts`, `pageStyles.css`) | LIVE | card game; `questions.md` is the source text; easter egg: 5 taps → `/profile` |
| `/profile` (`page.tsx`) → `ui/MyProfileView.tsx` or `ui/Wizard.tsx` | LIVE | «Анкета» tab: `GET /api/profile`; `isComplete` → `MyProfileView` (template card, city, formats, «Редактировать анкету» → the wizard with `onDone`/`onCancel`, without `firstMeeting`); otherwise the wizard, a full-height column (`h-[100dvh] px-4 pb-24`) above the fixed `FooterMenu`; the wizard loads `GET /api/profile`, seeds Telegram name/username, forwards `startapp=ref_<code>` as `referralCode`, autosaves steps via `POST /api/profile`, finishes with `isComplete: true` and `router.push("/home")` |
| `ui/FlexibleWizard.tsx` | LIVE | step engine (`steps`, `mode full\|edit`, `ProgressHeader` with back, `WizardStepConfig.countsInProgress`) |
| `ui/StepWindow.tsx` | LIVE | step shell: `WindowTitleBar` + scrollable body + full-width primary "Далее" `Button` (`title, onNext, nextDisabled, nextText, bodyClassName`) |
| `ui/useLimitedSelection.ts` | LIVE | multi-select over a `string[]` field with a max → `{ selected, count, isSelected, isLocked, toggle }` |
| `ui/WizardContext.tsx` | LIVE | `WizardProvider` = `useForm<Partial<Profile>>` + step index; `useWizardContext()` |
| `ui/wizardConfig.ts` | LIVE | `ONBOARDING_STEPS`: location, name, dateOfBirth, occupation, values, interests, goal, meetingFormat, about, photo, theme (design picker), firstMeeting (full-screen "join this week?" → `skipNextRound`); the last two have `countsInProgress: false`, so progress shows 10/10 |
| `ui/steps/Step{Location,Name,DateOfBirth,Occupation,Values,Interests,Goal,MeetingFormat,About,Photo,Theme}.tsx` | LIVE | one file per step on `useWizardContext()` / `useLimitedSelection()`; all but `StepTheme` (own window + carousel of `PROFILE_TEMPLATES`) render inside `StepWindow` |
| `ui/steps/StepReview.tsx` | — | optional "Спасибо, {name}!" interstitial with `autoAdvanceMs`; not in `ONBOARDING_STEPS` (header comment shows how to add it) |
| `/profile/[userId]` | LIVE | someone's questionnaire rendered with their `ProfileCard` template |
| `/profile/settings` | LIVE | client redirect → `/settings/profile` |
| `/home` | LIVE | «Люди»: `GET /api/home` → feedback hint, «История встреч» (last 4), «Мои встречи» / «Приглашённые» counters, «Выбрать подписку» without access |
| `/home/meetings`, `/home/meetings/[matchId]` | LIVE | full meeting log; feedback flow (outcome → impressions / reasons → «Супер!») and the partner's impression |
| `/meetings`, `/meetings/[matchId]/question` | LIVE | «Встречи» by phase (`WEEK_SCHEDULE`): `week` → `WeekMatchView` (accept, timer, contact, question of the week); `feedback` → embedded `MeetingFeedbackFlow`; `signup` → opt-in toggle + city |
| `/invitations` | LIVE | referral link + invited friends (paid subscription), rewards teaser otherwise |
| `/settings/subscription` | MOCK | plan picker without payments |
| `/settings` | LIVE | 4 links in a `Card` |
| `/settings/profile` (`page.tsx`, `ProfileSettings.tsx`, `SuccessToast.tsx`) | LIVE | loads own profile, edits single steps through `FlexibleWizard` in `edit` mode, saves via `POST /api/profile` |
| `/settings/notifications` | LIVE | shadcn `Switch` rows → `PUT /api/settings/notifications` |
| `/settings/matching-schedule` | LIVE | radio rows → `PUT /api/settings/matching-schedule` |

### API (`app/api/`)

| Route | Auth | Status |
|---|---|---|
| `GET/POST /api/profile` | user | LIVE |
| `POST /api/profile/photo` | user | LIVE |
| `GET /api/profile/[userId]` | user | LIVE |
| `GET /api/home`, `GET /api/meetings`, `GET /api/meetings/current`, `GET /api/meetings/pending-feedback` | user | LIVE |
| `GET /api/meetings/[matchId]`, `POST …/feedback`, `POST …/accept`, `GET …/question` | participant | LIVE |
| `PUT /api/meetings/participation`, `GET /api/invitations` | user | LIVE |
| `GET /api/reference` | user | LIVE |
| `GET/PUT /api/settings/notifications`, `/matching-schedule` | user | LIVE |
| `GET /api/me` | user | LIVE |
| `/api/admin/*` (overview, funnel, users, users/[telegramId], …/message, matching, matching/rounds/[roundId], matching/matches/[matchId], broadcasts, broadcasts/audience, broadcasts/test, broadcasts/[id]) | admin | LIVE |
| `GET /api/cron/matching` | `CRON_SECRET` | OPS |
| `POST /api/bot/webhook` | webhook secret | OPS |
| `GET/POST /api/bot/setup` | admin | OPS |
| `GET /api/health` | public | OPS |

## `components/`

| Path | Status | Notes |
|---|---|---|
| `ui/button.tsx`, `ui/card.tsx`, `ui/switch.tsx` | LIVE | shadcn primitives (Tailwind 3 variants) |
| `ui/*.tsx` (XP) | LIVE | `text-input`, `text-area`, `window-title-bar`, `window-control`, `progress-header`, `back-button`, `step-item`, `counter-badge`, `status-icon`, `country-card`, `unlock-divider`, `interest-chip`, `list-item`, `meeting-goal-card`, `answer-examples`, `age-summary`, `photo-uploader`, `selection-guidance`, `category-header` (`icon={false}` for a bare title) |
| `ui/index.ts` | LIVE | barrel for all of `ui/`; there is no `components/index.ts` |
| `profile-templates/index.tsx` | LIVE | registry: `PROFILE_TEMPLATES`, `getProfileTemplate(theme)`, `ProfileCard`; header comment explains adding a template. Used by `StepTheme` and `/profile/[userId]` |
| `profile-templates/image/ImageTemplate.tsx` | LIVE | one component for all card designs: artwork `public/profile-templates/<theme>.webp` (labels drawn in) with the answers laid over it at fixed coordinates |
| `profile-templates/{types,utils,fonts}.ts` | LIVE | `ProfileTemplateProps`/`ProfileCardData`, `formatLocation`/`getAge`, Caveat / PT Mono / Press Start 2P via `next/font` (`preload: false`) |
| `Root/Root.tsx` | LIVE | runs `mockEnv()` → `init()`; toggles `.dark` from `miniApp.isDark`; sets locale from `user.language_code`; "Loading" until ready |
| `FooterMenu.tsx` | LIVE | floating bottom tab bar (Люди, Приглашения, Встречи, Анкета, Профиль) + «Как прошло знакомство?» reminder from `/api/meetings/pending-feedback` |
| `meetings/*` | LIVE | meetings UI pieces (WeekMatchView, MeetingList, StatCard, CelebrationScreen, Countdown, BottomAction, LocationPicker, PixelPeople, FeedbackHintBanner) |
| `admin/*` | LIVE | `AdminUI` (AdminPage, Section, Panel, Stat, Badge, ConfirmButton, formatDate), `MatchCard`, `UserBadges`, `BroadcastProgress` |
| `ErrorBoundary.tsx`, `ErrorPage.tsx` | LIVE | |

## `core/`, `config/`, `hooks/`

| Path | Status | Notes |
|---|---|---|
| `core/init.ts` | LIVE | SDK v3 init: `setDebug`, `initSDK`, eruda, macOS workaround, mounts backButton/initData/miniApp/themeParams/viewport |
| `core/mockEnv.ts` | DEV | `mockTelegramEnv` with user `DEV_MOCK_TELEGRAM_ID`, light theme, unsigned init data |
| `core/i18n/*` | LIVE | `defaultLocale "ru"`, `locales ["ru"]`, cookie `NEXT_LOCALE` |
| `config/constants.ts` | LIVE | `DEV_MOCK_TELEGRAM_ID`, `MENU_ITEMS`, `APP_METADATA`, trial/week schedule constants |
| `hooks/useAuth.ts` | LIVE | `{ user, userId, isAdmin, isAdminKnown, isAuthenticated }`; `isAdmin` from cached `GET /api/me` |
| `hooks/useClientOnce.ts`, `useDidMount.ts` | LIVE | helpers (currently unused by Root) |

## `lib/`, `models/`

| Path | Status | Notes |
|---|---|---|
| `lib/auth.ts` | LIVE | `authenticate`, `requireAdmin`, `authErrorResponse`, `ensureUser`, `AuthError` |
| `lib/api.ts` | LIVE | `apiFetch`, `apiJson`, `api.get/post/put`, `ApiError`, `getInitDataRaw` |
| `lib/profileDto.ts` | LIVE | `userWithProfileInclude`, `toProfile(UserWithProfile)`, `TAG_CATEGORIES` |
| `lib/profileService.ts` | LIVE | `saveProfile` (validation, location upsert, tag replacement, referral), `getOwnProfile`, `getProfileByTelegramId` |
| `lib/prisma.ts` | LIVE | singleton; no-op proxy during build without `DATABASE_URL` |
| `lib/bot.ts` | OPS | grammY bot, `BOT_COMMANDS`, `notifyUser`, `isBotConfigured`, `getBotUsername`, `getInviteLink` |
| `lib/matchingService.ts` | OPS | engine over users/profiles/tags with weekly `match_rounds`; candidates need access; see DATA_AND_API |
| `lib/meetingsService.ts` | LIVE | `getAccess`, `getWeekPhase`, participation, meeting DTOs, feedback validation + status rules |
| `lib/weekMatchService.ts` | LIVE | `getCurrentMatch`, `acceptMatch` (bot nudges / contacts), `getWeeklyQuestion` |
| `lib/weekCycle.ts` | LIVE | `agreeDeadline`, `closeUnagreedMatches` |
| `lib/pendingFeedback.ts`, `lib/telegramLinks.ts` | LIVE | client: reminder cache / invalidation; `openTgLink` |
| `lib/settingsService.ts` | LIVE | client wrapper for settings routes |
| `lib/dateUtils.ts` | LIVE | `calculateAge`, `validateDateOfBirth`, `formatDateForInput` |
| `lib/utils.ts` | LIVE | `cn()` |
| `lib/imageUtils.ts` | LIVE | `fileToResizedJpeg` (browser): downscale to a 1280px JPEG blob before upload |
| `lib/photoStorage.ts` | LIVE | server: Supabase Storage REST (upload, delete, own-URL check, bucket creation) for profile photos |
| `models/types.ts` | LIVE | `StepProps`, `User`, `Profile`, `ProfileData`, settings types, option lists (`VALUE_OPTIONS`/`VALUES`, `INTEREST_GROUPS`/`INTERESTS`, `GOAL_OPTIONS`, `MEETING_FORMAT_OPTIONS`, `LOCATIONS: LocationOption[]`, `PROFILE_THEMES`/`DEFAULT_PROFILE_THEME`) |

## `public/`

`locales/{ru,en}.json`, `fonts/Handjet-Light.ttf` (unused), `Hardpixel.OTF`
(`.logo-font`), `background.png` (unused), `logo-*.PNG`, `texture.png`.
