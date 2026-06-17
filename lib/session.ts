import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "gabifit_session";
export const SESSION_MAX_AGE = 14 * 24 * 60 * 60; // 14 días, en segundos

export type Member = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  status: "active" | "pending" | "revoked";
  isAdmin: boolean;
};

// Lee la cookie, la verifica con Firebase Admin y devuelve la miembra con
// CUALQUIER estado (pending/active/revoked). null si no hay sesión válida o el
// doc no existe. La usa /masterclass para decidir qué pantalla mostrar.
export async function getSessionMemberAny(): Promise<Member | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, false);
    const snap = await adminDb().collection("members").doc(decoded.uid).get();
    if (!snap.exists) return null;
    const m = snap.data()!;
    return {
      uid: decoded.uid,
      email: m.email,
      fullName: m.fullName ?? null,
      whatsapp: m.whatsapp ?? null,
      status: m.status,
      isAdmin: Boolean(m.isAdmin),
    };
  } catch {
    return null;
  }
}

// Solo miembras ACTIVAS. Contrato usado por el portal, las lecciones y las guías
// — mantener este filtro es lo que bloquea a las pending del contenido pagado.
export async function getSessionMember(): Promise<Member | null> {
  const member = await getSessionMemberAny();
  if (!member || member.status !== "active") return null;
  return member;
}
