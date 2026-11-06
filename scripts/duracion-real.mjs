// Pone en cada lección la duración REAL del video que está publicado.
// El rótulo venía de cuando se especificó el programa ("20-25 min") y no tiene que ver
// con lo que dura el video (0:36 a 2:22), así que el portal mostraba "30 min" encima de
// un video de 55 segundos.
//
//   node --env-file=.env.local scripts/duracion-real.mjs        → ensayo
//   node --env-file=.env.local scripts/duracion-real.mjs --go   → escribe
//
// La duración se mide del MP4 que está en el bucket, no de un archivo local: así el
// rótulo no puede quedar describiendo una versión que ya no está publicada.
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { execFileSync } from "node:child_process";

const GO = process.argv.includes("--go");

initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n"),
})});
const db = getFirestore();

// m:ss, truncado — es lo que marca el reproductor como tiempo total.
function etiqueta(segundos) {
  const t = Math.floor(segundos);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

const snap = await db.collection("lessons").orderBy("sortOrder").get();
const cambios = [];
for (const d of snap.docs) {
  const x = d.data();
  if (!x.videoUrl) { console.log(`${x.id}: sin video, se salta`); continue; }
  const seg = Number(execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", x.videoUrl,
  ]).toString().trim());
  if (!Number.isFinite(seg) || seg <= 0) throw new Error(`no se pudo medir la lección ${x.id}`);
  const nueva = etiqueta(seg);
  cambios.push({ id: x.id, antes: x.duration, despues: nueva, seg, title: x.title });
  console.log(`${String(x.id).padStart(2)} | ${String(x.antes ?? x.duration).padEnd(12)} → ${nueva.padEnd(6)} | ${x.title.slice(0, 44)}`);
}

if (!GO) { console.log("\n(ensayo — nada escrito. Correr con --go.)"); process.exit(0); }

const lote = db.batch();
for (const c of cambios) lote.update(db.collection("lessons").doc(String(c.id)), { duration: c.despues });
await lote.commit();
console.log(`\n${cambios.length} duraciones actualizadas`);
process.exit(0);
