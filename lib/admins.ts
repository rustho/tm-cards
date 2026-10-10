/**
 * Admin Telegram ids from ADMIN_TELEGRAM_IDS (comma or space separated). Server only:
 * the client learns whether it is an admin from GET /api/me.
 */
let cached: { raw: string; ids: Set<number> } | undefined;

export function adminIds(): Set<number> {
  const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
  if (cached?.raw !== raw) {
    const ids = raw
      .split(/[\s,]+/)
      .map((id) => Number(id))
      .filter((id) => Number.isSafeInteger(id) && id > 0);
    cached = { raw, ids: new Set(ids) };
  }
  return cached.ids;
}

export function isAdminId(telegramId: number | string): boolean {
  return adminIds().has(Number(telegramId));
}
