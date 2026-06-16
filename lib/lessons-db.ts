import { adminDb } from "@/lib/firebase/admin";
import { toClientLesson, type ClientLesson, type LessonRow } from "@/lib/lessons-dto";

// Lista para el dashboard: NUNCA incluye videoUrl (toClientLesson lo elimina).
export async function getClientLessons(): Promise<ClientLesson[]> {
  const snap = await adminDb().collection("lessons").orderBy("sortOrder").get();
  return snap.docs.map((d) => toClientLesson(d.data() as LessonRow));
}

// Detalle server-only: incluye playableUrl SOLO si la lección está publicada.
export async function getLessonForView(
  id: number
): Promise<(LessonRow & { playableUrl: string }) | null> {
  if (!Number.isFinite(id)) return null;
  const snap = await adminDb().collection("lessons").doc(String(id)).get();
  if (!snap.exists) return null;
  const d = snap.data() as LessonRow;
  return { ...d, playableUrl: d.isPublished ? d.videoUrl : "" };
}

export async function getLessonCount(): Promise<number> {
  const snap = await adminDb().collection("lessons").count().get();
  return snap.data().count;
}
