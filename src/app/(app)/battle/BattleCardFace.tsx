"use client";

import { useState } from "react";
import { TIER_BORDER, type BattleCard, type LaneEffect } from "@/lib/quickBattle";

// Shared card visual for both Quick Battle prototypes -- real pixel art and
// tier border when the monSTAR has one, so a card looks like the same card
// on the battlefield as it does on the collection page, not a generic icon.
// Falls back to the icon if the art URL 404s (e.g. a location added before
// its real art was generated) instead of showing a broken-image icon.
export function BattleCardFace({ card, iconSize = "text-lg" }: { card: BattleCard; iconSize?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showArt = card.artUrl && !imgFailed;
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border-2 bg-gradient-to-br from-orange-800 to-orange-950 ${TIER_BORDER[card.tier]}`}
    >
      {showArt ? (
        // eslint-disable-next-line @next/next/no-img-element -- small local pixel-art sprite, no need for next/image optimization
        <img
          src={card.artUrl}
          alt={card.name}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-contain [image-rendering:pixelated]"
        />
      ) : (
        <span className={iconSize}>{card.icon}</span>
      )}
    </div>
  );
}

const BADGE_STYLE: Record<LaneEffect["badgeKind"], string> = {
  up: "bg-emerald-500 text-white",
  down: "bg-red-500 text-white",
  neutral: "bg-slate-600 text-slate-200",
};

// The location card that sits in the middle of a lane -- same card
// proportions as a monSTAR card, so it reads as a real third card on the
// battlefield (Snap-style) rather than a text label above the fight.
// Same broken-art fallback as BattleCardFace -- new locations start out
// icon-only until real art exists for them.
export function LocationCardFace({ lane }: { lane: LaneEffect }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showArt = lane.artUrl && !imgFailed;
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-md border-2 border-sky-400/40 bg-gradient-to-br from-slate-700 to-slate-900">
      <span className="truncate bg-black/30 px-1 py-0.5 text-center text-[8px] font-bold uppercase tracking-wide text-white">
        {lane.name}
      </span>
      <div className="relative flex flex-1 items-center justify-center">
        {showArt ? (
          // eslint-disable-next-line @next/next/no-img-element -- small local sprite, no need for next/image optimization
          <img
            src={lane.artUrl}
            alt={lane.name}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl">{lane.icon}</span>
        )}
        <span
          className={`absolute right-1 top-1 rounded px-1.5 py-0.5 text-[11px] font-black leading-none shadow ${BADGE_STYLE[lane.badgeKind]}`}
        >
          {lane.badge}
        </span>
      </div>
      <span className="truncate bg-black/30 px-1 py-0.5 text-center text-[7px] font-semibold text-amber-300">
        {lane.description}
      </span>
    </div>
  );
}
