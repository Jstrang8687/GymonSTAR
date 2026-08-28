"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateMonster } from "../../actions";

interface MonsterEditRowProps {
  monsterId: string;
  label: string;
  level: number;
  xp: number;
  strengthXp: number;
  enduranceXp: number;
}

export function MonsterEditRow({ monsterId, label, level, xp, strengthXp, enduranceXp }: MonsterEditRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ level, xp, strengthXp, enduranceXp });
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await adminUpdateMonster(monsterId, form);
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
        <span className="text-slate-200">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Lv.{level} · {xp} XP
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-amber-400 hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-3 py-2 text-sm">
      <p className="mb-2 text-slate-200">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["level", "xp", "strengthXp", "enduranceXp"] as const).map((field) => (
          <label key={field} className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {field}
            </span>
            <input
              type="number"
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: Number(e.target.value) }))}
              className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
            />
          </label>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setForm({ level, xp, strengthXp, enduranceXp });
            setEditing(false);
          }}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-white/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
