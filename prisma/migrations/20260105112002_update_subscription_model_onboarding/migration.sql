-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'SOFT_FREE',
    "maxGoals" INTEGER NOT NULL DEFAULT 1,
    "trialStartDate" DATETIME,
    "trialEndDate" DATETIME,
    "trialDiscountUsed" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "experience", "graceEndDate", "graceStartDate", "grit", "id", "level", "lifeVision", "manualRank", "name", "netRevenue", "password", "platformFees", "profileCompleteness", "projectROI", "reputationScore", "sessionsAttended", "skills", "stripeCustomerId", "stripeSubscriptionId", "subscriptionEndDate", "subscriptionPlan", "subscriptionStartDate", "subscriptionStatus", "taskCompletionRate", "totalCommissions", "totalReliability", "totalRevenue", "totalSponsorship", "trialEndDate", "trialStartDate", "updatedAt", "userProfile", "username") SELECT "avatarUrl", "bio", "createdAt", "email", "experience", "graceEndDate", "graceStartDate", "grit", "id", "level", "lifeVision", "manualRank", "name", "netRevenue", "password", "platformFees", "profileCompleteness", "projectROI", "reputationScore", "sessionsAttended", "skills", "stripeCustomerId", "stripeSubscriptionId", "subscriptionEndDate", coalesce("subscriptionPlan", 'SOFT_FREE') AS "subscriptionPlan", "subscriptionStartDate", "subscriptionStatus", "taskCompletionRate", "totalCommissions", "totalReliability", "totalRevenue", "totalSponsorship", "trialEndDate", "trialStartDate", "updatedAt", "userProfile", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
