import Link from "next/link";
import { requireOnboarded } from "@/lib/session-helpers";

export default async function BattlePage() {
  await requireOnboarded();

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="text-6xl">🗺️⚔️</div>
      <h1 className="mt-4 text-2xl font-black text-white">Battles — Coming Soon</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        Soon you&apos;ll be able to share your location and challenge nearby trainers to a
        monSTAR battle. We&apos;re building this carefully — real matchmaking and location
        sharing take real safety design, so it&apos;s not wired up yet.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-slate-600">
        No opponents nearby (feature disabled)
      </div>

      <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 text-left">
        <p className="text-sm font-bold text-amber-300">🧪 Quick Battle prototypes</p>
        <p className="mt-1 text-xs text-slate-400">
          Two versions of an instant, no-workout-required battle mode, for testing before we
          commit to one. Nothing here is saved.
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
      </div>
    </div>
  );
}
