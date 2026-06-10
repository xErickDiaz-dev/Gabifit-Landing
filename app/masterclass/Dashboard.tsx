"use client";

// IMPORTANTE: este componente NO importa lessons.ts — recibe los datos por
// props desde page.tsx (server), que solo lo renderiza con código válido.
// Así los datos del programa (y los videoUrl) nunca entran al JS público.

import Image from "next/image";
import Link from "next/link";
import { GABI_CUTOUT, LOGO_INK } from "./branding";
import type { ClientLesson, Guide, Phase } from "./lessons";
import { useProgress } from "./progress";

const PHASE_TINT: Record<Phase["color"], string> = {
  neon: "var(--neon)",
  purple: "var(--lilac)",
  white: "var(--paper-deep)",
};

function IndexRow({
  lesson,
  completed,
}: {
  lesson: ClientLesson;
  completed: boolean;
}) {
  return (
    <Link
      href={`/masterclass/leccion/${lesson.id}`}
      className="index-row group flex items-baseline gap-3 border-b border-[color:var(--ink)]/15 px-2 py-4 md:gap-4 md:px-3"
    >
      <span
        className={`flex h-8 w-8 shrink-0 translate-y-1 items-center justify-center rounded-full border-2 font-meta text-[11px] ${
          completed
            ? "border-[color:var(--ink)] bg-[color:var(--neon)] text-[color:var(--ink)]"
            : "border-[color:var(--ink)]/40 text-[color:var(--ink-soft)]"
        }`}
      >
        {completed ? "✓" : String(lesson.id).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="block text-lg leading-snug md:text-xl">
          {lesson.title}
        </span>
        <span className="font-meta mt-1 block text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
          {lesson.week}
        </span>
      </span>
      <span className="leader hidden sm:block" aria-hidden />
      <span className="shrink-0">
        {!lesson.hasVideo ? (
          <span className="stamp">Pronto</span>
        ) : (
          <span className="font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
            {lesson.duration} ▶
          </span>
        )}
      </span>
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
    <main className="pb-24">
      {/* Masthead */}
      <header className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-8">
        <div className="flex items-center justify-between pb-3">
          <Image
            src={LOGO_INK}
            alt="Gabifit"
            width={130}
            height={46}
            className="h-auto w-28 md:w-32"
            priority
          />
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">
            Área de miembros · 8 semanas
          </p>
        </div>
        <div className="rule-double" />
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
        {/* Portada / carta de Gabi */}
        <section className="grid items-end gap-8 pt-10 md:grid-cols-[7fr_5fr] md:gap-6 md:pt-14">
          <div>
            <p className="rise rise-1 font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
              Programa Post-Parto · Edición para ti
            </p>
            <h1 className="rise rise-2 mt-4 text-6xl md:text-7xl lg:text-8xl">
              Tu espacio,
              <br />
              <em className="marker pr-2">mamá.</em>
            </h1>
            <p className="dropcap rise rise-3 mt-8 max-w-xl text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
              Tu cuerpo no está roto — está en proceso de reconstruirse. Aquí
              tienes mis 11 lecciones en 3 fases, con tus guías para
              descargar. Vamos paso a paso, sin culpa, y celebrando cada
              pequeño logro. Estoy contigo en cada semana.
            </p>
            <p className="font-hand rise rise-4 mt-5 -rotate-2 text-3xl text-[color:var(--grape)]">
              — Gabi ♡
            </p>
          </div>

          <figure className="rise rise-2 relative mx-auto hidden w-full max-w-[270px] md:block">
            <div
              aria-hidden
              className="arch absolute inset-x-3 bottom-0 top-7"
              style={{ background: "var(--lilac)" }}
            />
            <Image
              src={GABI_CUTOUT}
              alt="Gabi, tu coach"
              width={540}
              height={988}
              className="relative block h-auto w-full"
              priority
            />
          </figure>
        </section>

        <div className="rule-double mt-6 md:mt-2" />

        {/* Ficha de progreso */}
        <section className="plate-neon mt-10 bg-[color:var(--paper)] p-5 md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">
                Tu ficha de progreso
              </p>
              <p className="mt-2 text-5xl md:text-6xl">
                {loaded ? done : "–"}
                <span className="text-2xl text-[color:var(--ink-soft)] md:text-3xl">
                  {" "}
                  / {lessons.length} lecciones
                </span>
              </p>
            </div>
            {done < lessons.length && (
              <Link href={`/masterclass/leccion/${next.id}`} className="btn-ink">
                {done === 0 ? "Empezar ahora →" : `Continuar · Lección ${next.id} →`}
              </Link>
            )}
          </div>
          <div className="mt-5 h-5 border-2 border-[color:var(--ink)] bg-[color:var(--paper)]">
            <div
              className="h-full bg-[color:var(--neon)] transition-all duration-700"
              style={{ width: `${loaded ? pct : 0}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-[color:var(--ink-soft)] md:text-base">
            {done === 0
              ? "Empieza por la Lección 1 — el despertar de tu cuerpo."
              : done === lessons.length
                ? "¡Completaste todo el programa! Estamos orgullosas de ti. 🎉"
                : "Vas increíble. Un paso a la vez — así se reconstruye una mamá fuerte."}
          </p>
        </section>

        {/* Nota médica */}
        <aside className="mt-8 border-2 border-[color:var(--ink)]/25 border-l-[6px] border-l-[color:var(--grape)] bg-[color:var(--paper-deep)]/60 p-5">
          <p className="font-meta text-[9px] text-[color:var(--grape)] md:text-[10px]">
            Nota importante — léela antes de empezar
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            {disclaimer}
          </p>
        </aside>

        {/* Fases como capítulos */}
        {phases.map((phase) => {
          const phaseLessons = lessons.filter((l) => l.phase === phase.id);
          return (
            <section key={phase.id} className="mt-16 md:mt-20">
              <div className="flex items-end gap-4 md:gap-6">
                <span
                  className="outline-numeral text-7xl md:text-8xl"
                  aria-hidden
                >
                  {String(phase.id).padStart(2, "0")}
                </span>
                <div className="pb-1">
                  <p className="font-meta text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                    Fase {phase.id} · {phase.weeks}
                  </p>
                  <h2 className="mt-1 text-3xl md:text-5xl">
                    <em
                      className="pr-1"
                      style={{
                        backgroundImage: `linear-gradient(to top, transparent 6%, ${PHASE_TINT[phase.color]} 6%, ${PHASE_TINT[phase.color]} 40%, transparent 40%)`,
                      }}
                    >
                      {phase.name}
                    </em>
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-xl text-sm text-[color:var(--ink-soft)] md:text-base">
                {phase.subtitle}
              </p>
              <div className="mt-6 border-t-2 border-[color:var(--ink)]">
                {phaseLessons.map((lesson) => (
                  <IndexRow
                    key={lesson.id}
                    lesson={lesson}
                    completed={completed.includes(lesson.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Biblioteca de guías */}
        <section className="mt-16 md:mt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl md:text-5xl">
              Tu <em className="marker-lilac pr-1">biblioteca</em>
            </h2>
            <p className="font-meta hidden pb-2 text-[10px] text-[color:var(--ink-soft)] md:block">
              7 guías · tuyas para siempre
            </p>
          </div>
          <p className="mt-3 max-w-xl text-sm text-[color:var(--ink-soft)] md:text-base">
            Descárgalas, imprímelas, pégalas en la nevera.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-7">
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
                <h3 className="mt-4 text-base leading-snug md:text-lg">
                  {guide.title}
                </h3>
                <p className="font-meta mt-1 text-[9px] text-[color:var(--grape)] group-hover:underline md:text-[10px]">
                  Descargar PDF ↓
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Pie */}
        <footer className="mt-20">
          <div className="rule-double" />
          <div className="flex flex-wrap items-center justify-between gap-3 py-5">
            <p className="font-meta text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
              Gabifit · Programa Post-Parto · 8 semanas
            </p>
            <p className="font-hand -rotate-1 text-2xl text-[color:var(--grape)]">
              hecho con amor para ti ♡
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
