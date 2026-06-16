import { describe, it, expect } from "vitest";
import { toClientLesson } from "../lessons-dto";

describe("toClientLesson", () => {
  it("quita videoUrl y expone hasVideo", () => {
    const dto = toClientLesson({
      id: 1, phase: 1, week: "Semana 1", title: "T", duration: "20 min",
      description: "D", videoUrl: "https://res.cloudinary.com/x/v.mp4",
      isPublished: true, sortOrder: 1,
    });
    expect((dto as Record<string, unknown>).videoUrl).toBeUndefined();
    expect(dto.hasVideo).toBe(true);
    expect(dto.id).toBe(1);
  });

  it("hasVideo es false si no está publicada o no hay url", () => {
    const base = { id: 2, phase: 1, week: "S", title: "T", duration: "x", description: "D", sortOrder: 2 };
    expect(toClientLesson({ ...base, videoUrl: "", isPublished: true }).hasVideo).toBe(false);
    expect(toClientLesson({ ...base, videoUrl: "http://v", isPublished: false }).hasVideo).toBe(false);
  });
});
