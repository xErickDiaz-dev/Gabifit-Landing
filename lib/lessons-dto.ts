// Tipos y transformación pura de lecciones — sin dependencias de Firebase,
// para mantener video_url fuera del cliente y poder testear la lógica aislada.

export type LessonRow = {
  id: number;
  phase: number;
  week: string;
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
  isPublished: boolean;
  sortOrder: number;
};

export type ClientLesson = {
  id: number;
  phase: number;
  week: string;
  title: string;
  duration: string;
  description: string;
  hasVideo: boolean;
};

// Una lección "tiene video" para el cliente solo si está publicada Y tiene URL.
// NUNCA expone videoUrl.
export function toClientLesson(row: Partial<LessonRow>): ClientLesson {
  return {
    id: row.id!,
    phase: row.phase!,
    week: row.week!,
    title: row.title!,
    duration: row.duration!,
    description: row.description!,
    hasVideo: Boolean(row.videoUrl) && Boolean(row.isPublished),
  };
}
