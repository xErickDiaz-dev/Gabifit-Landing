// Autenticación del portal masterclass.
// Sin base de datos: la cookie guarda un HMAC firmado con MASTERCLASS_CODE,
// así que rotar el código en Vercel invalida todas las cookies existentes.
// Usa Web Crypto para ser compatible con el edge runtime del middleware.

export const ACCESS_COOKIE = "gabifit_mc";
export const ACCESS_MAX_AGE = 180 * 24 * 60 * 60; // 180 días — cubre las 8 semanas con margen

const TOKEN_MESSAGE = "gabifit-masterclass-v1";

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAccessToken(code: string): Promise<string> {
  return hmacHex(normalizeCode(code), TOKEN_MESSAGE);
}

export async function isValidAccessToken(
  token: string | undefined
): Promise<boolean> {
  const code = process.env.MASTERCLASS_CODE;
  if (!code || !token) return false;
  const expected = await createAccessToken(code);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
