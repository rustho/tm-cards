import { PrismaClient } from "@prisma/client";

/**
 * One-off cleanup after the onboarding redesign (2026-10-08): personality
 * traits were replaced by values and hobbies merged into interests. Removes
 * profile links to every inactive tag, then the legacy `trait` and `hobby`
 * tag rows themselves. Idempotent. Run with `pnpm db:cleanup-tags`.
 * Irreversible: back up first if the data matters.
 */
const prisma = new PrismaClient();

async function main() {
  const links = await prisma.profileTag.deleteMany({ where: { tag: { isActive: false } } });
  const tags = await prisma.tag.deleteMany({ where: { category: { in: ["trait", "hobby"] } } });
  console.log(`🧹 Removed ${links.count} links to inactive tags and ${tags.count} trait/hobby tags`);
}

main()
  .catch((error) => {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
