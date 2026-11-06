import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeLead } from "../leads";

describe("isValidEmail", () => {
  it("acepta correos normales", () => {
    expect(isValidEmail("gabi@gabifitrd.com")).toBe(true);
    expect(isValidEmail("  MAMA@mail.com  ")).toBe(true);
  });
  it("rechaza lo que no es correo", () => {
    for (const v of ["", "mama", "mama@", "@mail.com", "a b@mail.com", null, 42, undefined]) {
      expect(isValidEmail(v)).toBe(false);
    }
  });
  it("rechaza correos absurdamente largos", () => {
    expect(isValidEmail("a".repeat(250) + "@mail.com")).toBe(false);
  });
});

describe("normalizeLead", () => {
  it("devuelve null si el correo no sirve", () => {
    expect(normalizeLead({ email: "no-es-correo" })).toBeNull();
  });

  it("baja el correo a minusculas y recorta espacios", () => {
    const l = normalizeLead({ email: "  Mama@Mail.COM " })!;
    expect(l.email).toBe("mama@mail.com");
  });

  it("pone 'desconocido' cuando no viene source", () => {
    expect(normalizeLead({ email: "a@b.com" })!.source).toBe("desconocido");
  });

  it("deja en null los campos vacios en vez de cadenas vacias", () => {
    const l = normalizeLead({ email: "a@b.com", name: "   ", whatsapp: "" })!;
    expect(l.name).toBeNull();
    expect(l.whatsapp).toBeNull();
  });

  it("recorta los campos largos", () => {
    const l = normalizeLead({ email: "a@b.com", name: "x".repeat(500) })!;
    expect(l.name!.length).toBe(200);
  });

  it("ignora tipos raros sin reventar", () => {
    const l = normalizeLead({ email: "a@b.com", name: { hola: 1 }, utm_source: 7 })!;
    expect(l.name).toBeNull();
    expect(l.utm_source).toBeNull();
  });
});
