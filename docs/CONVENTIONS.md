# Conventions

## Files and imports

- Aliases: `@/…` for repo root, `@public/…` for `public/`.
- Route handlers: `app/api/<name>/route.ts`, `export async function GET/POST/PUT`,
  plus `export const dynamic = "force-dynamic"` and `export const runtime = "nodejs"`.
- Pages: `app/<route>/page.tsx`; page-local UI in `app/<route>/ui/`;
  page-local CSS next to the component.
- Shared components: `components/<Name>.tsx` (or `components/<Name>/` for
  multi-file ones), imported by path (`@/components/FooterMenu`); there is no
  `components/index.ts` barrel. shadcn and XP primitives live in
  `components/ui/` (kebab-case files) and are re-exported from
  `components/ui/index.ts`; import them from `@/components/ui`. They are hand-copied from ui.shadcn.com (Tailwind
  v3 variants); there is deliberately **no `components.json`** at the repo
  root, because with the `@/*` alias a root `components.json` file can shadow the
  `components/` directory under `@/components`.
- Server-only: `lib/prisma.ts`, `lib/auth.ts`, `lib/bot.ts`,
  `lib/matchingService.ts`, `lib/profileDto.ts`. Never import them from
  client components. Client fetch wrappers: `lib/api.ts`, `lib/settingsService.ts`.

## API routes

```ts
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);      // or requireAdmin(request)
    // ... prisma ...
    return NextResponse.json(toProfile(row));
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Context:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

- The user id always comes from `authenticate()`, never from the body/URL.
- Validate and cap input (see `POST /api/profile`); respond `{ error }` with
  400/403/404/413 as appropriate.
- Map DB rows with `toProfile()`; do not leak `previousMatches`,
  preferences or flags.
- Ops routes (`/api/matching`, `/api/bot/setup`, `/api/cron/*`) return
  `{ success, data | error, details? }`.

## Client data access

- Always `api.get/post/put` from `lib/api.ts` (adds the tma header and
  throws `ApiError` on non-2xx). Treat 404 from `GET /api/profile` as
  "no profile yet".
- `useAuth()` gives `{ user, userId, isAdmin }` for UI decisions only.
- Fetch in `useEffect` with a `cancelled` flag; keep loading/error state local.

## React / Next

- Everything under `app/` that uses hooks or the SDK is `"use client"`.
  `app/layout.tsx` and `core/i18n/provider.tsx` are the only server components.
- Telegram SDK v3: `useSignal(initData.user)` (fields are snake_case:
  `first_name`, `language_code`), `useLaunchParams().tgWebAppPlatform`,
  `useSignal(miniApp.isDark)`. `Root` toggles the `dark` class on `<html>`.
- Navigation with `useRouter()`; redirects in `useEffect`, never during render.

## Wizard steps (react-hook-form)

One file per step in `app/profile/ui/steps/Step<Topic>.tsx`, props `{ onNext }`,
rendered inside `StepWindow` (`app/profile/ui/StepWindow.tsx`: title bar,
scrollable body, full-width "Далее" button). Modeled on `StepOccupation.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { AnswerExamples, TextArea } from "@/components/ui";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

export function StepOccupation({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.occupation");
  const { register, watch } = useWizardContext();
  const occupation = watch("occupation") || "";

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={!occupation.trim()}>
      <div className="flex flex-col gap-4">
        <TextArea
          {...register("occupation", { required: true, validate: (v) => Boolean(v?.trim()) })}
          placeholder={t("placeholder")}
          maxLength={80}
        />
        <AnswerExamples heading={t("examplesHeading")} examples={t.raw("examples") as string[]} />
      </div>
    </StepWindow>
  );
}
```

`StepWindow` props: `title`, `onNext`, `nextDisabled`, `nextText` (e.g. a
"Далее 2/3" counter), `bodyClassName`. Capped multi-selects use
`useLimitedSelection(field, max)` → `{ count, isSelected, isLocked, toggle }`
instead of hand-written `setValue` toggles (see `StepValues.tsx`).

- Field names are keys of `Profile`; "about" is stored in `profile`.
- Register the step in `wizardConfig.ts` (its `id` is used by
  `ProfileSettings.handleEditStep`) and add `profile.steps.<topic>.*` keys to
  both locale files.
- Text → `TextInput` / `TextArea`; single choice → `CountryCard`; multi
  choice → `ListItem`, `InterestChip` or `MeetingGoalCard` with
  `useLimitedSelection`; photo → `PhotoUploader` + `fileToResizedJpeg`
  (`lib/imageUtils.ts`) uploaded via `POST /api/profile/photo`. All from `@/components/ui`.
- The last step (`theme`, design picker) has `countsInProgress: false` in
  `wizardConfig.ts`, so the progress header counts 10 steps, not 11.

## Styling

- shadcn tokens first: `bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`,
  `text-destructive`. They are HSL vars in `globals.css` and switch with `.dark`.
- Foundation tokens (XP Foundations, see `docs/guides/THEME_SYSTEM_GUIDE.md`):
  `bg-primary-light`, `bg-primary-muted`, `bg-success`, `bg-success-bg`,
  `text-title|option|counter|body|chip`, `rounded-xs|sm|md|xl`, `p-2.75`.
  `.theme-*` utilities and `--theme-*` vars are legacy aliases; avoid in new code.
- `globals.css` sets `margin-bottom: 1rem` and a color on `h1`–`h6` and `p`;
  put `m-0` on headings and paragraphs in new components.
- Exception: profile card templates (`components/profile-templates/`) use their
  own fixed palettes and fonts (hex colors, Caveat / PT Mono / Press Start 2P)
  because a card must look the same in any app theme. Keep raw colors inside
  those templates only.
- Never raw greys/whites (`bg-white`, `text-gray-600`).
- Icons: `lucide-react`. Font: Inter 400/700 only (`--font-inter`, `font-sans`);
  `.logo-font` for the wordmark.
- Back navigation: always `<BackButton />` from `@/components/ui` (no ad-hoc
  ghost buttons with chevrons).
- Pages that render `FooterMenu` need `pb-24` on the scroll container.

## i18n

- `useTranslations("<namespace>")`; namespaces: `app, menu, home, profile
  {title, wizard, steps, view}, questions, admin, common, errors, settings,
  profileCard` (template labels).
- Every key goes to both `ru.json` and `en.json`. Product copy is Russian;
  code, comments and docs are English.

## Server code

- Prisma via the `prisma` singleton; `findUnique` by `telegramId`, `upsert`
  for writes, `$transaction([...])` for multi-row updates.
- Singletons expose `getInstance()`; config objects have `getConfig/updateConfig`.
- Logs: emoji-prefixed one-liners (`🚀 ✅ ❌ ⚠️ 🧹`).

## Commit messages

Imperative and specific. "upd" is history, not the standard.
