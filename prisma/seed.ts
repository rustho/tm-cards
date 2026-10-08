import { PrismaClient } from "@prisma/client";
import { INTERESTS, LOCATIONS, MEETING_FORMATS, VALUES } from "../models/types";

/**
 * Idempotent reference-data seed: tags and locations from the option lists
 * the wizard uses today. Run with `pnpm db:seed` (also wired to `prisma db seed`).
 */
const prisma = new PrismaClient();

async function main() {
  const tagRows = [
    ...INTERESTS.map((label, i) => ({ category: "interest", label, sortOrder: i })),
    ...VALUES.map((label, i) => ({ category: "value", label, sortOrder: i })),
    ...MEETING_FORMATS.map((label, i) => ({ category: "format", label, sortOrder: i })),
  ];
  for (const row of tagRows) {
    await prisma.tag.upsert({
      where: { category_label: { category: row.category, label: row.label } },
      update: { sortOrder: row.sortOrder, isActive: true },
      create: row,
    });
  }

  // Traits were replaced by values and hobbies merged into interests; keep old rows, hide them.
  await prisma.tag.updateMany({ where: { category: { in: ["trait", "hobby"] } }, data: { isActive: false } });
  await prisma.tag.updateMany({
    where: { category: "interest", label: { notIn: [...INTERESTS] } },
    data: { isActive: false },
  });

  for (let order = 0; order < LOCATIONS.length; order++) {
    const { country, region, available } = LOCATIONS[order];
    await prisma.location.upsert({
      where: { country_region: { country, region } },
      update: { sortOrder: order, isActive: available },
      create: { country, region, sortOrder: order, isActive: available },
    });
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
