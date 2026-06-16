// ============================================================
// Datos ESTÁTICOS del masterclass: fases, guías PDF y textos.
// Las LECCIONES viven ahora en Firestore (colección "lessons") y se leen
// con lib/lessons-db.ts — el videoUrl nunca llega al cliente.
// El admin (Fase 3) edita las lecciones; aquí solo quedan datos que no cambian.
// ============================================================

// El tipo cliente de una lección vive en lessons-dto (puro, sin Firebase).
export type { ClientLesson } from "@/lib/lessons-dto";

export type Phase = {
  id: 1 | 2 | 3;
  name: string;
  subtitle: string;
  weeks: string;
  color: "neon" | "purple" | "white";
};

export type Guide = {
  slug: string;
  file: string;
  cover: string;
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

export const GUIDES: Guide[] = [
  {
    slug: "guia-nutricion",
    cover: "/guias/covers/guia-nutricion.jpg",
    file: "/api/guias/guia-nutricion-gabifit.pdf",
    title: "Guía de Nutrición Post-Parto",
    description: "Tu base de alimentación anti-inflamatoria, adaptada a la lactancia.",
    phases: [1],
  },
  {
    slug: "protocolo-rutinas",
    cover: "/guias/covers/protocolo-rutinas.jpg",
    file: "/api/guias/protocolo-rutinas-gabifit.pdf",
    title: "Protocolo de Rutinas",
    description: "Todas las rutinas del programa, semana por semana.",
    phases: [1, 2, 3],
  },
  {
    slug: "checklist-mama-en-forma",
    cover: "/guias/covers/checklist-mama-en-forma.jpg",
    file: "/api/guias/checklist-mama-en-forma-gabifit.pdf",
    title: "Checklist Mamá en Forma",
    description: "Tu mapa diario: marca cada paso y mira tu progreso crecer.",
    phases: [1],
  },
  {
    slug: "tribu-gabifit",
    cover: "/guias/covers/tribu-gabifit.jpg",
    file: "/api/guias/tribu-gabifit.pdf",
    title: "Tribu Gabifit",
    description: "Cómo funciona tu comunidad de apoyo — no estás sola en esto.",
    phases: [1],
  },
  {
    slug: "menus-56-dias",
    cover: "/guias/covers/menus-56-dias.jpg",
    file: "/api/guias/menus-56-dias-gabifit.pdf",
    title: "Menús 56 Días",
    description: "8 semanas de menús resueltos con lista de compras incluida.",
    phases: [2],
  },
  {
    slug: "mama-reset-detox",
    cover: "/guias/covers/mama-reset-detox.jpg",
    file: "/api/guias/mama-reset-detox-gabifit.pdf",
    title: "Mamá Reset — Detox 7 Días",
    description: "El reinicio de 7 días para destrabar tu energía (Fase 3).",
    phases: [3],
  },
  {
    slug: "suplementacion",
    cover: "/guias/covers/suplementacion.jpg",
    file: "/api/guias/suplementacion-gabifit.pdf",
    title: "Guía de Suplementación",
    description: "Lo que funciona de verdad en el post-parto — sin humo.",
    phases: [3],
  },
];

export const MEDICAL_DISCLAIMER =
  "Este programa está diseñado para mujeres con parto vaginal sin complicaciones. Si tuviste cesárea, espera la aprobación de tu médico antes de comenzar (mínimo 6-8 semanas). Si sientes dolor, sangrado excesivo, presión en el piso pélvico o cualquier malestar — para de inmediato y consulta a tu ginecólogo. Este contenido es educativo y no reemplaza la atención médica personalizada.";

// Genera un poster (miniatura) automático desde la URL del video de Cloudinary.
export function cloudinaryPoster(videoUrl: string): string | undefined {
  if (!videoUrl.includes("res.cloudinary.com")) return undefined;
  return videoUrl
    .replace("/upload/", "/upload/so_2,q_auto,f_jpg/")
    .replace(/\.(mp4|mov|webm)$/i, ".jpg");
}

export function guidesForPhase(phase: number): Guide[] {
  return GUIDES.filter((g) => g.phases.includes(phase));
}
