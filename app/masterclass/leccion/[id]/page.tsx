import Image from "next/image";
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

const PHASE_TINT: Record<string, string> = {
  neon: "var(--neon)",
  purple: "var(--lilac)",
  white: "var(--paper-deep)",
};

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

  return (
    <main className="pb-24">
      {/* Masthead */}
      <header className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-8">
        <div className="flex items-center justify-between pb-3">
          <Link
            href="/masterclass"
            className="font-meta text-[10px] text-[color:var(--ink-soft)] hover:text-[color:var(--grape)] md:text-xs"
          >
            ← Tu espacio
          </Link>
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">
            Lección {lesson.id} / {LESSONS.length}
          </p>
        </div>
        <div className="rule-double" />
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
        {/* Apertura de capítulo */}
        <section className="flex items-start gap-4 pt-10 md:gap-7 md:pt-14">
          <span className="outline-numeral pt-2 text-7xl md:text-9xl" aria-hidden>
            {String(lesson.id).padStart(2, "0")}
          </span>
          <div>
            <p className="font-meta text-[9px] md:text-[10px]">
              <em
                className="not-italic"
                style={{
                  backgroundImage: `linear-gradient(to top, transparent 4%, ${PHASE_TINT[phase.color]} 4%, ${PHASE_TINT[phase.color]} 60%, transparent 60%)`,
                }}
              >
                Fase {phase.id} · {phase.name}
              </em>
              <span className="ml-3 text-[color:var(--ink-soft)]">
                {lesson.week} · {lesson.duration}
              </span>
            </p>
            <h1 className="mt-3 text-3xl leading-tight md:text-5xl">
              {lesson.title}
            </h1>
          </div>
        </section>

        {/* Video / próximamente */}
        <section className="mt-10">
          {lesson.videoUrl ? (
            <figure>
              <div className="plate bg-black">
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
              <figcaption className="font-meta mt-4 text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                Lámina {String(lesson.id).padStart(2, "0")} · Con Gabi, desde
                casa
              </figcaption>
            </figure>
          ) : (
            <div className="plate-lilac flex aspect-video flex-col items-center justify-center gap-5 bg-[color:var(--paper-deep)]/70 p-6 text-center">
              <span className="stamp">En producción</span>
              <p className="font-hand text-3xl leading-snug text-[color:var(--grape)] md:text-4xl">
                Gabi está grabando esta lección para ti
              </p>
              <p className="max-w-md text-sm leading-relaxed text-[color:var(--ink-soft)] md:text-base">
                Te avisaremos en cuanto esté lista. Mientras tanto, tus guías
                de esta fase ya te esperan aquí abajo.
              </p>
            </div>
          )}
        </section>

        {/* Descripción */}
        <section className="mt-12">
          <p className="font-meta text-[9px] text-[color:var(--grape)] md:text-[10px]">
            En esta lección
          </p>
          <p className="dropcap mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
            {lesson.description}
          </p>
        </section>

        {/* Marcar completada */}
        <section className="mt-10">
          <CompleteButton lessonId={lesson.id} />
        </section>

        {/* Guías de la fase */}
        {guides.length > 0 && (
          <section className="mt-14">
            <h2 className="text-3xl md:text-4xl">
              Guías de <em className="marker-lilac pr-1">esta fase</em>
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
              {guides.map((guide, i) => (
                <a key={guide.slug} href={guide.file} download className="group block">
                  <div
                    className="shelf-cover"
                    style={{ transform: `rotate(${i % 2 === 0 ? -1.2 : 1.4}deg)` }}
                  >
                    <Image
                      src={guide.cover}
                      alt={`Portada: ${guide.title}`}
                      width={560}
                      height={792}
                      className="block h-auto w-full"
                    />
                  </div>
                  <h3 className="mt-3 text-sm leading-snug md:text-base">
                    {guide.title}
                  </h3>
                  <p className="font-meta mt-1 text-[9px] text-[color:var(--grape)] group-hover:underline">
                    Descargar PDF ↓
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Navegación de capítulos */}
        <section className="mt-16">
          <div className="rule-double" />
          <div className="flex flex-col justify-between gap-6 py-6 md:flex-row">
            {prev ? (
              <Link href={`/masterclass/leccion/${prev.id}`} className="group max-w-xs">
                <p className="font-meta text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                  ← Lección anterior
                </p>
                <p className="mt-2 text-lg leading-snug group-hover:text-[color:var(--grape)]">
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
                <p className="font-meta text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                  Siguiente lección →
                </p>
                <p className="mt-2 text-lg leading-snug group-hover:text-[color:var(--grape)]">
                  {next.title}
                </p>
              </Link>
            )}
          </div>
          <div className="rule-double" />
        </section>

        {/* Nota médica */}
        <aside className="mt-10 border-2 border-[color:var(--ink)]/25 border-l-[6px] border-l-[color:var(--grape)] bg-[color:var(--paper-deep)]/60 p-5">
          <p className="font-meta text-[9px] text-[color:var(--grape)] md:text-[10px]">
            Recuerda — tu seguridad primero
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            {MEDICAL_DISCLAIMER}
          </p>
        </aside>
      </div>
    </main>
  );
}
