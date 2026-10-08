-- AlterTable
ALTER TABLE "match_feedback" ADD COLUMN "impressions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "reason" TEXT;
