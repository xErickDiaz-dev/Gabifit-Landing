import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isValidHottok, parseHotmartEvent } from "@/lib/hotmart";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headerToken = request.headers.get("x-hotmart-hottok");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Hotmart 2.0 manda el token en el header; algunas configs lo mandan en el body.
  const token = headerToken ?? (body as { hottok?: string })?.hottok;
  if (!isValidHottok(token, process.env.HOTMART_HOTTOK)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const parsed = parseHotmartEvent(body);
  if (!parsed) return NextResponse.json({ ok: true, ignored: true });

  const db = adminDb();
  const auth = adminAuth();

  if (parsed.action === "revoke") {
    const q = await db.collection("members").where("email", "==", parsed.email).get();
    for (const doc of q.docs) {
      await doc.ref.update({ status: "revoked" });
      try {
        await auth.revokeRefreshTokens(doc.id);
      } catch {
        /* el usuario puede no existir en Auth; el estado revoked basta para bloquear */
      }
    }
    return NextResponse.json({ ok: true });
  }

  // grant — idempotente por transacción
  if (parsed.transaction) {
    const dup = await db
      .collection("members")
      .where("hotmartTransactionId", "==", parsed.transaction)
      .limit(1)
      .get();
    if (!dup.empty) return NextResponse.json({ ok: true, duplicate: true });
  }

  let uid: string;
  try {
    uid = (await auth.getUserByEmail(parsed.email)).uid;
  } catch {
    uid = (await auth.createUser({ email: parsed.email, emailVerified: false })).uid;
  }

  await db.collection("members").doc(uid).set(
    {
      email: parsed.email,
      fullName: parsed.name,
      status: "active",
      hotmartTransactionId: parsed.transaction,
      purchasedAt: FieldValue.serverTimestamp(),
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
