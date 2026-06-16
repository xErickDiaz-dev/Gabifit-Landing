"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Cuándo tengo acceso al programa?",
    a: "Inmediatamente después del pago recibes tu código y el enlace al portal. Desde el primer minuto descargas las 7 guías completas (nutrición, menús de 56 días, rutinas, detox y más) y empiezas hoy mismo.",
  },
  {
    q: "¿Funciona si estoy lactando?",
    a: "Sí. El programa contempla el período de lactancia específicamente. La nutrición y las rutinas están adaptadas para madres que amamantan.",
  },
  {
    q: "¿Necesito equipo o ir al gym?",
    a: "No. El 100% del programa es en casa, sin equipo. Solo necesitas espacio para moverte y ganas de cambiar.",
  },
  {
    q: "¿Qué pasa si no veo resultados?",
    a: "Las clientas que siguen el programa con consistencia ven cambios visibles en las primeras 2-3 semanas. El programa está diseñado para cuerpos reales, no perfectos. Si le das, funciona.",
  },
  {
    q: "¿Cómo puedo pagar?",
    a: "Aceptamos tarjeta de crédito/débito, PayPal y transferencia bancaria. El proceso es 100% seguro.",
  },
  {
    q: "¿Ya están todos los videos disponibles?",
    a: "Las 7 guías completas las descargas hoy mismo. Las clases en video se publican semana a semana, siguiendo las 3 fases del programa — porque está diseñado para acompañarte progresivamente durante las 8 semanas, no para verlo todo de golpe. Tu acceso es de por vida: cada clase nueva queda guardada en tu portal para siempre.",
  },
  {
    q: "¿Por qué el precio es de $97?",
    a: "Es el precio de lanzamiento. El valor regular del programa completo es $147. Quienes entran ahora aseguran el acceso de por vida — con todas las clases que se vayan publicando incluidas — al precio más bajo que va a tener.",
  },
  {
    q: "¿Cuánto tiempo necesito por día?",
    a: "Entre 20 y 45 minutos. Las rutinas fueron diseñadas para mamás con poco tiempo y mucha responsabilidad. Si tienes 30 minutos al día, tienes suficiente.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} className="border-t-4 border-brand-black">
          <button
            className="w-full text-left pt-6 pb-4 flex justify-between items-start gap-4 cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <h3 className="text-2xl md:text-3xl text-brand-black">{faq.q}</h3>
            <span className="text-3xl font-heading text-brand-black flex-shrink-0 mt-1 leading-none">
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <p className="pb-6 text-lg font-mono font-bold normal-case text-brand-black leading-relaxed">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
