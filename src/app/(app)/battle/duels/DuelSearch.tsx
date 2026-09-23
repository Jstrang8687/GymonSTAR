"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { search, sharedTypesWith, challenge } from "./actions";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import type { TrainerSearchResult } from "@/lib/gymDuel";

// Head-to-head duels aren't gym-gated -- find anyone by name or email and
// challenge them directly, no check-in required.
export function DuelSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrainerSearchResult[]>([]);
  const [opponent, setOpponent] = useState<TrainerSearchResult | null>(null);
  const [sharedTypes, setSharedTypes] = useState<MuscleType[]>([]);
  const [muscleType, setMuscleType] = useState<MuscleType | "">("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(
      () => {
        if (!q || opponent) {
          setResults([]);
        } else {
          search(q).then(setResults);
        }
      },
      q ? 250 : 0
    );
    return () => clearTimeout(timer);
  }, [query, opponent]);

  function pickOpponent(r: TrainerSearchResult) {
    setOpponent(r);
    setResults([]);
    setQuery(r.name);
    setMuscleType("");
    sharedTypesWith(r.userId).then((types) => {
      setSharedTypes(types);
      setMuscleType(types[0] ?? "");
    });
  }

  function reset() {
    setOpponent(null);
    setQuery("");
    setSharedTypes([]);
    setMuscleType("");
  }

  function handleChallenge() {
    if (!opponent || !muscleType) return;
    setResult(null);
    startTransition(async () => {
      const res = await challenge(opponent.userId, muscleType);
      setResult(res);
      if (res.ok) {
        reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-bold text-white">Challenge any trainer</p>
      <p className="mt-1 text-xs text-slate-400">Search by name or email -- no gym or check-in needed.</p>
      <div className="relative mt-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpponent(null);
          }}
          placeholder="Search by name or email"
          className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-slate-800 shadow-xl">
            {results.map((r) => (
              <button
                key={r.userId}
                type="button"
                onClick={() => pickOpponent(r)}
                className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {opponent && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            value={muscleType}
            onChange={(e) => setMuscleType(e.target.value as MuscleType)}
            disabled={sharedTypes.length === 0}
            className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400 disabled:opacity-60"
          >
            {sharedTypes.length === 0 ? (
              <option value="">No shared monSTARs yet</option>
            ) : (
              sharedTypes.map((t) => (
                <option key={t} value={t}>
                  {MUSCLE_TYPE_META[t].icon} {MUSCLE_TYPE_META[t].label}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            disabled={pending || !muscleType}
            onClick={handleChallenge}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {pending ? "Starting..." : `⚔️ Challenge ${opponent.name}`}
          </button>
        </div>
      )}

      {result && (
        <p className={`mt-2 text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>{result.message}</p>
      )}
    </div>
  );
}
