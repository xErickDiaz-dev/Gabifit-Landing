import { describe, it, expect } from "vitest";
import { isValidHottok, parseHotmartEvent } from "../hotmart";

describe("isValidHottok", () => {
  it("acepta el token correcto", () => {
    expect(isValidHottok("secreto", "secreto")).toBe(true);
  });
  it("rechaza token incorrecto o vacío", () => {
    expect(isValidHottok("malo", "secreto")).toBe(false);
    expect(isValidHottok(undefined, "secreto")).toBe(false);
    expect(isValidHottok("secreto", "")).toBe(false);
  });
});

describe("parseHotmartEvent", () => {
  const base = (event: string) => ({
    event,
    data: {
      buyer: { email: "Ana@Mail.com", name: "Ana" },
      purchase: { transaction: "HP123", status: "APPROVED" },
    },
  });

  it("mapea compra aprobada a grant con email normalizado", () => {
    expect(parseHotmartEvent(base("PURCHASE_APPROVED"))).toEqual({
      action: "grant",
      email: "ana@mail.com",
      name: "Ana",
      transaction: "HP123",
      productId: null,
    });
  });

  it("extrae el id de producto (para distinguir el upsell de coaching)", () => {
    const withProduct = {
      event: "PURCHASE_APPROVED",
      data: {
        buyer: { email: "ana@mail.com", name: "Ana" },
        purchase: { transaction: "HP123" },
        product: { id: 998877 },
      },
    };
    expect(parseHotmartEvent(withProduct)?.productId).toBe("998877");
  });

  it("mapea reembolso/chargeback/cancelación a revoke", () => {
    for (const e of ["PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_CANCELED"]) {
      expect(parseHotmartEvent(base(e))?.action).toBe("revoke");
    }
  });

  it("ignora eventos no relevantes", () => {
    expect(parseHotmartEvent(base("PURCHASE_BILLET_PRINTED"))).toBeNull();
  });

  it("ignora eventos sin email", () => {
    expect(parseHotmartEvent({ event: "PURCHASE_APPROVED", data: {} })).toBeNull();
  });
});
