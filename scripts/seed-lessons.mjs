// Siembra las 11 lecciones en Firestore. Idempotente (set con doc id).
// Correr: node --env-file=.env.local scripts/seed-lessons.mjs
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

const LESSONS = [
  { id: 1, phase: 1, week: "Semana 1", title: "El Despertar — Respiración Diafragmática y Piso Pélvico", duration: "20-25 min", description: "Tu cuerpo no está roto: está en proceso de reconstruirse. Hoy no vamos a quemar grasa — vamos a despertar el sistema que controla todo lo demás: tu diafragma y tu piso pélvico. Lo que hagas estas dos primeras semanas determina cómo avanza todo el programa.", videoUrl: "", isPublished: false, sortOrder: 1 },
  { id: 2, phase: 1, week: "Semanas 1-2", title: "Caminata, Postura y Reconexión al Core", duration: "25-30 min", description: "Tu primer movimiento real: caminar con intención, corregir la postura que el embarazo cambió, y reconectar con tu core profundo. Vas a sentir tu cuerpo despertar sin forzarlo.", videoUrl: "", isPublished: false, sortOrder: 2 },
  { id: 3, phase: 1, week: "Semanas 1-2", title: "Come para Recuperarte — Nutrición Base Post-Parto", duration: "20-25 min", description: "Nada de dietas de castigo. Aquí aprendes a comer para sanar: alimentación anti-inflamatoria, adaptada a la lactancia, que le da a tu cuerpo lo que necesita para reconstruirse con energía.", videoUrl: "", isPublished: false, sortOrder: 3 },
  { id: 4, phase: 2, week: "Semana 3", title: "Diástasis Abdominal — Cómo Saber si la Tienes y Qué Hacer", duration: "25-30 min", description: "La separación abdominal que nadie te explicó. Aprende a autoevaluarte en casa con las manos, entender qué significa tu resultado, y qué ejercicios hacer (y cuáles evitar) para cerrarla de forma segura.", videoUrl: "", isPublished: false, sortOrder: 4 },
  { id: 5, phase: 2, week: "Semanas 3-4", title: "Nutrición Hormonal — Come para tus Hormonas", duration: "25 min", description: "Cortisol elevado, estrógeno fluctuante, prolactina: tus hormonas post-parto crean resistencia a bajar de peso con métodos convencionales. Aquí aprendes a comer a favor de tu ciclo, no en contra.", videoUrl: "", isPublished: false, sortOrder: 5 },
  { id: 6, phase: 2, week: "Semana 4", title: "Fuerza Progresiva — Sentadillas, Lunges y Brazos", duration: "30-35 min", description: "Empieza la fuerza de verdad: sentadillas, lunges y brazos sin equipo, en 30 minutos desde casa. Progresiones seguras que respetan tu piso pélvico mientras construyes el cuerpo que quieres.", videoUrl: "", isPublished: false, sortOrder: 6 },
  { id: 7, phase: 2, week: "Semana 5", title: "Tu Mente También se Recupera — Ejercicio y Salud Mental", duration: "20-25 min", description: "La recuperación no es solo física. Hablemos de la crisis de identidad, del agotamiento, y de cómo el movimiento se convierte en tu herramienta de salud mental — no en otra obligación más.", videoUrl: "", isPublished: false, sortOrder: 7 },
  { id: 8, phase: 3, week: "Semana 6", title: "Cardio de Regreso — Aeróbico Seguro y Progresivo", duration: "30 min", description: "Vuelve el cardio — pero a tu manera. Aeróbico progresivo que acelera tu metabolismo sin castigar tus articulaciones ni tu piso pélvico. Vas a sudar y te va a encantar.", videoUrl: "", isPublished: false, sortOrder: 8 },
  { id: 9, phase: 3, week: "Semanas 6-7", title: "Core Fuerte — Más Allá de la Diástasis", duration: "30 min", description: "Tu core ya despertó, ya sanó — ahora vamos a hacerlo fuerte de verdad. Trabajo profundo y funcional que se nota en tu postura, tu cintura y tu fuerza para cargar a tu bebé sin dolor.", videoUrl: "", isPublished: false, sortOrder: 9 },
  { id: 10, phase: 3, week: "Semana 7", title: "Suplementación y Detox — Lo Que Funciona de Verdad", duration: "25 min", description: "Sin humo y sin productos milagro: qué suplementos valen la pena en el post-parto, cuáles son perder dinero, y cómo hacer el Mamá Reset de 7 días de forma segura.", videoUrl: "", isPublished: false, sortOrder: 10 },
  { id: 11, phase: 3, week: "Semana 8", title: "Integración y Mantenimiento — Tu Nuevo Estilo de Vida", duration: "25-30 min", description: "Llegaste. Ahora hablemos de cómo mantener todo lo que construiste: tu plan de las semanas 9-12, cómo seguir progresando sola, y cómo este programa se convierte en tu nuevo estilo de vida.", videoUrl: "", isPublished: false, sortOrder: 11 },
];

for (const l of LESSONS) {
  await db.collection("lessons").doc(String(l.id)).set(l);
}
console.log(`Seeded ${LESSONS.length} lessons`);
process.exit(0);
