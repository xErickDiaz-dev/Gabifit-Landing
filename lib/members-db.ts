import { adminDb } from "@/lib/firebase/admin";

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
