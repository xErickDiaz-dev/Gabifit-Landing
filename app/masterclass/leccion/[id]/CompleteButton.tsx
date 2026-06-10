"use client";

import { useProgress } from "../../progress";

export default function CompleteButton({ lessonId }: { lessonId: number }) {
  const { completed, toggle, loaded } = useProgress();
  const done = completed.includes(lessonId);

  if (!loaded) return null;

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={() => toggle(lessonId)}
        className={`border-4 px-5 py-3 font-heading text-base font-black uppercase transition-transform hover:-translate-y-0.5 md:text-lg ${
          done
            ? "border-brand-neon bg-black text-brand-neon"
            : "border-black bg-brand-neon text-black shadow-[6px_6px_0px_#ffffff]"
        }`}
      >
        {done ? "✓ Lección completada" : "Marcar como completada"}
      </button>
      {done && (
        <p className="text-sm text-brand-purple">
          ¡Eso es! Un paso más cerca de la mamá fuerte que estás construyendo. 💜
        </p>
      )}
    </div>
  );
}
