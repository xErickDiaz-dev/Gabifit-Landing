import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { normalizeLead, type Lead } from "@/lib/leads";

export const dynamic = "force-dynamic";

// Los leads se guardan en Firestore. La versión anterior sólo escribía un
// .jsonl en process.cwd(), y eso en Vercel no existe: el sistema de archivos
// es de sólo lectura, así que el mkdir reventaba y la mamá que dejaba su
// correo recibía un 400. El archivo local se queda, pero sólo en desarrollo.
async function guardarEnFirestore(lead: Lead): Promise<boolean> {
  try {
    await adminDb()
      .collection("leads")
      .add({ ...lead, createdAt: FieldValue.serverTimestamp() });
    return true;
  } catch (e) {
    console.error("[lead] Firestore falló:", e);
    return false;
  }
}

async function guardarEnDisco(lead: Lead): Promise<boolean> {
  if (process.env.VERCEL) return false; // en serverless no hay disco donde escribir
  try {
    const dir = path.join(process.cwd(), ".leads");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "leads.jsonl"),
      JSON.stringify({ ...lead, ts: new Date().toISOString() }) + "\n",
      "utf8"
    );
    return true;
  } catch {
    return false;
  }
}

// MailerLite es un extra: si no está configurado o falla, el lead ya está a salvo.
async function mandarAMailerLite(lead: Lead): Promise<void> {
  const token = process.env.MAILERLITE_API_TOKEN;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  if (!token || !groupId) return;
  await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: lead.email,
      fields: {
        name: lead.name ?? "",
        phone: lead.whatsapp ?? "",
        source: lead.source,
        utm_source: lead.utm_source ?? "",
        utm_campaign: lead.utm_campaign ?? "",
      },
      groups: [groupId],
    }),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const lead = normalizeLead((body ?? {}) as Record<string, unknown>);
  if (!lead) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const [enFirestore, enDisco] = await Promise.all([
    guardarEnFirestore(lead),
    guardarEnDisco(lead),
  ]);

  // Si no se guardó en ningún lado, es culpa nuestra: 500 para que el front
  // pueda reintentar, no 400 (que le diría a la clienta que escribió mal).
  if (!enFirestore && !enDisco) {
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }

  void mandarAMailerLite(lead).catch((e) => console.error("[lead] MailerLite:", e));

  return NextResponse.json({ ok: true });
}
