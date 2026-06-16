// Lógica pura del webhook de Hotmart: verificación del token y mapeo de eventos.
// Sin dependencias externas para poder testearla de forma aislada.

export type HotmartAction = {
  action: "grant" | "revoke";
  email: string;
  name: string | null;
  transaction: string | null;
};

const GRANT_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
const REVOKE_EVENTS = new Set([
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_PROTEST",
  "PURCHASE_CANCELED",
  "SUBSCRIPTION_CANCELLATION",
]);

// Comparación en tiempo constante para no filtrar el token por timing.
export function isValidHottok(
  received: string | undefined | null,
  expected: string | undefined
): boolean {
  if (!expected || !received) return false;
  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= received.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function parseHotmartEvent(body: any): HotmartAction | null {
  const event = body?.event as string | undefined;
  if (!event) return null;
  const action = GRANT_EVENTS.has(event)
    ? "grant"
    : REVOKE_EVENTS.has(event)
      ? "revoke"
      : null;
  if (!action) return null;

  const buyer = body?.data?.buyer ?? {};
  const purchase = body?.data?.purchase ?? {};
  const email = String(buyer.email ?? "").trim().toLowerCase();
  if (!email) return null;

  return {
    action,
    email,
    name: buyer.name ? String(buyer.name) : null,
    transaction: purchase.transaction ? String(purchase.transaction) : null,
  };
}
