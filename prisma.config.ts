import "dotenv/config";
import { defineConfig } from "prisma/config";

// Plain Postgres (Supabase) -- no custom driver adapter needed for a normal
// long-running Node server. DATABASE_URL drives both the CLI and the
// runtime client (src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
