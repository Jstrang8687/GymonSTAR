export function StatBar({
  label,
  icon,
  value,
  max,
  colorClass,
}: {
  label: string;
  icon?: string;
  value: number;
  max: number;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-300">
        <span>
          {icon} {label}
        </span>
        <span className="tabular-nums text-slate-400">
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${colorClass} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
