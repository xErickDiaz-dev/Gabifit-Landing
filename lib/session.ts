import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "gabifit_session";
export const SESSION_MAX_AGE = 14 * 24 * 60 * 60; // 14 días, en segundos

export type Member = {
  uid: string;
  email: string;
  fullName: string | null;
  status: "active" | "pending" | "revoked";
  isAdmin: boolean;
};

// Lee la cookie de sesión, la verifica con Firebase Admin y confirma que la
// miembra está activa. Devuelve null si no hay sesión válida o no está activa.
export async function getSessionMember(): Promise<Member | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, false);
    const snap = await adminDb().collection("members").doc(decoded.uid).get();
    if (!snap.exists) return null;
    const m = snap.data()!;
    if (m.status !== "active") return null;
    return {
      uid: decoded.uid,
      email: m.email,
      fullName: m.fullName ?? null,
      status: m.status,
      isAdmin: Boolean(m.isAdmin),
    };
  } catch {
    return null;
  }
}
