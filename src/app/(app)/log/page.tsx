import { requireOnboarded } from "@/lib/session-helpers";
import { LogWorkoutForm } from "./LogWorkoutForm";

export default async function LogPage() {
  await requireOnboarded();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-black text-white">Log Workout</h1>
      <LogWorkoutForm />
    </div>
  );
}
