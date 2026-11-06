import Image from "next/image";
import { getSessionMemberAny } from "@/lib/session";
import {
  getClientRoutine,
  getClientMealPlan,
  getClientTasks,
  getClientProgress,
  getWorkoutLog,
  getAnnouncement,
} from "@/lib/coaching-db";
import { isoDate } from "@/lib/coaching";
import { LOGO_INK, GABI_PHOTO, WHATSAPP_HELP_URL } from "../masterclass/branding";
import CoachingLoginForm from "./CoachingLoginForm";
import CoachingPortal from "./CoachingPortal";

export const dynamic = "force-dynamic";

export default async function CoachingPage() {
  const member = await getSessionMemberAny();

  // --- Sin sesión → login ---
  if (!member) {
    return (
      <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
        <header className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between pb-3">
            <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
            <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">Coaching 1:1</p>
          </div>
          <div className="rule-double" />
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10">
          <div className="grid w-full items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-14">
            <figure className="mx-auto w-56 max-w-full md:w-full md:max-w-xs">
              <div className="arch plate-lilac">
                <Image src={GABI_PHOTO} alt="Gabi, tu coach" width={560} height={840} className="block h-auto w-full object-cover" priority />
              </div>
              <figcaption className="font-hand mt-4 -rotate-2 text-center text-2xl text-[color:var(--grape)]">tu coach, Gabi ♡</figcaption>
            </figure>
            <div>
              <p className="font-meta text-[10px] text-[color:var(--grape)]">Tu plan personalizado</p>
              <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl">
                Entra a<br />
                <em className="marker pr-2">tu coaching.</em>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
                Tu rutina, tus comidas, tus hábitos y tu progreso — hechos para ti.
              </p>
              <CoachingLoginForm />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- Con sesión pero sin coaching activo ---
  if (member.coachingStatus !== "active") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
        <span className="stamp mt-10">Coaching 1:1</span>
        <h1 className="mt-6 text-4xl md:text-6xl">Aún no tienes coaching</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)]">
          El coaching personalizado con Gabi es un acompañamiento aparte. Si ya lo compraste y no lo ves, escríbele.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href={WHATSAPP_HELP_URL} target="_blank" rel="noopener noreferrer" className="btn-ink">
            Quiero mi coaching →
          </a>
          <a href="/masterclass" className="font-meta text-[10px] text-[color:var(--grape)] underline">
            Ir a mi masterclass
          </a>
        </div>
      </main>
    );
  }

  // --- Clienta de coaching activa ---
  const [routine, mealPlan, tasks, progress, workoutLog, announcement] = await Promise.all([
    getClientRoutine(member.uid),
    getClientMealPlan(member.uid),
    getClientTasks(member.uid),
    getClientProgress(member.uid),
    getWorkoutLog(member.uid),
    getAnnouncement(),
  ]);

  return (
    <CoachingPortal
      clientName={member.fullName?.split(" ")[0] ?? "mami"}
      routine={routine}
      mealPlan={mealPlan}
      tasks={tasks}
      progress={progress}
      workoutLog={workoutLog}
      today={isoDate(new Date())}
      announcement={announcement.active ? announcement.message : null}
    />
  );
}
