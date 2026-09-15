"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { signOut } from "@/lib/auth";
import { deleteWorkoutProof as deleteProofFile } from "@/lib/proofStorage";
import { sendAccountDeletedEmail, sendVerificationEmail } from "@/lib/email";
import { createAuthToken } from "@/lib/authTokens";

// Self-service version of adminDeleteUser (src/app/(app)/admin/actions.ts) --
// operates on the caller's own account (from the session, never a
// client-supplied id) rather than an arbitrary target, so there's no need
// for the "can't delete your own account" guard that exists on the admin
// tool -- deleting your own account here is exactly the intended action.
export async function deleteMyAccount(): Promise<void> {
  const userId = await getUserId();

  const [logs, user] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId, videoFilename: { not: null } },
      select: { videoFilename: true },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, name: true } }),
  ]);
  for (const log of logs) {
    if (log.videoFilename) await deleteProofFile(log.videoFilename);
  }

  await prisma.user.delete({ where: { id: userId } });
  await sendAccountDeletedEmail(user.email, user.name);

  await signOut({ redirectTo: "/login" });
}

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function resendVerificationEmail(): Promise<void> {
  const userId = await getUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.emailVerified) return;

  const token = await createAuthToken(userId, "EMAIL_VERIFY");
  await sendVerificationEmail(user.email, user.name, `${APP_URL}/verify-email?token=${token}`);
}
