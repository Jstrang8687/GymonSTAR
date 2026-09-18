"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkIn } from "./actions";

export function CheckInButton() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleCheckIn() {
    setResult(null);
    if (!navigator.geolocation) {
      setResult({ ok: false, message: "Your browser doesn't support location -- can't check in." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTransition(async () => {
          const res = await checkIn(position.coords.latitude, position.coords.longitude, name);
          setResult(res);
          if (res.ok) {
            setName("");
            router.refresh();
          }
        });
      },
      (err) => {
        setResult({ ok: false, message: `Couldn't get your location: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-bold text-white">Check in at a gym</p>
      <p className="mt-1 text-xs text-slate-400">
        Claims wherever you are right now if it's new, or challenges the current champion if someone else
        already holds it. One-time location grab -- we don't track you after this.
      </p>
      <input
        placeholder="Name this gym (only used if it's new)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
      />
      <button
        type="button"
        disabled={pending}
        onClick={handleCheckIn}
        className="mt-2 w-full rounded-lg bg-amber-400 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Checking in..." : "📍 Check in here"}
      </button>
      {result && (
        <p className={`mt-2 text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>{result.message}</p>
      )}
    </div>
  );
}
