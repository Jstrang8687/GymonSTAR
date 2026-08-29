"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { signOut } from "@/lib/auth";
import { deleteWorkoutProof as deleteProofFile } from "@/lib/proofStorage";

// Self-service version of adminDeleteUser (src/app/(app)/admin/actions.ts) --
// operates on the caller's own account (from the session, never a
// client-supplied id) rather than an arbitrary target, so there's no need
// for the "can't delete your own account" guard that exists on the admin
// tool -- deleting your own account here is exactly the intended action.
export async function deleteMyAccount(): Promise<void> {
  const userId = await getUserId();

  const logs = await prisma.workoutLog.findMany({
    where: { userId, videoFilename: { not: null } },
    select: { videoFilename: true },
  });
  for (const log of logs) {
    if (log.videoFilename) await deleteProofFile(log.videoFilename);
  }

  await prisma.user.delete({ where: { id: userId } });

  await signOut({ redirectTo: "/login" });
}
