import Link from "next/link";
import { requireOnboarded } from "@/lib/session-helpers";
import { listTemplates } from "./actions";
import { ManageTemplates } from "./ManageTemplates";

export default async function TemplatesPage() {
  await requireOnboarded();
  const templates = await listTemplates();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/settings" className="text-sm text-slate-400 hover:text-white">
          ← Back to Settings
        </Link>
        <h1 className="mt-2 text-2xl font-black text-white">Workout Templates</h1>
        <p className="mt-1 text-sm text-slate-400">
          Saved exercise lists you can start a workout from. Save one from the{" "}
          <Link href="/log" className="font-semibold text-amber-400 hover:underline">
            Log Workout
          </Link>{" "}
          page.
        </p>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-slate-500">
          No templates yet. Build a workout on the Log Workout page and hit &quot;Save as a template.&quot;
        </p>
      ) : (
        <ManageTemplates templates={templates} />
      )}
    </div>
  );
}
