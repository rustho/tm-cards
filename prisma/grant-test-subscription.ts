import { PrismaClient } from "@prisma/client";

/**
 * Testing only: gives users an active subscription on a hidden `test` plan (no payment row).
 *
 *   pnpm db:test-subscription                       # list users with their access
 *   pnpm db:test-subscription <telegramId> [...]    # grant 4 weeks
 *   pnpm db:test-subscription <telegramId> --weeks=8
 *   pnpm db:test-subscription <telegramId> --revoke # cancel active subscriptions
 */
const prisma = new PrismaClient();
const args = process.argv.slice(2);
const revoke = args.includes("--revoke");
const weeks = Number(args.find((a) => a.startsWith("--weeks="))?.split("=")[1] ?? 4);
const telegramIds = args.filter((a) => !a.startsWith("--"));

async function listUsers() {
  const now = new Date();
  const users = await prisma.user.findMany({
    include: {
      profile: { select: { name: true, isComplete: true, location: true } },
      settings: { select: { matchingOption: true, skipNextRound: true } },
      subscriptions: { where: { status: "active", endsAt: { gt: now } }, orderBy: { endsAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
  });
  for (const u of users) {
    const sub = u.subscriptions[0];
    console.log(
      `👤 ${u.telegramId} ${u.profile?.name ?? "—"} | complete=${u.profile?.isComplete ?? false}` +
        ` | location=${u.profile?.location ? `${u.profile.location.country}/${u.profile.location.region}` : "—"}` +
        ` | matching=${u.settings?.matchingOption ?? "active"}${u.settings?.skipNextRound ? " (skip)" : ""}` +
        ` | created=${u.createdAt.toISOString().slice(0, 10)}` +
        ` | subscription=${sub ? `until ${sub.endsAt.toISOString().slice(0, 10)}` : "—"}`
    );
  }
}

async function main() {
  if (telegramIds.length === 0) return listUsers();

  const plan = await prisma.plan.upsert({
    where: { code: "test" },
    update: {},
    create: { code: "test", title: "Test (manual)", priceStars: 0, periodWeeks: 4, isActive: false },
  });

  for (const telegramId of telegramIds) {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      console.log(`⚠️ ${telegramId}: no such user`);
      continue;
    }
    if (revoke) {
      const { count } = await prisma.subscription.updateMany({
        where: { userId: user.id, status: "active" },
        data: { status: "cancelled" },
      });
      console.log(`🗑️ ${telegramId}: ${count} subscription(s) cancelled`);
      continue;
    }
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    await prisma.subscription.create({ data: { userId: user.id, planId: plan.id, startedAt, weeks, endsAt } });
    console.log(`✅ ${telegramId}: subscription until ${endsAt.toISOString().slice(0, 10)}`);
  }
}

main()
  .catch((error) => {
    console.error("❌", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
