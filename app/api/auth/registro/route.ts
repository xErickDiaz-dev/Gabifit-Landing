import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateFullName, validateWhatsapp, buildPendingMember } from "@/lib/members";

export const dynamic = "force-dynamic";

// Crea el documento de la miembra en estado "pending" tras un signup en el cliente.
// El email se toma del idToken verificado (confiable); el cliente no fija el status.
export async function POST(request: Request) {
  const { idToken, fullName, whatsapp } = await request
    .json()
    .catch(() => ({ idToken: null, fullName: "", whatsapp: "" }));
  if (!idToken) return NextResponse.json({ ok: false }, { status: 400 });

  const err = validateFullName(fullName ?? "") ?? validateWhatsapp(whatsapp ?? "");
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const ref = adminDb().collection("members").doc(decoded.uid);
  const existing = await ref.get();
  // No degradar a quien ya está activa (p. ej. compró por Hotmart).
  if (existing.exists && existing.data()!.status === "active") {
    return NextResponse.json({ ok: true, alreadyActive: true });
  }

  const doc = buildPendingMember({
    email: decoded.email ?? "",
    fullName,
    whatsapp,
  });
  await ref.set({ ...doc, createdAt: FieldValue.serverTimestamp() }, { merge: true });

  return NextResponse.json({ ok: true });
}
