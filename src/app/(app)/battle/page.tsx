import Link from "next/link";
import { requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_TYPE_META } from "@/lib/muscleTypes";
import { listGyms } from "./gyms/actions";
import { CheckInButton } from "./gyms/CheckInButton";
import { DuelSearch } from "./duels/DuelSearch";
import { myDuels } from "./duels/actions";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "closing...";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m left`;
}

export default async function BattlePage() {
  await requireOnboarded();
  const [gyms, duels] = await Promise.all([listGyms(), myDuels()]);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Battle</h1>
        <p className="mt-1 text-sm text-slate-400">Three ways to throw down.</p>
      </div>

      <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
        <p className="text-sm font-bold text-amber-300">🃏 Solo Card Battle</p>
        <p className="mt-1 text-xs text-slate-400">
          Instant, single-player, cards only -- no workouts involved, nothing here is saved.
        </p>
        <div className="mt-3 space-y-2">
          <Link
            href="/battle/quick-simple"
            className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:border-amber-400/50"
          >
            Simple — 3 lanes, one instant reveal
          </Link>
          <Link
            href="/battle/quick-full"
            className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:border-amber-400/50"
          >
            Full rules — 12-card roster, hand of 4, 6 energy-gated turns
          </Link>
        </div>
      </section>

      <section>
        <p className="text-sm font-bold text-white">⚔️ Head-to-Head Duels</p>
        <p className="mt-1 text-xs text-slate-400">
          Challenge anyone, anywhere -- no gym required. Whoever earns more XP in that muscle type over 48
          hours wins.
        </p>

        <div className="mt-3">
          <DuelSearch />
        </div>

        {duels.length > 0 && (
          <div className="mt-4 space-y-2">
            {duels.map((d) => (
              <div key={d.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{d.muscleTypeLabel}</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-white">You</span>
                  <span className="font-bold text-amber-400">
                    {d.myScore} — {d.opponentScore}
                  </span>
                  <span className="text-white">{d.opponentName}</span>
                </div>
                <p className="mt-1 text-center text-xs text-slate-500">
                  {d.status === "OPEN" ? formatCountdown(d.msRemaining) : d.won ? "You won!" : "You lost"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="text-sm font-bold text-white">🗺️ Gym Duels</p>
        <p className="mt-1 text-xs text-slate-400">
          Claim a real place by checking in. Someone else&apos;s turf? Beat their score in a 48-hour training
          window to take it.
        </p>

        <div className="mt-3">
          <CheckInButton />
        </div>

        <div className="mt-4 space-y-3">
          {gyms.length === 0 ? (
            <p className="text-sm text-slate-500">No gyms claimed yet — be the first.</p>
          ) : (
            gyms.map((gym) => (
              <div key={gym.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{gym.name}</p>
                  {gym.championMuscleType && (
                    <span className="text-xs text-slate-400">
                      {MUSCLE_TYPE_META[gym.championMuscleType].icon} {MUSCLE_TYPE_META[gym.championMuscleType].label}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-amber-300">
                  👑 {gym.championName ?? "Unclaimed"}
                </p>

                {gym.challenge && gym.challenge.status === "OPEN" && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                      ⚔️ Duel in progress — {gym.challenge.muscleTypeLabel}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-white">{gym.challenge.challengerName}</span>
                      <span className="font-bold text-amber-400">
                        {gym.challenge.challengerScore} — {gym.challenge.defenderScore}
                      </span>
                      <span className="text-white">{gym.challenge.defenderName}</span>
                    </div>
                    <p className="mt-1 text-center text-xs text-slate-500">
                      {formatCountdown(gym.challenge.msRemaining)}
                    </p>
                  </div>
                )}

                {gym.challenge && gym.challenge.status === "RESOLVED" && (
                  <p className="mt-2 text-xs text-slate-500">
                    Last duel: {gym.challenge.winnerName} won {gym.challenge.challengerScore} —{" "}
                    {gym.challenge.defenderScore}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
