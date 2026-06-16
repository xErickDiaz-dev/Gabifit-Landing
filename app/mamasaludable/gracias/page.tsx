import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¡Listo! Tu guía está en camino | Gabifit",
  description: "Revisa tu correo en menos de 60 segundos.",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
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
        <div className="max-w-3xl text-center">
          <span className="inline-block bg-brand-neon text-brand-black px-4 py-2 font-heading text-base md:text-lg mb-8">
            ✓ ESTÁS DENTRO
          </span>
          <h1 className="text-5xl md:text-8xl mb-8 leading-none">
            ¡LISTO, MAMI!
            <br />
            <span className="text-brand-neon">TU GUÍA VA EN CAMINO.</span>
          </h1>
          <p className="text-base md:text-lg font-mono normal-case opacity-80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Revisa tu correo en los próximos 60 segundos. Si no lo ves en la
            bandeja, mira en spam o promociones — y márcalo como{" "}
            <span className="text-brand-neon">no spam</span> para que los
            siguientes lleguen bien.
          </p>

          <div className="bg-brand-purple text-brand-black p-8 md:p-10 brutalist-shadow-neon mb-10">
            <h2 className="text-3xl md:text-4xl mb-4">
              YA QUE ESTÁS AQUÍ...
            </h2>
            <p className="font-mono normal-case text-base md:text-lg leading-relaxed mb-6">
              Cuando entres en postparto vas a querer esto: la Masterclass
              Post-Parto, mi programa completo de 8 semanas para recuperar tu
              cuerpo después del bebé. Acceso de por vida.
            </p>
            <a
              href="/#pricing"
              className="inline-block bg-brand-black text-brand-neon px-6 py-4 text-lg md:text-xl font-heading hover:bg-brand-white hover:text-brand-black transition-all"
            >
              → VER LA MASTERCLASS ($97)
            </a>
          </div>

          <p className="font-mono normal-case text-sm opacity-60">
            ¿No te llega el correo en 5 minutos? Escríbeme directo a{" "}
            <a
              href="https://wa.me/18098939904"
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
