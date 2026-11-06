import { listExercises } from "@/lib/coaching-db";
import ExerciseLibrary from "./ExerciseLibrary";

export const dynamic = "force-dynamic";

export default async function EjerciciosPage() {
  const exercises = await listExercises();
  return (
    <main>
      <h1 className="text-4xl md:text-5xl">
        Librería de <em className="marker pr-1">ejercicios</em>
      </h1>
      <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
        Crea ejercicios con imagen/cartoon una vez y reúsalos en cualquier rutina.
      </p>
      <div className="mt-8">
        <ExerciseLibrary exercises={exercises} />
      </div>
    </main>
  );
}
