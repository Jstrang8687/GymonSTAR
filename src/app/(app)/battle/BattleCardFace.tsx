import { TIER_BORDER, type BattleCard, type LaneEffect } from "@/lib/quickBattle";

// Shared card visual for both Quick Battle prototypes -- real pixel art and
// tier border when the monSTAR has one, so a card looks like the same card
// on the battlefield as it does on the collection page, not a generic icon.
export function BattleCardFace({ card, iconSize = "text-lg" }: { card: BattleCard; iconSize?: string }) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border-2 bg-gradient-to-br from-orange-800 to-orange-950 ${TIER_BORDER[card.tier]}`}
    >
      {card.artUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small local pixel-art sprite, no need for next/image optimization
        <img src={card.artUrl} alt={card.name} className="h-full w-full object-contain [image-rendering:pixelated]" />
      ) : (
        <span className={iconSize}>{card.icon}</span>
      )}
    </div>
  );
}

// The location card that sits in the middle of a lane -- same card
// proportions as a monSTAR card, so it reads as a real third card on the
// battlefield (Snap-style) rather than a text label above the fight.
// artUrl is unset in the pool for now; once real location art exists this
// picks it up automatically, same as BattleCardFace does for monSTARs.
export function LocationCardFace({ lane }: { lane: LaneEffect }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-md border-2 border-sky-400/40 bg-gradient-to-br from-slate-700 to-slate-900">
      <span className="truncate bg-black/30 px-1 py-0.5 text-center text-[8px] font-bold uppercase tracking-wide text-white">
        {lane.name}
      </span>
      <div className="flex flex-1 items-center justify-center">
        {lane.artUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- small local sprite, no need for next/image optimization
          <img src={lane.artUrl} alt={lane.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">{lane.icon}</span>
        )}
      </div>
      <span className="truncate bg-black/30 px-1 py-0.5 text-center text-[7px] font-semibold text-amber-300">
        {lane.description}
      </span>
    </div>
  );
}
