-- CreateTable
CREATE TABLE "DuelTrophy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleType" "MuscleType" NOT NULL,
    "kind" "GymChallengeKind" NOT NULL,
    "opponentName" TEXT NOT NULL,
    "wonAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "DuelTrophy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DuelTrophy_userId_idx" ON "DuelTrophy"("userId");

-- AddForeignKey
ALTER TABLE "DuelTrophy" ADD CONSTRAINT "DuelTrophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New tables don't inherit RLS from existing ones -- lock this one down the
-- same way the rest of the schema was (see the enable_row_level_security
-- migration). No policies needed: Prisma connects as the table owner and
-- bypasses RLS automatically; this only blocks Supabase's public REST API.
ALTER TABLE "DuelTrophy" ENABLE ROW LEVEL SECURITY;
