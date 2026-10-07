-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_telegramId_fkey";

-- DropForeignKey
ALTER TABLE "MatchResult" DROP CONSTRAINT "MatchResult_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "MatchResult" DROP CONSTRAINT "MatchResult_user2Id_fkey";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "languageCode" TEXT,
    "referralCode" TEXT NOT NULL,
    "referrerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastMatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "dateOfBirth" DATE,
    "gender" TEXT,
    "locationId" TEXT,
    "goal" TEXT,
    "about" TEXT,
    "announcement" TEXT,
    "placesToVisit" TEXT[],
    "photo" TEXT,
    "socials" JSONB,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_tags" (
    "profileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "profile_tags_pkey" PRIMARY KEY ("profileId","tagId")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "userId" TEXT NOT NULL,
    "notifyNewMatches" BOOLEAN NOT NULL DEFAULT true,
    "notifyMessages" BOOLEAN NOT NULL DEFAULT true,
    "notifyProfileViews" BOOLEAN NOT NULL DEFAULT false,
    "notifyGameInvites" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "matchingOption" TEXT NOT NULL DEFAULT 'active',
    "matchingCustomDate" TIMESTAMP(3),
    "matchingResumeDate" TIMESTAMP(3),
    "preferredAgeMin" INTEGER NOT NULL DEFAULT 18,
    "preferredAgeMax" INTEGER NOT NULL DEFAULT 65,
    "preferredGender" TEXT NOT NULL DEFAULT 'any',
    "skipNextRound" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "match_rounds" (
    "id" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_feedback" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "met" BOOLEAN NOT NULL,
    "rating" INTEGER,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priceStars" INTEGER NOT NULL,
    "periodWeeks" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "weeks" INTEGER NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amountStars" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XTR',
    "telegramChargeId" TEXT NOT NULL,
    "providerChargeId" TEXT,
    "payload" JSONB,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE INDEX "profiles_locationId_idx" ON "profiles"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "locations_country_region_key" ON "locations"("country", "region");

-- CreateIndex
CREATE INDEX "tags_category_idx" ON "tags"("category");

-- CreateIndex
CREATE UNIQUE INDEX "tags_category_label_key" ON "tags"("category", "label");

-- CreateIndex
CREATE INDEX "profile_tags_tagId_idx" ON "profile_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "match_rounds_weekStart_key" ON "match_rounds"("weekStart");

-- CreateIndex
CREATE INDEX "matches_user1Id_idx" ON "matches"("user1Id");

-- CreateIndex
CREATE INDEX "matches_user2Id_idx" ON "matches"("user2Id");

-- CreateIndex
CREATE INDEX "matches_status_expiresAt_idx" ON "matches"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "matches_roundId_user1Id_user2Id_key" ON "matches"("roundId", "user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "match_feedback_matchId_authorId_key" ON "match_feedback"("matchId", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_telegramChargeId_key" ON "payments"("telegramChargeId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_tags" ADD CONSTRAINT "profile_tags_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_tags" ADD CONSTRAINT "profile_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "match_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_feedback" ADD CONSTRAINT "match_feedback_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_feedback" ADD CONSTRAINT "match_feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Backfill from the legacy tables (MatchingUser, MatchResult, UserSettings)
-- ---------------------------------------------------------------------------

-- Users (referralCode is generated by Prisma on create; legacy rows get a random one here)
INSERT INTO "users" ("id", "telegramId", "username", "referralCode", "status", "lastMatchedAt", "createdAt", "updatedAt")
SELECT gen_random_uuid(), mu."telegramId", NULLIF(mu."username", ''),
       substr(md5(mu."telegramId" || random()::text), 1, 10),
       'active', mu."lastMatchTime", mu."createdAt", mu."updatedAt"
FROM "MatchingUser" mu;

-- Locations referenced by existing profiles
INSERT INTO "locations" ("id", "country", "region")
SELECT gen_random_uuid(), d."country", d."region"
FROM (
  SELECT DISTINCT "country", COALESCE("region", '') AS "region"
  FROM "MatchingUser"
  WHERE "country" IS NOT NULL AND btrim("country") <> ''
) d
ON CONFLICT DO NOTHING;

-- Profiles
INSERT INTO "profiles" ("userId", "name", "dateOfBirth", "gender", "locationId", "goal", "about", "announcement",
                        "placesToVisit", "photo", "socials", "theme", "isComplete", "createdAt", "updatedAt")
SELECT u."id",
       NULLIF(mu."name", ''),
       CASE
         WHEN mu."dateOfBirth" ~ '^\d{4}-\d{2}-\d{2}$' THEN to_date(mu."dateOfBirth", 'YYYY-MM-DD')
         WHEN mu."dateOfBirth" ~ '^\d{2}\.\d{2}\.\d{4}$' THEN to_date(mu."dateOfBirth", 'DD.MM.YYYY')
         ELSE NULL
       END,
       NULLIF(mu."gender", ''),
       l."id",
       NULLIF(mu."goal", ''),
       NULLIF(mu."profile", ''),
       NULLIF(mu."announcement", ''),
       COALESCE(mu."placesToVisit", '{}'),
       NULLIF(mu."photo", ''),
       CASE WHEN mu."instagram" IS NOT NULL AND btrim(mu."instagram") <> ''
            THEN jsonb_build_object('instagram', ltrim(btrim(mu."instagram"), '@'))
            ELSE NULL END,
       'default',
       mu."isActive",
       mu."createdAt", mu."updatedAt"
FROM "MatchingUser" mu
JOIN "users" u ON u."telegramId" = mu."telegramId"
LEFT JOIN "locations" l ON l."country" = mu."country" AND l."region" = COALESCE(mu."region", '');

-- Tags used by existing profiles (the seed adds the full reference lists)
INSERT INTO "tags" ("id", "category", "label")
SELECT gen_random_uuid(), t."category", t."label"
FROM (
  SELECT 'interest' AS "category", unnest("interests") AS "label" FROM "MatchingUser"
  UNION SELECT 'hobby', unnest("hobbies") FROM "MatchingUser"
  UNION SELECT 'trait', unnest("personalityTraits") FROM "MatchingUser"
) t
WHERE t."label" IS NOT NULL AND btrim(t."label") <> ''
ON CONFLICT DO NOTHING;

INSERT INTO "profile_tags" ("profileId", "tagId")
SELECT DISTINCT u."id", tg."id"
FROM (
  SELECT "telegramId", 'interest' AS "category", unnest("interests") AS "label" FROM "MatchingUser"
  UNION ALL SELECT "telegramId", 'hobby', unnest("hobbies") FROM "MatchingUser"
  UNION ALL SELECT "telegramId", 'trait', unnest("personalityTraits") FROM "MatchingUser"
) x
JOIN "users" u ON u."telegramId" = x."telegramId"
JOIN "tags" tg ON tg."category" = x."category" AND tg."label" = x."label"
ON CONFLICT DO NOTHING;

-- Settings: existing rows, then matching preferences that lived on MatchingUser
INSERT INTO "user_settings" ("userId", "notifyNewMatches", "notifyMessages", "notifyProfileViews", "notifyGameInvites",
                             "notifyWeeklyDigest", "matchingOption", "matchingCustomDate", "matchingResumeDate",
                             "createdAt", "updatedAt")
SELECT u."id", s."notifyNewMatches", s."notifyMessages", s."notifyProfileViews", s."notifyGameInvites",
       s."notifyWeeklyDigest", s."matchingOption", s."matchingCustomDate", s."matchingResumeDate",
       s."createdAt", s."updatedAt"
FROM "UserSettings" s
JOIN "users" u ON u."telegramId" = s."telegramId";

UPDATE "user_settings" us
SET "preferredAgeMin" = mu."preferredAgeMin",
    "preferredAgeMax" = mu."preferredAgeMax",
    "preferredGender" = mu."preferredGender",
    "skipNextRound"   = mu."skip"
FROM "users" u
JOIN "MatchingUser" mu ON mu."telegramId" = u."telegramId"
WHERE us."userId" = u."id";

INSERT INTO "user_settings" ("userId", "preferredAgeMin", "preferredAgeMax", "preferredGender", "skipNextRound", "updatedAt")
SELECT u."id", mu."preferredAgeMin", mu."preferredAgeMax", mu."preferredGender", mu."skip", now()
FROM "MatchingUser" mu
JOIN "users" u ON u."telegramId" = mu."telegramId"
WHERE NOT EXISTS (SELECT 1 FROM "user_settings" us WHERE us."userId" = u."id")
  AND (mu."preferredAgeMin" <> 18 OR mu."preferredAgeMax" <> 65 OR mu."preferredGender" <> 'any' OR mu."skip");

-- Rounds: one closed round per ISO week that has MatchResult rows
INSERT INTO "match_rounds" ("id", "weekStart", "status")
SELECT gen_random_uuid(), w."weekStart", 'closed'
FROM (SELECT DISTINCT date_trunc('week', "createdAt")::date AS "weekStart" FROM "MatchResult") w
ON CONFLICT DO NOTHING;

-- Matches from MatchResult (ids are kept). Legacy ids may carry a leading apostrophe.
INSERT INTO "matches" ("id", "roundId", "user1Id", "user2Id", "score", "factors", "status", "notifiedAt", "expiresAt", "createdAt")
SELECT mr."id", r."id",
       LEAST(u1."id", u2."id"), GREATEST(u1."id", u2."id"),
       mr."compatibilityScore", mr."matchingFactors",
       CASE mr."status" WHEN 'accepted' THEN 'met' WHEN 'declined' THEN 'not_met' WHEN 'expired' THEN 'expired' ELSE 'pending' END,
       CASE WHEN mr."notificationSent" THEN mr."createdAt" END,
       mr."expiresAt", mr."createdAt"
FROM "MatchResult" mr
JOIN "users" u1 ON u1."telegramId" = ltrim(mr."user1Id", '''')
JOIN "users" u2 ON u2."telegramId" = ltrim(mr."user2Id", '''')
JOIN "match_rounds" r ON r."weekStart" = date_trunc('week', mr."createdAt")::date
WHERE u1."id" <> u2."id"
ON CONFLICT DO NOTHING;

-- Pairs that exist only in MatchingUser.previousMatches (spreadsheet era) go into one legacy round
INSERT INTO "match_rounds" ("id", "weekStart", "status")
SELECT gen_random_uuid(), DATE '2024-12-30', 'closed'
WHERE EXISTS (SELECT 1 FROM "MatchingUser" WHERE cardinality("previousMatches") > 0)
ON CONFLICT DO NOTHING;

INSERT INTO "matches" ("id", "roundId", "user1Id", "user2Id", "score", "factors", "status", "notifiedAt", "expiresAt", "createdAt")
SELECT gen_random_uuid(), r."id",
       LEAST(u1."id", u2."id"), GREATEST(u1."id", u2."id"),
       0, '[]'::jsonb, 'expired', NULL,
       COALESCE(mu."lastMatchTime", mu."updatedAt"), COALESCE(mu."lastMatchTime", mu."createdAt")
FROM "MatchingUser" mu
CROSS JOIN LATERAL unnest(mu."previousMatches") AS p("tid")
JOIN "users" u1 ON u1."telegramId" = mu."telegramId"
JOIN "users" u2 ON u2."telegramId" = ltrim(p."tid", '''')
JOIN "match_rounds" r ON r."weekStart" = DATE '2024-12-30'
WHERE u1."id" <> u2."id"
  AND NOT EXISTS (
    SELECT 1 FROM "matches" m
    WHERE m."user1Id" = LEAST(u1."id", u2."id") AND m."user2Id" = GREATEST(u1."id", u2."id")
  )
ON CONFLICT DO NOTHING;

-- Drop the legacy round if nothing was imported into it
DELETE FROM "match_rounds" r
WHERE r."status" = 'closed'
  AND NOT EXISTS (SELECT 1 FROM "matches" m WHERE m."roundId" = r."id");

-- ---------------------------------------------------------------------------
-- Drop legacy tables
-- ---------------------------------------------------------------------------
DROP TABLE "MatchResult";
DROP TABLE "UserSettings";
DROP TABLE "MatchingUser";
