import { NextResponse } from "next/server";
import { getCoachingClient } from "@/lib/session";
import {
  appendProgressEntry,
  uploadProgressPhoto,
  updateProgressPhotos,
} from "@/lib/coaching-db";
import { isoDate, type ProgressEntry } from "@/lib/coaching";

export const dynamic = "force-dynamic";

const MAX_PHOTOS = 3;

function toNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

// Decodifica un data URL (data:image/jpeg;base64,XXXX) a buffer + contentType.
function parseDataUrl(s: string): { buffer: Buffer; contentType: string } | null {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(s);
  if (!m) return null;
  return { contentType: m[1], buffer: Buffer.from(m[2], "base64") };
}

// La clienta registra una entrada de progreso (peso, medidas, nota y hasta 3 fotos).
export async function POST(request: Request) {
  const me = await getCoachingClient();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" && body.date ? body.date : isoDate(new Date());

  const entry: Omit<ProgressEntry, "id"> = {
    date,
    weight: toNum(body.weight),
    waist: toNum(body.waist),
    hips: toNum(body.hips),
    note: typeof body.note === "string" ? body.note.slice(0, 1000) : "",
    photoPaths: [],
  };

  const entryId = await appendProgressEntry(me.uid, entry);

  // Sube las fotos (si las hay) y guarda sus rutas en la entrada.
  const photos: string[] = Array.isArray(body.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];
  const paths: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const parsed = parseDataUrl(photos[i]);
    if (!parsed) continue;
    // Límite defensivo (~6MB por foto ya decodificada).
    if (parsed.buffer.length > 6 * 1024 * 1024) continue;
    const path = await uploadProgressPhoto(
      me.uid,
      entryId,
      i,
      parsed.buffer,
      parsed.contentType
    );
    paths.push(path);
  }
  if (paths.length) await updateProgressPhotos(me.uid, entryId, paths);

  return NextResponse.json({ ok: true, entryId, photoPaths: paths });
}
