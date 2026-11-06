"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  emptyRoutine,
  emptyRoutineDay,
  emptyExercise,
  emptyMealPlan,
  emptyMeal,
  emptyMealItem,
  libraryToExercise,
  assetSrc,
  type RoutineTemplate,
  type MealPlanTemplate,
  type TaskTemplate,
  type Routine,
  type MealPlan,
  type LibraryExercise,
} from "@/lib/coaching";

const labelCls = "font-meta block text-[10px] text-[color:var(--ink-soft)]";

async function post(payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/admin/coaching", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export default function TemplateManager({
  routines,
  meals,
  tasks,
  library,
}: {
  routines: RoutineTemplate[];
  meals: MealPlanTemplate[];
  tasks: TaskTemplate[];
  library: LibraryExercise[];
}) {
  return (
    <div className="space-y-14">
      <RoutineTemplates list={routines} library={library} />
      <MealTemplates list={meals} />
      <TaskTemplates list={tasks} />
    </div>
  );
}

// ---------- Rutinas ----------
function RoutineTemplates({ list, library }: { list: RoutineTemplate[]; library: LibraryExercise[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<RoutineTemplate | null>(null);

  async function del(id: string) {
    await post({ action: "deleteTemplate", kind: "routine", id });
    router.refresh();
  }

  if (editing) {
    return (
      <RoutineTemplateEditor
        initial={editing}
        library={library}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl">Plantillas de rutina</h2>
        <button
          onClick={() => setEditing({ id: "", ...emptyRoutine() })}
          className="btn-ink"
        >
          + Nueva
        </button>
      </div>
      <TemplateList
        items={list.map((t) => ({ id: t.id, name: t.name, sub: `${t.days.length} día(s)` }))}
        onEdit={(id) => setEditing(list.find((t) => t.id === id)!)}
        onDelete={del}
      />
    </section>
  );
}

function RoutineTemplateEditor({
  initial,
  library,
  onClose,
  onSaved,
}: {
  initial: RoutineTemplate;
  library: LibraryExercise[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [r, setR] = useState<Routine & { id: string }>(initial);
  const [busy, setBusy] = useState(false);
  function mutate(fn: (d: Routine & { id: string }) => void) {
    setR((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }
  function addFromLibrary(di: number, libId: string) {
    const lib = library.find((x) => x.id === libId);
    if (lib) mutate((d) => d.days[di].exercises.push(libraryToExercise(lib)));
  }
  async function save() {
    setBusy(true);
    const ok = await post({ action: "saveTemplate", kind: "routine", template: r });
    setBusy(false);
    if (ok) onSaved();
  }
  return (
    <section className="plate bg-[color:var(--paper)] p-5">
      <input
        className="input-line"
        value={r.name}
        onChange={(e) => mutate((d) => (d.name = e.target.value))}
        placeholder="Nombre de la plantilla"
      />
      {r.days.map((day, di) => (
        <div key={di} className="mt-5 border-t border-[color:var(--ink)]/15 pt-4">
          <div className="flex gap-3">
            <input
              className="input-line flex-1"
              value={day.label}
              onChange={(e) => mutate((d) => (d.days[di].label = e.target.value))}
              placeholder="Día 1"
            />
            <input
              className="input-line flex-1"
              value={day.focus}
              onChange={(e) => mutate((d) => (d.days[di].focus = e.target.value))}
              placeholder="Enfoque"
            />
            <button onClick={() => mutate((d) => d.days.splice(di, 1))} className="font-meta text-[10px] text-[color:var(--grape)]">
              ✕
            </button>
          </div>
          {day.exercises.map((ex, ei) => (
            <div key={ei} className="mt-2 flex items-start gap-2">
              {ex.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetSrc(ex.imageUrl)} alt="" className="h-10 w-10 shrink-0 border border-[color:var(--ink)] object-cover" />
              )}
              <div className="grid flex-1 gap-2 sm:grid-cols-12">
                <input className="input-line sm:col-span-5" value={ex.name} onChange={(e) => mutate((d) => (d.days[di].exercises[ei].name = e.target.value))} placeholder="Ejercicio" />
                <input className="input-line sm:col-span-2" value={ex.sets} onChange={(e) => mutate((d) => (d.days[di].exercises[ei].sets = e.target.value))} placeholder="4x" />
                <input className="input-line sm:col-span-2" value={ex.reps} onChange={(e) => mutate((d) => (d.days[di].exercises[ei].reps = e.target.value))} placeholder="12" />
                <input className="input-line sm:col-span-2" value={ex.rest} onChange={(e) => mutate((d) => (d.days[di].exercises[ei].rest = e.target.value))} placeholder="60s" />
                <button onClick={() => mutate((d) => d.days[di].exercises.splice(ei, 1))} className="font-meta text-[14px] text-[color:var(--grape)] sm:col-span-1">✕</button>
              </div>
            </div>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button onClick={() => mutate((d) => d.days[di].exercises.push(emptyExercise()))} className="font-meta text-[10px] text-[color:var(--grape)]">+ Ejercicio en blanco</button>
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
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}
      <button onClick={() => mutate((d) => d.days.push(emptyRoutineDay()))} className="font-meta mt-4 block text-[11px] text-[color:var(--grape)]">+ Día</button>
      <div className="mt-6 flex gap-3">
        <button onClick={save} disabled={busy} className="btn-ink disabled:opacity-60">{busy ? "Guardando…" : "Guardar plantilla"}</button>
        <button onClick={onClose} className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px]">Cancelar</button>
      </div>
    </section>
  );
}

// ---------- Comidas ----------
function MealTemplates({ list }: { list: MealPlanTemplate[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MealPlanTemplate | null>(null);
  async function del(id: string) {
    await post({ action: "deleteTemplate", kind: "mealPlan", id });
    router.refresh();
  }
  if (editing) {
    return (
      <MealTemplateEditor
        initial={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    );
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl">Plantillas de comidas</h2>
        <button onClick={() => setEditing({ id: "", ...emptyMealPlan() })} className="btn-ink">+ Nueva</button>
      </div>
      <TemplateList
        items={list.map((t) => ({ id: t.id, name: t.name, sub: `${t.meals.length} comida(s)` }))}
        onEdit={(id) => setEditing(list.find((t) => t.id === id)!)}
        onDelete={del}
      />
    </section>
  );
}

function MealTemplateEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: MealPlanTemplate;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [m, setM] = useState<MealPlan & { id: string }>(initial);
  const [busy, setBusy] = useState(false);
  function mutate(fn: (d: MealPlan & { id: string }) => void) {
    setM((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }
  async function save() {
    setBusy(true);
    const ok = await post({ action: "saveTemplate", kind: "mealPlan", template: m });
    setBusy(false);
    if (ok) onSaved();
  }
  return (
    <section className="plate-lilac bg-[color:var(--paper)] p-5">
      <input className="input-line" value={m.name} onChange={(e) => mutate((d) => (d.name = e.target.value))} placeholder="Nombre del plan" />
      {m.meals.map((meal, mi) => (
        <div key={mi} className="mt-5 border-t border-[color:var(--ink)]/15 pt-4">
          <div className="flex gap-3">
            <input className="input-line flex-1" value={meal.label} onChange={(e) => mutate((d) => (d.meals[mi].label = e.target.value))} placeholder="Desayuno" />
            <input className="input-line w-24" value={meal.time} onChange={(e) => mutate((d) => (d.meals[mi].time = e.target.value))} placeholder="8:00" />
            <button onClick={() => mutate((d) => d.meals.splice(mi, 1))} className="font-meta text-[10px] text-[color:var(--grape)]">✕</button>
          </div>
          {meal.items.map((it, ii) => (
            <div key={ii} className="mt-2 grid gap-2 sm:grid-cols-12">
              <input className="input-line sm:col-span-7" value={it.food} onChange={(e) => mutate((d) => (d.meals[mi].items[ii].food = e.target.value))} placeholder="Alimento" />
              <input className="input-line sm:col-span-3" value={it.qty} onChange={(e) => mutate((d) => (d.meals[mi].items[ii].qty = e.target.value))} placeholder="60g" />
              <input className="input-line sm:col-span-1" type="number" value={it.kcal ?? ""} onChange={(e) => mutate((d) => (d.meals[mi].items[ii].kcal = Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : null))} placeholder="kcal" />
              <button onClick={() => mutate((d) => d.meals[mi].items.splice(ii, 1))} className="font-meta text-[14px] text-[color:var(--grape)] sm:col-span-1">✕</button>
            </div>
          ))}
          <button onClick={() => mutate((d) => d.meals[mi].items.push(emptyMealItem()))} className="font-meta mt-2 text-[10px] text-[color:var(--grape)]">+ Alimento</button>
        </div>
      ))}
      <button onClick={() => mutate((d) => d.meals.push(emptyMeal()))} className="font-meta mt-4 block text-[11px] text-[color:var(--grape)]">+ Comida</button>
      <div className="mt-6 flex gap-3">
        <button onClick={save} disabled={busy} className="btn-ink disabled:opacity-60">{busy ? "Guardando…" : "Guardar plantilla"}</button>
        <button onClick={onClose} className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px]">Cancelar</button>
      </div>
    </section>
  );
}

// ---------- Tareas ----------
function TaskTemplates({ list }: { list: TaskTemplate[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [cadence, setCadence] = useState("Diario");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!title.trim()) return;
    setBusy(true);
    await post({ action: "saveTemplate", kind: "task", template: { id: "", title: title.trim(), cadence } });
    setBusy(false);
    setTitle("");
    router.refresh();
  }
  async function del(id: string) {
    await post({ action: "deleteTemplate", kind: "task", id });
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl">Plantillas de tareas</h2>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className={labelCls}>Tarea</span>
          <input className="input-line mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Beber 2L de agua" />
        </label>
        <label className="w-40">
          <span className={labelCls}>Cadencia</span>
          <input className="input-line mt-2" value={cadence} onChange={(e) => setCadence(e.target.value)} placeholder="Diario" />
        </label>
        <button onClick={add} disabled={busy} className="btn-ink shrink-0 disabled:opacity-60">{busy ? "…" : "Añadir"}</button>
      </div>
      <div className="mt-5 border-t-2 border-[color:var(--ink)]">
        {list.length === 0 && (
          <p className="font-meta py-4 text-[11px] text-[color:var(--ink-soft)]">Aún no hay tareas.</p>
        )}
        {list.map((t) => (
          <div key={t.id} className="flex items-center justify-between border-b border-[color:var(--ink)]/15 py-3">
            <p className="text-base">
              {t.title} <span className="font-meta text-[10px] text-[color:var(--ink-soft)]">· {t.cadence}</span>
            </p>
            <button onClick={() => del(t.id)} className="font-meta text-[10px] text-[color:var(--grape)]">Borrar</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Lista genérica de plantillas ----------
function TemplateList({
  items,
  onEdit,
  onDelete,
}: {
  items: { id: string; name: string; sub: string }[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-5 border-t-2 border-[color:var(--ink)]">
      {items.length === 0 && (
        <p className="font-meta py-4 text-[11px] text-[color:var(--ink-soft)]">Aún no hay plantillas.</p>
      )}
      {items.map((t) => (
        <div key={t.id} className="flex items-center justify-between border-b border-[color:var(--ink)]/15 py-4">
          <div>
            <p className="text-lg">{t.name || "(sin nombre)"}</p>
            <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">{t.sub}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onEdit(t.id)} className="font-meta text-[10px] text-[color:var(--grape)]">Editar</button>
            <button onClick={() => onDelete(t.id)} className="font-meta text-[10px] text-[color:var(--ink-soft)]">Borrar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
