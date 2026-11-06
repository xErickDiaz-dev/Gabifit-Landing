import {
  listRoutineTemplates,
  listMealPlanTemplates,
  listTaskTemplates,
  listExercises,
} from "@/lib/coaching-db";
import TemplateManager from "./TemplateManager";

export const dynamic = "force-dynamic";

export default async function PlantillasPage() {
  const [routines, meals, tasks, library] = await Promise.all([
    listRoutineTemplates(),
    listMealPlanTemplates(),
    listTaskTemplates(),
    listExercises(),
  ]);

  return (
    <main>
      <h1 className="text-4xl md:text-5xl">
        Tus <em className="marker pr-1">plantillas</em>
      </h1>
      <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
        Crea una vez, asigna y ajusta por clienta.
      </p>
      <div className="mt-8">
        <TemplateManager routines={routines} meals={meals} tasks={tasks} library={library} />
      </div>
    </main>
  );
}
