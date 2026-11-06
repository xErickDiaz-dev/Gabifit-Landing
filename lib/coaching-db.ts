import { adminAuth, adminDb, adminStorage } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  EMPTY_PROFILE,
  EMPTY_ANNOUNCEMENT,
  isoDate,
  lastNDates,
  taskAdherence,
  weightDelta,
  latestWeight,
  normalizeClientType,
  type CoachingProfile,
  type CoachingClientSummary,
  type CoachingStatus,
  type ClientType,
  type Announcement,
  type Routine,
  type MealPlan,
  type ClientTask,
  type ProgressEntry,
  type RoutineTemplate,
  type MealPlanTemplate,
  type TaskTemplate,
  type LibraryExercise,
} from "@/lib/coaching";

// ============================================================
//  Helpers internos
// ============================================================
type TS = { toDate?: () => Date } | undefined;
function tsToIso(ts: TS): string | null {
  return ts?.toDate ? ts.toDate().toISOString() : null;
}

function readProfile(data: Record<string, unknown>): CoachingProfile {
  const p = (data.coachingProfile as Partial<CoachingProfile>) ?? {};
  return { ...EMPTY_PROFILE, ...p };
}

const memberRef = (uid: string) => adminDb().collection("members").doc(uid);
const planDoc = (uid: string, name: "routine" | "mealPlan" | "workoutLog") =>
  memberRef(uid).collection("coachingPlan").doc(name);

// ============================================================
//  Lecturas — contenido asignado a una clienta
// ============================================================
export async function getClientRoutine(uid: string): Promise<Routine | null> {
  const snap = await planDoc(uid, "routine").get();
  return snap.exists ? (snap.data() as Routine) : null;
}

export async function getClientMealPlan(uid: string): Promise<MealPlan | null> {
  const snap = await planDoc(uid, "mealPlan").get();
  return snap.exists ? (snap.data() as MealPlan) : null;
}

export async function getClientTasks(uid: string): Promise<ClientTask[]> {
  const snap = await memberRef(uid).collection("tasks").get();
  const tasks = snap.docs.map((d) => {
    const t = d.data();
    return {
      id: d.id,
      title: t.title ?? "",
      cadence: t.cadence ?? "",
      completions: Array.isArray(t.completions) ? (t.completions as string[]) : [],
    };
  });
  tasks.sort((a, b) => a.title.localeCompare(b.title));
  return tasks;
}

export async function getClientProgress(uid: string): Promise<ProgressEntry[]> {
  const snap = await memberRef(uid).collection("progress").orderBy("date", "asc").get();
  return snap.docs.map((d) => {
    const e = d.data();
    return {
      id: d.id,
      date: e.date ?? "",
      weight: typeof e.weight === "number" ? e.weight : null,
      waist: typeof e.waist === "number" ? e.waist : null,
      hips: typeof e.hips === "number" ? e.hips : null,
      note: e.note ?? "",
      photoPaths: Array.isArray(e.photoPaths) ? (e.photoPaths as string[]) : [],
    };
  });
}

export async function getWorkoutLog(
  uid: string
): Promise<{ date: string; dayLabel: string }[]> {
  const snap = await planDoc(uid, "workoutLog").get();
  const entries = snap.exists ? (snap.data()?.entries ?? []) : [];
  return Array.isArray(entries) ? entries : [];
}

// Detalle completo para el CRM (página de una clienta).
export type CoachingClientDetail = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  status: CoachingStatus | null;
  clientType: ClientType;
  profile: CoachingProfile;
  routine: Routine | null;
  mealPlan: MealPlan | null;
  tasks: ClientTask[];
  progress: ProgressEntry[];
  workoutLog: { date: string; dayLabel: string }[];
};

export async function getCoachingClientDetail(
  uid: string
): Promise<CoachingClientDetail | null> {
  const snap = await memberRef(uid).get();
  if (!snap.exists) return null;
  const m = snap.data()!;
  const [routine, mealPlan, tasks, progress, workoutLog] = await Promise.all([
    getClientRoutine(uid),
    getClientMealPlan(uid),
    getClientTasks(uid),
    getClientProgress(uid),
    getWorkoutLog(uid),
  ]);
  return {
    uid,
    email: m.email ?? "",
    fullName: m.fullName ?? null,
    whatsapp: m.whatsapp ?? null,
    status: (m.coachingStatus as CoachingStatus | undefined) ?? null,
    clientType: normalizeClientType(m.clientType),
    profile: readProfile(m),
    routine,
    mealPlan,
    tasks,
    progress,
    workoutLog,
  };
}

// Lista del CRM: todas las clientas con coaching activo + métricas de un vistazo.
export async function getCoachingClients(): Promise<CoachingClientSummary[]> {
  const snap = await adminDb()
    .collection("members")
    .where("coachingStatus", "==", "active")
    .get();
  const today = isoDate(new Date());

  const week = new Set(lastNDates(today, 7));
  const rows = await Promise.all(
    snap.docs.map(async (d) => {
      const m = d.data();
      const profile = readProfile(m);
      const [progress, tasks, routine, workoutLog] = await Promise.all([
        getClientProgress(d.id),
        getClientTasks(d.id),
        getClientRoutine(d.id),
        getWorkoutLog(d.id),
      ]);
      let lastSignIn: string | null = null;
      try {
        const u = await adminAuth().getUser(d.id);
        lastSignIn = u.metadata.lastSignInTime
          ? new Date(u.metadata.lastSignInTime).toISOString()
          : null;
      } catch {
        /* doc huérfano sin cuenta en Auth */
      }
      const lastProgress = progress[progress.length - 1];
      return {
        uid: d.id,
        email: m.email ?? "",
        fullName: m.fullName ?? null,
        whatsapp: m.whatsapp ?? null,
        status: "active" as CoachingStatus,
        clientType: normalizeClientType(m.clientType),
        lastSignIn,
        startWeight: profile.startWeight,
        latestWeight: latestWeight(progress),
        weightDelta: weightDelta(progress, profile.startWeight),
        lastProgressAt: lastProgress ? lastProgress.date : null,
        taskCount: tasks.length,
        adherence: taskAdherence(tasks, today),
        hasRoutine: !!routine && routine.days.length > 0,
        workoutsThisWeek: workoutLog.filter((w) => week.has(w.date)).length,
      } satisfies CoachingClientSummary;
    })
  );
  rows.sort((a, b) => (b.lastProgressAt ?? "").localeCompare(a.lastProgressAt ?? ""));
  return rows;
}

// ============================================================
//  Escrituras — alta y entitlement
// ============================================================
export async function createCoachingClient(
  email: string,
  fullName: string,
  clientType: ClientType = "upsell"
): Promise<string> {
  const clean = email.trim().toLowerCase();
  let user = await adminAuth().getUserByEmail(clean).catch(() => null);
  if (!user) user = await adminAuth().createUser({ email: clean });
  await memberRef(user.uid).set(
    {
      email: clean,
      fullName: fullName.trim() || null,
      coachingStatus: "active",
      clientType,
      coachingProfile: EMPTY_PROFILE,
      source: clientType === "upsell" ? "coaching-manual" : `coaching-${clientType}`,
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  return user.uid;
}

export async function setCoachingStatus(
  uid: string,
  status: CoachingStatus
): Promise<void> {
  await memberRef(uid).update({ coachingStatus: status });
  if (status === "revoked") {
    try {
      await adminAuth().revokeRefreshTokens(uid);
    } catch {
      /* puede no existir en Auth; el estado basta */
    }
  }
}

export async function saveProfile(
  uid: string,
  profile: CoachingProfile,
  extra?: { whatsapp?: string | null; clientType?: ClientType }
): Promise<void> {
  const patch: Record<string, unknown> = { coachingProfile: profile };
  if (extra?.whatsapp !== undefined) patch.whatsapp = extra.whatsapp || null;
  if (extra?.clientType !== undefined) patch.clientType = extra.clientType;
  await memberRef(uid).set(patch, { merge: true });
}

// ============================================================
//  Escrituras — plan asignado (rutina / comidas / tareas)
// ============================================================
export async function saveRoutine(uid: string, routine: Routine): Promise<void> {
  await planDoc(uid, "routine").set({ ...routine, updatedAt: FieldValue.serverTimestamp() });
}

export async function saveMealPlan(uid: string, mealPlan: MealPlan): Promise<void> {
  await planDoc(uid, "mealPlan").set({ ...mealPlan, updatedAt: FieldValue.serverTimestamp() });
}

// Reemplaza el set de tareas conservando `completions` de las tareas que siguen.
export async function saveTasks(
  uid: string,
  tasks: { id: string; title: string; cadence: string }[]
): Promise<void> {
  const col = memberRef(uid).collection("tasks");
  const existing = await col.get();
  const keepIds = new Set(tasks.map((t) => t.id).filter(Boolean));
  const batch = adminDb().batch();
  // Borra las que se quitaron.
  for (const doc of existing.docs) {
    if (!keepIds.has(doc.id)) batch.delete(doc.ref);
  }
  // Upsert título/cadencia SIN tocar completions.
  for (const t of tasks) {
    const ref = t.id ? col.doc(t.id) : col.doc();
    batch.set(ref, { title: t.title, cadence: t.cadence }, { merge: true });
  }
  await batch.commit();
}

// ============================================================
//  Escrituras — acciones del cliente (su propio uid)
// ============================================================
export async function toggleTaskCompletion(
  uid: string,
  taskId: string,
  dateIso: string,
  done: boolean
): Promise<void> {
  await memberRef(uid)
    .collection("tasks")
    .doc(taskId)
    .update({
      completions: done
        ? FieldValue.arrayUnion(dateIso)
        : FieldValue.arrayRemove(dateIso),
    });
}

export async function logWorkout(
  uid: string,
  dayLabel: string,
  dateIso: string
): Promise<void> {
  await planDoc(uid, "workoutLog").set(
    { entries: FieldValue.arrayUnion({ date: dateIso, dayLabel }) },
    { merge: true }
  );
}

export async function appendProgressEntry(
  uid: string,
  entry: Omit<ProgressEntry, "id">
): Promise<string> {
  const ref = await memberRef(uid).collection("progress").add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateProgressPhotos(
  uid: string,
  entryId: string,
  photoPaths: string[]
): Promise<void> {
  await memberRef(uid).collection("progress").doc(entryId).update({ photoPaths });
}

// ============================================================
//  Plantillas (biblioteca reutilizable de Gabi)
// ============================================================
export async function listRoutineTemplates(): Promise<RoutineTemplate[]> {
  const snap = await adminDb().collection("routineTemplates").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RoutineTemplate, "id">) }));
}
export async function listMealPlanTemplates(): Promise<MealPlanTemplate[]> {
  const snap = await adminDb().collection("mealPlanTemplates").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MealPlanTemplate, "id">) }));
}
export async function listTaskTemplates(): Promise<TaskTemplate[]> {
  const snap = await adminDb().collection("taskTemplates").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TaskTemplate, "id">) }));
}

export async function saveRoutineTemplate(t: RoutineTemplate): Promise<void> {
  const { id, ...rest } = t;
  const col = adminDb().collection("routineTemplates");
  await (id ? col.doc(id).set(rest) : col.add(rest));
}
export async function saveMealPlanTemplate(t: MealPlanTemplate): Promise<void> {
  const { id, ...rest } = t;
  const col = adminDb().collection("mealPlanTemplates");
  await (id ? col.doc(id).set(rest) : col.add(rest));
}
export async function saveTaskTemplate(t: TaskTemplate): Promise<void> {
  const { id, ...rest } = t;
  const col = adminDb().collection("taskTemplates");
  await (id ? col.doc(id).set(rest) : col.add(rest));
}

export async function deleteTemplate(
  kind: "routine" | "mealPlan" | "task",
  id: string
): Promise<void> {
  const col =
    kind === "routine"
      ? "routineTemplates"
      : kind === "mealPlan"
        ? "mealPlanTemplates"
        : "taskTemplates";
  await adminDb().collection(col).doc(id).delete();
}

// ============================================================
//  Fotos de progreso (Firebase Storage, servidor)
// ============================================================
function bucket() {
  return adminStorage().bucket();
}

export async function uploadProgressPhoto(
  uid: string,
  entryId: string,
  index: number,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `coaching/${uid}/progress/${entryId}/${index}.${ext}`;
  await bucket()
    .file(path)
    .save(buffer, { contentType, resumable: false, validation: false });
  return path;
}

export async function readPhoto(
  path: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const file = bucket().file(path);
    const [buffer] = await file.download();
    const [meta] = await file.getMetadata();
    return { buffer, contentType: meta.contentType ?? "image/jpeg" };
  } catch {
    return null;
  }
}

// ============================================================
//  Librería de ejercicios (catálogo compartido con imagen/cartoon)
// ============================================================
export async function listExercises(): Promise<LibraryExercise[]> {
  const snap = await adminDb().collection("exercises").get();
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<LibraryExercise, "id">),
  }));
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export async function saveExercise(ex: LibraryExercise): Promise<string> {
  const { id, ...rest } = ex;
  const col = adminDb().collection("exercises");
  if (id) {
    await col.doc(id).set(rest, { merge: true });
    return id;
  }
  const ref = await col.add(rest);
  return ref.id;
}

export async function deleteExercise(id: string): Promise<void> {
  await adminDb().collection("exercises").doc(id).delete();
}

// Sube una imagen de la librería (cartoon/foto de ejercicio) a Storage.
export async function uploadLibraryImage(
  id: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `library/${id}.${ext}`;
  await bucket()
    .file(path)
    .save(buffer, { contentType, resumable: false, validation: false });
  return path;
}

// ============================================================
//  Anuncio (broadcast al portal)
// ============================================================
const announcementRef = () => adminDb().collection("config").doc("coachingAnnouncement");

export async function getAnnouncement(): Promise<Announcement> {
  const snap = await announcementRef().get();
  if (!snap.exists) return EMPTY_ANNOUNCEMENT;
  const d = snap.data()!;
  return { message: d.message ?? "", active: Boolean(d.active) };
}

export async function setAnnouncement(a: Announcement): Promise<void> {
  await announcementRef().set(
    { message: a.message, active: a.active, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}
