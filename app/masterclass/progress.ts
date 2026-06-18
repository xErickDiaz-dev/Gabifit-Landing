"use client";

import { useCallback, useEffect, useState } from "react";

// Progreso de la usuaria guardado en su navegador (localStorage).
// Sin base de datos: si cambia de dispositivo pierde los checkmarks,
// pero nunca el acceso (el código siempre funciona).

const KEY = "gabifit_mc_progress";
const EVENT = "gabifit-progress-change";

function read(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCompleted(read());
    setLoaded(true);
    const sync = () => setCompleted(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: number) => {
    const current = read();
    const isAdding = !current.includes(id);
    const next = isAdding ? [...current, id] : current.filter((x) => x !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    // Sincroniza al servidor para que el panel de Gabi vea el avance.
    // Best-effort: si la red falla, el check local se mantiene igual.
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: id, done: isAdding }),
    }).catch(() => {});
  }, []);

  return { completed, toggle, loaded };
}
