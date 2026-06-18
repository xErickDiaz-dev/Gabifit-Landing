import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionMember } from "@/lib/session";

export const dynamic = "force-dynamic";

// Guarda el progreso de la miembra (lecciones completadas) en el servidor.
// El uid sale de la sesión: cada miembra solo escribe SU propio progreso.
export async function POST(request: Request) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false }, { status: 401 });

  const { lessonId, done } = await request
    .json()
    .catch(() => ({ lessonId: null, done: null }));
  if (typeof lessonId !== "number" || typeof done !== "boolean") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await adminDb()
    .collection("members")
    .doc(member.uid)
    .update({
      completedLessons: done
        ? FieldValue.arrayUnion(lessonId)
        : FieldValue.arrayRemove(lessonId),
    });

  return NextResponse.json({ ok: true });
}
