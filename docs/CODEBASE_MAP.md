# Codebase map

Branch `feature/platform-upgrade`. Status tags: **LIVE** = user-facing path ·
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
| `vercel.json` | OPS | cron `0 */4 * * *` → `/api/cron/matching` |
| `prisma/schema.prisma`, `prisma/migrations/` | LIVE | `MatchingUser`, `MatchResult`, `UserSettings`; 5 migrations |
| `.env.example` | DEV | documents every variable |
| `.env` | ⚠️ | tracked with old credentials; untouched on purpose |
| `.claude/launch.json` | DEV | dev-server config for the Claude browser pane |
| `CLAUDE.md`, `AGENTS.md`, `docs/` | docs | agent documentation; `docs/archive` is stale history |

## `app/`

| Route / file | Status | Notes |
|---|---|---|
| `layout.tsx` | LIVE | server component: locale, `I18nProvider`, `Root`; imports normalize.css + `globals.css`; Handjet font var |
| `fonts.ts` | LIVE | `localFont` Handjet → `--font-handjet` |
| `page.tsx` | LIVE | `/`: admin → `AdminMenu`; others → `router.replace("/icebreaker")` in an effect |
| `error.tsx`, `not-found.tsx` | LIVE | |
| `_assets/globals.css` | LIVE | shadcn tokens (`:root`, `.dark`), brand vars, body background, `.theme-*` utilities, input/age/character-count helpers |
| `/icebreaker` (`page.tsx`, `ui/{startGame,game,endGame}.tsx`, `constants/questions.ts`, `pageStyles.css`) | LIVE | card game; `questions.md` is the source text; easter egg: 5 taps → `/profile` |
| `/profile` → `ui/Wizard.tsx` | LIVE | loads `GET /api/profile`, seeds Telegram name/username, autosaves steps via `POST /api/profile`, finishes with `isActive: true` and `router.push("/home")` |
| `ui/FlexibleWizard.tsx` | LIVE | step engine (`steps`, `mode full\|edit`, progress bar, back button) |
| `ui/WizardContext.tsx` | LIVE | `WizardProvider` = `useForm<Partial<Profile>>` + step index; `useWizardContext()` |
| `ui/wizardConfig.ts` | LIVE | `ONBOARDING_STEPS`: country, region, name, dateOfBirth, personality, interests, hobbies, goal, photo, socials, about |
| `ui/steps/Step{Country,City,Name,DateOfBirth,Personality,Interests,Hobbies,Goal,Photo,Socials,About}.tsx` | LIVE | one file per step, all on `useWizardContext()` |
| `/profile/[userId]` | LIVE | read-only profile card (all fields, null-safe Instagram) |
| `/profile/settings` | LIVE | client redirect → `/settings/profile` |
| `/home` | LIVE | `GET /api/matches/{me}` → cards → `/profile/[id]` |
| `/settings` | LIVE | 4 links in a `Card` |
| `/settings/profile` (`page.tsx`, `ProfileSettings.tsx`, `SuccessToast.tsx`) | LIVE | loads own profile, edits single steps through `FlexibleWizard` in `edit` mode, saves via `POST /api/profile` |
| `/settings/notifications` | LIVE | shadcn `Switch` rows → `PUT /api/settings/notifications` |
| `/settings/matching-schedule` | LIVE | radio rows → `PUT /api/settings/matching-schedule` |
| `/settings/subscription` | LIVE | static "free in beta" |

### API (`app/api/`)

| Route | Auth | Status |
|---|---|---|
| `GET/POST /api/profile` | user | LIVE |
| `GET /api/profile/[userId]` | user | LIVE |
| `GET /api/users` | admin | OPS |
| `GET /api/matches/[userId]` | owner/admin | LIVE |
| `GET/PUT /api/settings/notifications`, `/matching-schedule` | user | LIVE |
| `GET/POST/PUT /api/matching` | admin | OPS |
| `GET /api/cron/matching` | `CRON_SECRET` | OPS |
| `POST /api/bot/webhook` | webhook secret | OPS |
| `GET/POST /api/bot/setup` | admin | OPS |
| `GET /api/health` | public | OPS |

## `components/`

| Path | Status | Notes |
|---|---|---|
| `ui/button.tsx`, `ui/card.tsx`, `ui/switch.tsx`, `ui/index.ts` | LIVE | shadcn primitives (Tailwind 3 variants) |
| `index.ts` | LIVE | exports `Input`, `SelectedButton`, `SelectionGrid`, `StepContainer`, `SelectionCard`, `NextButton`, `PhotoUpload` |
| `Root/Root.tsx` | LIVE | runs `mockEnv()` → `init()`; toggles `.dark` from `miniApp.isDark`; sets locale from `user.language_code`; "Loading" until ready |
| `FooterMenu.tsx` | LIVE | fixed bottom nav with lucide icons, active state from `usePathname` |
| `AdminMenu.tsx` | LIVE | 4 cards (descriptions hardcoded English) |
| `StepContainer/`, `NextButton/`, `Input/`, `SelectionCard/`, `SelectedButton/`, `SelectionGrid/`, `PhotoUpload/` | LIVE | wizard building blocks; `SelectedButton` wraps the shadcn `Button` |
| `ErrorBoundary.tsx`, `ErrorPage.tsx` | LIVE | |

## `core/`, `config/`, `hooks/`

| Path | Status | Notes |
|---|---|---|
| `core/init.ts` | LIVE | SDK v3 init: `setDebug`, `initSDK`, eruda, macOS workaround, mounts backButton/initData/miniApp/themeParams/viewport |
| `core/mockEnv.ts` | DEV | `mockTelegramEnv` with user `ADMIN_TELEGRAM_IDS[0]`, light theme, unsigned init data |
| `core/i18n/*` | LIVE | `defaultLocale "ru"`, `locales ["ru"]`, cookie `NEXT_LOCALE` |
| `config/constants.ts` | LIVE | `ADMIN_TELEGRAM_IDS`, `MENU_ITEMS`, `APP_METADATA` |
| `hooks/useAuth.ts` | LIVE | `{ user, userId, isAdmin, isAuthenticated }` |
| `hooks/useClientOnce.ts`, `useDidMount.ts` | LIVE | helpers (currently unused by Root) |

## `lib/`, `models/`

| Path | Status | Notes |
|---|---|---|
| `lib/auth.ts` | LIVE | `authenticate`, `requireAdmin`, `authErrorResponse`, `ensureUser`, `AuthError` |
| `lib/api.ts` | LIVE | `apiFetch`, `apiJson`, `api.get/post/put`, `ApiError`, `getInitDataRaw` |
| `lib/profileDto.ts` | LIVE | `toProfile(MatchingUser)` |
| `lib/prisma.ts` | LIVE | singleton; no-op proxy during build without `DATABASE_URL` |
| `lib/bot.ts` | OPS | grammY bot, `BOT_COMMANDS`, `notifyUser`, `isBotConfigured` |
| `lib/matchingService.ts` | OPS | engine; see DATA_AND_API |
| `lib/settingsService.ts` | LIVE | client wrapper for settings routes |
| `lib/dateUtils.ts` | LIVE | `calculateAge`, `validateDateOfBirth`, `formatDateForInput` |
| `lib/utils.ts` | LIVE | `cn()` |
| `models/types.ts` | LIVE | `StepProps`, `User`, `Profile`, `ProfileData`, settings types, option lists (`PERSONALITY_TRAITS`, `INTERESTS`, `HOBBIES`, `GOALS`, `LOCATIONS`) |

## `public/`

`locales/{ru,en}.json`, `fonts/Handjet-Light.ttf`, `Hardpixel.OTF`
(`.logo-font`), `background.png`, `left-arrow.svg`, `logo-*.PNG`, `texture.png`.
