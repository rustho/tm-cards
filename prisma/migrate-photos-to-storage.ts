import { PrismaClient } from "@prisma/client";
import { deleteProfilePhoto, ensurePhotoBucket, uploadProfilePhoto } from "../lib/photoStorage";

/**
 * One-off: moves base64 data URLs from `profiles.photo` into Supabase Storage
 * and replaces them with the public URL. Creates the bucket if needed.
 * Idempotent (only rows still starting with `data:` are touched).
 *
 *   pnpm db:migrate-photos            # migrate
 *   pnpm db:migrate-photos --dry-run  # only count
 */
const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const rows = await prisma.profile.findMany({
    where: { photo: { startsWith: "data:" } },
    select: { userId: true },
  });
  console.log(`🖼️ ${rows.length} profiles with a base64 photo${dryRun ? " (dry run)" : ""}`);
  if (dryRun || rows.length === 0) return;

  await ensurePhotoBucket();

  let migrated = 0;
  let failed = 0;
  // One row at a time: each photo is up to 2 MB, no need to hold them all in memory.
  for (const { userId } of rows) {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { photo: true } });
    const dataUrl = profile?.photo;
    if (!dataUrl?.startsWith("data:")) continue;
    let uploaded: string | null = null;
    try {
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      uploaded = await uploadProfilePhoto(userId, new Uint8Array(Buffer.from(base64, "base64")));
      // Only replace if the row was not changed meanwhile.
      const { count } = await prisma.profile.updateMany({ where: { userId, photo: dataUrl }, data: { photo: uploaded } });
      if (count === 0) {
        await deleteProfilePhoto(uploaded);
        console.log(`⏭️ ${userId}: photo changed during migration, skipped`);
        continue;
      }
      migrated++;
    } catch (error) {
      failed++;
      if (uploaded) await deleteProfilePhoto(uploaded);
      console.error(`❌ ${userId}:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`✅ Migrated ${migrated} photos, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("❌ Photo migration failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
