import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { AuthTokenType } from "@prisma/client";

const TTL_MS: Record<AuthTokenType, number> = {
  EMAIL_VERIFY: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// Only the hash is ever stored -- the raw token exists solely in the emailed
// URL. Replaces any existing token of the same type for this user, so
// requesting a new link invalidates a previous one instead of leaving both
// valid.
export async function createAuthToken(userId: string, type: AuthTokenType): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");

  await prisma.authToken.deleteMany({ where: { userId, type } });
  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TTL_MS[type]),
    },
  });

  return rawToken;
}

// Verifies and single-use-consumes a token, returning the userId it belongs
// to (or null if it's missing, expired, or already used). Always deletes any
// matching row so a token can't be replayed.
export async function consumeAuthToken(rawToken: string, type: AuthTokenType): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.authToken.findUnique({ where: { tokenHash } });

  if (!record || record.type !== type) return null;

  await prisma.authToken.delete({ where: { id: record.id } });

  if (record.expiresAt < new Date()) return null;

  return record.userId;
}
