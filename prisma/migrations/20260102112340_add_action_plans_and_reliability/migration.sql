-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "tribeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sharedWith" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActionPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ActionPlan_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tribe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "topic" TEXT,
    "meetingTime" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "reliabilityRate" REAL NOT NULL DEFAULT 0,
    "matchmakingCriteria" TEXT,
    "affiliateCommission" REAL NOT NULL DEFAULT 0,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tribe_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tribe" ("affiliateCommission", "createdAt", "creatorId", "id", "matchmakingCriteria", "maxMembers", "meetingTime", "name", "topic", "updatedAt") SELECT "affiliateCommission", "createdAt", "creatorId", "id", "matchmakingCriteria", "maxMembers", "meetingTime", "name", "topic", "updatedAt" FROM "Tribe";
DROP TABLE "Tribe";
ALTER TABLE "new_Tribe" RENAME TO "Tribe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
