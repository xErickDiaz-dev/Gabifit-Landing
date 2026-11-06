// Sube los 11 videos del masterclass a Firebase Storage y publica las lecciones.
//
//   node --env-file=.env.local subir-lecciones.mjs            → ensayo, no toca nada
//   node --env-file=.env.local subir-lecciones.mjs --go       → sube y publica
//
// El orden es el sortOrder que ya vive en Firestore (1..11); los archivos están
// numerados igual, así que el id del doc y el prefijo Lxx del archivo coinciden.
// Al nombre del objeto se le pega un sufijo aleatorio, como hace Cloudinary, para
// que la URL del contenido pagado no se pueda adivinar.
import { createHash, randomBytes } from "node:crypto";
import { statSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const GO = process.argv.includes("--go");
const SRC = "C:/Users/Tu papi/Desktop/Ai Builts/Hyperframe videos/_review_finales2/WEB";

const VIDEOS = [
  [1,  "L01-el-despertar"],
  [2,  "L02-caminata-postura-y-core"],
  [3,  "L03-come-para-recuperarte"],
  [4,  "L04-diastasis-abdominal"],
  [5,  "L05-nutricion-hormonal"],
  [6,  "L06-fuerza-progresiva"],
  [7,  "L07-tu-mente-tambien-se-recupera"],
  [8,  "L08-cardio-de-regreso"],
  [9,  "L09-core-fuerte"],
  [10, "L10-suplementacion-y-detox"],
  [11, "L11-integracion-y-mantenimiento"],
];

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n"),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const db = getFirestore();
const bucket = getStorage().bucket();

// Comprobación previa: los 11 archivos existen y cada lección existe en Firestore.
const plan = [];
for (const [id, base] of VIDEOS) {
  const local = `${SRC}/${base}.mp4`;
  if (!existsSync(local)) throw new Error(`falta el archivo ${local}`);
  const snap = await db.collection("lessons").doc(String(id)).get();
  if (!snap.exists) throw new Error(`no existe la lección ${id} en Firestore`);
  const row = snap.data();
  if (row.sortOrder !== id) throw new Error(`lección ${id} tiene sortOrder ${row.sortOrder}`);
  plan.push({ id, base, local, size: statSync(local).size, title: row.title, was: row.videoUrl || "" });
}

console.log(`bucket: ${bucket.name}`);
console.log(`origen: ${SRC}\n`);
for (const p of plan) {
  console.log(`${String(p.id).padStart(2)} · ${(p.size / 1048576).toFixed(0).padStart(3)} MB · ${p.title}`);
}
const total = plan.reduce((a, p) => a + p.size, 0);
console.log(`\ntotal ${(total / 1048576).toFixed(0)} MB en ${plan.length} lecciones`);

if (!GO) {
  console.log("\n(ensayo — nada subido. Correr con --go para subir y publicar.)");
  process.exit(0);
}

const hechas = [];
for (const p of plan) {
  const sufijo = randomBytes(4).toString("hex");
  const dest = `lessons/${String(p.id).padStart(2, "0")}-${p.base.replace(/^L\d\d-/, "")}-${sufijo}.mp4`;
  const t0 = Date.now();
  await bucket.upload(p.local, {
    destination: dest,
    resumable: true,
    metadata: {
      contentType: "video/mp4",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  const file = bucket.file(dest);
  await file.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${encodeURI(dest)}`;
  await db.collection("lessons").doc(String(p.id)).update({ videoUrl: url, isPublished: true });
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`[${p.id}/11] ${p.base} → ${dest}  (${seg}s)`);
  console.log(`        ${url}`);
  hechas.push({ id: p.id, title: p.title, dest, url, bytes: p.size, antes: p.was });
}

writeFileSync("subida-lecciones.json", JSON.stringify(hechas, null, 2));
console.log(`\n=== ${hechas.length} lecciones publicadas ===`);
process.exit(0);
