import { notFound } from "next/navigation";
import { getSessionMemberAny } from "@/lib/session";
import {
  getCoachingClientDetail,
  listRoutineTemplates,
  listMealPlanTemplates,
  listTaskTemplates,
  listExercises,
} from "@/lib/coaching-db";
import ClientDetail from "./ClientDetail";

export const dynamic = "force-dynamic";

export default async function CoachingClientPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) notFound();

  const { uid } = await params;
  const [detail, routineTemplates, mealPlanTemplates, taskTemplates, library] = await Promise.all([
    getCoachingClientDetail(uid),
    listRoutineTemplates(),
    listMealPlanTemplates(),
    listTaskTemplates(),
    listExercises(),
  ]);
  if (!detail) notFound();

  return (
    <ClientDetail
      detail={detail}
      routineTemplates={routineTemplates}
      mealPlanTemplates={mealPlanTemplates}
      taskTemplates={taskTemplates}
      library={library}
    />
  );
}
