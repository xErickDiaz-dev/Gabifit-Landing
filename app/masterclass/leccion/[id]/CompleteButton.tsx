"use client";

import { useProgress } from "../../progress";

export default function CompleteButton({ lessonId }: { lessonId: number }) {
  const { completed, toggle, loaded } = useProgress();
  const done = completed.includes(lessonId);

  if (!loaded) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        onClick={() => toggle(lessonId)}
        aria-pressed={done}
        className="group flex items-center gap-3 text-left"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[color:var(--ink)] text-lg transition-colors ${
            done
              ? "bg-[color:var(--neon)]"
              : "bg-transparent group-hover:bg-[color:var(--paper-deep)]"
          }`}
        >
          {done ? "✓" : ""}
        </span>
        <span className="text-lg md:text-xl">
          {done ? "Lección completada" : "Marcar lección como completada"}
        </span>
      </button>
      {done && (
        <p className="font-hand -rotate-1 text-2xl text-[color:var(--grape)]">
          ¡eso es, mami! un paso más ♡
        </p>
      )}
    </div>
  );
}
