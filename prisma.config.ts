import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// Same adapter drives both the CLI (migrate/generate) and the runtime
// client (src/lib/prisma.ts) -- TURSO_DATABASE_URL can be a plain local
// file (e.g. "file:./prisma/dev.db") for local dev, or a real libsql:// URL +
// auth token once pointed at a hosted Turso database.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  adapter: async () => {
    return new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  },
});
