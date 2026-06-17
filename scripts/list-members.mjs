// Lista las miembras registradas (correo, estado, admin, origen).
// Uso: node --env-file=.env.local scripts/list-members.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();
const snap = await db.collection("members").get();
console.log(`Total miembras: ${snap.size}`);
snap.forEach((d) => {
  const m = d.data();
  console.log(
    `- ${m.email ?? "(sin correo)"} | status=${m.status ?? "-"} | admin=${Boolean(m.isAdmin)} | source=${m.source ?? "-"}`
  );
});
process.exit(0);
