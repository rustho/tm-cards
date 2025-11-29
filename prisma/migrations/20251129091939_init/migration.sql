-- CreateTable
CREATE TABLE "MatchingUser" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "age" INTEGER,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "country" TEXT,
    "region" TEXT,
    "interests" TEXT[],
    "hobbies" TEXT[],
    "personalityTraits" TEXT[],
    "placesToVisit" TEXT[],
    "instagram" TEXT,
    "photo" TEXT,
    "announcement" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastMatchTime" TIMESTAMP(3),
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "previousMatches" TEXT[],
    "skip" BOOLEAN NOT NULL DEFAULT false,
    "preferredAgeMin" INTEGER NOT NULL DEFAULT 18,
    "preferredAgeMax" INTEGER NOT NULL DEFAULT 65,
    "preferredGender" TEXT NOT NULL DEFAULT 'any',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchingUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "compatibilityScore" DOUBLE PRECISION NOT NULL,
    "matchingFactors" JSONB NOT NULL,
    "matchingRound" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "chatId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "command" TEXT,
    "message" TEXT,
    "notificationType" TEXT,
    "notificationData" JSONB,
    "miniAppOpened" BOOLEAN NOT NULL DEFAULT false,
    "buttonClicked" TEXT,
    "error" TEXT,
    "errorStack" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "responseTime" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BotLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchingUser_telegramId_key" ON "MatchingUser"("telegramId");

-- CreateIndex
CREATE INDEX "MatchResult_user1Id_user2Id_idx" ON "MatchResult"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "MatchResult_status_createdAt_idx" ON "MatchResult"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MatchResult_expiresAt_idx" ON "MatchResult"("expiresAt");

-- CreateIndex
CREATE INDEX "BotLog_userId_timestamp_idx" ON "BotLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "BotLog_type_timestamp_idx" ON "BotLog"("type", "timestamp");

-- CreateIndex
CREATE INDEX "BotLog_notificationType_timestamp_idx" ON "BotLog"("notificationType", "timestamp");

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "MatchingUser"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "MatchingUser"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
