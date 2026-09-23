-- Supabase exposes every table in the `public` schema over its PostgREST
-- API using the project's anon/authenticated keys -- that API is gated only
-- by Row Level Security, and RLS was off on every table here. With no
-- policies at all, this app was fully readable/writable by anyone who had
-- (or guessed) the project's anon key, completely bypassing the app itself.
--
-- Enabling RLS with zero policies makes every table default-deny for the
-- `anon` and `authenticated` Postgres roles PostgREST uses. This app never
-- uses those roles -- Prisma connects directly as `postgres`, which OWNS
-- every one of these tables, and table owners bypass RLS automatically
-- (we are NOT using FORCE ROW LEVEL SECURITY, which would change that).
-- So this closes the public hole with zero effect on the app itself.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coach" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MonSTAR" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TrainingProgram" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuthToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomExercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Gym" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GymChallenge" ENABLE ROW LEVEL SECURITY;
