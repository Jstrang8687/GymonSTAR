import "server-only";
import { prisma } from "@/lib/prisma";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import type { Gym, GymChallenge } from "@prisma/client";

// Anything checked in within this radius of an existing gym snaps to it
// instead of creating a duplicate -- a one-time GPS grab at check-in, not
// live tracking.
const NEARBY_METERS = 100;
const CHALLENGE_WINDOW_MS = 48 * 60 * 60 * 1000;

// Standard great-circle distance between two lat/lng points, in meters.
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function findNearbyGym(lat: number, lng: number): Promise<Gym | null> {
  const gyms = await prisma.gym.findMany();
  for (const gym of gyms) {
    if (distanceMeters(lat, lng, gym.latitude, gym.longitude) <= NEARBY_METERS) return gym;
  }
  return null;
}

// The monSTAR you'd defend a gym with, or need to already own to challenge
// one -- always your highest-XP monster, matching "current top muscle-type
// monSTAR becomes the defending fighter" from the design.
export async function topMonsterType(userId: string): Promise<MuscleType | null> {
  const top = await prisma.monSTAR.findFirst({ where: { userId }, orderBy: { xp: "desc" } });
  return (top?.muscleType as MuscleType) ?? null;
}

// Sums exactly the XP this user earned for this specific muscle type from
// real workout logs in the window -- xpBreakdown already records per-type
// credit precisely (see WorkoutLog.xpBreakdown), so this is a direct read,
// not a new XP currency.
async function earnedXpInWindow(
  userId: string,
  muscleType: MuscleType,
  windowStart: Date,
  windowEnd: Date
): Promise<number> {
  const logs = await prisma.workoutLog.findMany({
    where: { userId, createdAt: { gte: windowStart, lte: windowEnd } },
    select: { xpBreakdown: true },
  });
  let total = 0;
  for (const log of logs) {
    if (!log.xpBreakdown) continue;
    const breakdown = JSON.parse(log.xpBreakdown) as Record<string, { strengthXp: number; enduranceXp: number }>;
    const entry = breakdown[muscleType];
    if (entry) total += entry.strengthXp + entry.enduranceXp;
  }
  return total;
}

export interface ChallengeScores {
  challengerScore: number;
  defenderScore: number;
  msRemaining: number;
}

export async function liveScores(challenge: GymChallenge): Promise<ChallengeScores> {
  const now = new Date();
  const windowEnd = challenge.windowEnd < now ? challenge.windowEnd : now;
  const [challengerEarned, defenderEarned] = await Promise.all([
    earnedXpInWindow(challenge.challengerId, challenge.muscleType as MuscleType, challenge.windowStart, windowEnd),
    earnedXpInWindow(challenge.defenderId, challenge.muscleType as MuscleType, challenge.windowStart, windowEnd),
  ]);
  return {
    challengerScore: challenge.challengerStartXp + challengerEarned,
    defenderScore: challenge.defenderStartXp + defenderEarned,
    msRemaining: Math.max(0, challenge.windowEnd.getTime() - now.getTime()),
  };
}

// Lazily closes out a challenge whose window has passed -- there's no
// background job, so this runs whenever a challenge is read (gyms list,
// battle page). Ties go to the defender. A challenger win hands the gym
// over; the muscle type stays what it was fought over.
export async function resolveIfExpired(challenge: GymChallenge): Promise<GymChallenge> {
  if (challenge.status !== "OPEN" || challenge.windowEnd > new Date()) return challenge;

  const { challengerScore, defenderScore } = await liveScores(challenge);
  const winnerId = challengerScore > defenderScore ? challenge.challengerId : challenge.defenderId;

  const resolved = await prisma.gymChallenge.update({
    where: { id: challenge.id },
    data: { status: "RESOLVED", winnerId, resolvedAt: new Date() },
  });

  if (winnerId === challenge.challengerId) {
    await prisma.gym.update({
      where: { id: challenge.gymId },
      data: { championUserId: challenge.challengerId, claimedAt: new Date() },
    });
  }

  return resolved;
}

export interface CheckInResult {
  status: "claimed" | "already-champion" | "challenge-started" | "challenge-pending";
  message: string;
  gymId: string;
}

export async function checkInAtGym(userId: string, lat: number, lng: number, name: string): Promise<CheckInResult> {
  let gym = await findNearbyGym(lat, lng);

  if (!gym) {
    const myTopType = await topMonsterType(userId);
    if (!myTopType) {
      throw new Error("Log a workout and catch a monSTAR before you can claim a gym.");
    }
    gym = await prisma.gym.create({
      data: {
        name: name.trim() || "Unnamed Gym",
        latitude: lat,
        longitude: lng,
        championUserId: userId,
        championMuscleType: myTopType,
        claimedAt: new Date(),
      },
    });
    return { status: "claimed", message: `You claimed ${gym.name}!`, gymId: gym.id };
  }

  if (!gym.championUserId) {
    const myTopType = await topMonsterType(userId);
    if (!myTopType) {
      throw new Error("Log a workout and catch a monSTAR before you can claim a gym.");
    }
    gym = await prisma.gym.update({
      where: { id: gym.id },
      data: { championUserId: userId, championMuscleType: myTopType, claimedAt: new Date() },
    });
    return { status: "claimed", message: `You claimed ${gym.name}!`, gymId: gym.id };
  }

  if (gym.championUserId === userId) {
    return { status: "already-champion", message: `You already hold ${gym.name}.`, gymId: gym.id };
  }

  const existingOpen = await prisma.gymChallenge.findFirst({ where: { gymId: gym.id, status: "OPEN" } });
  if (existingOpen) {
    return {
      status: "challenge-pending",
      message: `${gym.name} already has a duel in progress -- check back once it resolves.`,
      gymId: gym.id,
    };
  }

  const muscleType = gym.championMuscleType as MuscleType;
  const myMonster = await prisma.monSTAR.findUnique({
    where: { userId_muscleType: { userId, muscleType } },
  });
  if (!myMonster) {
    throw new Error(
      `${gym.name} is defended with a ${MUSCLE_TYPE_META[muscleType].label} monSTAR. Catch one of your own before you can challenge it.`
    );
  }
  const defenderMonster = await prisma.monSTAR.findUniqueOrThrow({
    where: { userId_muscleType: { userId: gym.championUserId, muscleType } },
  });

  const windowStart = new Date();
  const windowEnd = new Date(windowStart.getTime() + CHALLENGE_WINDOW_MS);
  await prisma.gymChallenge.create({
    data: {
      gymId: gym.id,
      muscleType,
      challengerId: userId,
      defenderId: gym.championUserId,
      challengerStartXp: myMonster.xp,
      defenderStartXp: defenderMonster.xp,
      windowStart,
      windowEnd,
    },
  });

  return {
    status: "challenge-started",
    message: `Duel started at ${gym.name}! 48 hours of ${MUSCLE_TYPE_META[muscleType].label} training decides it.`,
    gymId: gym.id,
  };
}
