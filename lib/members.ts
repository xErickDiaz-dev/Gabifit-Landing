// Lógica PURA de registro y miembras — sin Firebase, testeable en aislamiento.

export type RegistroInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  password: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFullName(v: string): string | null {
  if (!v || v.trim().length < 2) return "Escribe tu nombre completo.";
  return null;
}

export function validateEmail(v: string): string | null {
  if (!v || !EMAIL_RE.test(v.trim())) return "Escribe un correo válido.";
  return null;
}

export function validateWhatsapp(v: string): string | null {
  const digits = (v ?? "").replace(/\D/g, "");
  if (digits.length < 8) return "Escribe tu WhatsApp con código de país.";
  return null;
}

export function validatePassword(v: string): string | null {
  if (!v || v.length < 8) return "Tu contraseña debe tener al menos 8 caracteres.";
  return null;
}

// Devuelve el primer mensaje de error, o null si todo está bien.
export function validateRegistro(input: Partial<RegistroInput>): string | null {
  return (
    validateFullName(input.fullName ?? "") ??
    validateEmail(input.email ?? "") ??
    validateWhatsapp(input.whatsapp ?? "") ??
    validatePassword(input.password ?? "")
  );
}

export type NewMemberDoc = {
  email: string;
  fullName: string;
  whatsapp: string;
  status: "pending";
  source: "registro-web";
  isAdmin: false;
};

// Construye el documento del nuevo member (sin createdAt; el handler añade el timestamp).
export function buildPendingMember(input: {
  email: string;
  fullName: string;
  whatsapp: string;
}): NewMemberDoc {
  return {
    email: input.email.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    whatsapp: input.whatsapp.replace(/\s+/g, " ").trim(),
    status: "pending",
    source: "registro-web",
    isAdmin: false,
  };
}

export type Screen = "login" | "pending" | "active" | "revoked";

// Decide qué pantalla ver en /masterclass según el estado de la miembra.
export function screenForMember(member: { status: string } | null): Screen {
  if (!member) return "login";
  if (member.status === "active") return "active";
  if (member.status === "pending") return "pending";
  return "revoked";
}
