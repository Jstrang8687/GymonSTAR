-- CreateEnum
CREATE TYPE "GymChallengeStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "Gym" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "championUserId" TEXT,
    "championMuscleType" "MuscleType",
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymChallenge" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "muscleType" "MuscleType" NOT NULL,
    "challengerId" TEXT NOT NULL,
    "defenderId" TEXT NOT NULL,
    "challengerStartXp" INTEGER NOT NULL,
    "defenderStartXp" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "status" "GymChallengeStatus" NOT NULL DEFAULT 'OPEN',
    "winnerId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GymChallenge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GymChallenge" ADD CONSTRAINT "GymChallenge_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
