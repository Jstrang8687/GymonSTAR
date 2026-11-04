import Link from "next/link";
import { requireAdmin } from "@/lib/session-helpers";
import { listOpenReports } from "@/lib/moderation";
import { REPORT_REASON_LABEL } from "@/lib/reportReasons";
import { adminResolveReport } from "../actions";

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await listOpenReports();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
          ← Admin
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
          No open reports.
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-slate-300">
                  <Link href={`/admin/users/${r.reportedId}`} className="font-bold text-amber-400 hover:underline">
                    {r.reportedName}
                  </Link>{" "}
                  reported by <span className="font-semibold text-white">{r.reporterName}</span>
                </p>
                <p className="text-xs text-slate-500">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-red-300">{REPORT_REASON_LABEL[r.reason]}</p>
              {r.note && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{r.note}</p>}
              <div className="mt-3 flex gap-2">
                <form action={adminResolveReport.bind(null, r.id, "ACTIONED")}>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300"
                  >
                    Mark handled
                  </button>
                </form>
                <form action={adminResolveReport.bind(null, r.id, "DISMISSED")}>
                  <button
                    type="submit"
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-white/30"
                  >
                    Dismiss
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
