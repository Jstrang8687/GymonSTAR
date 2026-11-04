"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockTrainer, reportTrainer } from "@/app/(app)/moderation/actions";
import { REPORT_REASONS } from "@/lib/reportReasons";

type View = "menu" | "report" | "block";

// Small "Report / block" control that sits next to another trainer's name.
// Required for app-store review of anything with user-to-user interaction,
// and just the right thing to offer when someone is being a problem.
export function ReportBlockMenu({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setView("menu");
    setReason("");
    setNote("");
    setResult(null);
  }

  function submitReport() {
    startTransition(async () => {
      const res = await reportTrainer(userId, reason, note);
      setResult(res);
    });
  }

  function confirmBlock() {
    startTransition(async () => {
      const res = await blockTrainer(userId);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
      >
        Report / block
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-slate-900/70 p-3 text-left text-xs text-slate-300">
      {result?.ok ? (
        <>
          <p className="text-emerald-400">{result.message}</p>
          <button type="button" onClick={close} className="mt-2 text-slate-400 hover:text-white">
            Close
          </button>
        </>
      ) : view === "menu" ? (
        <>
          <p className="font-semibold text-white">{name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView("report")}
              className="rounded-md border border-white/10 px-2.5 py-1.5 font-semibold hover:border-amber-400/50"
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => setView("block")}
              className="rounded-md border border-white/10 px-2.5 py-1.5 font-semibold hover:border-red-400/50"
            >
              Block
            </button>
            <button type="button" onClick={close} className="px-1 text-slate-500 hover:text-white">
              Cancel
            </button>
          </div>
        </>
      ) : view === "report" ? (
        <>
          <p className="font-semibold text-white">Report {name}</p>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-white outline-none focus:border-amber-400"
          >
            <option value="">Pick a reason…</option>
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Anything we should know? (optional)"
            className="mt-2 w-full rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-white outline-none focus:border-amber-400"
          />
          {result && !result.ok && <p className="mt-2 text-red-400">{result.message}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending || !reason}
              onClick={submitReport}
              className="rounded-md bg-amber-400 px-3 py-1.5 font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
            >
              {pending ? "Sending..." : "Send report"}
            </button>
            <button type="button" onClick={close} className="px-1 text-slate-500 hover:text-white">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-semibold text-white">Block {name}?</p>
          <p className="mt-1 text-slate-400">
            You won&apos;t see each other in search, and neither of you can challenge the other. Duels already in
            progress still finish. You can unblock them any time in Settings.
          </p>
          {result && !result.ok && <p className="mt-2 text-red-400">{result.message}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={confirmBlock}
              className="rounded-md bg-red-500 px-3 py-1.5 font-bold text-white hover:bg-red-400 disabled:opacity-50"
            >
              {pending ? "Blocking..." : "Block"}
            </button>
            <button type="button" onClick={close} className="px-1 text-slate-500 hover:text-white">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
