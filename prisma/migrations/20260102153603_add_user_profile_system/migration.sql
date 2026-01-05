-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "cancelledAt" DATETIME,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "tribeId" TEXT,
    "platformFee" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badges_Catalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "description" TEXT,
    "criteriaLogic" TEXT,
    "reputationValue" REAL NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "requiredForProfile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Badges_Catalog" ("createdAt", "criteriaLogic", "description", "iconName", "id", "name", "type") SELECT "createdAt", "criteriaLogic", "description", "iconName", "id", "name", "type" FROM "Badges_Catalog";
DROP TABLE "Badges_Catalog";
ALTER TABLE "new_Badges_Catalog" RENAME TO "Badges_Catalog";
CREATE UNIQUE INDEX "Badges_Catalog_name_key" ON "Badges_Catalog"("name");
CREATE TABLE "new_Tribe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "topic" TEXT,
    "meetingTime" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "reliabilityRate" REAL NOT NULL DEFAULT 0,
    "matchmakingCriteria" TEXT,
    "affiliateCommission" REAL NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "platformFees" REAL NOT NULL DEFAULT 0,
    "creatorRevenue" REAL NOT NULL DEFAULT 0,
    "requiresSubscription" BOOLEAN NOT NULL DEFAULT true,
    "minReputationScore" REAL,
    "minBadgeCount" INTEGER,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tribe_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tribe" ("affiliateCommission", "createdAt", "creatorId", "id", "matchmakingCriteria", "maxMembers", "meetingTime", "name", "reliabilityRate", "topic", "updatedAt") SELECT "affiliateCommission", "createdAt", "creatorId", "id", "matchmakingCriteria", "maxMembers", "meetingTime", "name", "reliabilityRate", "topic", "updatedAt" FROM "Tribe";
DROP TABLE "Tribe";
ALTER TABLE "new_Tribe" RENAME TO "Tribe";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "name" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "totalReliability" REAL NOT NULL DEFAULT 0,
    "grit" INTEGER NOT NULL DEFAULT 0,
    "sessionsAttended" INTEGER NOT NULL DEFAULT 0,
    "taskCompletionRate" REAL NOT NULL DEFAULT 0,
    "totalSponsorship" REAL NOT NULL DEFAULT 0,
    "manualRank" TEXT,
    "projectROI" REAL,
    "skills" TEXT,
    "lifeVision" TEXT,
    "totalCommissions" REAL NOT NULL DEFAULT 0,
    "userProfile" TEXT NOT NULL DEFAULT 'SOFT',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscriptionPlan" TEXT,
    "trialStartDate" DATETIME,
    "trialEndDate" DATETIME,
    "graceStartDate" DATETIME,
    "graceEndDate" DATETIME,
    "subscriptionStartDate" DATETIME,
    "subscriptionEndDate" DATETIME,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "platformFees" REAL NOT NULL DEFAULT 0,
    "netRevenue" REAL NOT NULL DEFAULT 0,
    "reputationScore" REAL NOT NULL DEFAULT 0,
    "profileCompleteness" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "experience", "grit", "id", "level", "lifeVision", "manualRank", "name", "password", "projectROI", "sessionsAttended", "skills", "taskCompletionRate", "totalCommissions", "totalReliability", "totalSponsorship", "updatedAt", "username") SELECT "avatarUrl", "bio", "createdAt", "email", "experience", "grit", "id", "level", "lifeVision", "manualRank", "name", "password", "projectROI", "sessionsAttended", "skills", "taskCompletionRate", "totalCommissions", "totalReliability", "totalSponsorship", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");
