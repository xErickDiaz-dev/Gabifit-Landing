import type { Metadata } from "next";

// Página a la que Hotmart redirige DESPUÉS del pago (página de gracias / obrigado).
// Indica cómo activar la cuenta (crear contraseña). noindex.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "¡Bienvenida a Gabifit! Activa tu acceso",
  description: "Activa tu cuenta de la Masterclass Post-Parto.",
  robots: { index: false, follow: false },
};

const WHATSAPP_HELP =
  "https://wa.me/18098939904?text=" +
  encodeURIComponent("Hola Gabi 💜 acabo de comprar y necesito ayuda para activar mi acceso.");

export default function AccesoPage() {
  return (
    <div className="bg-brand-black text-brand-white font-sans uppercase antialiased min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-brand-black p-6 flex justify-center border-b-4 border-brand-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="/">
          <img
            src="https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png"
            alt="Gabifit"
            className="h-24 md:h-32"
          />
        </a>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full text-center">
          <span className="inline-block bg-brand-neon text-brand-black px-4 py-2 font-heading text-base md:text-lg mb-8">
            ✓ PAGO CONFIRMADO
          </span>
          <h1 className="text-5xl md:text-7xl mb-6 leading-none">
            ¡BIENVENIDA A LA
            <br />
            <span className="text-brand-neon">TRIBU GABIFIT!</span>
          </h1>
          <p className="text-base md:text-lg font-mono normal-case opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Tu lugar en el programa está reservado para siempre. Solo falta un paso para crear tu
            acceso.
          </p>

          {/* Pasos de activación */}
          <div className="bg-brand-purple text-brand-black p-8 md:p-10 brutalist-shadow-neon mb-10 text-left">
            <p className="font-mono text-sm normal-case mb-4 font-bold uppercase">
              Activa tu cuenta en 2 pasos:
            </p>
            <ol className="font-mono text-sm md:text-base normal-case leading-relaxed list-decimal pl-5 space-y-2">
              <li>
                Entra a tu portal y toca <strong>"Crear / recuperar mi contraseña"</strong>.
              </li>
              <li>
                Ingresa el <strong>correo de tu compra</strong> → te llega un enlace para crear tu
                contraseña y entrar.
              </li>
            </ol>
          </div>

          <a
            href="/masterclass"
            className="inline-block bg-brand-neon text-brand-black px-8 py-6 text-xl md:text-2xl font-heading brutalist-shadow-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full max-w-xl"
          >
            → IR A MI PORTAL
          </a>

          <p className="font-mono normal-case text-sm opacity-70 max-w-xl mx-auto mt-8 leading-relaxed">
            Dentro encuentras tus 7 guías para descargar hoy mismo y tus clases en video, que se
            publican semana a semana durante las 8 semanas del programa.
          </p>

          <p className="font-mono normal-case text-sm opacity-60 mt-8">
            ¿Algún problema para entrar? Escríbeme a{" "}
            <a
              href={WHATSAPP_HELP}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-neon underline hover:no-underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="bg-brand-black p-8 border-t-4 border-brand-white">
        <p className="text-center text-xs font-mono opacity-60">
          GABIFIT © 2026 · HECHO CON ❤️ PARA MADRES DOMINICANAS
        </p>
      </footer>
    </div>
  );
}
