# AGENTS.md

Instructions for any AI coding agent (Claude Code, Codex, Cursor, etc.) live in
[`CLAUDE.md`](CLAUDE.md). Read it first. Detailed references are in
[`docs/`](docs/):

- `docs/CODEBASE_MAP.md` — directory and file map with status tags
- `docs/DATA_AND_API.md` — Prisma schema, auth, every API route
- `docs/DEV_WORKFLOW.md` — setup, run, DB, bot, verify, deploy
- `docs/CONVENTIONS.md` — code patterns to follow
- `docs/KNOWN_ISSUES.md` — tech debt

Non-negotiables:

1. Use **pnpm** (`pnpm install --frozen-lockfile`).
2. Verify with `pnpm typecheck`; `pnpm build` for routing/Prisma changes. There are no tests.
3. Do not run `next lint` unattended (no config, it prompts).
4. Never put secrets in `.env`; use `.env.local`.
5. Every API route authenticates through `lib/auth.ts`; every client call goes through `lib/api.ts`. Never trust a user id from the request body.
6. UI primitives come from `components/ui` (shadcn). Telegram UI is gone; do not reintroduce it.
7. Wizard steps use `useWizardContext()` and are registered in `app/profile/ui/wizardConfig.ts`.
