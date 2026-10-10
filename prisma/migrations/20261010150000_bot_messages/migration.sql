-- CreateTable
CREATE TABLE "bot_messages" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "sentBy" TEXT,
    "broadcastId" TEXT,
    "telegramMessageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bot_messages_telegramId_createdAt_idx" ON "bot_messages"("telegramId", "createdAt");

