-- CreateEnum
CREATE TYPE "GymChallengeKind" AS ENUM ('THRONE', 'FREEFORM');

-- AlterTable
ALTER TABLE "GymChallenge" ADD COLUMN     "kind" "GymChallengeKind" NOT NULL DEFAULT 'THRONE',
ALTER COLUMN "gymId" DROP NOT NULL;
