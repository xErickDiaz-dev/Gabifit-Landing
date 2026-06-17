import Image from "next/image";
import { LOGO_INK } from "./branding";
import type { ClientLesson, Guide, Phase } from "./lessons";

const PHASE_TINT: Record<Phase["color"], string> = {
  neon: "var(--neon)",
  purple: "var(--lilac)",
  white: "var(--paper-deep)",
};

export default function PendingPreview({
  phases,
  lessons,
  guides,
  email,
}: {
  phases: Phase[];
  lessons: ClientLesson[];
  guides: Guide[];
  email: string;
}) {
  return (
    <main className="pb-24">
      <header className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-8">
        <div className="flex items-center justify-between pb-3">
          <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">Solicitud en revisión</p>
        </div>
        <div className="rule-double" />
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
        {/* Banner de espera */}
        <section className="plate-lilac mt-10 bg-[color:var(--paper)] p-6 text-center md:p-10">
          <span className="stamp">En revisión</span>
          <h1 className="mt-5 text-4xl md:text-6xl">
            Tu solicitud está <em className="marker pr-2">en revisión</em> 💜
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
            Gracias por unirte, mamá. Gabi va a revisar tu solicitud ({email}) y te
            avisará en cuanto tu acceso esté listo. Mientras tanto, este es el
            programa completo que te espera:
          </p>
        </section>

        {/* Adelanto de las fases (sin enlaces, todo "Pronto") */}
        {phases.map((phase) => {
          const phaseLessons = lessons.filter((l) => l.phase === phase.id);
          return (
            <section key={phase.id} className="mt-16 md:mt-20">
              <div className="flex items-end gap-4 md:gap-6">
                <span className="outline-numeral text-7xl md:text-8xl" aria-hidden>
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
              <p className="mt-3 max-w-xl text-sm text-[color:var(--ink-soft)] md:text-base">{phase.subtitle}</p>
              <div className="mt-6 border-t-2 border-[color:var(--ink)]">
                {phaseLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-baseline gap-3 border-b border-[color:var(--ink)]/15 px-2 py-4 md:gap-4 md:px-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 translate-y-1 items-center justify-center rounded-full border-2 border-[color:var(--ink)]/40 font-meta text-[11px] text-[color:var(--ink-soft)]">
                      {String(lesson.id).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg leading-snug md:text-xl">{lesson.title}</span>
                      <span className="font-meta mt-1 block text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                        {lesson.week}
                      </span>
                    </span>
                    <span className="ml-auto shrink-0">
                      <span className="stamp">Pronto</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Adelanto de la biblioteca (portadas sin descarga) */}
        <section className="mt-16 md:mt-20">
          <h2 className="text-4xl md:text-5xl">
            Tu <em className="marker-lilac pr-1">biblioteca</em>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[color:var(--ink-soft)] md:text-base">
            7 guías que se desbloquean cuando Gabi active tu acceso.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-7">
            {guides.map((guide, i) => (
              <div key={guide.slug} className="block">
                <div className="shelf-cover opacity-70" style={{ transform: `rotate(${i % 2 === 0 ? -1.2 : 1.4}deg)` }}>
                  <Image src={guide.cover} alt={`Portada: ${guide.title}`} width={560} height={792} className="block h-auto w-full" />
                </div>
                <h3 className="mt-4 text-base leading-snug md:text-lg">{guide.title}</h3>
                <p className="font-meta mt-1 text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">Disponible al activar</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20">
          <div className="rule-double" />
          <p className="font-meta py-5 text-center text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
            Gabifit · Programa Post-Parto · 8 semanas
          </p>
        </footer>
      </div>
    </main>
  );
}
