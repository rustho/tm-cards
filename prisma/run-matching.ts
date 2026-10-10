import MatchingService from "../lib/matchingService";
import prisma from "../lib/prisma";

/**
 * Runs the weekly matching locally against DATABASE_URL — same as GET /api/cron/matching.
 * Notifications go out only with MATCHING_NOTIFICATIONS=true and TELEGRAM_BOT_TOKEN set.
 *
 *   pnpm matching:run
 */
async function main() {
  const service = MatchingService.getInstance();
  const expired = await service.cleanupExpiredMatches();
  const run = await service.runMatching();
  console.log(JSON.stringify({ expired, ...run }, null, 2));
  if (run.eligibleUsers < 2) {
    console.log("ℹ️ Fewer than 2 candidates: check `pnpm db:test-subscription` (profile complete, location, pause, cooldown 24h, access).");
  }
}

main()
  .catch((error) => {
    console.error("❌", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
