import { describe, it, expect } from "vitest";
import { validateRegistro, buildPendingMember, screenForMember } from "../members";

describe("validateRegistro", () => {
  const ok = {
    fullName: "Ana Pérez",
    email: "ana@mail.com",
    whatsapp: "+1 809 123 4567",
    password: "12345678",
  };
  it("acepta un registro válido", () => {
    expect(validateRegistro(ok)).toBeNull();
  });
  it("rechaza nombre vacío", () => {
    expect(validateRegistro({ ...ok, fullName: " " })).toMatch(/nombre/i);
  });
  it("rechaza correo inválido", () => {
    expect(validateRegistro({ ...ok, email: "no-es-correo" })).toMatch(/correo/i);
  });
  it("rechaza whatsapp corto", () => {
    expect(validateRegistro({ ...ok, whatsapp: "123" })).toMatch(/whatsapp/i);
  });
  it("rechaza contraseña corta", () => {
    expect(validateRegistro({ ...ok, password: "123" })).toMatch(/contraseña/i);
  });
});

describe("buildPendingMember", () => {
  it("normaliza datos y marca pending, no-admin, origen web", () => {
    const doc = buildPendingMember({
      email: "  Ana@Mail.COM ",
      fullName: "  Ana  ",
      whatsapp: " +1 809 123 4567 ",
    });
    expect(doc.email).toBe("ana@mail.com");
    expect(doc.fullName).toBe("Ana");
    expect(doc.whatsapp).toBe("+1 809 123 4567");
    expect(doc.status).toBe("pending");
    expect(doc.isAdmin).toBe(false);
    expect(doc.source).toBe("registro-web");
  });
});

describe("screenForMember", () => {
  it("sin miembra → login", () => expect(screenForMember(null)).toBe("login"));
  it("active → active", () => expect(screenForMember({ status: "active" })).toBe("active"));
  it("pending → pending", () => expect(screenForMember({ status: "pending" })).toBe("pending"));
  it("revoked → revoked", () => expect(screenForMember({ status: "revoked" })).toBe("revoked"));
});
