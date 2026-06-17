// Marca una cuenta como ADMIN (isAdmin: true) y la ACTIVA (status: active).
// Sirve para la cuenta de Gabi, que necesita ver el panel /masterclass/admin
// y aprobar/rechazar solicitudes. La cuenta debe existir antes (registrarse en
// /masterclass/registro o haber comprado por Hotmart).
//
// Uso: node --env-file=.env.local scripts/make-admin.mjs correo@de-gabi.com
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const email = process.argv[2];
if (!email) {
  console.error("Uso: node --env-file=.env.local scripts/make-admin.mjs <correo>");
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
const user = await auth.getUserByEmail(normalized).catch(() => null);
if (!user) {
  console.error(
    `No existe una cuenta con el correo ${normalized}.\n` +
      `Primero regístrala en https://www.gabifitrd.com/masterclass/registro`
  );
  process.exit(1);
}

await db
  .collection("members")
  .doc(user.uid)
  .set({ isAdmin: true, status: "active", email: user.email }, { merge: true });

console.log(
  `✅ ${normalized} ahora es ADMIN y está ACTIVA (uid: ${user.uid}).\n` +
    `Puede entrar a https://www.gabifitrd.com/masterclass/admin`
);
process.exit(0);
