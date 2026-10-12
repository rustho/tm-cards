-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "publishedAt" TIMESTAMP(3);


-- Every pair made before drafts existed was shown to users right away
UPDATE "matches" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
