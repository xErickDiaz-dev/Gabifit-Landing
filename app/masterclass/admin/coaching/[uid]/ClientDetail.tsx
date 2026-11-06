"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CoachingClientDetail } from "@/lib/coaching-db";
import {
  EMPTY_PROFILE,
  emptyRoutine,
  emptyRoutineDay,
  emptyExercise,
  emptyMealPlan,
  emptyMeal,
  emptyMealItem,
  instantiateRoutine,
  instantiateMealPlan,
  libraryToExercise,
  assetSrc,
  waLink,
  CLIENT_TYPES,
  CLIENT_TYPE_LABEL,
  type CoachingProfile,
  type Routine,
  type MealPlan,
  type ClientTask,
  type RoutineTemplate,
  type MealPlanTemplate,
  type TaskTemplate,
  type LibraryExercise,
  type ClientType,
} from "@/lib/coaching";
import WeightChart from "../../../../coaching/WeightChart";

type Tab = "perfil" | "rutina" | "comidas" | "tareas" | "progreso";

async function post(payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/admin/coaching", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

const labelCls = "font-meta block text-[10px] text-[color:var(--ink-soft)]";
const tabs: { id: Tab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "rutina", label: "Rutina" },
  { id: "comidas", label: "Comidas" },
  { id: "tareas", label: "Tareas" },
  { id: "progreso", label: "Progreso" },
];

export default function ClientDetail({
  detail,
  routineTemplates,
  mealPlanTemplates,
  taskTemplates,
  library,
}: {
  detail: CoachingClientDetail;
  routineTemplates: RoutineTemplate[];
  mealPlanTemplates: MealPlanTemplate[];
  taskTemplates: TaskTemplate[];
  library: LibraryExercise[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("perfil");

  const wa = waLink(detail.whatsapp, `¡Hola ${detail.fullName?.split(" ")[0] ?? ""}! Soy Gabi 💜`);

  return (
    <main className="max-w-4xl">
      <Link
        href="/masterclass/admin/coaching"
        className="font-meta text-[10px] text-[color:var(--ink-soft)] hover:text-[color:var(--grape)]"
      >
        ← Todas las clientas
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl">{detail.fullName ?? detail.email}</h1>
          <p className="font-meta mt-2 text-[11px] text-[color:var(--ink-soft)]">
            {detail.email}
            {detail.whatsapp ? ` · ${detail.whatsapp}` : ""} ·{" "}
            <span className="text-[color:var(--grape)]">{CLIENT_TYPE_LABEL[detail.clientType]}</span> ·{" "}
            <span className={detail.status === "active" ? "text-[color:var(--grape)]" : ""}>
              coaching {detail.status === "active" ? "activo" : "sin acceso"}
            </span>
          </p>
        </div>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ink shrink-0">
            WhatsApp →
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b-2 border-[color:var(--ink)]">
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
      </div>

      <div className="mt-8">
        {tab === "perfil" && (
          <ProfileEditor
            uid={detail.uid}
            status={detail.status}
            initial={detail.profile}
            initialWhatsapp={detail.whatsapp}
            initialClientType={detail.clientType}
            onSaved={() => router.refresh()}
          />
        )}
        {tab === "rutina" && (
          <RoutineEditor
            uid={detail.uid}
            initial={detail.routine}
            templates={routineTemplates}
            library={library}
            onSaved={() => router.refresh()}
          />
        )}
        {tab === "comidas" && (
          <MealPlanEditor
            uid={detail.uid}
            initial={detail.mealPlan}
            templates={mealPlanTemplates}
            onSaved={() => router.refresh()}
          />
        )}
        {tab === "tareas" && (
          <TasksEditor
            uid={detail.uid}
            initial={detail.tasks}
            templates={taskTemplates}
            onSaved={() => router.refresh()}
          />
        )}
        {tab === "progreso" && <ProgressView detail={detail} />}
      </div>
    </main>
  );
}

function SaveBar({ busy, saved, onSave }: { busy: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="mt-8 flex items-center gap-4">
      <button onClick={onSave} disabled={busy} className="btn-ink disabled:opacity-60">
        {busy ? "Guardando…" : "Guardar"}
      </button>
      {saved && (
        <span className="font-hand -rotate-1 text-xl text-[color:var(--grape)]">¡guardado! ♡</span>
      )}
    </div>
  );
}

// ============================================================ Perfil
function ProfileEditor({
  uid,
  status,
  initial,
  initialWhatsapp,
  initialClientType,
  onSaved,
}: {
  uid: string;
  status: string | null;
  initial: CoachingProfile;
  initialWhatsapp: string | null;
  initialClientType: ClientType;
  onSaved: () => void;
}) {
  const [p, setP] = useState<CoachingProfile>({ ...EMPTY_PROFILE, ...initial });
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? "");
  const [clientType, setClientType] = useState<ClientType>(initialClientType);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function num(v: string): number | null {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  async function save() {
    setBusy(true);
    setSaved(false);
    const ok = await post({ action: "saveProfile", uid, profile: p, whatsapp, clientType });
    setBusy(false);
    if (ok) {
      setSaved(true);
      onSaved();
    }
  }

  async function toggleAccess() {
    const next = status === "active" ? "revoked" : "active";
    setBusy(true);
    await post({ action: "setStatus", uid, status: next });
    setBusy(false);
    onSaved();
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={labelCls}>WhatsApp (con código de país)</span>
          <input
            className="input-line mt-2"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+1 809 000 0000"
          />
        </label>
        <label>
          <span className={labelCls}>Tipo de clienta</span>
          <select
            value={clientType}
            onChange={(e) => setClientType(e.target.value as ClientType)}
            className="mt-2 w-full border-2 border-[color:var(--ink)] bg-transparent p-2 font-meta text-[11px]"
          >
            {CLIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CLIENT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelCls}>Objetivo principal</span>
          <input
            className="input-line mt-2"
            value={p.goal}
            onChange={(e) => setP({ ...p, goal: e.target.value })}
            placeholder="Bajar grasa, recuperar fuerza…"
          />
        </label>
        <label>
          <span className={labelCls}>Altura (cm)</span>
          <input
            className="input-line mt-2"
            type="number"
            value={p.heightCm ?? ""}
            onChange={(e) => setP({ ...p, heightCm: num(e.target.value) })}
          />
        </label>
        <label>
          <span className={labelCls}>Peso inicial (kg)</span>
          <input
            className="input-line mt-2"
            type="number"
            value={p.startWeight ?? ""}
            onChange={(e) => setP({ ...p, startWeight: num(e.target.value) })}
          />
        </label>
        <label>
          <span className={labelCls}>Meta de peso (kg)</span>
          <input
            className="input-line mt-2"
            type="number"
            value={p.targetWeight ?? ""}
            onChange={(e) => setP({ ...p, targetWeight: num(e.target.value) })}
          />
        </label>
      </div>
      <label className="mt-5 block">
        <span className={labelCls}>Lesiones / consideraciones médicas</span>
        <textarea
          className="mt-2 w-full border-2 border-[color:var(--ink)] bg-transparent p-3 text-sm"
          rows={2}
          value={p.injuries}
          onChange={(e) => setP({ ...p, injuries: e.target.value })}
        />
      </label>
      <label className="mt-5 block">
        <span className={labelCls}>Notas internas (solo tú las ves)</span>
        <textarea
          className="mt-2 w-full border-2 border-[color:var(--ink)] bg-transparent p-3 text-sm"
          rows={3}
          value={p.notes}
          onChange={(e) => setP({ ...p, notes: e.target.value })}
        />
      </label>

      <SaveBar busy={busy} saved={saved} onSave={save} />

      <div className="mt-10 border-t border-[color:var(--ink)]/15 pt-6">
        <button
          onClick={toggleAccess}
          disabled={busy}
          className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px] text-[color:var(--ink-soft)] disabled:opacity-60"
        >
          {status === "active" ? "Quitar acceso al coaching" : "Reactivar acceso al coaching"}
        </button>
      </div>
    </div>
  );
}

// ============================================================ Rutina
function RoutineEditor({
  uid,
  initial,
  templates,
  library,
  onSaved,
}: {
  uid: string;
  initial: Routine | null;
  templates: RoutineTemplate[];
  library: LibraryExercise[];
  onSaved: () => void;
}) {
  const [r, setR] = useState<Routine>(initial ?? emptyRoutine());
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function mutate(fn: (draft: Routine) => void) {
    setR((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  function loadTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (t) setR(instantiateRoutine(t));
  }

  function addFromLibrary(di: number, libId: string) {
    const lib = library.find((x) => x.id === libId);
    if (lib) mutate((d) => d.days[di].exercises.push(libraryToExercise(lib)));
  }

  async function save() {
    setBusy(true);
    setSaved(false);
    const ok = await post({ action: "saveRoutine", uid, routine: r });
    setBusy(false);
    if (ok) {
      setSaved(true);
      onSaved();
    }
  }

  return (
    <div>
      <TemplatePicker templates={templates} onPick={loadTemplate} label="rutina" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Nombre de la rutina</span>
          <input
            className="input-line mt-2"
            value={r.name}
            onChange={(e) => mutate((d) => (d.name = e.target.value))}
            placeholder="Fase 1 · Reset"
          />
        </label>
        <label>
          <span className={labelCls}>Nota para la clienta</span>
          <input
            className="input-line mt-2"
            value={r.note}
            onChange={(e) => mutate((d) => (d.note = e.target.value))}
            placeholder="3 días, descansa 48h entre piernas"
          />
        </label>
      </div>

      {r.days.map((day, di) => (
        <div key={di} className="plate mt-6 bg-[color:var(--paper)] p-4 md:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1">
              <span className={labelCls}>Día</span>
              <input
                className="input-line mt-2"
                value={day.label}
                onChange={(e) => mutate((d) => (d.days[di].label = e.target.value))}
                placeholder="Día 1"
              />
            </label>
            <label className="flex-1">
              <span className={labelCls}>Enfoque</span>
              <input
                className="input-line mt-2"
                value={day.focus}
                onChange={(e) => mutate((d) => (d.days[di].focus = e.target.value))}
                placeholder="Tren inferior"
              />
            </label>
            <button
              onClick={() => mutate((d) => d.days.splice(di, 1))}
              className="font-meta text-[10px] text-[color:var(--grape)]"
            >
              Quitar día
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {day.exercises.map((ex, ei) => (
              <div key={ei} className="flex items-start gap-3 border-t border-[color:var(--ink)]/15 pt-3">
                {ex.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={assetSrc(ex.imageUrl)}
                    alt=""
                    className="h-12 w-12 shrink-0 border border-[color:var(--ink)] object-cover"
                  />
                )}
                <div className="grid flex-1 gap-2 sm:grid-cols-12">
                  <input
                    className="input-line sm:col-span-4"
                    value={ex.name}
                    onChange={(e) => mutate((d) => (d.days[di].exercises[ei].name = e.target.value))}
                    placeholder="Sentadilla"
                  />
                  <input
                    className="input-line sm:col-span-1"
                    value={ex.sets}
                    onChange={(e) => mutate((d) => (d.days[di].exercises[ei].sets = e.target.value))}
                    placeholder="4x"
                  />
                  <input
                    className="input-line sm:col-span-2"
                    value={ex.reps}
                    onChange={(e) => mutate((d) => (d.days[di].exercises[ei].reps = e.target.value))}
                    placeholder="12 reps"
                  />
                  <input
                    className="input-line sm:col-span-2"
                    value={ex.rest}
                    onChange={(e) => mutate((d) => (d.days[di].exercises[ei].rest = e.target.value))}
                    placeholder="60s"
                  />
                  <input
                    className="input-line sm:col-span-2"
                    value={ex.videoUrl}
                    onChange={(e) => mutate((d) => (d.days[di].exercises[ei].videoUrl = e.target.value))}
                    placeholder="video URL"
                  />
                  <button
                    onClick={() => mutate((d) => d.days[di].exercises.splice(ei, 1))}
                    className="font-meta text-[14px] text-[color:var(--grape)] sm:col-span-1"
                    aria-label="Quitar ejercicio"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => mutate((d) => d.days[di].exercises.push(emptyExercise()))}
                className="font-meta text-[10px] text-[color:var(--grape)]"
              >
                + Ejercicio en blanco
              </button>
              {library.length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) addFromLibrary(di, e.target.value);
                    e.target.value = "";
                  }}
                  className="border-2 border-[color:var(--ink)] bg-transparent p-1.5 font-meta text-[10px]"
                >
                  <option value="">+ Desde librería…</option>
                  {library.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => mutate((d) => d.days.push(emptyRoutineDay()))}
        className="font-meta mt-6 block text-[11px] text-[color:var(--grape)]"
      >
        + Añadir día
      </button>

      <SaveBar busy={busy} saved={saved} onSave={save} />
    </div>
  );
}

// ============================================================ Comidas
function MealPlanEditor({
  uid,
  initial,
  templates,
  onSaved,
}: {
  uid: string;
  initial: MealPlan | null;
  templates: MealPlanTemplate[];
  onSaved: () => void;
}) {
  const [m, setM] = useState<MealPlan>(initial ?? emptyMealPlan());
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function mutate(fn: (draft: MealPlan) => void) {
    setM((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }
  function loadTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (t) setM(instantiateMealPlan(t));
  }
  async function save() {
    setBusy(true);
    setSaved(false);
    const ok = await post({ action: "saveMealPlan", uid, mealPlan: m });
    setBusy(false);
    if (ok) {
      setSaved(true);
      onSaved();
    }
  }

  return (
    <div>
      <TemplatePicker templates={templates} onPick={loadTemplate} label="plan" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Nombre del plan</span>
          <input
            className="input-line mt-2"
            value={m.name}
            onChange={(e) => mutate((d) => (d.name = e.target.value))}
            placeholder="1800 kcal · alto en proteína"
          />
        </label>
        <label>
          <span className={labelCls}>Meta de kcal (opcional)</span>
          <input
            className="input-line mt-2"
            type="number"
            value={m.kcalTarget ?? ""}
            onChange={(e) =>
              mutate((d) => (d.kcalTarget = Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : null))
            }
          />
        </label>
      </div>

      {m.meals.map((meal, mi) => (
        <div key={mi} className="plate-lilac mt-6 bg-[color:var(--paper)] p-4 md:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1">
              <span className={labelCls}>Comida</span>
              <input
                className="input-line mt-2"
                value={meal.label}
                onChange={(e) => mutate((d) => (d.meals[mi].label = e.target.value))}
                placeholder="Desayuno"
              />
            </label>
            <label className="w-28">
              <span className={labelCls}>Hora</span>
              <input
                className="input-line mt-2"
                value={meal.time}
                onChange={(e) => mutate((d) => (d.meals[mi].time = e.target.value))}
                placeholder="8:00"
              />
            </label>
            <button
              onClick={() => mutate((d) => d.meals.splice(mi, 1))}
              className="font-meta text-[10px] text-[color:var(--grape)]"
            >
              Quitar
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {meal.items.map((it, ii) => (
              <div key={ii} className="grid gap-2 sm:grid-cols-12">
                <input
                  className="input-line sm:col-span-6"
                  value={it.food}
                  onChange={(e) => mutate((d) => (d.meals[mi].items[ii].food = e.target.value))}
                  placeholder="Avena con fruta"
                />
                <input
                  className="input-line sm:col-span-3"
                  value={it.qty}
                  onChange={(e) => mutate((d) => (d.meals[mi].items[ii].qty = e.target.value))}
                  placeholder="60g"
                />
                <input
                  className="input-line sm:col-span-2"
                  type="number"
                  value={it.kcal ?? ""}
                  onChange={(e) =>
                    mutate((d) => (d.meals[mi].items[ii].kcal = Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : null))
                  }
                  placeholder="kcal"
                />
                <button
                  onClick={() => mutate((d) => d.meals[mi].items.splice(ii, 1))}
                  className="font-meta text-[14px] text-[color:var(--grape)] sm:col-span-1"
                  aria-label="Quitar alimento"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => mutate((d) => d.meals[mi].items.push(emptyMealItem()))}
              className="font-meta mt-2 text-[10px] text-[color:var(--grape)]"
            >
              + Alimento
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => mutate((d) => d.meals.push(emptyMeal()))}
        className="font-meta mt-6 block text-[11px] text-[color:var(--grape)]"
      >
        + Añadir comida
      </button>

      <SaveBar busy={busy} saved={saved} onSave={save} />
    </div>
  );
}

// ============================================================ Tareas
function TasksEditor({
  uid,
  initial,
  templates,
  onSaved,
}: {
  uid: string;
  initial: ClientTask[];
  templates: TaskTemplate[];
  onSaved: () => void;
}) {
  const [tasks, setTasks] = useState<{ id: string; title: string; cadence: string }[]>(
    initial.map((t) => ({ id: t.id, title: t.title, cadence: t.cadence }))
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    const ok = await post({ action: "saveTasks", uid, tasks });
    setBusy(false);
    if (ok) {
      setSaved(true);
      onSaved();
    }
  }

  return (
    <div>
      {templates.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-meta text-[10px] text-[color:var(--ink-soft)]">Añadir de plantilla:</span>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTasks((p) => [...p, { id: "", title: t.title, cadence: t.cadence }])}
              className="border-2 border-[color:var(--ink)] px-3 py-1 font-meta text-[10px]"
            >
              + {t.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2">
        {tasks.map((t, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-12">
            <input
              className="input-line sm:col-span-7"
              value={t.title}
              onChange={(e) =>
                setTasks((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
              }
              placeholder="Beber 2L de agua"
            />
            <input
              className="input-line sm:col-span-4"
              value={t.cadence}
              onChange={(e) =>
                setTasks((p) => p.map((x, j) => (j === i ? { ...x, cadence: e.target.value } : x)))
              }
              placeholder="Diario"
            />
            <button
              onClick={() => setTasks((p) => p.filter((_, j) => j !== i))}
              className="font-meta text-[14px] text-[color:var(--grape)] sm:col-span-1"
              aria-label="Quitar tarea"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setTasks((p) => [...p, { id: "", title: "", cadence: "Diario" }])}
          className="font-meta mt-2 text-[11px] text-[color:var(--grape)]"
        >
          + Añadir tarea
        </button>
      </div>

      <SaveBar busy={busy} saved={saved} onSave={save} />
    </div>
  );
}

// ============================================================ Progreso (lectura)
function ProgressView({ detail }: { detail: CoachingClientDetail }) {
  const points = detail.progress
    .filter((e) => typeof e.weight === "number")
    .map((e) => ({ date: e.date, weight: e.weight as number }));

  return (
    <div>
      <WeightChart points={points} />

      <div className="mt-8 space-y-4">
        {detail.progress.length === 0 && (
          <p className="font-meta text-[11px] text-[color:var(--ink-soft)]">
            Esta clienta aún no registra progreso.
          </p>
        )}
        {[...detail.progress].reverse().map((e) => (
          <div key={e.id} className="border-b border-[color:var(--ink)]/15 pb-4">
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="font-meta text-[10px] text-[color:var(--grape)]">{e.date}</p>
              {e.weight !== null && <p className="text-lg">{e.weight} kg</p>}
              {e.waist !== null && (
                <p className="text-sm text-[color:var(--ink-soft)]">cintura {e.waist} cm</p>
              )}
              {e.hips !== null && (
                <p className="text-sm text-[color:var(--ink-soft)]">cadera {e.hips} cm</p>
              )}
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

// ============================================================ Selector de plantilla
function TemplatePicker({
  templates,
  onPick,
  label,
}: {
  templates: { id: string; name: string }[];
  onPick: (id: string) => void;
  label: string;
}) {
  if (templates.length === 0) {
    return (
      <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">
        No hay plantillas de {label} todavía. Créalas en “Plantillas”.
      </p>
    );
  }
  return (
    <label className="block">
      <span className={labelCls}>Cargar desde plantilla (luego puedes ajustar)</span>
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onPick(e.target.value);
          e.target.value = "";
        }}
        className="mt-2 w-full border-2 border-[color:var(--ink)] bg-transparent p-2 font-meta text-[11px]"
      >
        <option value="">— elegir plantilla —</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name || "(sin nombre)"}
          </option>
        ))}
      </select>
    </label>
  );
}
