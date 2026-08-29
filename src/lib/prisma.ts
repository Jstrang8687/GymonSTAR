import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Same adapter as prisma.config.ts (CLI migrations) -- TURSO_DATABASE_URL is
// a plain local file in dev ("file:./prisma/dev.db") and a real libsql:// URL +
// auth token once pointed at a hosted Turso database, so accounts and
// workout data survive restarts on hosts with no persistent disk.
function createPrismaClient() {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
