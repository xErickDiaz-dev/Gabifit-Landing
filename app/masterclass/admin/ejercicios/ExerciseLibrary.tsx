"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emptyLibraryExercise, assetSrc, type LibraryExercise } from "@/lib/coaching";
import { resizeImage } from "../../../coaching/resizeImage";

const labelCls = "font-meta block text-[10px] text-[color:var(--ink-soft)]";

async function post(payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/coaching", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json().catch(() => ({ ok: res.ok }));
}

export default function ExerciseLibrary({ exercises }: { exercises: LibraryExercise[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<LibraryExercise | null>(null);

  async function del(id: string) {
    await post({ action: "deleteExercise", id });
    router.refresh();
  }

  if (editing) {
    return (
      <ExerciseEditor
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
      <button onClick={() => setEditing(emptyLibraryExercise())} className="btn-ink">
        + Nuevo ejercicio
      </button>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {exercises.length === 0 && (
          <p className="font-meta col-span-full py-4 text-[11px] text-[color:var(--ink-soft)]">
            Aún no hay ejercicios en la librería.
          </p>
        )}
        {exercises.map((ex) => (
          <div key={ex.id} className="plate bg-[color:var(--paper)] p-3">
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-[color:var(--paper-deep)]/50">
              {ex.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetSrc(ex.imageUrl)} alt={ex.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-meta text-[9px] text-[color:var(--ink-soft)]">sin imagen</span>
              )}
            </div>
            <p className="mt-2 text-sm leading-snug">{ex.name || "(sin nombre)"}</p>
            {ex.muscleGroup && (
              <p className="font-meta text-[9px] text-[color:var(--grape)]">{ex.muscleGroup}</p>
            )}
            <div className="mt-2 flex gap-3">
              <button onClick={() => setEditing(ex)} className="font-meta text-[10px] text-[color:var(--grape)]">
                Editar
              </button>
              <button onClick={() => del(ex.id)} className="font-meta text-[10px] text-[color:var(--ink-soft)]">
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExerciseEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: LibraryExercise;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ex, setEx] = useState<LibraryExercise>(initial);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof LibraryExercise, v: string) => setEx((p) => ({ ...p, [k]: v }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setDataUrl(await resizeImage(f, 900, 0.8));
    } catch {
      /* ignora */
    }
  }

  async function save() {
    setBusy(true);
    try {
      // 1) guarda el ejercicio para obtener id
      const res1 = await post({ action: "saveExercise", exercise: ex });
      const id = res1.id ?? ex.id;
      // 2) si hay imagen nueva, súbela y vuelve a guardar con la ruta
      if (dataUrl && id) {
        const up = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, dataUrl }),
        });
        const upData = await up.json().catch(() => ({}));
        if (upData.path) {
          await post({ action: "saveExercise", exercise: { ...ex, id, imageUrl: upData.path } });
        }
      }
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  const preview = dataUrl ?? (ex.imageUrl ? assetSrc(ex.imageUrl) : "");

  return (
    <section className="plate bg-[color:var(--paper)] p-5">
      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden border-2 border-[color:var(--ink)] bg-[color:var(--paper-deep)]/50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-meta text-[9px] text-[color:var(--ink-soft)]">sin imagen</span>
            )}
          </div>
          <label className={`${labelCls} mt-3`}>
            Imagen / cartoon
            <input type="file" accept="image/*" onChange={onFile} className="mt-1 block text-xs" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelCls}>Nombre</span>
            <input className="input-line mt-2" value={ex.name} onChange={(e) => set("name", e.target.value)} placeholder="Sentadilla goblet" />
          </label>
          <label>
            <span className={labelCls}>Grupo muscular</span>
            <input className="input-line mt-2" value={ex.muscleGroup} onChange={(e) => set("muscleGroup", e.target.value)} placeholder="Piernas" />
          </label>
          <label>
            <span className={labelCls}>Video (URL, opcional)</span>
            <input className="input-line mt-2" value={ex.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" />
          </label>
          <label>
            <span className={labelCls}>Series por defecto</span>
            <input className="input-line mt-2" value={ex.defaultSets} onChange={(e) => set("defaultSets", e.target.value)} placeholder="4x" />
          </label>
          <label>
            <span className={labelCls}>Reps por defecto</span>
            <input className="input-line mt-2" value={ex.defaultReps} onChange={(e) => set("defaultReps", e.target.value)} placeholder="12" />
          </label>
          <label>
            <span className={labelCls}>Descanso por defecto</span>
            <input className="input-line mt-2" value={ex.defaultRest} onChange={(e) => set("defaultRest", e.target.value)} placeholder="60s" />
          </label>
          <label className="sm:col-span-2">
            <span className={labelCls}>Notas / técnica</span>
            <textarea className="mt-2 w-full border-2 border-[color:var(--ink)] bg-transparent p-3 text-sm" rows={2} value={ex.notes} onChange={(e) => set("notes", e.target.value)} />
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={save} disabled={busy || !ex.name.trim()} className="btn-ink disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar ejercicio"}
        </button>
        <button onClick={onClose} className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px]">
          Cancelar
        </button>
      </div>
    </section>
  );
}
