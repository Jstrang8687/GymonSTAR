import type { MuscleType } from "@/lib/muscleTypes";

// A template is the skeleton of a workout -- which exercises, no numbers --
// so it stays useful indefinitely even as your weights/reps change over time.
export interface TemplateExercise {
  name: string;
  category: "strength" | "endurance";
  // Set only when the exercise was picked from the library, same as
  // ExerciseRow.pickedMuscleType -- lets loading a template pre-select the
  // right muscle-group chip and know whether it's time-based (cardio).
  muscleType?: MuscleType;
}

export interface WorkoutTemplateData {
  id: string;
  name: string;
  muscleTypes: MuscleType[];
  exercises: TemplateExercise[];
}
