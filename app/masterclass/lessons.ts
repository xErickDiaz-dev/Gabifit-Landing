// ============================================================
// CONFIGURACIÓN DEL MASTERCLASS — ESTE ES EL ÚNICO ARCHIVO QUE
// HAY QUE TOCAR PARA CONECTAR LOS VIDEOS.
//
// Cuando Gaby grabe un video:
//   1. Súbelo a Cloudinary (cuenta dmkx2uowd, carpeta "masterclass")
//   2. Copia la URL del video (botón "Copy URL" en Cloudinary)
//   3. Pégala en el campo videoUrl de la lección correspondiente
//   4. Despliega con: vercel --prod
//
// Una lección con videoUrl: "" se muestra como "Próximamente".
// ============================================================

export type Phase = {
  id: 1 | 2 | 3;
  name: string;
  subtitle: string;
  weeks: string;
  color: "neon" | "purple" | "white";
};

export type Lesson = {
  id: number;
  phase: 1 | 2 | 3;
  week: string;
  title: string;
  duration: string;
  description: string;
  videoUrl: string; // "" = próximamente
};

export type Guide = {
  slug: string;
  file: string;
  title: string;
  description: string;
  phases: number[];
};

export const PHASES: Phase[] = [
  {
    id: 1,
    name: "Reset del Cuerpo",
    subtitle: "Básico — despertamos tu piso pélvico y tu core profundo",
    weeks: "Semanas 1-2",
    color: "neon",
  },
  {
    id: 2,
    name: "Progresión Hormonal",
    subtitle: "Intermedio — fuerza progresiva y nutrición para tus hormonas",
    weeks: "Semanas 3-5",
    color: "purple",
  },
  {
    id: 3,
    name: "Intensidad Adaptada",
    subtitle: "Avanzado — más intensidad, tu nuevo estilo de vida",
    weeks: "Semanas 6-8",
    color: "white",
  },
];

export const LESSONS: Lesson[] = [
  {
    id: 1,
    phase: 1,
    week: "Semana 1",
    title: "El Despertar — Respiración Diafragmática y Piso Pélvico",
    duration: "20-25 min",
    description:
      "Tu cuerpo no está roto: está en proceso de reconstruirse. Hoy no vamos a quemar grasa — vamos a despertar el sistema que controla todo lo demás: tu diafragma y tu piso pélvico. Lo que hagas estas dos primeras semanas determina cómo avanza todo el programa.",
    videoUrl: "",
  },
  {
    id: 2,
    phase: 1,
    week: "Semanas 1-2",
    title: "Caminata, Postura y Reconexión al Core",
    duration: "25-30 min",
    description:
      "Tu primer movimiento real: caminar con intención, corregir la postura que el embarazo cambió, y reconectar con tu core profundo. Vas a sentir tu cuerpo despertar sin forzarlo.",
    videoUrl: "",
  },
  {
    id: 3,
    phase: 1,
    week: "Semanas 1-2",
    title: "Come para Recuperarte — Nutrición Base Post-Parto",
    duration: "20-25 min",
    description:
      "Nada de dietas de castigo. Aquí aprendes a comer para sanar: alimentación anti-inflamatoria, adaptada a la lactancia, que le da a tu cuerpo lo que necesita para reconstruirse con energía.",
    videoUrl: "",
  },
  {
    id: 4,
    phase: 2,
    week: "Semana 3",
    title: "Diastasis Recti — Cómo Saber si lo Tienes y Qué Hacer",
    duration: "25-30 min",
    description:
      "La separación abdominal que nadie te explicó. Aprende a auto-evaluarte en casa con las manos, entender qué significa tu resultado, y qué ejercicios hacer (y cuáles evitar) para cerrarla de forma segura.",
    videoUrl: "",
  },
  {
    id: 5,
    phase: 2,
    week: "Semanas 3-4",
    title: "Nutrición Hormonal — Come para tus Hormonas",
    duration: "25 min",
    description:
      "Cortisol elevado, estrógeno fluctuante, prolactina: tus hormonas post-parto crean resistencia a bajar de peso con métodos convencionales. Aquí aprendes a comer a favor de tu ciclo, no en contra.",
    videoUrl: "",
  },
  {
    id: 6,
    phase: 2,
    week: "Semana 4",
    title: "Fuerza Progresiva — Sentadillas, Lunges y Brazos",
    duration: "30-35 min",
    description:
      "Empieza la fuerza de verdad: sentadillas, lunges y brazos sin equipo, en 30 minutos desde casa. Progresiones seguras que respetan tu piso pélvico mientras construyes el cuerpo que quieres.",
    videoUrl: "",
  },
  {
    id: 7,
    phase: 2,
    week: "Semana 5",
    title: "Tu Mente También se Recupera — Ejercicio y Salud Mental",
    duration: "20-25 min",
    description:
      "La recuperación no es solo física. Hablemos de la crisis de identidad, del agotamiento, y de cómo el movimiento se convierte en tu herramienta de salud mental — no en otra obligación más.",
    videoUrl: "",
  },
  {
    id: 8,
    phase: 3,
    week: "Semana 6",
    title: "Cardio de Regreso — Aeróbico Seguro y Progresivo",
    duration: "30 min",
    description:
      "Vuelve el cardio — pero a tu manera. Aeróbico progresivo que acelera tu metabolismo sin castigar tus articulaciones ni tu piso pélvico. Vas a sudar y te va a encantar.",
    videoUrl: "",
  },
  {
    id: 9,
    phase: 3,
    week: "Semanas 6-7",
    title: "Core Fuerte — Más Allá de la Diastasis",
    duration: "30 min",
    description:
      "Tu core ya despertó, ya sanó — ahora vamos a hacerlo fuerte de verdad. Trabajo profundo y funcional que se nota en tu postura, tu cintura y tu fuerza para cargar a tu bebé sin dolor.",
    videoUrl: "",
  },
  {
    id: 10,
    phase: 3,
    week: "Semana 7",
    title: "Suplementación y Detox — Lo Que Funciona de Verdad",
    duration: "25 min",
    description:
      "Sin humo y sin productos milagro: qué suplementos valen la pena en el post-parto, cuáles son perder dinero, y cómo hacer el Mamá Reset de 7 días de forma segura.",
    videoUrl: "",
  },
  {
    id: 11,
    phase: 3,
    week: "Semana 8",
    title: "Integración y Mantenimiento — Tu Nuevo Estilo de Vida",
    duration: "25-30 min",
    description:
      "Llegaste. Ahora hablemos de cómo mantener todo lo que construiste: tu plan de las semanas 9-12, cómo seguir progresando sola, y cómo este programa se convierte en tu nuevo estilo de vida.",
    videoUrl: "",
  },
];

export const GUIDES: Guide[] = [
  {
    slug: "guia-nutricion",
    file: "/guias/guia-nutricion-gabifit.pdf",
    title: "Guía de Nutrición Post-Parto",
    description: "Tu base de alimentación anti-inflamatoria, adaptada a la lactancia.",
    phases: [1],
  },
  {
    slug: "protocolo-rutinas",
    file: "/guias/protocolo-rutinas-gabifit.pdf",
    title: "Protocolo de Rutinas",
    description: "Todas las rutinas del programa, semana por semana.",
    phases: [1, 2, 3],
  },
  {
    slug: "checklist-mama-en-forma",
    file: "/guias/checklist-mama-en-forma-gabifit.pdf",
    title: "Checklist Mamá en Forma",
    description: "Tu mapa diario: marca cada paso y mira tu progreso crecer.",
    phases: [1],
  },
  {
    slug: "tribu-gabifit",
    file: "/guias/tribu-gabifit.pdf",
    title: "Tribu Gabifit",
    description: "Cómo funciona tu comunidad de apoyo — no estás sola en esto.",
    phases: [1],
  },
  {
    slug: "menus-56-dias",
    file: "/guias/menus-56-dias-gabifit.pdf",
    title: "Menús 56 Días",
    description: "8 semanas de menús resueltos con lista de compras incluida.",
    phases: [2],
  },
  {
    slug: "mama-reset-detox",
    file: "/guias/mama-reset-detox-gabifit.pdf",
    title: "Mamá Reset — Detox 7 Días",
    description: "El reinicio de 7 días para destrabar tu energía (Fase 3).",
    phases: [3],
  },
  {
    slug: "suplementacion",
    file: "/guias/suplementacion-gabifit.pdf",
    title: "Guía de Suplementación",
    description: "Lo que funciona de verdad en el post-parto — sin humo.",
    phases: [3],
  },
];

export const MEDICAL_DISCLAIMER =
  "Este programa está diseñado para mujeres con parto vaginal sin complicaciones. Si tuviste cesárea, espera la aprobación de tu médico antes de comenzar (mínimo 6-8 semanas). Si sientes dolor, sangrado excesivo, presión en el piso pélvico o cualquier malestar — para de inmediato y consulta a tu ginecólogo. Este contenido es educativo y no reemplaza la atención médica personalizada.";

export const LOGO_URL =
  "https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png";

// Genera un poster (miniatura) automático desde la URL del video de Cloudinary
export function cloudinaryPoster(videoUrl: string): string | undefined {
  if (!videoUrl.includes("res.cloudinary.com")) return undefined;
  return videoUrl
    .replace("/upload/", "/upload/so_2,q_auto,f_jpg/")
    .replace(/\.(mp4|mov|webm)$/i, ".jpg");
}

export function getLesson(id: number): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function guidesForPhase(phase: number): Guide[] {
  return GUIDES.filter((g) => g.phases.includes(phase));
}
