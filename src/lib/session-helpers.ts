import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeLoginXp, nextStreak, todayStr, xpForLevel } from "@/lib/game";

export const getUserId = cache(async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
});

// Ensures a UserProfile row exists, applies the daily login-streak bonus at
// most once per calendar day, and returns the (possibly updated) profile.
// Wrapped in React's cache() so repeated calls within one request/render
// pass (layout + page) hit the DB only once.
export const getProfile = cache(async () => {
  const userId = await getUserId();

  let profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { coach: true },
  });

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId },
      include: { coach: true },
    });
  }

  const today = todayStr();
  if (profile.lastLoginDate !== today) {
    const streak = nextStreak(profile.lastLoginDate, today, profile.loginStreak);
    const loginXp = computeLoginXp(streak);
    let trainerXp = profile.trainerXp + loginXp;
    let trainerLevel = profile.trainerLevel;
    while (trainerXp >= xpForLevel(trainerLevel)) {
      trainerXp -= xpForLevel(trainerLevel);
      trainerLevel += 1;
    }

    profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        lastLoginDate: today,
        loginStreak: streak,
        trainerXp,
        trainerLevel,
      },
      include: { coach: true },
    });
  }

  return profile;
});

export async function requireOnboarded() {
  const profile = await getProfile();
  if (!profile.onboarded) redirect("/onboarding");
  return profile;
}
