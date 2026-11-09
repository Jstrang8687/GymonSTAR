import { prisma } from "@/lib/prisma";

// Pinged on a schedule (see .github/workflows/keep-alive.yml). The query is
// the point: database activity is what stops Supabase's free tier from
// pausing the project after a week of inactivity.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
