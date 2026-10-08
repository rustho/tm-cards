import { PrismaClient } from "@prisma/client";
import { HOBBIES, INTERESTS, LOCATIONS, PERSONALITY_TRAITS } from "../models/types";

/**
 * Idempotent reference-data seed: tags and locations from the option lists
 * the wizard uses today. Run with `pnpm db:seed` (also wired to `prisma db seed`).
 */
const prisma = new PrismaClient();

async function main() {
  const tagRows = [
    ...INTERESTS.map((label, i) => ({ category: "interest", label, sortOrder: i })),
    ...HOBBIES.map((label, i) => ({ category: "hobby", label, sortOrder: i })),
    ...PERSONALITY_TRAITS.map((label, i) => ({ category: "trait", label, sortOrder: i })),
  ];
  for (const row of tagRows) {
    await prisma.tag.upsert({
      where: { category_label: { category: row.category, label: row.label } },
      update: { sortOrder: row.sortOrder, isActive: true },
      create: row,
    });
  }

  let order = 0;
  for (const { country, regions } of LOCATIONS) {
    for (const region of regions) {
      await prisma.location.upsert({
        where: { country_region: { country, region } },
        update: { sortOrder: order, isActive: true },
        create: { country, region, sortOrder: order },
      });
      order++;
    }
  }

  const [tags, locations] = await Promise.all([prisma.tag.count(), prisma.location.count()]);
  console.log(`✅ Seeded reference data: ${tags} tags, ${locations} locations`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
