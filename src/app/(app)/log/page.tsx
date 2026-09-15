import { requireOnboarded } from "@/lib/session-helpers";
import { LogWorkoutForm } from "./LogWorkoutForm";
import { listTemplates } from "../settings/templates/actions";
import { listCustomExercises } from "@/lib/customExercises";

export default async function LogPage() {
  await requireOnboarded();
  const [templates, customExercises] = await Promise.all([listTemplates(), listCustomExercises()]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-black text-white">Log Workout</h1>
      <LogWorkoutForm templates={templates} customExercises={customExercises} />
    </div>
  );
}
