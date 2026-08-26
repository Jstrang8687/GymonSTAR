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
    </div>
  );
}
