// Smoke test E2E del flujo admin EN PRODUCCIÓN, como lo haría el navegador:
// login (REST) → cookie de sesión (/api/auth/session) → ver panel (/masterclass/admin)
// → aprobar una pendiente (/api/admin/members) → verificar en Firestore.
// La contraseña se pasa por argumento (NO se guarda en el archivo).
// Uso: node --env-file=.env.local scripts/demo-approve.mjs <contraseña> [correo-a-aprobar]
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ADMIN_EMAIL = "gabifitxlpp@gmail.com";
const BASE = "https://www.gabifitrd.com";
const password = process.argv[2];
const targetEmail = process.argv[3] ?? "lppmediatest@gmail.com";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!password) {
  console.error("Uso: node --env-file=.env.local scripts/demo-approve.mjs <contraseña> [correo]");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const auth = getAuth();
const db = getFirestore();

const target = await auth.getUserByEmail(targetEmail);
const before = (await db.collection("members").doc(target.uid).get()).data();
console.log(`Solicitud a aprobar: ${targetEmail}  (estado ANTES: ${before?.status})`);

// 1. Login como Gabi (Firebase REST, igual que el navegador)
const loginRes = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: ADMIN_EMAIL, password, returnSecureToken: true }) }
);
const login = await loginRes.json();
if (!login.idToken) { console.error("1. Login FALLÓ:", login.error?.message); process.exit(1); }
console.log(`1. Login OK como ${ADMIN_EMAIL}`);

// 2. Cambiar el idToken por la cookie de sesión httpOnly
const sessRes = await fetch(`${BASE}/api/auth/session`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: login.idToken }),
});
const setCookie = sessRes.headers.get("set-cookie");
if (!sessRes.ok || !setCookie) { console.error("2. Sesión FALLÓ:", sessRes.status); process.exit(1); }
const cookie = setCookie.split(";")[0];
console.log(`2. Sesión creada (cookie httpOnly) → ${sessRes.status}`);

// 3. Abrir el panel de admin (debe cargar = es admin)
const adminRes = await fetch(`${BASE}/masterclass/admin`, { headers: { Cookie: cookie } });
console.log(`3. GET /masterclass/admin → ${adminRes.status} ${adminRes.status === 200 ? "(Gabi VE el panel)" : "(¡404 = no es admin!)"}`);

// 4. Pulsar "Aprobar" sobre la solicitud
const approveRes = await fetch(`${BASE}/api/admin/members`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ uid: target.uid, action: "approve" }),
});
console.log(`4. POST aprobar ${targetEmail} → ${approveRes.status} ${approveRes.ok ? "OK" : "FALLÓ"}`);

// 5. Verificar el resultado en Firestore
const after = (await db.collection("members").doc(target.uid).get()).data();
console.log(`5. estado DESPUÉS: ${after?.status} ${after?.status === "active" ? "✓ APROBADA — ahora puede entrar al portal completo" : ""}`);
process.exit(0);
