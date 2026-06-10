"use client";

// IMPORTANTE: este componente NO importa lessons.ts — recibe los datos por
// props desde page.tsx (server), que solo lo renderiza con código válido.
// Así los datos del programa (y los videoUrl) nunca entran al JS público.

import Image from "next/image";
import Link from "next/link";
import { LOGO_URL } from "./branding";
import type { ClientLesson, Guide, Phase } from "./lessons";
import { useProgress } from "./progress";

const PHASE_ACCENT = {
  neon: {
    badge: "bg-brand-neon text-black",
    text: "text-brand-neon",
  },
  purple: {
    badge: "bg-brand-purple text-black",
    text: "text-brand-purple",
  },
  white: {
    badge: "bg-white text-black",
    text: "text-white",
  },
} as const;

function LessonCard({
  lesson,
  completed,
}: {
  lesson: ClientLesson;
  completed: boolean;
}) {
  return (
    <Link
      href={`/masterclass/leccion/${lesson.id}`}
      className="group flex items-center gap-4 border-4 border-white bg-black p-4 transition-transform hover:-translate-y-1 hover:border-brand-neon md:p-5"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center border-4 font-heading text-lg font-black md:h-14 md:w-14 md:text-xl ${
          completed
            ? "border-brand-neon bg-brand-neon text-black"
            : "border-white text-white"
        }`}
      >
        {completed ? "✓" : String(lesson.id).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/70 md:text-xs">
          {lesson.week} · {lesson.duration}
        </p>
        <h3 className="mt-1 text-base leading-tight text-white md:text-lg">
          {lesson.title}
        </h3>
      </div>
      <div className="shrink-0">
        {!lesson.hasVideo ? (
          <span className="border-2 border-brand-purple px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-brand-purple md:text-[10px]">
            Próximamente
          </span>
        ) : (
          <span className="font-heading text-xl text-brand-neon group-hover:translate-x-1 md:text-2xl">
            ▶
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard({
  phases,
  lessons,
  guides,
  disclaimer,
}: {
  phases: Phase[];
  lessons: ClientLesson[];
  guides: Guide[];
  disclaimer: string;
}) {
  const { completed, loaded } = useProgress();
  const done = lessons.filter((l) => completed.includes(l.id)).length;
  const pct = Math.round((done / lessons.length) * 100);
  const next = lessons.find((l) => !completed.includes(l.id)) ?? lessons[0];

  return (
    <main className="grid-bg min-h-screen">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Image
            src={LOGO_URL}
            alt="Gabifit"
            width={140}
            height={45}
            className="h-auto w-28 md:w-36"
            priority
          />
          <span className="border-2 border-brand-purple px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-purple md:text-xs">
            Área de miembros
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        {/* Bienvenida + progreso */}
        <section className="pt-10 md:pt-14">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-purple md:text-sm">
            Programa Post-Parto · 8 semanas
          </p>
          <h1 className="mt-2 text-4xl text-white md:text-6xl">
            Tu <span className="text-brand-neon">masterclass</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Bienvenida. Este espacio es tuyo: 11 lecciones en 3 fases para
            recuperar tu figura, tu energía y tu identidad. Tu cuerpo no está
            roto — está en proceso de reconstruirse, y vamos a hacerlo juntas,
            paso a paso.
          </p>

          <div className="mt-8 border-4 border-white bg-black p-5 shadow-[8px_8px_0px_#cff154] md:p-6">
            <div className="flex items-end justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-widest text-white/70">
                Tu progreso
              </p>
              <p className="font-heading text-2xl text-brand-neon md:text-3xl">
                {loaded ? `${done}/${lessons.length}` : "–"}
              </p>
            </div>
            <div className="mt-3 h-4 border-2 border-white bg-black">
              <div
                className="h-full bg-brand-neon transition-all duration-700"
                style={{ width: `${loaded ? pct : 0}%` }}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-white/80">
                {done === 0
                  ? "Empieza por la Lección 1 — el despertar de tu cuerpo. 💪"
                  : done === lessons.length
                    ? "¡COMPLETASTE TODO EL PROGRAMA! Estamos orgullosas de ti. 🎉"
                    : `Vas increíble. Tu siguiente paso: Lección ${next.id}.`}
              </p>
              {done < lessons.length && (
                <Link
                  href={`/masterclass/leccion/${next.id}`}
                  className="inline-block shrink-0 border-4 border-black bg-brand-neon px-4 py-2 text-center font-heading text-sm font-black uppercase text-black shadow-[4px_4px_0px_#ffffff] transition-transform hover:-translate-y-0.5"
                >
                  {done === 0 ? "Empezar ahora →" : "Continuar →"}
                </Link>
              )}
            </div>
          </div>

          {/* Aviso médico — visible antes de empezar */}
          <div className="mt-6 border-4 border-brand-purple/60 bg-brand-purple/5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
              Importante — lee esto antes de empezar
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/80 md:text-sm">
              {disclaimer}
            </p>
          </div>
        </section>

        {/* Fases */}
        {phases.map((phase) => {
          const accent = PHASE_ACCENT[phase.color];
          const phaseLessons = lessons.filter((l) => l.phase === phase.id);
          return (
            <section key={phase.id} className="mt-14">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span
                  className={`border-4 border-black px-3 py-1 font-heading text-sm font-black uppercase ${accent.badge}`}
                >
                  Fase {phase.id}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                  {phase.weeks}
                </span>
              </div>
              <h2 className={`text-3xl md:text-4xl ${accent.text}`}>
                {phase.name}
              </h2>
              <p className="mt-2 text-sm text-white/80">{phase.subtitle}</p>
              <div className="mt-6 flex flex-col gap-4">
                {phaseLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    completed={completed.includes(lesson.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Guías */}
        <section className="mt-16">
          <h2 className="text-3xl text-brand-purple md:text-4xl">
            Tus guías
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Descárgalas, imprímelas, pégalas en la nevera. Son tuyas para
            siempre.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <a
                key={guide.slug}
                href={guide.file}
                download
                className="group flex items-start gap-4 border-4 border-white bg-black p-4 transition-transform hover:-translate-y-1 hover:border-brand-purple md:p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-brand-purple font-heading text-lg font-black text-brand-purple">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base leading-tight text-white md:text-lg">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/70 md:text-sm">
                    {guide.description}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
                    Descargar ↓
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
