import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Same adapter as prisma.config.ts (CLI migrations) -- TURSO_DATABASE_URL is
// a plain local file in dev ("file:./prisma/dev.db") and a real libsql:// URL +
// auth token once pointed at a hosted Turso database, so accounts and
// workout data survive restarts on hosts with no persistent disk.
function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db";
  // Temporary diagnostic: confirms which database the running process is
  // actually resolving to, without ever logging the auth token. Remove once
  // the Render "no such table" mismatch is root-caused.
  console.log(
    "[prisma] resolved TURSO_DATABASE_URL:",
    process.env.TURSO_DATABASE_URL ? url : "(not set -- using local file fallback)",
    "| TURSO_AUTH_TOKEN present:",
    Boolean(process.env.TURSO_AUTH_TOKEN)
  );
  const adapter = new PrismaLibSQL({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
