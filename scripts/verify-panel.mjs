// Verifica el panel admin mejorado EN PRODUCCIÓN: login → panel carga →
// el progreso se guarda en el servidor (marca/desmarca una lección de prueba).
// Uso: node --env-file=.env.local scripts/verify-panel.mjs <contraseña>
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ADMIN_EMAIL = "gabifitxlpp@gmail.com";
const BASE = "https://www.gabifitrd.com";
const password = process.argv[2];
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const TEST_LESSON = 99; // id ficticio: no choca con lecciones reales

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const auth = getAuth();
const db = getFirestore();

// 1. Login
const login = await (
  await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password, returnSecureToken: true }),
  })
).json();
console.log("1. Login:", login.idToken ? "OK" : "FALLO " + (login.error && login.error.message));
if (!login.idToken) process.exit(1);

// 2. Sesión
const sess = await fetch(`${BASE}/api/auth/session`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken: login.idToken }),
});
const cookie = (sess.headers.get("set-cookie") || "").split(";")[0];
console.log("2. Sesión:", sess.status);

// 3. El panel carga y muestra el bloque de miembras
const panel = await fetch(`${BASE}/masterclass/admin`, { headers: { Cookie: cookie } });
const html = await panel.text();
console.log(
  "3. GET /masterclass/admin:", panel.status,
  html.includes("miembras") ? "(muestra 'Tus miembras' ✓)" : "(¡sin tabla de miembras?)"
);

// 4. Guardar progreso (marcar lección de prueba)
const u = await auth.getUserByEmail(ADMIN_EMAIL);
const mark = await fetch(`${BASE}/api/progress`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ lessonId: TEST_LESSON, done: true }),
});
const afterMark = (await db.collection("members").doc(u.uid).get()).data();
console.log(
  "4. POST /api/progress (marcar):", mark.status,
  (afterMark.completedLessons || []).includes(TEST_LESSON) ? "→ guardado en servidor ✓" : "→ NO se guardó"
);

// 5. Limpiar (desmarcar la lección de prueba)
await fetch(`${BASE}/api/progress`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ lessonId: TEST_LESSON, done: false }),
});
const afterClean = (await db.collection("members").doc(u.uid).get()).data();
console.log(
  "5. Limpieza (desmarcar):",
  (afterClean.completedLessons || []).includes(TEST_LESSON) ? "aún está" : "quitado ✓"
);
process.exit(0);
