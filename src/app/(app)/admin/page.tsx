import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-helpers";

export default async function AdminPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      profile: true,
      _count: { select: { monsters: true, workoutLogs: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Admin</h1>
        <Link
          href="/admin/gallery"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-amber-300 hover:border-white/30"
        >
          🖼️ Full monSTAR gallery (102 cards)
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Trainer Lv.</th>
              <th className="px-4 py-2">Streak</th>
              <th className="px-4 py-2">monSTARs</th>
              <th className="px-4 py-2">Workouts</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-2">
                  <Link href={`/admin/users/${u.id}`} className="font-semibold text-amber-400 hover:underline">
                    {u.name}
                  </Link>
                  {u.isAdmin && (
                    <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      ADMIN
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-400">{u.email}</td>
                <td className="px-4 py-2 text-slate-300">{u.profile?.trainerLevel ?? "—"}</td>
                <td className="px-4 py-2 text-slate-300">🔥 {u.profile?.loginStreak ?? 0}</td>
                <td className="px-4 py-2 text-slate-300">{u._count.monsters}</td>
                <td className="px-4 py-2 text-slate-300">{u._count.workoutLogs}</td>
                <td className="px-4 py-2 text-slate-500">{u.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
