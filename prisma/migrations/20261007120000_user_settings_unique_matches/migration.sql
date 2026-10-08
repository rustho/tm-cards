-- Remove duplicate pairs before adding the unique constraint (keep the oldest row)
DELETE FROM "MatchResult" a
USING "MatchResult" b
WHERE a."user1Id" = b."user1Id"
  AND a."user2Id" = b."user2Id"
  AND a."createdAt" > b."createdAt";

-- DropIndex
DROP INDEX IF EXISTS "MatchResult_user1Id_user2Id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "MatchResult_user1Id_user2Id_key" ON "MatchResult"("user1Id", "user2Id");

-- CreateTable
CREATE TABLE "UserSettings" (
    "telegramId" TEXT NOT NULL,
    "notifyNewMatches" BOOLEAN NOT NULL DEFAULT true,
    "notifyMessages" BOOLEAN NOT NULL DEFAULT true,
    "notifyProfileViews" BOOLEAN NOT NULL DEFAULT false,
    "notifyGameInvites" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "matchingOption" TEXT NOT NULL DEFAULT 'active',
    "matchingCustomDate" TIMESTAMP(3),
    "matchingResumeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("telegramId")
);

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "MatchingUser"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;
