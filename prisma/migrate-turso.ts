// Prisma's own `migrate deploy` doesn't reliably go through the configured
// libsql driver adapter for the actual DDL execution -- observed in practice
// applying the schema to a throwaway local file instead of the real Turso
// database, even with prisma.config.ts's adapter loaded. This applies the
// migration.sql files directly through the exact same @libsql/client
// connection the running app uses (src/lib/prisma.ts), so there's no
// ambiguity about which database actually receives the schema.
import { createClient } from "@libsql/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");
const TRACKING_TABLE = "_gymonstar_migrations";

function splitStatements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  console.log("[migrate-turso] target:", url);

  const client = createClient({ url, authToken });

  await client.execute(
    `CREATE TABLE IF NOT EXISTS "${TRACKING_TABLE}" (name TEXT NOT NULL PRIMARY KEY, applied_at TEXT NOT NULL)`
  );

  const applied = await client.execute(`SELECT name FROM "${TRACKING_TABLE}"`);
  const appliedNames = new Set(applied.rows.map((r) => r.name as string));

  const dirs = readdirSync(MIGRATIONS_DIR)
    .filter((name) => statSync(path.join(MIGRATIONS_DIR, name)).isDirectory())
    .sort();

  let ranAny = false;
  for (const dir of dirs) {
    if (appliedNames.has(dir)) continue;

    const sqlPath = path.join(MIGRATIONS_DIR, dir, "migration.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    const statements = splitStatements(sql);

    for (const statement of statements) {
      await client.execute(statement);
    }
    await client.execute({
      sql: `INSERT INTO "${TRACKING_TABLE}" (name, applied_at) VALUES (?, ?)`,
      args: [dir, new Date().toISOString()],
    });
    console.log("[migrate-turso] applied:", dir);
    ranAny = true;
  }

  if (!ranAny) console.log("[migrate-turso] already up to date, nothing to apply.");
  client.close();
}

main().catch((e) => {
  console.error("[migrate-turso] failed:", e);
  process.exit(1);
});
