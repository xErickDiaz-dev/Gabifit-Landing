// Lógica PURA del coaching (upsell) — tipos + transformaciones sin Firebase,
// para poder testearlas en aislamiento (igual que members.ts y hotmart.ts).
// El portal del cliente y el CRM de Gabi comparten estos tipos.

export type CoachingStatus = "active" | "revoked";

// Perfil de la clienta de coaching (lo edita Gabi en el CRM).
export type CoachingProfile = {
  goal: string; // objetivo principal ("bajar grasa", "fuerza"…)
  heightCm: number | null;
  birthdate: string | null; // ISO yyyy-mm-dd
  startWeight: number | null; // peso inicial en kg
  targetWeight: number | null; // meta en kg
  injuries: string; // lesiones / consideraciones médicas
  notes: string; // notas internas de Gabi (no se muestran a la clienta)
};

export const EMPTY_PROFILE: CoachingProfile = {
  goal: "",
  heightCm: null,
  birthdate: null,
  startWeight: null,
  targetWeight: null,
  injuries: "",
  notes: "",
};

// --- Rutina de entrenamiento ---
export type Exercise = {
  name: string;
  sets: string; // "4" o "3-4"
  reps: string; // "12" o "8-10"
  rest: string; // "60s"
  videoUrl: string; // demo (Cloudinary/YouTube), puede ir vacío
  imageUrl: string; // foto/cartoon de la posición (ruta en Storage o URL), puede ir vacío
  notes: string;
};
export type RoutineDay = { label: string; focus: string; exercises: Exercise[] };
export type Routine = { name: string; note: string; days: RoutineDay[] };
export type RoutineTemplate = Routine & { id: string };

// --- Plan de comidas ---
export type MealItem = { food: string; qty: string; kcal: number | null };
export type Meal = { label: string; time: string; items: MealItem[]; note: string };
export type MealPlan = {
  name: string;
  note: string;
  kcalTarget: number | null;
  meals: Meal[];
};
export type MealPlanTemplate = MealPlan & { id: string };

// --- Tareas / hábitos ---
export type ClientTask = {
  id: string;
  title: string;
  cadence: string; // "Diario", "Lun/Mié/Vie"…
  completions: string[]; // fechas ISO yyyy-mm-dd marcadas
};
export type TaskTemplate = { id: string; title: string; cadence: string };

// --- Progreso ---
export type ProgressEntry = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  weight: number | null;
  waist: number | null; // cintura cm
  hips: number | null; // cadera cm
  note: string;
  photoPaths: string[]; // rutas en Firebase Storage (se sirven por /api/coaching/photo)
};

// Resumen para la lista del CRM (una fila por clienta).
export type CoachingClientSummary = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  status: CoachingStatus;
  clientType: ClientType;
  lastSignIn: string | null;
  startWeight: number | null;
  latestWeight: number | null;
  weightDelta: number | null; // latest - start (negativo = bajó)
  lastProgressAt: string | null;
  taskCount: number;
  adherence: number; // % 0-100 de cumplimiento de tareas en los últimos 7 días
  hasRoutine: boolean;
  workoutsThisWeek: number;
};

// ============================================================
//  Fábricas de filas vacías (para los editores del CRM)
// ============================================================
export function emptyExercise(): Exercise {
  return { name: "", sets: "", reps: "", rest: "", videoUrl: "", imageUrl: "", notes: "" };
}
export function emptyRoutineDay(): RoutineDay {
  return { label: "", focus: "", exercises: [emptyExercise()] };
}
export function emptyRoutine(): Routine {
  return { name: "", note: "", days: [emptyRoutineDay()] };
}
export function emptyMealItem(): MealItem {
  return { food: "", qty: "", kcal: null };
}
export function emptyMeal(): Meal {
  return { label: "", time: "", items: [emptyMealItem()], note: "" };
}
export function emptyMealPlan(): MealPlan {
  return { name: "", note: "", kcalTarget: null, meals: [emptyMeal()] };
}

// ============================================================
//  Instanciación de plantilla → asignación (copia-instantánea)
//  Copiar la plantilla al cliente y NO referenciarla, para que
//  editar la plantilla luego no altere a clientas ya asignadas.
// ============================================================
export function instantiateRoutine(t: RoutineTemplate): Routine {
  return { name: t.name, note: t.note, days: structuredClone(t.days) };
}
export function instantiateMealPlan(t: MealPlanTemplate): MealPlan {
  return {
    name: t.name,
    note: t.note,
    kcalTarget: t.kcalTarget,
    meals: structuredClone(t.meals),
  };
}

// ============================================================
//  Hotmart: ¿la compra corresponde al producto de coaching?
//  Si no hay producto esperado configurado, NUNCA hace match
//  (así el webhook mantiene el comportamiento de masterclass).
// ============================================================
export function coachingProductMatches(
  productId: string | null | undefined,
  expected: string | undefined
): boolean {
  if (!expected || !productId) return false;
  return String(productId).trim() === String(expected).trim();
}

// ============================================================
//  Métricas de progreso / adherencia (puras, testeable)
// ============================================================
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Lista de las últimas n fechas (ISO) hasta hoy, incluida.
export function lastNDates(todayIso: string, n: number): string[] {
  const out: string[] = [];
  const base = new Date(todayIso + "T00:00:00Z");
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - i);
    out.push(isoDate(d));
  }
  return out;
}

// Peso más reciente registrado (entradas en cualquier orden).
export function latestWeight(entries: ProgressEntry[]): number | null {
  const withWeight = entries
    .filter((e) => typeof e.weight === "number")
    .sort((a, b) => a.date.localeCompare(b.date));
  return withWeight.length ? withWeight[withWeight.length - 1].weight : null;
}

// Cambio de peso: peso actual menos el peso inicial (perfil o 1ª entrada).
export function weightDelta(
  entries: ProgressEntry[],
  startWeight: number | null
): number | null {
  const sorted = entries
    .filter((e) => typeof e.weight === "number")
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return null;
  const start = typeof startWeight === "number" ? startWeight : sorted[0].weight!;
  const latest = sorted[sorted.length - 1].weight!;
  return Math.round((latest - start) * 10) / 10;
}

// Adherencia: % de cumplimientos en los últimos `windowDays`, promediado
// entre todas las tareas. 100 = todas las tareas marcadas todos los días.
export function taskAdherence(
  tasks: ClientTask[],
  todayIso: string,
  windowDays = 7
): number {
  if (!tasks.length) return 0;
  const window = new Set(lastNDates(todayIso, windowDays));
  let ratioSum = 0;
  for (const t of tasks) {
    const hits = t.completions.filter((c) => window.has(c)).length;
    ratioSum += Math.min(hits, windowDays) / windowDays;
  }
  return Math.round((ratioSum / tasks.length) * 100);
}

// ============================================================
//  Tipos de clienta (organización del CRM)
// ============================================================
export type ClientType = "upsell" | "regalo" | "influencer" | "vip";

export const CLIENT_TYPES: ClientType[] = ["upsell", "regalo", "influencer", "vip"];

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  upsell: "Upsell",
  regalo: "Regalo",
  influencer: "Influencer",
  vip: "VIP",
};

export function normalizeClientType(v: unknown): ClientType {
  return CLIENT_TYPES.includes(v as ClientType) ? (v as ClientType) : "upsell";
}

// Link de WhatsApp con mensaje precargado (null si no hay número usable).
export function waLink(whatsapp: string | null, text: string): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// Resuelve la imagen de un ejercicio: URL externa directa, o ruta de Storage
// (library/...) servida por /api/coaching/asset. "" si no hay imagen.
export function assetSrc(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `/api/coaching/asset?path=${encodeURIComponent(path)}`;
}

// ============================================================
//  Librería de ejercicios (catálogo reutilizable con imagen/cartoon)
// ============================================================
export type LibraryExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  imageUrl: string; // ruta en Storage (library/...) o URL
  videoUrl: string;
  defaultSets: string;
  defaultReps: string;
  defaultRest: string;
  notes: string;
};

export function emptyLibraryExercise(): LibraryExercise {
  return {
    id: "",
    name: "",
    muscleGroup: "",
    imageUrl: "",
    videoUrl: "",
    defaultSets: "",
    defaultReps: "",
    defaultRest: "",
    notes: "",
  };
}

// Convierte un ejercicio de la librería en uno de rutina (snapshot).
export function libraryToExercise(lib: LibraryExercise): Exercise {
  return {
    name: lib.name,
    sets: lib.defaultSets,
    reps: lib.defaultReps,
    rest: lib.defaultRest,
    videoUrl: lib.videoUrl,
    imageUrl: lib.imageUrl,
    notes: lib.notes,
  };
}

// ============================================================
//  Anuncio (broadcast al portal de las clientas)
// ============================================================
export type Announcement = { message: string; active: boolean };

export const EMPTY_ANNOUNCEMENT: Announcement = { message: "", active: false };

// ============================================================
//  "Necesitan atención" — selección pura y testeable
// ============================================================
export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso + "T00:00:00Z").getTime();
  const b = new Date(bIso + "T00:00:00Z").getTime();
  return Math.floor((b - a) / 86400000);
}

export type AttentionInput = {
  hasRoutine: boolean;
  taskCount: number;
  adherence: number;
  lastProgressAt: string | null;
  workoutsThisWeek: number;
};

// Devuelve las razones por las que una clienta necesita atención (vacío = al día).
export function attentionReasons(c: AttentionInput, todayIso: string): string[] {
  const reasons: string[] = [];
  if (!c.hasRoutine) reasons.push("Sin rutina asignada");
  if (c.taskCount > 0 && c.adherence < 40) reasons.push("Adherencia baja");
  if (c.workoutsThisWeek === 0) reasons.push("No entrenó esta semana");
  const days = c.lastProgressAt ? daysBetween(c.lastProgressAt, todayIso) : Infinity;
  if (days > 10) reasons.push("Sin registrar progreso");
  return reasons;
}
