import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LESSONS,
  MEDICAL_DISCLAIMER,
  PHASES,
  cloudinaryPoster,
  getLesson,
  guidesForPhase,
} from "../../lessons";
import CompleteButton from "./CompleteButton";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: String(l.id) }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonId = Number(id);
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  const phase = PHASES.find((p) => p.id === lesson.phase)!;
  const guides = guidesForPhase(lesson.phase);
  const prev = getLesson(lessonId - 1);
  const next = getLesson(lessonId + 1);
  const accentText =
    phase.color === "neon"
      ? "text-brand-neon"
      : phase.color === "purple"
        ? "text-brand-purple"
        : "text-white";

  return (
    <main className="grid-bg min-h-screen">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/masterclass"
            className="font-mono text-xs uppercase tracking-widest text-white/70 hover:text-brand-neon md:text-sm"
          >
            ← Tu masterclass
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/60 md:text-xs">
            Lección {lesson.id} de {LESSONS.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        {/* Título */}
        <section className="pt-8 md:pt-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`font-mono text-xs uppercase tracking-widest ${accentText}`}>
              Fase {phase.id} — {phase.name}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-white/70">
              {lesson.week} · {lesson.duration}
            </span>
          </div>
          <h1 className="mt-3 text-3xl leading-tight text-white md:text-5xl">
            {lesson.title}
          </h1>
        </section>

        {/* Video */}
        <section className="mt-8">
          {lesson.videoUrl ? (
            <div className="border-4 border-white bg-black shadow-[10px_10px_0px_#cff154]">
              <video
                controls
                playsInline
                preload="metadata"
                poster={cloudinaryPoster(lesson.videoUrl)}
                className="block h-auto w-full"
              >
                <source src={lesson.videoUrl} type="video/mp4" />
                Tu navegador no puede reproducir este video.
              </video>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 border-4 border-white bg-black p-6 text-center shadow-[10px_10px_0px_#c4b5fd]">
              <span className="border-2 border-brand-purple px-3 py-1 font-mono text-xs uppercase tracking-widest text-brand-purple">
                Próximamente
              </span>
              <p className="max-w-md text-sm leading-relaxed text-white/70 md:text-base">
                Gabi está preparando esta lección con todo el amor del mundo.
                Te avisaremos en cuanto esté lista — mientras tanto, tus guías
                de esta fase ya están disponibles abajo. 💜
              </p>
            </div>
          )}
        </section>

        {/* Descripción */}
        <section className="mt-8">
          <h2 className="text-2xl text-brand-neon md:text-3xl">
            En esta lección
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            {lesson.description}
          </p>
        </section>

        {/* Marcar completada */}
        <section className="mt-8">
          <CompleteButton lessonId={lesson.id} />
        </section>

        {/* Guías de la fase */}
        {guides.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl text-brand-purple md:text-3xl">
              Guías de esta fase
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {guides.map((guide) => (
                <a
                  key={guide.slug}
                  href={guide.file}
                  download
                  className="flex items-start gap-4 border-4 border-white bg-black p-4 transition-transform hover:-translate-y-1 hover:border-brand-purple"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border-4 border-brand-purple font-heading text-base font-black text-brand-purple">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base leading-tight text-white">
                      {guide.title}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
                      Descargar ↓
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Navegación */}
        <section className="mt-12 flex flex-col gap-4 border-t-4 border-white/30 pt-8 md:flex-row md:justify-between">
          {prev ? (
            <Link
              href={`/masterclass/leccion/${prev.id}`}
              className="group max-w-xs"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                ← Lección anterior
              </p>
              <p className="mt-1 text-sm text-white group-hover:text-brand-neon">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/masterclass/leccion/${next.id}`}
              className="group max-w-xs md:text-right"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                Siguiente lección →
              </p>
              <p className="mt-1 text-sm text-white group-hover:text-brand-neon">
                {next.title}
              </p>
            </Link>
          )}
        </section>

        {/* Disclaimer */}
        <section className="mt-12 border-4 border-white/30 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">
            Recuerda — tu seguridad primero
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/60 md:text-sm">
            {MEDICAL_DISCLAIMER}
          </p>
        </section>
      </div>
    </main>
  );
}
