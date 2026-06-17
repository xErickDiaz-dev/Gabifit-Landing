"use client";

import { useState, useEffect, useRef } from "react";

const TOTAL = 4;
const WA_LINK =
  "https://wa.me/18098939904?text=Hola%20Gabi%20%2C%20Quiero%20vivir%20esa%20experience%20con%20todas%20las%20chicas%20apuntame";

export default function MommyGardenBrunch() {
  const [current, setCurrent] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => setCurrent(Math.max(0, Math.min(TOTAL - 1, i)));
  const changeSlide = (dir: number) => goTo(current + dir);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) changeSlide(diff > 0 ? 1 : -1);
  };

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const Dots = () => (
    <div className="slide__dots">
      {Array.from({ length: TOTAL }, (_, i) => (
        <button
          key={i}
          className={`slide__dot${current === i ? " active" : ""}`}
          aria-label={`Ir a invitada ${i + 1}`}
          onClick={() => goTo(i)}
        />
      ))}
    </div>
  );

  const SlideNav = () => (
    <div className="slide__nav">
      <button
        className="slide__nav-btn"
        onClick={() => changeSlide(-1)}
        aria-label="Anterior"
        disabled={current === 0}
      >
        ←
      </button>
      <Dots />
      <button
        className="slide__nav-btn"
        onClick={() => changeSlide(1)}
        aria-label="Siguiente"
        disabled={current === TOTAL - 1}
      >
        →
      </button>
    </div>
  );

  const faqs = [
    {
      q: "¿Cómo confirmo que mi cupo quedó reservado?",
      a: "Escríbele a Gaby por WhatsApp, ella te envía los detalles del pago y cuando recibe el comprobante de transferencia tu cupo queda confirmado. Es así de sencillo. Los cupos son limitados así que te recomendamos no esperar mucho.",
    },
    {
      q: "¿Para quién es este evento exactamente?",
      a: "Para mamás y mujeres que quieren priorizarse. No tienes que estar en tu mejor momento físico ni tener todo resuelto. Si sientes que llevas tiempo poniéndote de última, este evento es para ti. Venís tal como estás.",
    },
    {
      q: "¿Qué debo llevar?",
      a: "Solo tu mejor energía — el brunch está incluido. Ropa cómoda y bonita (es un brunch garden 🌸). Si quieres, trae un cuaderno para anotar. Todos los detalles de logística se comparten cuando confirmas tu reserva.",
    },
    {
      q: "¿Qué incluye el precio de la entrada?",
      a: "El precio de $2,500 pesos incluye todo: el brunch garden completo (1 entrada y 1 plato fuerte), las charlas en vivo con las 4 invitadas, una rifa exclusiva, la actividad de bienestar guiada y acceso a la experiencia completa del evento. No hay costos adicionales — llegas, disfrutas y te vas transformada.",
    },
    {
      q: "¿Qué pasa si no puedo ir después de reservar?",
      a: "Por la naturaleza íntima del evento y los cupos limitados, los pagos no tienen reembolso. Sin embargo, puedes transferir tu entrada a otra persona. Escríbele a Gaby y lo coordinamos sin problema.",
    },
  ];

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="container navbar__inner">
          <a href="#" className="navbar__logo">
            <img src="/logo-ink.png" alt="GabiFit" />
          </a>
          <a href="#tickets" className="btn btn-yellow navbar__cta">
            Reservar mi entrada →
          </a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="hero" id="inicio">
        <div className="container hero__inner">
          <div>
            <div className="hero__eyebrow">
              <span className="pill pill--lilac">🌸 Evento especial · Mayo 2026</span>
              <span className="pill pill--yellow">Cupos limitados</span>
            </div>
            <h1 className="hero__title">
              Mommy
              <br />
              <span className="highlight">Garden</span>
              <br />
              Brunch
            </h1>
            <p className="hero__sub">
              Porque llevas demasiado tiempo poniéndote de última. Este es el
              espacio que necesitabas — para respirar, reconectar y recordar
              quién eres más allá de la maternidad.
            </p>
            <div className="hero__meta">
              <div className="hero__meta-chip">📅 24 de Mayo, 2026</div>
              <div className="hero__meta-chip">📍 Monarca Bistro · Santiago</div>
              <div className="hero__meta-chip">🌿 4 invitadas especiales</div>
            </div>
            <div className="hero__actions">
              <a href="#tickets" className="btn btn-yellow btn-lg">
                Quiero mi entrada →
              </a>
              <a href="#invitadas" className="btn btn-outline">
                Conocer las invitadas
              </a>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__img-frame">
              <img
                src="/assets/mama-y-coach.jpeg"
                alt="Gaby — GabiFit Coach"
                className="hero__img"
              />
              <div className="hero__badge">
                <span className="hero__badge-icon">🌸</span>
                <div className="hero__badge-text">
                  <strong>Cupos casi agotados</strong>
                  <span>No dejes pasar esto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PARA QUIÉN ES ══ */}
      <section className="why" id="para-quien">
        <div className="container why__inner">
          <div>
            <p className="label">¿Esto es para ti?</p>
            <h2 className="section-title">
              Sé lo que se siente llegar al final del día{" "}
              <em>completamente vacía.</em>
            </h2>
            <p className="why__body">
              Das todo. A tus hijos, a tu pareja, al trabajo, a todos. Y cuando
              llega el momento de preguntarte cómo estás <em>tú</em>... ya no
              queda nada. Ni energía, ni tiempo, ni espacio.
              <br />
              <br />
              Eso que sientes — que ya no eres tú misma, que te perdiste en el
              camino de ser mamá — tiene solución. Y no empieza en el gym ni en
              una dieta perfecta. Empieza en un espacio como este.
            </p>
            <div className="why__checks">
              {[
                "Sientes que te perdiste a ti misma en la maternidad y no sabes cómo volver",
                "Quieres cuidarte — física, mental y espiritualmente — pero no sabes por dónde empezar",
                "Necesitas un espacio para respirar rodeada de mujeres que realmente entienden",
                "Estás lista para priorizarte sin culpa y sin tener que explicarle nada a nadie",
              ].map((text, i) => (
                <div key={i} className="why__check">
                  <div className="why__check-icon">✓</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="why__quote">
              <p className="why__quote-text">
                "Yo también fui esa mamá que ponía a todos primero y se
                convencía de que estaba bien. Hasta que entendí que cuidarme a
                mí <em>es</em> cuidar a mi familia. Este evento es lo que yo
                hubiera necesitado."
              </p>
              <div className="why__quote-author">
                <img
                  src="/assets/mama-y-coach.jpeg"
                  alt="Gaby"
                  className="why__quote-avatar"
                />
                <div>
                  <div className="why__quote-name">Gaby — GabiFit</div>
                  <div className="why__quote-role">
                    Fitness Coach · Mamá · Tu anfitriona
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INVITADAS — CAROUSEL ══ */}
      <section className="speakers" id="invitadas">
        <div className="container">
          <div className="speakers__header">
            <p className="label">Las invitadas</p>
            <h2 className="section-title">
              Cuatro mujeres. Cuatro historias reales.
              <br />
              <em>Una tarde que no olvidarás.</em>
            </h2>
          </div>

          <div className="carousel" id="carousel">
            <div
              className="carousel__slides"
              style={{ transform: `translateX(-${current * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slide 1: Gaby */}
              <div className="carousel__slide">
                <div className="slide__info">
                  <div className="slide__counter">
                    <strong>01</strong> / 04
                  </div>
                  <div className="slide__specialty">
                    <span className="slide__specialty-tag">Host</span>
                    <span className="slide__specialty-tag">Fitness Coach</span>
                    <span className="slide__specialty-tag">Mamá</span>
                  </div>
                  <h3 className="slide__name">Gaby</h3>
                  <p className="slide__bio">
                    Más de 8 años transformando vidas — no solo cuerpos. Gaby
                    sabe lo que es luchar con la culpa de "no tener tiempo",
                    sentir que el cuerpo no responde y seguir de pie con una
                    sonrisa. Ha acompañado a más de 200 mujeres en su proceso y
                    conoce cada excusa, cada miedo y cada victoria pequeña que
                    nadie celebra. Hoy crea este espacio desde su propia
                    historia.
                  </p>
                  <p className="slide__quote">
                    "Entrenar me salvó. Pero fue la comunidad la que me
                    transformó de verdad."
                  </p>
                  <SlideNav />
                </div>
                <div className="slide__photo">
                  <img src="/assets/mama-y-coach.jpeg" alt="Gaby — GabiFit" />
                  <div className="slide__photo-overlay"></div>
                  <span className="slide__photo-tag">Anfitriona</span>
                </div>
              </div>

              {/* Slide 2: Maríah Espinal */}
              <div className="carousel__slide">
                <div className="slide__info">
                  <div className="slide__counter">
                    <strong>02</strong> / 04
                  </div>
                  <div className="slide__specialty">
                    <span className="slide__specialty-tag">Mamá</span>
                    <span className="slide__specialty-tag">
                      Creadora de Contenido
                    </span>
                    <span className="slide__specialty-tag">
                      Pastelera sin gluten
                    </span>
                  </div>
                  <h3 className="slide__name">Maríah Espinal</h3>
                  <p className="slide__bio">
                    Maríah no llegó a la vida saludable por una foto en
                    Instagram. Llegó porque necesitaba sentirse bien por dentro
                    — como mamá, como mujer, como hija de Dios. Hoy comparte
                    ese camino con honestidad brutal: los días difíciles, las
                    recaídas, los pequeños logros que nadie ve pero que lo
                    cambian todo. Su historia te va a llegar al alma.
                  </p>
                  <p className="slide__quote">
                    "Comer diferente me cambió el cuerpo. Elegirme a mí me
                    cambió la vida."
                  </p>
                  <SlideNav />
                </div>
                <div className="slide__photo">
                  <img src="/assets/maria-espinal.jpeg" alt="Maríah Espinal" />
                  <div className="slide__photo-overlay"></div>
                  <span className="slide__photo-tag">Invitada especial</span>
                </div>
              </div>

              {/* Slide 3: Lic. Himilce Cruz */}
              <div className="carousel__slide">
                <div className="slide__info">
                  <div className="slide__counter">
                    <strong>03</strong> / 04
                  </div>
                  <div className="slide__specialty">
                    <span className="slide__specialty-tag">
                      Psicóloga Clínica
                    </span>
                    <span className="slide__specialty-tag">
                      Coach de Bienestar
                    </span>
                  </div>
                  <h3 className="slide__name">Lic. Himilce Cruz</h3>
                  <p className="slide__bio">
                    La ansiedad, el agotamiento emocional, el sentir que nada
                    es suficiente — Himilce ha visto eso de cerca y sabe que
                    muchas mamás lo viven en silencio. Como psicóloga clínica y
                    coach de bienestar, acompaña a mujeres a entender que
                    cuidar la mente no es un lujo, es una necesidad. Su charla
                    te va a dar permiso de sentir lo que llevas tiempo callando.
                  </p>
                  <p className="slide__quote">
                    "No se trata de ser una supermamá. Se trata de ser una mamá
                    entera."
                  </p>
                  <SlideNav />
                </div>
                <div className="slide__photo">
                  <img src="/assets/himilce.jpeg" alt="Lic. Himilce Cruz" />
                  <div className="slide__photo-overlay"></div>
                  <span className="slide__photo-tag">Invitada especial</span>
                </div>
              </div>

              {/* Slide 4: Cherlin Nicol */}
              <div className="carousel__slide">
                <div className="slide__info">
                  <div className="slide__counter">
                    <strong>04</strong> / 04
                  </div>
                  <div className="slide__specialty">
                    <span className="slide__specialty-tag">
                      Entrenadora Personal
                    </span>
                    <span className="slide__specialty-tag">Nutrición</span>
                    <span className="slide__specialty-tag">Suplementación</span>
                  </div>
                  <h3 className="slide__name">Cherlin Nicol</h3>
                  <p className="slide__bio">
                    Cherlin lleva más de 5 años desmontando el mito de que
                    ponerse en forma es cosa de genética o de vivir en el gym.
                    Entrenadora personal, casi graduada en Nutrición y dueña de
                    su propia tienda de suplementos — sabe exactamente qué hace
                    falta para que los resultados lleguen y se queden. Sin
                    extremos, sin dietas de hambre, sin excusas.
                  </p>
                  <p className="slide__quote">
                    "La transformación real empieza cuando dejás de tratarte
                    como el último elemento de tu lista."
                  </p>
                  <SlideNav />
                </div>
                <div className="slide__photo">
                  <img
                    src="/assets/cherlin.jpeg"
                    alt="Cherlin Nicol Pichardo"
                  />
                  <div className="slide__photo-overlay"></div>
                  <span className="slide__photo-tag">Invitada especial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EXPERIENCIA ══ */}
      <section className="experience" id="experiencia">
        <div className="container experience__inner">
          <div>
            <p className="label">¿Qué vas a vivir?</p>
            <h2 className="section-title">
              Un día diseñado para que <em>sientas</em> algo distinto
            </h2>
            <p className="section-body">
              No es otro evento de "motivación". Es una experiencia real, íntima
              y cuidada en cada detalle — para que te vayas diferente a como
              llegaste.
            </p>
            <div className="exp-grid">
              <div className="exp-card">
                <div className="exp-card__icon">🌸</div>
                <div className="exp-card__title">Brunch Garden</div>
                <div className="exp-card__desc">
                  Mesa bonita, comida que nutre y espacio para sentarte sin
                  apuro. Porque mereces comer tranquila por una vez.
                </div>
              </div>
              <div className="exp-card">
                <div className="exp-card__icon">🎙️</div>
                <div className="exp-card__title">Charlas que te mueven</div>
                <div className="exp-card__desc">
                  Fitness, salud mental, alimentación y fe. Sin filtros, sin
                  poses — solo conversaciones reales de mujer a mujer.
                </div>
              </div>
              <div className="exp-card">
                <div className="exp-card__icon">🧘‍♀️</div>
                <div className="exp-card__title">Momento para ti</div>
                <div className="exp-card__desc">
                  Una actividad de bienestar guiada para que te detengas,
                  respires y recuerdes quién eres cuando no estás cuidando a
                  todos.
                </div>
              </div>
              <div className="exp-card">
                <div className="exp-card__icon">🤍</div>
                <div className="exp-card__title">Comunidad real</div>
                <div className="exp-card__desc">
                  Mujeres que entienden tu camino sin que tengas que explicarlo.
                  Conexiones que duran más allá del evento.
                </div>
              </div>
            </div>
          </div>

          <div className="exp-mosaic">
            {[
              ["shot_on_iPhone_202604041321.png", "Mommy Garden Brunch"],
              ["Latina_women_in_202604041256.png", "Mujeres en el evento"],
              ["Latina_women_in_202604041256 (1).png", "Mujeres en el evento"],
              ["realistic_candid_photo_202604041322.png", "Momento de conexión"],
              ["realistic_candid_photo_202604041323.png", "Experiencia del evento"],
              ["candid_photo_of_202604041357.png", "Comunidad GabiFit"],
              ["quiero_que_le_202604041359.png", "Bienestar y conexión"],
              ["slight_grain,_subtle_202604041400.png", "Tarde de bienestar"],
            ].map(([file, alt]) => (
              <div key={file} className="exp-mosaic__item">
                <img src={`/assets/${file}`} alt={alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DRESS CODE ══ */}
      <section className="dresscode" id="vestimenta">
        <div className="container dresscode__inner">
          <div className="dresscode__content">
            <p className="label">Código de vestimenta</p>
            <h2 className="section-title">
              Ven lista para <em>brillar y moverte.</em>
            </h2>
            <p className="dresscode__sub">
              Ropa deportiva en uno de los tres colores oficiales. Así todas
              llegamos con la misma vibra — cómodas, bonitas y listas para
              vivir algo que no olvidarán. 🌸
            </p>

            <div className="dresscode__palette">
              {[
                { color: "#9B9DE0", label: "Lavanda" },
                { color: "#EDE898", label: "Amarillo Mantequilla" },
                { color: "#F4A8C0", label: "Rosa Baby" },
              ].map(({ color, label }) => (
                <div key={label} className="palette-chip">
                  <span
                    className="palette-chip__dot"
                    style={{ background: color }}
                  />
                  <span className="palette-chip__label">{label}</span>
                </div>
              ))}
            </div>

            <div className="dresscode__rules">
              <div className="dresscode__rules-title">
                <span>✨</span> Guía rápida
              </div>
              <div className="dresscode__rules-list">
                {[
                  [
                    "Ropa deportiva",
                    " — leggings, top, sports bra, shorts o conjunto de gym.",
                  ],
                  [
                    "Uno de los tres colores",
                    " — puedes usar solo uno o mezclarlos.",
                  ],
                  [
                    "Tenis cómodos",
                    " — hay actividades de movimiento incluidas.",
                  ],
                  [
                    "Accesorios libres",
                    " — aretes, diademas, tu toque personal. ¡Venís como quieras!",
                  ],
                ].map(([bold, rest]) => (
                  <div key={bold} className="dresscode__rule">
                    <div className="dresscode__rule-dot"></div>
                    <span>
                      <strong style={{ color: "#fff" }}>{bold}</strong>
                      {rest}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dresscode__video-wrap">
            <div className="dresscode__video-frame">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="dresscode__video"
              >
                <source
                  src="https://res.cloudinary.com/dmkx2uowd/video/upload/q_auto/f_auto/v1775397828/estilo_de_vestimenta_pbzpqz.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="dresscode__video-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VENUE ══ */}
      <section className="venue" id="lugar">
        <div className="container">
          <div className="venue__header">
            <p className="label">El lugar</p>
            <h2 className="section-title">
              Un espacio tan bonito<br /><em>como la experiencia.</em>
            </h2>
            <p className="section-body" style={{ marginInline: "auto", textAlign: "center", marginTop: "0.75rem" }}>
              Monarca Bistro nos abre sus puertas para crear el ambiente perfecto — garden, íntimo y lleno de detalles.
            </p>
            <div className="venue__chips">
              <div className="venue__chip">📍 Monarca Bistro</div>
              <div className="venue__chip">🗺️ Av. Benito Juárez N.62, Villa Olga, Santiago</div>
              <div className="venue__chip">📅 24 de Mayo, 2026</div>
            </div>
          </div>
          <div className="venue__gallery">
            <div className="venue__gallery-main">
              <img src="/assets/Restaurantgabifit.jpg" alt="Monarca Bistro — Lugar del evento" />
            </div>
            <div className="venue__gallery-side">
              <img src="/assets/Gabifitlugarevento.jpg" alt="Espacio garden del evento" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ TICKETS ══ */}
      <section className="tickets" id="tickets">
        <div className="container">
          <div className="tickets__header">
            <p className="label">Reserva tu espacio</p>
            <h2 className="section-title">
              Este espacio no espera.
              <br />
              <em>Tú tampoco deberías.</em>
            </h2>
            <p
              className="section-body"
              style={{ marginInline: "auto", textAlign: "center", marginTop: "0.75rem" }}
            >
              Un solo tipo de entrada. Una sola experiencia. Completa.
            </p>
          </div>

          <div className="ticket-card">
            <div className="ticket-card__top">
              <div className="ticket-card__label">
                Entrada General · Mommy Garden Brunch
              </div>
              <div className="ticket-card__price">
                <sup>$</sup>2,500{" "}
                <span
                  style={{
                    fontSize: "0.45em",
                    fontWeight: 600,
                    opacity: 0.75,
                  }}
                >
                  DOP
                </span>
              </div>
              <div className="ticket-card__price-note">
                Pago por transferencia · Cupo confirmado al recibir comprobante
              </div>
            </div>
            <div className="ticket-card__body">
              <div className="ticket-card__alert">
                🌸 Cupos muy limitados — No dejes pasar esto
              </div>
              <ul className="ticket-card__list">
                <li>Brunch garden completo (1 entrada + 1 plato fuerte)</li>
                <li>Charlas en vivo con las 4 invitadas</li>
                <li>Rifa exclusiva del evento 🎁</li>
                <li>Actividad de bienestar guiada</li>
                <li>Acceso a la experiencia completa</li>
                <li>Comunidad de mujeres extraordinarias</li>
                <li>Llegas, disfrutas y te vas transformada 🌸</li>
              </ul>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow btn-lg ticket-card__cta"
              >
                Reservar mi entrada por WhatsApp →
              </a>
              <p className="ticket-card__footnote">
                Al hacer clic irás a WhatsApp directo con Gaby para coordinar
                tu reserva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="faq__header">
            <p className="label">Preguntas frecuentes</p>
            <h2 className="section-title">
              ¿Tienes dudas? <em>Normal.</em>
            </h2>
          </div>
          <div className="faq__list">
            {faqs.map((item, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? " open" : ""}`}
              >
                <button
                  className="faq-item__q"
                  onClick={() => toggleFaq(i)}
                >
                  {item.q}
                  <span className="faq-item__icon">+</span>
                </button>
                <div className="faq-item__a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__logo">
            <img src="https://res.cloudinary.com/dmkx2uowd/image/upload/v1781725677/logo-yellow_ujv3gc.png" alt="GabiFit" />
          </div>
          <p className="footer__tagline">&quot;Hoy te eliges a ti.&quot; 🌸</p>
          <div className="footer__social">
            <a
              href="https://www.instagram.com/gabifitrd"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @gabifitrd"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
          <p className="footer__copy">
            © 2026 GabiFit. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
