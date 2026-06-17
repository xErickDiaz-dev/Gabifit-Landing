// Crea (o actualiza) una cuenta y la deja como ADMIN + ACTIVA. Para la cuenta de Gabi.
// Genera una contraseña temporal fuerte (cambiarla en el primer acceso).
// Uso: node --env-file=.env.local scripts/create-admin.mjs <correo> [nombre]
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";

const email = process.argv[2];
const fullName = process.argv[3] ?? "Gabi";
if (!email) {
  console.error("Uso: node --env-file=.env.local scripts/create-admin.mjs <correo> [nombre]");
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
const normalized = email.trim().toLowerCase();
// Contraseña temporal: legible pero fuerte (mayúscula, dígitos hex, símbolo).
const password = "Gabi" + randomBytes(4).toString("hex") + "!";

let user = await auth.getUserByEmail(normalized).catch(() => null);
let action;
if (user) {
  user = await auth.updateUser(user.uid, { password });
  action = "ya existía (le puse contraseña nueva)";
} else {
  user = await auth.createUser({ email: normalized, password, displayName: fullName });
  action = "creada";
}

await db.collection("members").doc(user.uid).set(
  { isAdmin: true, status: "active", email: normalized, fullName, source: "admin-seed" },
  { merge: true }
);

console.log(`OK Cuenta ${action}: ${normalized}`);
console.log(`   admin=true | status=active | uid=${user.uid}`);
console.log(`   CONTRASENA_TEMPORAL=${password}`);
console.log(`   Entrar: https://www.gabifitrd.com/masterclass`);
process.exit(0);
