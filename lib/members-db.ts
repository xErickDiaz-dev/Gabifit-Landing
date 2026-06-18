import { adminAuth, adminDb } from "@/lib/firebase/admin";

export type PendingMemberRow = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  createdAt: string | null; // ISO string, o null
};

// Lista las miembras en espera. Ordena en memoria (sin índice compuesto en Firestore).
export async function getPendingMembers(): Promise<PendingMemberRow[]> {
  const snap = await adminDb().collection("members").where("status", "==", "pending").get();
  const rows: PendingMemberRow[] = snap.docs.map((d) => {
    const m = d.data();
    const ts = m.createdAt as { toDate?: () => Date } | undefined;
    return {
      uid: d.id,
      email: m.email ?? "",
      fullName: m.fullName ?? null,
      whatsapp: m.whatsapp ?? null,
      createdAt: ts?.toDate ? ts.toDate().toISOString() : null,
    };
  });
  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return rows;
}

export type MemberRow = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  status: "active" | "pending" | "revoked";
  source: string | null;
  createdAt: string | null; // ISO
  lastSignIn: string | null; // ISO, de Firebase Auth
  completedCount: number; // lecciones completadas
};

// Lista TODAS las miembras con su progreso y última conexión (de Firebase Auth).
// Para el panel de admin. Ordena por más recientes primero.
export async function getAllMembers(): Promise<MemberRow[]> {
  const snap = await adminDb().collection("members").get();
  const rows = await Promise.all(
    snap.docs.map(async (d) => {
      const m = d.data();
      let lastSignIn: string | null = null;
      try {
        const u = await adminAuth().getUser(d.id);
        lastSignIn = u.metadata.lastSignInTime
          ? new Date(u.metadata.lastSignInTime).toISOString()
          : null;
      } catch {
        /* la cuenta puede no existir en Auth (doc huérfano) */
      }
      const ts = m.createdAt as { toDate?: () => Date } | undefined;
      return {
        uid: d.id,
        email: m.email ?? "",
        fullName: m.fullName ?? null,
        whatsapp: m.whatsapp ?? null,
        status: (m.status ?? "pending") as MemberRow["status"],
        source: m.source ?? null,
        createdAt: ts?.toDate ? ts.toDate().toISOString() : null,
        lastSignIn,
        completedCount: Array.isArray(m.completedLessons) ? m.completedLessons.length : 0,
      };
    })
  );
  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return rows;
}
