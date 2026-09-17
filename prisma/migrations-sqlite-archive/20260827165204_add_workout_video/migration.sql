-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN "videoFilename" TEXT;
ALTER TABLE "WorkoutLog" ADD COLUMN "videoMimeType" TEXT;
ALTER TABLE "WorkoutLog" ADD COLUMN "videoVerifiedAt" DATETIME;
