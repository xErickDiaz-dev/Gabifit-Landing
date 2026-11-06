import FAQAccordion from "./components/FAQAccordion";
import TestimonialSlider from "./components/TestimonialSlider";
import VSLPlayer from "./components/VSLPlayer";

// ⬇️ PEGAR AQUÍ el link de checkout de Hotmart cuando Gaby cree el producto.
// Mientras esté vacío, el botón abre WhatsApp con Gaby para no perder la venta.
const CHECKOUT_URL = "";
const WHATSAPP_FALLBACK =
  "https://wa.me/18098939904?text=" +
  encodeURIComponent(
    "Hola Gabi 💜 quiero acceder a la Masterclass Post-Parto ($97). ¿Cómo hago el pago?"
  );
const BUY_URL = CHECKOUT_URL || WHATSAPP_FALLBACK;

const PROMO_TEXT =
  "🔥 PRECIO DE LANZAMIENTO: ACCEDE POR SOLO $97 USD (PRECIO REGULAR $147) · PAGO ÚNICO · ACCESO DE POR VIDA";

const PROBLEMS = [
  {
    title: "EL CUERPO QUE NO RESPONDE",
    text: 'Haces ejercicio, comes "bien" y tu cuerpo simplemente no cambia. No es falta de voluntad — es que tu metabolismo post-parto tiene reglas distintas que nadie te explicó.',
  },
  {
    title: "YA NO TE RECONOCES",
    text: "Te miras al espejo y sientes que perdiste algo más que la figura. Esa mujer segura, llena de energía... ¿dónde está? La maternidad es hermosa, pero nadie te dijo que vendría con una crisis de identidad.",
  },
  {
    title: "SIN TIEMPO NI PARA RESPIRAR",
    text: 'No tienes 2 horas para ir al gym. Tienes un bebé que atender, una casa que mantener y una vida que vivir. Las rutinas "normales" no fueron diseñadas para ti.',
  },
  {
    title: "CADA DIETA DURA 3 DÍAS",
    text: "Probaste la dieta de tu amiga, la de Instagram, la del médico. Ninguna funciona porque ninguna fue creada para el cuerpo de una mamá post-parto. No es tu culpa.",
  },
];

const PILLARS = [
  {
    num: "01",
    name: "REINICIO CELULAR",
    desc: "Nutrición estratégica que reactiva tu metabolismo post-parto desde adentro. Sin contar calorías obsesivamente. Sin pasar hambre. Con menús reales para mamás con poco tiempo.",
    hoverColor: "hover:bg-brand-neon",
  },
  {
    num: "02",
    name: "RESETEO HORMONAL",
    desc: "Tu cuerpo post-parto tiene niveles distintos de cortisol, estrógeno y progesterona. El programa trabaja con tu ciclo femenino — no en su contra — para eliminar la grasa rebelde que las dietas normales no tocan.",
    hoverColor: "hover:bg-brand-purple",
  },
  {
    num: "03",
    name: "TRIBU DE MADRES",
    desc: "El apoyo real marca la diferencia. Grupo privado con Gabi activa, motivación de mujeres en tu mismo camino y seguimiento personalizado. Porque las transformaciones más poderosas no se hacen solas.",
    hoverColor: "hover:bg-brand-neon",
  },
];

const VALUE_STACK = [
  {
    item: "Masterclass Post-Parto — 3 fases, 8 semanas (Básico → Intermedio → Avanzado)",
    value: "$197",
    bonus: false,
  },
  {
    item: "Guía de Nutrición del Ciclo Femenino Post-Parto",
    value: "$67",
    bonus: false,
  },
  {
    item: "Protocolo de Rutinas Adaptadas (en casa, sin equipo)",
    value: "$47",
    bonus: false,
  },
  {
    item: "Menús de Recuperación Celular — 8 semanas completas",
    value: "$67",
    bonus: false,
  },
  { item: "🎁 BONO #1: Semana Detox Gabifit", value: "$37", bonus: true },
  {
    item: "🎁 BONO #2: Mini-Guía de Suplementación para Madres",
    value: "$27",
    bonus: true,
  },
  {
    item: '🎁 BONO #3: Checklist "Mamá en Forma" — descargable semanal',
    value: "$17",
    bonus: true,
  },
  {
    item: "🎁 BONO #4: Acceso al Grupo Privado Tribu Gabifit",
    value: "$37",
    bonus: true,
  },
  {
    item: "🎁 BONO #5: Soporte Directo con Gabi por WhatsApp — 30 días",
    value: "PRICELESS",
    bonus: true,
  },
];

const CREDENTIALS = [
  "9+ años de experiencia en fitness femenino",
  "Especialización en recuperación post-parto y metabolismo hormonal",
  "+300 clientes transformadas en 3+ países",
  "Creadora del Método Gabifit — enfoque integrado cuerpo-mente",
  "Comunidad activa Tribu Gabifit",
];

const STATS = [
  ["+300", "MADRES TRANSFORMADAS"],
  ["9", "AÑOS DE EXPERIENCIA"],
  ["+3", "PAÍSES"],
];

export default function GabifitLanding() {
  return (
    <div className="bg-brand-black text-brand-white font-sans uppercase antialiased overflow-x-hidden selection:bg-brand-neon selection:text-brand-black">
      {/* ── PROMO BAR ── */}
      <div className="bg-brand-neon text-brand-black py-4 border-b-4 border-brand-white font-bold text-lg md:text-2xl overflow-hidden">
        <div className="animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-5 whitespace-nowrap">
              {PROMO_TEXT} ·
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="bg-brand-black px-4 py-4 md:px-8 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="/">
          <img
            src="https://res.cloudinary.com/dmkx2uowd/image/upload/v1781725677/logo-yellow_ujv3gc.png"
            alt="Gabifit"
            className="h-16 md:h-24 drop-shadow-[0_0_15px_rgba(207,241,84,0.3)] hover:scale-105 transition-transform cursor-pointer"
          />
        </a>
        <div className="flex items-center gap-3 md:gap-4">
          <a
            href="/masterclass"
            className="font-heading text-sm md:text-xl text-brand-white hover:text-brand-neon transition-colors"
          >
            ENTRAR
          </a>
          <a
            href="/masterclass/registro"
            className="bg-brand-neon text-brand-black px-4 py-2 md:px-6 md:py-3 font-heading text-sm md:text-xl brutalist-shadow-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            REGISTRARME
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="bg-brand-black">
        <div className="max-w-6xl mx-auto px-4 pb-24">
          {/* VSL Video */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="brutalist-border brutalist-shadow-neon overflow-hidden">
              <VSLPlayer src="https://res.cloudinary.com/dmkx2uowd/video/upload/q_auto/f_auto/v1776184097/gabi_vsl_zxmkja.mp4" />
            </div>
          </div>

          {/* Headlines */}
          <div className="text-center">
            <h1 className="text-5xl md:text-8xl mb-6 leading-none">
              DEJA DE LUCHAR
              <br />
              CON TU CUERPO
              <br />
              <span className="text-brand-neon">POST-PARTO.</span>
            </h1>
            <h2 className="text-2xl md:text-4xl mb-8 text-brand-purple leading-tight font-heading">
              TU METABOLISMO NECESITA
              <br />
              UNA ESTRATEGIA —
              <br />
              NO MÁS SACRIFICIO.
            </h2>
            <p className="text-base md:text-lg font-mono normal-case opacity-80 max-w-2xl mx-auto mb-10 leading-relaxed">
              El programa de 8 semanas que enseña a las madres dominicanas a
              recuperar su figura, su energía y su identidad — con ciencia real,
              sin rutinas imposibles ni dietas de castigo.
            </p>

            <div className="flex flex-col items-center gap-4">
              <a
                href="#pricing"
                className="inline-block bg-brand-neon text-brand-black px-8 py-6 text-2xl md:text-4xl font-heading brutalist-shadow-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full max-w-2xl text-center"
              >
                → QUIERO EMPEZAR MI TRANSFORMACIÓN ($97)
              </a>
              <p className="font-mono text-sm opacity-60 normal-case">
                Acceso inmediato · Sin equipo · 100% desde casa
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── DIVIDER ── */}
      <div className="divider-line" />

      {/* ── PROBLEM SECTION ── */}
      <section className="py-24 px-4 md:px-12 bg-brand-white text-brand-black">
        <h2 className="text-6xl md:text-9xl mb-16 text-center leading-none">
          ¿ESTO TE SUENA
          <br />
          <span className="italic opacity-40">FAMILIAR?</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16 items-start">
          {/* Imagen */}
          <div className="brutalist-border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dmkx2uowd/image/upload/v1781725390/madre_cansada_cjyou1.jpg"
              alt="Madre post-parto"
              className="w-full h-auto grayscale brightness-75 contrast-150"
            />
          </div>
          {/* Tarjetas de problemas */}
          <div className="flex flex-col gap-5">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="border-b-4 border-brand-black pb-5">
                <h3 className="text-2xl md:text-3xl mb-2 text-brand-black">
                  {p.title}
                </h3>
                <p className="normal-case text-base font-mono text-brand-black/80 leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xl md:text-2xl font-mono font-bold normal-case max-w-2xl mx-auto text-brand-black">
          Eso no es debilidad. Es que nadie te dio la estrategia correcta para
          tu biología de mamá.
        </p>
      </section>

      {/* ── MISSION & COMMUNITY ── */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-brand-neon p-12 md:p-24 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-brand-white text-brand-black min-h-[400px]">
          <h2 className="text-7xl md:text-9xl mb-8 leading-none">
            EL PROGRAMA
          </h2>
          <p className="text-xl md:text-2xl font-bold normal-case leading-tight font-mono">
            Gabifit no es otro programa de "ejercítate más y come menos." Es un
            sistema diseñado desde cero para la fisiología post-parto: hormonas
            cambiadas, metabolismo lento, tiempo limitado y cero energía. Aquí
            todo tiene un propósito científico.
          </p>
        </div>
        <div className="bg-brand-purple p-12 md:p-24 flex flex-col justify-between text-brand-black min-h-[400px]">
          <h2 className="text-7xl md:text-9xl mb-8 leading-none">LA TRIBU</h2>
          <p className="text-xl md:text-2xl font-bold normal-case leading-tight font-mono">
            No vas a hacer esto sola. La Tribu Gabifit es una comunidad de
            madres reales que están en el mismo camino — con Gabi disponible,
            motivación diaria y la certeza de que alguien te está viendo
            avanzar.
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-brand-black border-y-4 border-brand-white py-10 px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-24 text-center">
          {STATS.map(([num, label]) => (
            <div key={label}>
              <div className="text-5xl md:text-7xl font-heading text-brand-neon">
                {num}
              </div>
              <div className="text-xs font-mono mt-2 opacity-60">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── METHOD ── */}
      <section className="py-32 px-4 md:px-12 grid-bg">
        <div className="mb-24">
          <h2 className="text-6xl md:text-9xl mb-2 italic">EL MÉTODO</h2>
          <h2 className="text-6xl md:text-9xl text-brand-neon">GABIFIT</h2>
          <p className="text-base md:text-lg font-mono normal-case opacity-70 max-w-xl mt-6 leading-relaxed">
            Tres pilares que trabajan juntos para que tu cuerpo vuelva a
            responder — sin mitos, sin castigos, sin excusas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-brand-white border-4 border-brand-white">
          {PILLARS.map((p) => (
            <div
              key={p.num}
              className={`bg-brand-black p-10 ${p.hoverColor} hover:text-brand-black transition-colors duration-300 cursor-pointer group hover:-translate-y-2`}
            >
              <span className="text-6xl font-heading mb-8 block">
                [{p.num}]
              </span>
              <h3 className="text-3xl mb-6">{p.name}</h3>
              <p className="normal-case opacity-70 group-hover:opacity-100 font-mono leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-32 px-4 md:px-12 bg-brand-black">
        <div className="mb-16 border-l-8 border-brand-neon pl-8">
          <h2 className="text-6xl md:text-9xl mb-4 leading-none">
            HISTORIAS DE
          </h2>
          <h2 className="text-6xl md:text-9xl text-brand-neon italic leading-none">
            MADRES REALES
          </h2>
          <p className="text-base font-mono normal-case opacity-60 mt-4">
            No te cuentes la historia — léela de ellas.
          </p>
        </div>
        <TestimonialSlider />
      </section>

      {/* ── OFFER / PRICING ── */}
      <section className="py-24 border-y-8 border-brand-white" id="pricing">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl md:text-7xl mb-4 text-center leading-none">
            TODO LO QUE RECIBES
            <br />
            AL UNIRTE HOY
          </h2>
          <p className="text-center font-mono normal-case opacity-70 mb-16 text-sm md:text-base">
            Un sistema completo — no un PDF suelto, no una lista de ejercicios
            genéricos. Un programa real con acceso inmediato.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Value Stack */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="border-4 border-brand-white overflow-hidden">
                {VALUE_STACK.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-start justify-between gap-4 p-4 border-b-2 border-brand-white/20 ${row.bonus ? "bg-brand-purple/10" : ""}`}
                  >
                    <span
                      className={`text-xs md:text-sm font-mono normal-case leading-relaxed flex-1 ${row.bonus ? "text-brand-purple" : "text-brand-white"}`}
                    >
                      {row.item}
                    </span>
                    <span className="text-brand-neon font-heading text-base md:text-lg whitespace-nowrap flex-shrink-0">
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-brand-white/10">
                  <span className="text-xl font-heading">VALOR TOTAL</span>
                  <span className="text-2xl font-heading line-through opacity-40">
                    $497
                  </span>
                </div>
              </div>

              {/* Urgency block */}
              <div className="border-4 border-brand-neon p-6">
                <p className="text-brand-neon font-mono text-sm normal-case leading-relaxed">
                  ⚡ Precio de lanzamiento: $97 (precio regular $147).
                  <br />
                  Pago único — acceso de por vida, incluyendo cada clase nueva
                  que se publica.
                  <br />
                  Las primeras 50 en unirse entran al Grupo VIP prioritario con
                  Gabi.
                </p>
              </div>
            </div>

            {/* Price Box */}
            <div className="lg:col-span-6 bg-brand-neon p-10 md:p-12 brutalist-shadow-white flex flex-col justify-center items-center text-brand-black">
              <span className="text-xl font-mono font-bold opacity-60 line-through mb-2">
                $147 USD
              </span>
              <span className="text-[100px] md:text-[130px] leading-none font-heading">
                $97
              </span>
              <span className="text-lg font-bold mb-8 font-mono text-center">
                PAGO ÚNICO / ACCESO DE POR VIDA
              </span>
              <a
                href={BUY_URL}
                target={CHECKOUT_URL ? "_blank" : undefined}
                rel={CHECKOUT_URL ? "noopener noreferrer" : undefined}
                className="w-full bg-brand-black text-brand-neon py-6 text-2xl md:text-3xl font-heading text-center hover:bg-brand-white hover:text-brand-black transition-all duration-300 cursor-pointer block"
              >
                → ACCEDER AHORA POR $97
              </a>
              <p className="text-xs font-mono mt-4 text-center opacity-80 normal-case">
                Acceso inmediato · Pago 100% seguro · Tarjeta, PayPal o
                transferencia
              </p>
              <p className="text-xs font-mono mt-3 text-center opacity-60 normal-case max-w-xs">
                Si sigues el programa con disciplina y no ves cambios en 30
                días, hablamos. La confianza es la base de la Tribu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COACH ── */}
      <section className="py-32 px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start max-w-7xl mx-auto">
          <div className="lg:col-span-5 brutalist-border brutalist-shadow-purple -rotate-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gabi-coach.jpeg"
              alt="Gabi, tu coach"
              className="w-full h-auto block"
            />
          </div>
          <div className="lg:col-span-7 pt-12">
            <h2 className="text-5xl md:text-8xl mb-8 italic leading-none">
              TU COACH:
              <br />
              GABI FIT
            </h2>
            <div className="bg-brand-white text-brand-black p-8 brutalist-shadow-neon mb-10">
              <p className="text-lg md:text-xl font-mono normal-case leading-relaxed">
                Soy Gabi — entrenadora con más de 9 años ayudando a
                mujeres a transformar su cuerpo y su confianza.
                <br />
                <br />
                Trabajo específicamente con mamás post-parto porque sé lo que
                significa mirar tu cuerpo y no reconocerte. He acompañado a más
                de 300 madres en República Dominicana, EEUU y más — a recuperar
                su figura, sí, pero sobre todo a recuperarse a sí mismas.
                <br />
                <br />
                Aquí no se trata solo de bajar de peso.{" "}
                <strong>Se trata de volver a ser tú.</strong>
              </p>
            </div>
            <ul className="flex flex-col gap-3 font-mono">
              {CREDENTIALS.map((c, i) => (
                <li
                  key={i}
                  className="bg-brand-black border-2 border-brand-white p-4 flex items-start gap-3"
                >
                  <span className="text-brand-neon flex-shrink-0">✅</span>
                  <span className="normal-case">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS EN VIDEO ── */}
      <section className="py-32 px-4 md:px-12 bg-brand-black border-t-4 border-brand-white">
        <div className="mb-16 border-l-8 border-brand-purple pl-8">
          <h2 className="text-6xl md:text-9xl mb-4 leading-none">
            ELLAS LO
          </h2>
          <h2 className="text-6xl md:text-9xl text-brand-purple italic leading-none">
            VIVIERON.
          </h2>
          <p className="text-base font-mono normal-case opacity-60 mt-4">
            Testimonios reales de madres que transformaron su vida con Gabifit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* ── Video 1: Elaine Zapata ── */}
          <div className="flex flex-col gap-6">
            <div className="brutalist-border brutalist-shadow-purple overflow-hidden">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-auto block"
              >
                <source src="https://storage.googleapis.com/gabifitrd.firebasestorage.app/web/testimonio-elaine-zapata-04d10fbf.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="border-l-4 border-brand-purple pl-6">
              <blockquote className="text-lg md:text-xl font-mono normal-case italic opacity-90 leading-relaxed mb-4">
                &ldquo;Antes de entrenar con ella no me sentía tan capaz, no sentía que tenía esa
                disciplina y esa constancia — hasta que comencé a entrenar con ella. Vi que sí pude.&rdquo;
              </blockquote>
              <p className="font-heading text-brand-purple text-xl">ELAINE ZAPATA</p>
              <p className="font-mono text-sm opacity-60 normal-case">Clienta Gabifit · Santo Domingo</p>
            </div>
          </div>

          {/* ── Video 2: María Cristina ── */}
          <div className="flex flex-col gap-6">
            <div className="brutalist-border brutalist-shadow-neon overflow-hidden">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-auto block"
              >
                <source src="https://res.cloudinary.com/dmkx2uowd/video/upload/q_auto/f_auto/v1776205653/Maria-cristina-testimonio-gabifit_xyxgxc.mov" type="video/mp4" />
              </video>
            </div>
            <div className="border-l-4 border-brand-neon pl-6">
              <blockquote className="text-lg md:text-xl font-mono normal-case italic opacity-90 leading-relaxed mb-4">
                &ldquo;Duré tres años entrenando con Gaby — fue una experiencia maravillosa, llena de acompañamiento. Me levantaba a las 5 de la mañana y lo hacía feliz por cómo me sentía y cómo estaba mi cuerpo.&rdquo;
              </blockquote>
              <p className="font-heading text-brand-neon text-xl">MARÍA CRISTINA</p>
              <p className="font-mono text-sm opacity-60 normal-case">3 años con Gabifit · Mamá postparto</p>
            </div>
          </div>

          {/* Espacio para los próximos 2 videos — agrega aquí */}
          {/* Video 3, 4 se añaden con el mismo patrón */}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-brand-white text-brand-black py-24 px-4 md:px-12">
        <div className="max-w-4xl">
          <h2 className="text-7xl md:text-9xl mb-16 underline decoration-brand-neon decoration-8 leading-none">
            PREGUNTAS SIN FILTRO
          </h2>
          <FAQAccordion />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-black p-12 md:p-24 border-t-8 border-brand-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dmkx2uowd/image/upload/v1781725677/logo-yellow_ujv3gc.png"
              alt="Gabifit"
              className="h-32 drop-shadow-[0_0_10px_rgba(207,241,84,0.2)] hover:scale-105 transition-transform cursor-pointer mb-8"
            />
            <p className="text-xs opacity-50 max-w-md normal-case leading-relaxed mb-4 font-mono">
              *Los resultados varían según el nivel de compromiso individual.
              Gabifit no garantiza resultados específicos. Los testimonios
              mostrados son reales y representan la experiencia de clientas que
              completaron el programa con disciplina.*
            </p>
            <p className="text-sm font-heading text-brand-neon">
              GABIFIT © 2026 · HECHO CON ❤️ PARA MADRES DOMINICANAS
            </p>
          </div>
          <div className="flex gap-8 text-xl font-heading">
            <a className="hover:text-brand-neon transition-colors" href="#">
              PRIVACIDAD
            </a>
            <a className="hover:text-brand-purple transition-colors" href="#">
              TÉRMINOS
            </a>
            <a className="hover:text-brand-neon transition-colors" href="#">
              CONTACTO
            </a>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ── */}
      <a
        href="#pricing"
        className="fixed bottom-6 right-6 z-50 bg-brand-neon text-brand-black p-5 font-heading text-xl brutalist-border md:hidden brutalist-shadow-white hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
      >
        ACCEDER AHORA
      </a>
    </div>
  );
}
