import { describe, it, expect } from "vitest";
import {
  coachingProductMatches,
  instantiateRoutine,
  instantiateMealPlan,
  latestWeight,
  weightDelta,
  taskAdherence,
  lastNDates,
  normalizeClientType,
  libraryToExercise,
  attentionReasons,
  daysBetween,
  emptyLibraryExercise,
  type RoutineTemplate,
  type MealPlanTemplate,
  type ProgressEntry,
  type ClientTask,
} from "../coaching";

describe("coachingProductMatches", () => {
  it("hace match cuando el producto coincide", () => {
    expect(coachingProductMatches("123", "123")).toBe(true);
    expect(coachingProductMatches("  123 ", "123")).toBe(true);
  });
  it("NO hace match si no hay producto esperado (preserva masterclass)", () => {
    expect(coachingProductMatches("123", undefined)).toBe(false);
    expect(coachingProductMatches("123", "")).toBe(false);
  });
  it("NO hace match con productos distintos o nulos", () => {
    expect(coachingProductMatches("999", "123")).toBe(false);
    expect(coachingProductMatches(null, "123")).toBe(false);
  });
});

describe("instantiate* (copia-instantánea de plantilla)", () => {
  const routineTpl: RoutineTemplate = {
    id: "r1",
    name: "Full body",
    note: "base",
    days: [{ label: "Día 1", focus: "Tren superior", exercises: [] }],
  };
  it("copia la rutina sin compartir referencias con la plantilla", () => {
    const r = instantiateRoutine(routineTpl);
    r.days[0].label = "MODIFICADO";
    expect(routineTpl.days[0].label).toBe("Día 1"); // la plantilla no cambia
    expect(r.name).toBe("Full body");
    expect("id" in r).toBe(false); // la asignación no arrastra el id de plantilla
  });
  it("copia el plan de comidas sin compartir referencias", () => {
    const mealTpl: MealPlanTemplate = {
      id: "m1",
      name: "1800 kcal",
      note: "",
      kcalTarget: 1800,
      meals: [{ label: "Desayuno", time: "8am", items: [], note: "" }],
    };
    const m = instantiateMealPlan(mealTpl);
    m.meals[0].label = "X";
    expect(mealTpl.meals[0].label).toBe("Desayuno");
    expect(m.kcalTarget).toBe(1800);
  });
});

describe("métricas de progreso", () => {
  const entries: ProgressEntry[] = [
    { id: "a", date: "2026-01-01", weight: 70, waist: null, hips: null, note: "", photoPaths: [] },
    { id: "b", date: "2026-02-01", weight: 68, waist: null, hips: null, note: "", photoPaths: [] },
    { id: "c", date: "2026-03-01", weight: 66.5, waist: null, hips: null, note: "", photoPaths: [] },
  ];
  it("latestWeight toma el peso de la fecha más reciente", () => {
    expect(latestWeight(entries)).toBe(66.5);
    expect(latestWeight([])).toBeNull();
  });
  it("weightDelta usa el startWeight del perfil si existe", () => {
    expect(weightDelta(entries, 72)).toBe(-5.5); // 66.5 - 72
  });
  it("weightDelta cae a la primera entrada si no hay startWeight", () => {
    expect(weightDelta(entries, null)).toBe(-3.5); // 66.5 - 70
  });
});

describe("taskAdherence", () => {
  it("100% si todas las tareas se cumplen toda la ventana", () => {
    const days = lastNDates("2026-06-17", 7);
    const tasks: ClientTask[] = [
      { id: "t1", title: "Agua", cadence: "Diario", completions: days },
      { id: "t2", title: "Pasos", cadence: "Diario", completions: days },
    ];
    expect(taskAdherence(tasks, "2026-06-17", 7)).toBe(100);
  });
  it("0% sin tareas o sin cumplimientos", () => {
    expect(taskAdherence([], "2026-06-17")).toBe(0);
    expect(
      taskAdherence(
        [{ id: "t", title: "x", cadence: "Diario", completions: [] }],
        "2026-06-17"
      )
    ).toBe(0);
  });
  it("promedia entre tareas e ignora fechas fuera de la ventana", () => {
    const tasks: ClientTask[] = [
      // 7 de 7 días
      { id: "t1", title: "a", cadence: "Diario", completions: lastNDates("2026-06-17", 7) },
      // 0 de 7 (fecha vieja)
      { id: "t2", title: "b", cadence: "Diario", completions: ["2020-01-01"] },
    ];
    expect(taskAdherence(tasks, "2026-06-17", 7)).toBe(50);
  });
});

describe("normalizeClientType", () => {
  it("acepta tipos válidos y cae a upsell con basura", () => {
    expect(normalizeClientType("influencer")).toBe("influencer");
    expect(normalizeClientType("vip")).toBe("vip");
    expect(normalizeClientType(undefined)).toBe("upsell");
    expect(normalizeClientType("loquesea")).toBe("upsell");
  });
});

describe("libraryToExercise", () => {
  it("convierte un ejercicio de librería a snapshot de rutina (sin id)", () => {
    const lib = { ...emptyLibraryExercise(), id: "x", name: "Sentadilla", defaultSets: "4", imageUrl: "library/x.jpg" };
    const ex = libraryToExercise(lib);
    expect(ex.name).toBe("Sentadilla");
    expect(ex.sets).toBe("4");
    expect(ex.imageUrl).toBe("library/x.jpg");
    expect("id" in ex).toBe(false);
  });
});

describe("daysBetween + attentionReasons", () => {
  it("daysBetween cuenta días calendario", () => {
    expect(daysBetween("2026-06-01", "2026-06-12")).toBe(11);
  });
  it("una clienta al día no tiene razones", () => {
    expect(
      attentionReasons(
        { hasRoutine: true, taskCount: 3, adherence: 90, lastProgressAt: "2026-06-15", workoutsThisWeek: 3 },
        "2026-06-17"
      )
    ).toEqual([]);
  });
  it("acumula razones: sin rutina, adherencia baja, sin entrenar, sin progreso", () => {
    const reasons = attentionReasons(
      { hasRoutine: false, taskCount: 2, adherence: 10, lastProgressAt: null, workoutsThisWeek: 0 },
      "2026-06-17"
    );
    expect(reasons).toContain("Sin rutina asignada");
    expect(reasons).toContain("Adherencia baja");
    expect(reasons).toContain("No entrenó esta semana");
    expect(reasons).toContain("Sin registrar progreso");
  });
  it("no marca adherencia baja si no tiene tareas", () => {
    const reasons = attentionReasons(
      { hasRoutine: true, taskCount: 0, adherence: 0, lastProgressAt: "2026-06-16", workoutsThisWeek: 2 },
      "2026-06-17"
    );
    expect(reasons).not.toContain("Adherencia baja");
  });
});
