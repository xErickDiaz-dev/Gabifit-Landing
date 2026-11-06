// Lógica pura del lead magnet: validar y normalizar lo que manda el formulario.
// Vive aquí (y no en la route) para poder testearla sin levantar Next.

export type LeadInput = {
  name?: unknown;
  email?: unknown;
  whatsapp?: unknown;
  source?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
};

export type Lead = {
  name: string | null;
  email: string;
  whatsapp: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const e = email.trim();
  // Suficiente para un formulario: un arroba, algo a cada lado y un punto detrás.
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t ? t : null;
}

// Devuelve null si el correo no sirve — la route responde 400 con eso.
export function normalizeLead(body: LeadInput): Lead | null {
  if (!isValidEmail(body.email)) return null;
  return {
    name: texto(body.name, 200),
    email: body.email.trim().toLowerCase(),
    whatsapp: texto(body.whatsapp, 50),
    source: texto(body.source, 80) ?? "desconocido",
    utm_source: texto(body.utm_source, 120),
    utm_medium: texto(body.utm_medium, 120),
    utm_campaign: texto(body.utm_campaign, 120),
    utm_content: texto(body.utm_content, 120),
  };
}
