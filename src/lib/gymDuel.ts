import "server-only";
import { prisma } from "@/lib/prisma";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { sendChallengedEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";
import type { Gym, GymChallenge } from "@prisma/client";

// Fire-and-forget by design, matching email.ts/push.ts -- a challenge should
// never fail to start because a notification couldn't be delivered.
async function notifyChallenged(
  defenderId: string,
  challengerName: string,
  muscleTypeLabel: string,
  gymName: string | null
): Promise<void> {
  const defender = await prisma.user.findUnique({ where: { id: defenderId }, select: { email: true, name: true } });
  if (!defender) return;
  const where = gymName ? ` for ${gymName}` : "";
  await Promise.all([
    sendChallengedEmail(defender.email, defender.name, challengerName, muscleTypeLabel, gymName),
    sendPushToUser(defenderId, {
      title: "You've been challenged!",
      body: `${challengerName} challenged you to a ${muscleTypeLabel} duel${where}.`,
      url: "/battle",
    }),
  ]);
}

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
// battle page). Ties go to the defender. A challenger win on a THRONE duel
// hands the gym over; FREEFORM duels never touch the gym's champion --
// they're just two members settling a score.
export async function resolveIfExpired(challenge: GymChallenge): Promise<GymChallenge> {
  if (challenge.status !== "OPEN" || challenge.windowEnd > new Date()) return challenge;

  const { challengerScore, defenderScore } = await liveScores(challenge);
  const winnerId = challengerScore > defenderScore ? challenge.challengerId : challenge.defenderId;

  const resolved = await prisma.gymChallenge.update({
    where: { id: challenge.id },
    data: { status: "RESOLVED", winnerId, resolvedAt: new Date() },
  });

  if (challenge.kind === "THRONE" && challenge.gymId && winnerId === challenge.challengerId) {
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
  const [defenderMonster, challenger] = await Promise.all([
    prisma.monSTAR.findUniqueOrThrow({
      where: { userId_muscleType: { userId: gym.championUserId, muscleType } },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
  ]);

  const windowStart = new Date();
  const windowEnd = new Date(windowStart.getTime() + CHALLENGE_WINDOW_MS);
  await prisma.gymChallenge.create({
    data: {
      gymId: gym.id,
      kind: "THRONE",
      muscleType,
      challengerId: userId,
      defenderId: gym.championUserId,
      challengerStartXp: myMonster.xp,
      defenderStartXp: defenderMonster.xp,
      windowStart,
      windowEnd,
    },
  });

  await notifyChallenged(gym.championUserId, challenger.name, MUSCLE_TYPE_META[muscleType].label, gym.name);

  return {
    status: "challenge-started",
    message: `Duel started at ${gym.name}! 48 hours of ${MUSCLE_TYPE_META[muscleType].label} training decides it.`,
    gymId: gym.id,
  };
}

export interface TrainerSearchResult {
  userId: string;
  name: string;
}

// Name/email search for freeform duel opponents -- no gym or location
// involved, so there's no roster to pick from otherwise. Email is only used
// to match, never returned -- results show name alone.
export async function searchTrainers(query: string, excludeUserId: string): Promise<TrainerSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const users = await prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }],
    },
    select: { id: true, name: true },
    take: 8,
  });
  return users.map((u) => ({ userId: u.id, name: u.name ?? "Unknown" }));
}

// The only muscle types a duel between these two could actually be fought
// over -- both sides need their own monSTAR of that type to have XP to score.
export async function sharedMuscleTypes(userId: string, otherUserId: string): Promise<MuscleType[]> {
  const [mine, theirs] = await Promise.all([
    prisma.monSTAR.findMany({ where: { userId }, select: { muscleType: true } }),
    prisma.monSTAR.findMany({ where: { userId: otherUserId }, select: { muscleType: true } }),
  ]);
  const theirTypes = new Set(theirs.map((m) => m.muscleType as MuscleType));
  return mine.map((m) => m.muscleType as MuscleType).filter((t) => theirTypes.has(t));
}

export interface FreeformDuelResult {
  message: string;
}

// Open PvP between any two trainers -- no gym, no throne, just whoever
// out-trains the other for that muscle type over 48 hours.
export async function startFreeformDuel(
  challengerId: string,
  opponentId: string,
  muscleType: MuscleType
): Promise<FreeformDuelResult> {
  if (challengerId === opponentId) {
    throw new Error("You can't duel yourself.");
  }

  const existingOpen = await prisma.gymChallenge.findFirst({
    where: {
      kind: "FREEFORM",
      status: "OPEN",
      OR: [
        { challengerId, defenderId: opponentId },
        { challengerId: opponentId, defenderId: challengerId },
      ],
    },
  });
  if (existingOpen) {
    throw new Error("You already have a duel in progress with that trainer.");
  }

  const [myMonster, theirMonster, opponent, challenger] = await Promise.all([
    prisma.monSTAR.findUnique({ where: { userId_muscleType: { userId: challengerId, muscleType } } }),
    prisma.monSTAR.findUnique({ where: { userId_muscleType: { userId: opponentId, muscleType } } }),
    prisma.user.findUniqueOrThrow({ where: { id: opponentId }, select: { name: true } }),
    prisma.user.findUniqueOrThrow({ where: { id: challengerId }, select: { name: true } }),
  ]);
  if (!myMonster || !theirMonster) {
    throw new Error(`Both of you need a ${MUSCLE_TYPE_META[muscleType].label} monSTAR to duel over it.`);
  }

  const windowStart = new Date();
  const windowEnd = new Date(windowStart.getTime() + CHALLENGE_WINDOW_MS);
  await prisma.gymChallenge.create({
    data: {
      kind: "FREEFORM",
      muscleType,
      challengerId,
      defenderId: opponentId,
      challengerStartXp: myMonster.xp,
      defenderStartXp: theirMonster.xp,
      windowStart,
      windowEnd,
    },
  });

  await notifyChallenged(opponentId, challenger.name, MUSCLE_TYPE_META[muscleType].label, null);

  return {
    message: `Duel started with ${opponent.name}! 48 hours of ${MUSCLE_TYPE_META[muscleType].label} training decides it.`,
  };
}

export interface MyDuelDisplay {
  id: string;
  muscleTypeLabel: string;
  opponentName: string;
  isChallenger: boolean;
  myScore: number;
  opponentScore: number;
  msRemaining: number;
  status: "OPEN" | "RESOLVED";
  won: boolean | null;
}

// The viewer's own freeform duels -- open ones plus recent results, newest
// first, since these no longer live on any single gym's card.
export async function listMyDuels(userId: string): Promise<MyDuelDisplay[]> {
  const raw = await prisma.gymChallenge.findMany({
    where: { kind: "FREEFORM", OR: [{ challengerId: userId }, { defenderId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const resolved = await Promise.all(raw.map((c) => resolveIfExpired(c)));

  const results: MyDuelDisplay[] = [];
  for (const c of resolved) {
    const isChallenger = c.challengerId === userId;
    const opponentId = isChallenger ? c.defenderId : c.challengerId;
    const [opponent, scores] = await Promise.all([
      prisma.user.findUnique({ where: { id: opponentId }, select: { name: true } }),
      liveScores(c),
    ]);
    results.push({
      id: c.id,
      muscleTypeLabel: MUSCLE_TYPE_META[c.muscleType as MuscleType].label,
      opponentName: opponent?.name ?? "Unknown",
      isChallenger,
      myScore: isChallenger ? scores.challengerScore : scores.defenderScore,
      opponentScore: isChallenger ? scores.defenderScore : scores.challengerScore,
      msRemaining: scores.msRemaining,
      status: c.status,
      won: c.winnerId ? c.winnerId === userId : null,
    });
  }
  return results;
}
