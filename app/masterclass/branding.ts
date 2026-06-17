// Constantes PÚBLICAS del portal (seguras para el bundle del cliente).
// IMPORTANTE: los componentes cliente (AccessGate, Dashboard, etc.) solo
// pueden importar de ESTE archivo — nunca de lessons.ts, porque lessons.ts
// contiene los videoUrl del contenido pagado y no debe llegar al JS público.

export const LOGO_URL =
  "https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png";

// Logo en tinta (fondo transparente) para el papel crema del portal
export const LOGO_INK = "/assets/logo-ink.png";

// Foto real de Gabi (login + registro). Vive en public/ (no en public/assets/,
// que el .vercelignore excluye por su peso), por eso carga en producción.
export const GABI_PHOTO = "/gabi-coach.jpeg";
export const GABI_CUTOUT = "/assets/gabi-cutout.webp";

export const WHATSAPP_HELP_URL =
  "https://wa.me/18098939904?text=" +
  encodeURIComponent(
    "¡Hola! Necesito ayuda con mi código de acceso del Masterclass Gabifit 💜"
  );
