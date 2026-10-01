import { MUSCLE_TYPE_META } from "@/lib/muscleTypes";
import type { TrophyDisplay } from "@/lib/duelTrophies";

// Trophies always render with the legendary holo treatment regardless of
// the winner's real monSTAR tier -- it's a prize, not a reflection of the
// card's own level. Spent ones stay in the gallery (a win is still a win)
// but lose the shine and get a plain "Used" tag instead.
export function TrophyGallery({ trophies }: { trophies: TrophyDisplay[] }) {
  if (trophies.length === 0) {
    return (
      <p className="text-sm text-slate-500">No trophies yet — win a duel to start your case.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {trophies.map((t) => {
        const meta = MUSCLE_TYPE_META[t.muscleType];
        return (
          <div
            key={t.id}
            className={`relative aspect-[3/4] overflow-hidden rounded-xl border-4 bg-gradient-to-br from-orange-800 to-orange-950 p-2 shadow-lg ${
              t.used ? "border-white/15 opacity-50" : "border-amber-300 shadow-[0_0_14px_-3px_rgba(252,211,77,0.7)]"
            }`}
          >
            {!t.used && <div className="holo-shimmer" />}
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-3xl">{meta.icon}</span>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-amber-300">Duel Trophy</p>
              <p className="text-xs font-bold text-white">{meta.label}</p>
              <p className="mt-1 truncate text-[9px] text-slate-300">beat {t.opponentName}</p>
              <p className="text-[9px] text-slate-500">
                {t.wonAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
            </div>
            {t.used && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded border border-white/30 bg-black/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                Used
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
