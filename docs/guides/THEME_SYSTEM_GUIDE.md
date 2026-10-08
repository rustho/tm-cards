# Theme system: XP UI Foundations

Source of truth: Figma frame **"00 — XP Foundations" → Foundations / Root**.
Implementation: CSS variables in `app/_assets/globals.css`, exposed as Tailwind
tokens in `tailwind.config.ts`. Hex values below were sampled from a Figma
screenshot; replace them with the exact Figma values when available (one line
each in `globals.css`).

## Colors

| Figma token | Hex | CSS var | Tailwind |
|---|---|---|---|
| color/background | `#F8F6F4` | `--color-background` | `bg-background`, `bg-muted` |
| color/surface | `#FFFFFF` | `--color-surface` | `bg-card`, `bg-surface` |
| color/primary | `#2253DB` | `--color-primary` | `bg-primary`, `text-primary` |
| color/primary-light | `#528AEE` | `--color-primary-light` | `bg-primary-light` |
| color/primary-muted (disabled) | `#DEE8F8` | `--color-primary-muted` | `bg-primary-muted`, `bg-secondary`, `bg-accent` |
| color/success-bg (selected) | `#F4F8EF` | `--color-success-bg` | `bg-success-bg` |
| color/success | `#61982D` | `--color-success` | `bg-success`, `text-success` |
| color/danger | `#D24B3B` | `--color-danger` | `bg-destructive` / `bg-danger` |
| text | `#010616` | `--color-text` | `text-foreground` |
| secondary text | `#68717E` | `--color-text-secondary` | `text-muted-foreground` |
| divider / stroke | `#E6E9EB` | `--color-stroke` | `border-border` |

Text on primary/success/danger is white (`text-primary-foreground` etc.).
Opacity modifiers work (`bg-primary/10`).

Dark theme: Figma has none yet. `.dark` (toggled from Telegram in
`components/Root/Root.tsx`) overrides only the `--color-*` layer with derived
values; everything else follows.

## Typography

Inter Regular (400) and Bold (700) only, loaded with `next/font/google`
(`app/fonts.ts`, latin + cyrillic) as `--font-inter`; `font-sans` uses it.

| Style | Size / line | Weight | Tailwind |
|---|---|---|---|
| Window Title | 20 / 26 | Bold | `text-title` (bold built in) |
| Option | 17 / 24 | Regular | `text-option` |
| Counter | 16 / 22 | Regular | `text-counter` |
| Body (default) | 15 / 20 | Regular | `text-body` |
| Chip | 14 / 20 | Regular | `text-chip` |
| Caption | 13 / 18 | Regular | `text-caption` |

`body` defaults to Body 15/20. Do not use `font-medium`/`font-semibold`: the
weights are not loaded.

## Dimensions

- Spacing: 4 · 6 · 8 · 11 · 12 · 16 · 20 · 24 px → Tailwind `1 · 1.5 · 2 · 2.75 · 3 · 4 · 5 · 6`
  (`p-2.75` = 11px is the one custom step).
- Radius: 2 · 4 · 8 · 26 px → `rounded-xs · rounded-sm · rounded-md · rounded-xl`.
  `rounded-lg` is also 8px so shadcn primitives stay on the scale.
- Stroke: 1px (`border`, color `border-border`).

## Components

| Component | File | Spec |
|---|---|---|
| `Button` primary | `components/ui/button.tsx` | `variant="primary" size="block"`: `bg-action` (#296CF9), white Counter 16/22 Regular, `rounded-md` 8px, 48px tall, full width. Hover 90%, active 80%, disabled 50% opacity |
| `BackButton` | `components/ui/back-button.tsx` | arrow 12px + label, gap 8, Option 17/24, `text-muted-foreground`, hug, 24px tall. Defaults: `router.back()`, `common.back` label; pass `onClick`/children to override |
| `InterestChip` | `components/ui/interest-chip.tsx` | emoji `icon` + `label`, Chip 14/20, 32px tall, `rounded-xl` 26px, padding 6×11, gap 4, hug. Default: `bg-surface` + `border-divider`; `selected`: `bg-primary-muted` + `border-primary` |
| `TextArea` | `components/ui/text-area.tsx` | `bg-surface`, `border-divider` 1px (focus `border-primary`, `error` `border-destructive`), `rounded-md` 8px, padding 12×16, min 120×80, text Option 17/24, placeholder `text-muted-foreground`, auto-grows. With `maxLength` (or `showCounter`) a bottom-right `n/max` counter, Caption 13/18 `text-muted-foreground`. Works with RHF `register` |
| `TextInput` | `components/ui/text-input.tsx` | single-line sibling of `TextArea`: `bg-surface`, `border-divider` 1px (focus `border-primary`, `error` `border-destructive`), `rounded-md` 8px, 56px tall, padding 0×16, Option 17/24. Works with RHF `register` |
| `AnswerExamples` | `components/ui/answer-examples.tsx` | Column with 4px gap, Body 15/20: `heading` (default «Например:») in `text-primary`, then `examples[]` as a list in `text-foreground` |

`cn()` (`lib/utils.ts`) knows the `text-title|option|counter|body|chip|caption` sizes;
add new font-size tokens there too, or tailwind-merge drops them next to a
`text-<color>` class.

## Layers in globals.css

1. `--color-*`, `--radius-*`: foundation tokens. Change the design here.
2. shadcn aliases (`--background`, `--primary`, `--destructive`, ...) used by
   Tailwind and `components/ui`.
3. Legacy `--theme-*` / `--brand-*` and `.theme-*` utilities: aliases onto the
   foundation so older component CSS follows the new palette. Do not use in new
   code; remove as components are redesigned.

The wizard is fully on the tokens: `FlexibleWizard.css` only does layout, and
steps render inside `StepWindow` (`app/profile/ui/StepWindow.tsx`:
`WindowTitleBar` + body on `bg-background`/`border-divider` + primary `Button`).
The old pixel-art wizard components and their `.input-*` CSS are gone.

`globals.css` also has base element rules: `h1`–`h6` and `p` get
`margin-bottom: 1rem` and a color. Components put `m-0` on their headings and
paragraphs.

## Exception: profile card templates

`components/profile-templates/` (notebook, retro) deliberately use their own
fixed palettes (hex colors, e.g. `text-[#1b1b1b]`) and decorative fonts
(Caveat, PT Mono, Press Start 2P from `components/profile-templates/fonts.ts`,
`preload: false`). A card is a user-chosen design and must look the same in
light and dark app themes, so it does not follow the tokens. Keep raw colors
and these fonts inside the templates; everywhere else the token rules above
apply.
