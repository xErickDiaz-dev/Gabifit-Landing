"use client";

import { useMemo, useState } from "react";
import {
  lastNDates,
  taskAdherence,
  weightDelta,
  latestWeight,
  assetSrc,
  type Routine,
  type MealPlan,
  type ClientTask,
  type ProgressEntry,
} from "@/lib/coaching";
import WeightChart from "./WeightChart";
import { resizeImage } from "./resizeImage";

type Tab = "inicio" | "rutina" | "comidas" | "tareas" | "progreso";

const tabs: { id: Tab; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "rutina", label: "Rutina" },
  { id: "comidas", label: "Comidas" },
  { id: "tareas", label: "Tareas" },
  { id: "progreso", label: "Progreso" },
];

export default function CoachingPortal({
  clientName,
  routine,
  mealPlan,
  tasks: initialTasks,
  progress: initialProgress,
  workoutLog: initialLog,
  today,
  announcement,
}: {
  clientName: string;
  routine: Routine | null;
  mealPlan: MealPlan | null;
  tasks: ClientTask[];
  progress: ProgressEntry[];
  workoutLog: { date: string; dayLabel: string }[];
  today: string;
  announcement: string | null;
}) {
  const [tab, setTab] = useState<Tab>("inicio");
  const [tasks, setTasks] = useState<ClientTask[]>(initialTasks);
  const [progress, setProgress] = useState<ProgressEntry[]>(initialProgress);
  const [log, setLog] = useState(initialLog);

  const week = useMemo(() => lastNDates(today, 7), [today]);
  const adherence = taskAdherence(tasks, today);
  const points = progress
    .filter((e) => typeof e.weight === "number")
    .map((e) => ({ date: e.date, weight: e.weight as number }));
  const delta = weightDelta(progress, null);
  const workoutsThisWeek = log.filter((w) => week.includes(w.date)).length;

  async function toggleTask(taskId: string, done: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completions: done
                ? [...t.completions, today]
                : t.completions.filter((d) => d !== today),
            }
          : t
      )
    );
    await fetch("/api/coaching/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, date: today, done }),
    }).catch(() => {});
  }

  async function markWorkout(dayLabel: string) {
    if (log.some((w) => w.date === today && w.dayLabel === dayLabel)) return;
    setLog((prev) => [...prev, { date: today, dayLabel }]);
    await fetch("/api/coaching/workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayLabel }),
    }).catch(() => {});
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <header className="flex items-center justify-between">
        <p className="font-meta text-[10px] text-[color:var(--grape)]">Coaching 1:1 · Gabifit</p>
        <a href="/masterclass" className="font-meta text-[10px] text-[color:var(--ink-soft)] hover:text-[color:var(--grape)]">
          Masterclass →
        </a>
      </header>
      <h1 className="mt-4 text-4xl md:text-6xl">
        Hola, <em className="marker pr-1">{clientName}</em>
      </h1>
      <p className="font-hand mt-2 text-2xl text-[color:var(--grape)]">vamos por tu mejor versión ♡</p>

      {announcement && (
        <div className="plate-lilac mt-5 bg-[color:var(--paper)] p-4">
          <p className="font-meta text-[10px] text-[color:var(--grape)]">Mensaje de Gabi 💜</p>
          <p className="mt-1 text-base leading-snug">{announcement}</p>
        </div>
      )}

      {/* Tabs */}
      <nav className="mt-7 flex flex-wrap gap-2 border-b-2 border-[color:var(--ink)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-meta text-[11px] ${
              tab === t.id
                ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                : "text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "inicio" && (
          <Overview
            adherence={adherence}
            delta={delta}
            latest={latestWeight(progress)}
            workouts={workoutsThisWeek}
            routineName={routine?.name ?? null}
            mealName={mealPlan?.name ?? null}
            onGo={setTab}
          />
        )}
        {tab === "rutina" && <RoutineView routine={routine} today={today} log={log} onWorkout={markWorkout} />}
        {tab === "comidas" && <MealView plan={mealPlan} />}
        {tab === "tareas" && <TasksView tasks={tasks} week={week} today={today} onToggle={toggleTask} />}
        {tab === "progreso" && (
          <ProgressTab points={points} progress={progress} onAdded={(e) => setProgress((p) => [...p, e])} today={today} />
        )}
      </div>
    </main>
  );
}

// ---------- Ring ----------
function Ring({ pct, big, small }: { pct: number; big: string; small: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--paper-deep)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--neon)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(pct, 100) / 100)}
        />
      </svg>
      <div>
        <p className="text-2xl">{big}</p>
        <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">{small}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`${accent ? "plate-neon" : "plate"} bg-[color:var(--paper)] p-4`}>
      <p className="text-3xl md:text-4xl">{value}</p>
      <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">{label}</p>
    </div>
  );
}

// ---------- Inicio ----------
function Overview({
  adherence,
  delta,
  latest,
  workouts,
  routineName,
  mealName,
  onGo,
}: {
  adherence: number;
  delta: number | null;
  latest: number | null;
  workouts: number;
  routineName: string | null;
  mealName: string | null;
  onGo: (t: Tab) => void;
}) {
  return (
    <div>
      <div className="plate bg-[color:var(--paper)] p-5">
        <p className="font-meta text-[10px] text-[color:var(--grape)]">Tu semana</p>
        <div className="mt-4">
          <Ring pct={adherence} big={`${adherence}%`} small="cumplimiento de hábitos (7 días)" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard value={latest !== null ? `${latest}` : "—"} label="peso actual (kg)" />
        <StatCard
          value={delta !== null ? `${delta > 0 ? "+" : ""}${delta}` : "—"}
          label="cambio de peso (kg)"
          accent={delta !== null && delta < 0}
        />
        <StatCard value={`${workouts}`} label="entrenos esta semana" />
      </div>

      <div className="mt-8 space-y-3">
        <button onClick={() => onGo("rutina")} className="index-row flex w-full items-center justify-between border-b border-[color:var(--ink)]/15 px-1 py-4 text-left">
          <span>
            <span className="font-meta block text-[10px] text-[color:var(--grape)]">Hoy entrenas</span>
            <span className="text-xl">{routineName ?? "Tu rutina te espera"}</span>
          </span>
          <span className="font-meta text-[10px] text-[color:var(--grape)]">Ver →</span>
        </button>
        <button onClick={() => onGo("comidas")} className="index-row flex w-full items-center justify-between border-b border-[color:var(--ink)]/15 px-1 py-4 text-left">
          <span>
            <span className="font-meta block text-[10px] text-[color:var(--grape)]">Tu plan</span>
            <span className="text-xl">{mealName ?? "Tu plan de comidas"}</span>
          </span>
          <span className="font-meta text-[10px] text-[color:var(--grape)]">Ver →</span>
        </button>
        <button onClick={() => onGo("progreso")} className="index-row flex w-full items-center justify-between border-b border-[color:var(--ink)]/15 px-1 py-4 text-left">
          <span>
            <span className="font-meta block text-[10px] text-[color:var(--grape)]">Cada semana</span>
            <span className="text-xl">Registra tu progreso</span>
          </span>
          <span className="font-meta text-[10px] text-[color:var(--grape)]">Ver →</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Rutina ----------
function RoutineView({
  routine,
  today,
  log,
  onWorkout,
}: {
  routine: Routine | null;
  today: string;
  log: { date: string; dayLabel: string }[];
  onWorkout: (dayLabel: string) => void;
}) {
  if (!routine || routine.days.length === 0) {
    return <Empty text="Gabi está preparando tu rutina. ¡Pronto la verás aquí!" />;
  }
  return (
    <div>
      <h2 className="text-2xl md:text-3xl">{routine.name || "Tu rutina"}</h2>
      {routine.note && <p className="mt-2 text-[color:var(--ink-soft)]">{routine.note}</p>}
      <div className="mt-6 space-y-6">
        {routine.days.map((day, di) => {
          const doneToday = log.some((w) => w.date === today && w.dayLabel === (day.label || `Día ${di + 1}`));
          return (
            <div key={di} className="plate bg-[color:var(--paper)] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl">
                  {day.label || `Día ${di + 1}`}
                  {day.focus && <span className="font-meta ml-2 text-[10px] text-[color:var(--grape)]">{day.focus}</span>}
                </h3>
              </div>
              <ul className="mt-4 space-y-3">
                {day.exercises.map((ex, ei) => (
                  <li key={ei} className="flex gap-3 border-t border-[color:var(--ink)]/15 pt-3">
                    {ex.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={assetSrc(ex.imageUrl)}
                        alt={ex.name}
                        className="h-16 w-16 shrink-0 border-2 border-[color:var(--ink)] object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-lg">{ex.name}</p>
                        <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">
                          {[ex.sets && `${ex.sets}`, ex.reps && `${ex.reps}`, ex.rest && `desc. ${ex.rest}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      {ex.notes && <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{ex.notes}</p>}
                      {ex.videoUrl && (
                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="font-meta mt-1 inline-block text-[10px] text-[color:var(--grape)] underline">
                          Ver demo ▶
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onWorkout(day.label || `Día ${di + 1}`)}
                disabled={doneToday}
                className={`mt-5 ${doneToday ? "border-2 border-[color:var(--grape)] px-4 py-2 font-meta text-[11px] text-[color:var(--grape)]" : "btn-ink"}`}
              >
                {doneToday ? "✓ Entrenado hoy" : "Marcar entrenado hoy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Comidas ----------
function MealView({ plan }: { plan: MealPlan | null }) {
  if (!plan || plan.meals.length === 0) {
    return <Empty text="Gabi está armando tu plan de comidas. ¡Pronto lo verás aquí!" />;
  }
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl md:text-3xl">{plan.name || "Tu plan de comidas"}</h2>
        {plan.kcalTarget && (
          <span className="stamp">{plan.kcalTarget} kcal/día</span>
        )}
      </div>
      {plan.note && <p className="mt-2 text-[color:var(--ink-soft)]">{plan.note}</p>}
      <div className="mt-6 space-y-5">
        {plan.meals.map((meal, mi) => (
          <div key={mi} className="plate-lilac bg-[color:var(--paper)] p-5">
            <h3 className="text-xl">
              {meal.label || "Comida"}
              {meal.time && <span className="font-meta ml-2 text-[10px] text-[color:var(--ink-soft)]">{meal.time}</span>}
            </h3>
            <ul className="mt-3 space-y-1">
              {meal.items.map((it, ii) => (
                <li key={ii} className="flex items-baseline justify-between gap-3 border-b border-[color:var(--ink)]/10 py-1">
                  <span>
                    {it.food} {it.qty && <span className="text-[color:var(--ink-soft)]">· {it.qty}</span>}
                  </span>
                  {it.kcal !== null && <span className="font-meta text-[10px] text-[color:var(--ink-soft)]">{it.kcal} kcal</span>}
                </li>
              ))}
            </ul>
            {meal.note && <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{meal.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Tareas ----------
function TasksView({
  tasks,
  week,
  today,
  onToggle,
}: {
  tasks: ClientTask[];
  week: string[];
  today: string;
  onToggle: (taskId: string, done: boolean) => void;
}) {
  if (tasks.length === 0) {
    return <Empty text="Aún no tienes hábitos asignados. Gabi los agregará pronto." />;
  }
  const weekAsc = [...week].reverse();
  return (
    <div>
      <h2 className="text-2xl md:text-3xl">Tus <em className="marker pr-1">hábitos</em></h2>
      <p className="mt-2 text-[color:var(--ink-soft)]">Marca lo que cumpliste hoy. La constancia es lo que cambia todo.</p>
      <div className="mt-6 space-y-4">
        {tasks.map((t) => {
          const doneToday = t.completions.includes(today);
          return (
            <div key={t.id} className="plate bg-[color:var(--paper)] p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(t.id, !doneToday)}
                  aria-pressed={doneToday}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[color:var(--ink)] text-lg ${
                    doneToday ? "bg-[color:var(--neon)]" : "bg-transparent"
                  }`}
                >
                  {doneToday ? "✓" : ""}
                </button>
                <div className="flex-1">
                  <p className="text-lg leading-snug">{t.title}</p>
                  <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">{t.cadence}</p>
                </div>
              </div>
              {/* Racha 7 días */}
              <div className="mt-3 flex gap-1.5">
                {weekAsc.map((d) => (
                  <span
                    key={d}
                    title={d}
                    className={`h-4 flex-1 rounded-sm ${
                      t.completions.includes(d) ? "bg-[color:var(--neon)]" : "bg-[color:var(--paper-deep)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Progreso ----------
function ProgressTab({
  points,
  progress,
  onAdded,
  today,
}: {
  points: { date: string; weight: number }[];
  progress: ProgressEntry[];
  onAdded: (e: ProgressEntry) => void;
  today: string;
}) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    const urls: string[] = [];
    for (const f of files) {
      try {
        urls.push(await resizeImage(f));
      } catch {
        /* ignora archivos no válidos */
      }
    }
    setPhotos(urls);
  }

  async function submit() {
    setBusy(true);
    const res = await fetch("/api/coaching/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, weight, waist, hips, note, photos }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      onAdded({
        id: data.entryId ?? `tmp-${today}`,
        date: today,
        weight: weight ? parseFloat(weight) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        note,
        photoPaths: data.photoPaths ?? [],
      });
      setWeight("");
      setWaist("");
      setHips("");
      setNote("");
      setPhotos([]);
    }
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl">Tu <em className="marker pr-1">progreso</em></h2>
      <div className="mt-5 plate bg-[color:var(--paper)] p-4">
        <WeightChart points={points} />
      </div>

      {/* Registrar */}
      <div className="plate-neon mt-6 bg-[color:var(--paper)] p-5">
        <p className="font-meta text-[10px] text-[color:var(--grape)]">Registrar de hoy</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <input className="input-line" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="peso kg" />
          <input className="input-line" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="cintura cm" />
          <input className="input-line" type="number" value={hips} onChange={(e) => setHips(e.target.value)} placeholder="cadera cm" />
        </div>
        <textarea
          className="mt-3 w-full border-2 border-[color:var(--ink)] bg-transparent p-3 text-sm"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿Cómo te sentiste esta semana?"
        />
        <label className="font-meta mt-3 block text-[10px] text-[color:var(--ink-soft)]">
          Fotos (hasta 3)
          <input type="file" accept="image/*" multiple onChange={onFiles} className="mt-2 block text-xs" />
        </label>
        {photos.length > 0 && (
          <div className="mt-3 flex gap-2">
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p} alt="" className="h-20 w-auto border-2 border-[color:var(--ink)] object-cover" />
            ))}
          </div>
        )}
        <button onClick={submit} disabled={busy} className="btn-ink mt-4 disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar progreso"}
        </button>
      </div>

      {/* Historial */}
      <div className="mt-8 space-y-4">
        {[...progress].reverse().map((e) => (
          <div key={e.id} className="border-b border-[color:var(--ink)]/15 pb-4">
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="font-meta text-[10px] text-[color:var(--grape)]">{e.date}</p>
              {e.weight !== null && <p className="text-lg">{e.weight} kg</p>}
              {e.waist !== null && <p className="text-sm text-[color:var(--ink-soft)]">cintura {e.waist}</p>}
              {e.hips !== null && <p className="text-sm text-[color:var(--ink-soft)]">cadera {e.hips}</p>}
            </div>
            {e.note && <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{e.note}</p>}
            {e.photoPaths.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {e.photoPaths.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p}
                    src={`/api/coaching/photo?path=${encodeURIComponent(p)}`}
                    alt="Progreso"
                    className="h-32 w-auto border-2 border-[color:var(--ink)] object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="plate-lilac flex flex-col items-center justify-center gap-4 bg-[color:var(--paper-deep)]/60 p-8 text-center">
      <span className="stamp">Pronto</span>
      <p className="font-hand text-3xl text-[color:var(--grape)]">{text}</p>
    </div>
  );
}
