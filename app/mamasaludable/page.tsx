import type { Metadata } from "next";
import LeadForm from "./LeadForm";

export const metadata: Metadata = {
  title: "Ejercicios seguros en el embarazo | Guía gratis | Gabifit",
  description:
    "Guía gratis con ejercicios seguros para cada trimestre del embarazo. Qué hacer, qué evitar, cómo proteger tu suelo pélvico — por una coach que ha entrenado a +300 mamás.",
  openGraph: {
    title: "Ejercicios seguros en el embarazo | Gabifit",
    description:
      "Guía gratis con ejercicios seguros por trimestre. Qué hacer, qué evitar, cómo proteger tu suelo pélvico.",
    type: "website",
    url: "https://gabifitrd.com/mamasaludable",
  },
  alternates: {
    canonical: "https://gabifitrd.com/mamasaludable",
  },
};

const FAQS = [
  {
    q: "¿Es seguro entrenar durante el embarazo?",
    a: "En la mayoría de embarazos sin complicaciones, sí — y trae beneficios reales (parto más fácil, mejor energía, recuperación postparto más rápida). Siempre con luz verde de tu obstetra. Esta guía te explica el cómo seguro.",
  },
  {
    q: "¿Necesito gym o equipo especial?",
    a: "No. La guía está pensada para entrenar en casa. Equipo mínimo: tapete, una banda elástica y dos mancuernas livianas (3–8 lb). Una silla. Eso es todo.",
  },
  {
    q: "¿Sirve si nunca he entrenado antes?",
    a: "Sí, especialmente. La guía empieza con lo básico: caminar, respirar y suelo pélvico. Si nunca entrenaste, este es el mejor momento para empezar — gentil, progresivo, seguro.",
  },
  {
    q: "¿Y si ya pasé del primer trimestre?",
    a: "Perfecto. La guía cubre los 3 trimestres por separado. Vas directo al trimestre que estás viviendo ahora.",
  },
  {
    q: "¿Voy a recibir spam?",
    a: "No. Recibirás 5 correos en 8 días con tips reales para tu embarazo. Después solo te escribo los domingos cuando tenga algo importante. Te puedes salir cuando quieras.",
  },
];

const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gabi Fit",
  alternateName: "Gabifit",
  jobTitle: "Pregnancy & post-partum fitness coach",
  url: "https://gabifitrd.com/mamasaludable",
  image: "https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png",
  sameAs: [
    "https://instagram.com/gabifitrd",
    "https://tiktok.com/@gabifitrd",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Santiago",
    addressCountry: "DO",
  },
};

const SERVICE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Online pregnancy and postpartum fitness coaching",
  provider: { "@type": "Person", name: "Gabifit" },
  areaServed: { "@type": "Country", name: "Dominican Republic" },
  audience: {
    "@type": "PeopleAudience",
    audienceType: "Pregnant and postpartum mothers",
  },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// TODO: swap this URL for a real photo of Gabi training a pregnant client.
// Drop the photo in `public/assets/embarazo-hero.jpg` and change HERO_IMAGE_URL to "/assets/embarazo-hero.jpg".
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1200&q=80&auto=format&fit=crop";

export default function MamaSaludableLanding() {
  return (
    <div className="bg-brand-black text-brand-white font-sans uppercase antialiased overflow-x-hidden selection:bg-brand-neon selection:text-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />

      {/* ── NAVBAR ── */}
      <nav className="bg-brand-black p-6 flex justify-center border-b-4 border-brand-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="/">
          <img
            src="https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png"
            alt="Gabifit"
            className="h-24 md:h-32 drop-shadow-[0_0_15px_rgba(207,241,84,0.3)] hover:scale-105 transition-transform cursor-pointer"
          />
        </a>
      </nav>

      {/* ── HERO ── */}
      <header className="bg-brand-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* LEFT: Hero photo */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="brutalist-border brutalist-shadow-neon overflow-hidden -rotate-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_IMAGE_URL}
                  alt="Mamá embarazada entrenando con Gabifit"
                  className="w-full h-auto block aspect-[4/5] object-cover"
                  loading="eager"
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="bg-brand-neon text-brand-black p-4 text-center">
                  <div className="font-heading text-3xl md:text-4xl">+9</div>
                  <div className="font-mono text-[9px] md:text-xs normal-case mt-1 leading-tight">AÑOS ENTRENANDO MAMÁS</div>
                </div>
                <div className="bg-brand-purple text-brand-black p-4 text-center">
                  <div className="font-heading text-3xl md:text-4xl">+300</div>
                  <div className="font-mono text-[9px] md:text-xs normal-case mt-1 leading-tight">MAMÁS ACOMPAÑADAS</div>
                </div>
                <div className="bg-brand-white text-brand-black p-4 text-center">
                  <div className="font-heading text-3xl md:text-4xl">3</div>
                  <div className="font-mono text-[9px] md:text-xs normal-case mt-1 leading-tight">TRIMESTRES CUBIERTOS</div>
                </div>
              </div>
            </div>

            {/* RIGHT: Headline + form */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <span className="inline-block bg-brand-neon text-brand-black px-3 py-1 font-heading text-sm md:text-base mb-6">
                GUÍA GRATIS · DESCARGA INMEDIATA
              </span>
              <h1 className="text-4xl md:text-6xl xl:text-7xl mb-6 leading-none">
                EJERCICIOS<br />
                <span className="text-brand-neon">SEGUROS</span> EN<br />
                EL <span className="italic opacity-90">EMBARAZO.</span>
              </h1>
              <p className="text-base md:text-lg font-mono normal-case opacity-80 max-w-xl mb-8 leading-relaxed">
                Qué hacer, qué evitar, cómo proteger tu suelo pélvico — trimestre por trimestre. La guía que tu obstetra olvidó darte.
              </p>
              <div className="max-w-md">
                <LeadForm ctaLabel="QUIERO MI GUÍA GRATIS" />
              </div>
              <p className="font-mono text-sm opacity-60 normal-case mt-6">
                Diseñada para mamás dominicanas. 0 clichés. 0 dietas locas.
              </p>
            </div>

          </div>
        </div>
      </header>

      <div className="divider-line" />

      {/* ── PAIN MIRROR ── */}
      <section className="py-20 md:py-24 px-4 md:px-12 bg-brand-white text-brand-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl mb-12 leading-none">
            SI ESTÁS EMBARAZADA,<br />
            <span className="italic opacity-50">YA ESCUCHASTE</span><br />
            DEMASIADAS COSAS<br />
            CONTRADICTORIAS.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="border-l-8 border-brand-neon pl-6">
              <h3 className="text-2xl mb-3">"NO HAGAS NADA"</h3>
              <p className="font-mono normal-case text-base leading-relaxed text-brand-black/80">
                Tu suegra dice cama. Tu prima dice yoga. Internet dice CrossFit. ¿En quién creer?
              </p>
            </div>
            <div className="border-l-8 border-brand-purple pl-6">
              <h3 className="text-2xl mb-3">SUELO PÉLVICO ¿QUÉ?</h3>
              <p className="font-mono normal-case text-base leading-relaxed text-brand-black/80">
                Nadie te explicó qué es ni cómo cuidarlo — y es la diferencia entre un postparto fácil y uno complicado.
              </p>
            </div>
            <div className="border-l-8 border-brand-neon pl-6">
              <h3 className="text-2xl mb-3">MIEDO A HACERLO MAL</h3>
              <p className="font-mono normal-case text-base leading-relaxed text-brand-black/80">
                Por miedo, dejas de moverte. Y entonces sí llega el dolor lumbar, la fatiga, el insomnio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="py-20 md:py-24 px-4 md:px-12 bg-brand-black grid-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-7xl mb-4 leading-none">
            LO QUE VAS A
          </h2>
          <h2 className="text-5xl md:text-7xl mb-12 text-brand-neon italic leading-none">
            RECIBIR HOY:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: "01", title: "Ejercicios por trimestre", desc: "T1, T2 y T3 con sets, reps y modificaciones específicas para cada etapa." },
              { num: "02", title: "Lista de qué NO hacer", desc: "6 ejercicios que aumentan riesgo de diástasis, prolapso o caída. Evítalos." },
              { num: "03", title: "Suelo pélvico bien explicado", desc: "Las 2 técnicas base — respiración 360° y Kegel consciente. Bien hechas, no mal hechas." },
              { num: "04", title: "Plan de 7 días realista", desc: "Una semana ejemplo que sí puedes hacer entre náuseas, trabajo y la vida real." },
              { num: "05", title: "Equipo mínimo", desc: "Tapete, una banda, dos mancuernas livianas. Cero gym, cero excusas." },
              { num: "06", title: "Bonus: WhatsApp directo", desc: "Si te trabas con cualquier ejercicio, escríbeme. No te dejo en visto." },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-brand-black border-2 border-brand-white p-6 hover:border-brand-neon transition-colors"
              >
                <div className="font-heading text-brand-neon text-3xl mb-3">[{item.num}]</div>
                <h3 className="text-2xl mb-3">{item.title}</h3>
                <p className="font-mono normal-case text-sm leading-relaxed opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-md mx-auto">
            <LeadForm ctaLabel="ENVIARME LA GUÍA" />
          </div>
        </div>
      </section>

      {/* ── ABOUT GABI ── */}
      <section className="py-20 md:py-24 px-4 md:px-12 bg-brand-purple text-brand-black">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 brutalist-border brutalist-shadow-neon overflow-hidden -rotate-2">
            <video autoPlay loop muted playsInline className="w-full h-auto block">
              <source src="/coach-video.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="md:col-span-7">
            <h2 className="text-5xl md:text-7xl mb-6 italic leading-none">
              HOLA, SOY GABI.
            </h2>
            <p className="font-mono normal-case text-base md:text-lg leading-relaxed mb-6">
              Soy mamá, dominicana y coach. Después de mi primer embarazo entendí lo que ningún libro te dice: que tu cuerpo en el embarazo NO está roto, está construyendo. Y que entrenarlo bien ahora — gentil, consciente, específico — es lo que más te va a ayudar después.
              <br />
              <br />
              Llevo más de 9 años entrenando mujeres dominicanas. He acompañado a más de 300 mamás durante su embarazo y postparto. Sin dietas mágicas. Sin rutinas imposibles. Con ciencia real.
            </p>
            <ul className="flex flex-col gap-2 font-mono">
              {/* TODO: pendiente certificación principal de Gabi */}
              {/* TODO: pendiente especialización pre/postnatal si aplica */}
              <li className="flex items-start gap-2">
                <span>✅</span>
                <span className="normal-case">+9 años entrenando mujeres dominicanas</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✅</span>
                <span className="normal-case">+300 mamás acompañadas en embarazo y postparto</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✅</span>
                <span className="normal-case">Creadora del Método Gabifit</span>
              </li>
            </ul>
            <p className="mt-8 text-xs font-mono normal-case opacity-70 leading-relaxed">
              *Esta guía es educativa, no reemplaza atención médica. Antes de iniciar cualquier programa de ejercicios durante el embarazo, consulta con tu obstetra.*
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-brand-white text-brand-black py-20 md:py-24 px-4 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl mb-12 underline decoration-brand-neon decoration-8 leading-none">
            PREGUNTAS QUE TODA EMBARAZADA ME HACE
          </h2>
          <div>
            {FAQS.map((faq, i) => (
              <details key={i} className="border-t-4 border-brand-black py-5 group">
                <summary className="flex justify-between items-start gap-4 cursor-pointer list-none">
                  <h3 className="text-xl md:text-2xl text-brand-black">{faq.q}</h3>
                  <span className="text-3xl font-heading text-brand-black flex-shrink-0 leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="pt-4 text-base font-mono font-bold normal-case text-brand-black leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-brand-neon text-brand-black py-20 md:py-24 px-4 md:px-12 border-y-8 border-brand-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl mb-6 leading-none">
            TU GUÍA ESTÁ<br />A UN CLIC.
          </h2>
          <p className="font-mono normal-case text-base md:text-lg mb-10 max-w-xl mx-auto">
            +300 mamás dominicanas ya están entrenando seguro durante su embarazo. Es tu turno.
          </p>
          <div className="max-w-md mx-auto">
            <LeadForm ctaLabel="RECIBIR MI GUÍA AHORA" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-black p-12 md:p-16 border-t-8 border-brand-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png"
              alt="Gabifit"
              className="h-24 mb-6"
            />
            <p className="text-sm font-heading text-brand-neon">
              GABIFIT © 2026 · HECHO CON ❤️ PARA MADRES DOMINICANAS
            </p>
          </div>
          <div className="flex gap-6 text-base font-heading">
            <a href="https://instagram.com/gabifitrd" className="hover:text-brand-neon transition-colors">INSTAGRAM</a>
            <a href="/" className="hover:text-brand-purple transition-colors">MASTERCLASS $97</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
