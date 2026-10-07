# Conventions

## Files and imports

- Aliases: `@/…` for repo root, `@public/…` for `public/`.
- Route handlers: `app/api/<name>/route.ts`, `export async function GET/POST/PUT`,
  plus `export const dynamic = "force-dynamic"` and `export const runtime = "nodejs"`.
- Pages: `app/<route>/page.tsx`; page-local UI in `app/<route>/ui/`;
  page-local CSS next to the component.
- Shared components: `components/<Name>/<Name>.tsx` + `<Name>.css` + `index.ts`.
  shadcn primitives live in `components/ui/` and are re-exported from
  `components/ui/index.ts`. They are hand-copied from ui.shadcn.com (Tailwind
  v3 variants); there is deliberately **no `components.json`** at the repo
  root, because with the `@/*` alias a root `components.json` file shadows the
  `components/` directory and breaks `import ... from "@/components"`.
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

One file per step in `app/profile/ui/steps/Step<Topic>.tsx`, props `{ onNext }`:

```tsx
export function StepTopic({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.<topic>");
  const { register, watch, setValue, control, formState: { errors } } = useWizardContext();
  const value = watch("field") || "";
  return (
    <StepContainer title={t("title")} onNext={onNext} nextDisabled={!value}>
      {/* <Input {...register("field", { required: true })} />          — text */}
      {/* <Controller name="field" control={control} render={...} />  — cards, custom onChange */}
      {/* setValue("field", next, { shouldValidate: true })            — array toggles, max 4 */}
    </StepContainer>
  );
}
```

- Field names are keys of `Profile`; "about" is stored in `profile`.
- Register the step in `wizardConfig.ts` (its `id` is used by
  `ProfileSettings.handleEditStep`) and add `profile.steps.<topic>.*` keys to
  both locale files.
- Single choice → `SelectionCard` column; multi choice → `SelectionGrid` +
  `SelectedButton`; text → `Input`; photo → `PhotoUpload`.

## Styling

- shadcn tokens first: `bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`,
  `text-destructive`. They are HSL vars in `globals.css` and switch with `.dark`.
- Brand extras: `bg-gradient-primary`, `text-success`, `bg-warning/10`,
  `.theme-card`, `.theme-btn-primary` (legacy utilities, fine to use).
- Wizard-specific chrome (`StepContainer`, `NextButton`, `SelectionCard`) has
  its own CSS with the pixel-art design; do not restyle it with Tailwind.
- Never raw greys/whites (`bg-white`, `text-gray-600`).
- Icons: `lucide-react`. Fonts: Handjet body (`--font-handjet`), Rubik in
  card CSS, `.logo-font` for the wordmark.
- Pages that render `FooterMenu` need `pb-24` on the scroll container.

## i18n

- `useTranslations("<namespace>")`; namespaces: `app, menu, home, profile
  {title, wizard, steps, view}, questions, admin, common, errors, settings`.
- Every key goes to both `ru.json` and `en.json`. Product copy is Russian;
  code, comments and docs are English.

## Server code

- Prisma via the `prisma` singleton; `findUnique` by `telegramId`, `upsert`
  for writes, `$transaction([...])` for multi-row updates.
- Singletons expose `getInstance()`; config objects have `getConfig/updateConfig`.
- Logs: emoji-prefixed one-liners (`🚀 ✅ ❌ ⚠️ 🧹`).

## Commit messages

Imperative and specific. "upd" is history, not the standard.
