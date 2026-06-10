# Portal Masterclass Gabifit — Diseño aprobado

**Fecha:** 2026-06-10
**Estado:** Aprobado por el usuario
**Proyecto:** Landing-GABI (Next.js 16, Vercel, Cloudinary `dmkx2uowd`)

## Objetivo

Construir el área de miembros del "Programa Gabifit Post-Parto" (8 semanas, 3 fases, 11 videos)
donde las compradoras ven los videos del masterclass y descargan los 7 PDFs, protegido con un
código de acceso simple. Entregable adicional: documento de guiones con marca para que Gaby
grabe los 11 videos.

## Decisiones tomadas

- **Hosting de videos:** Cloudinary (ya en uso para VSL/testimonios). Firebase descartado
  (sin transcodificación, requiere plan Blaze, costo de banda mayor).
- **Acceso:** código simple compartido — `MASTERCLASS_CODE` env var, valor inicial `MAMAFUERTE8`.
  Rotable desde Vercel sin tocar código.
- **Estructura:** portal tipo curso (Opción B) — dashboard + página por lección.
- **Progreso:** localStorage (sin base de datos).
- **Estado de videos:** ninguno grabado aún — todas las lecciones arrancan en "Próximamente";
  conectar un video = pegar URL de Cloudinary en `app/masterclass/lessons.ts`.

## Arquitectura

### Rutas

| Ruta | Contenido |
|---|---|
| `/masterclass` | Sin cookie: pantalla de bienvenida + código. Con cookie: dashboard. |
| `/masterclass/leccion/[1-11]` | Página de lección (gated). |
| `/api/masterclass/login` | POST `{code}` → valida contra env → set cookie. |
| `/guias/*.pdf` | PDFs estáticos en `public/guias/`, protegidos por middleware. |

### Protección (middleware.ts en raíz)

- Matcher: `/masterclass/leccion/:path*` y `/guias/:path*`.
- Cookie `gabifit_mc` httpOnly, secure, sameSite=lax, 180 días. Valor = HMAC-SHA256 de un
  string fijo firmado con `MASTERCLASS_CODE` (Web Crypto, compatible edge). Rotar el código
  invalida cookies existentes.
- Sin cookie válida → redirect a `/masterclass`. PDFs sin cookie → redirect igual.
- `/masterclass` decide server-side (lee cookie) si muestra gate o dashboard.
- Todo el portal con `noindex` (no debe aparecer en Google).

### Datos (`app/masterclass/lessons.ts`)

Config única: 11 lecciones (id, fase, semana, título, duración, descripción cálida,
`videoUrl` vacío = próximamente) + 7 guías (archivo, título, descripción, fase asociada).
Las guías: guia-nutricion, protocolo-rutinas, menus-56-dias, mama-reset-detox,
suplementacion, checklist-mama-en-forma, tribu-gabifit.

### Fases y lecciones

- **Fase 1 — Reset del Cuerpo (sem 1-2):** 1. El Despertar (piso pélvico) · 2. Caminata, Postura
  y Core · 3. Come para Recuperarte
- **Fase 2 — Progresión Hormonal (sem 3-5):** 4. Diastasis Recti · 5. Nutrición Hormonal ·
  6. Fuerza Progresiva · 7. Tu Mente También se Recupera
- **Fase 3 — Intensidad Adaptada (sem 6-8):** 8. Cardio de Regreso · 9. Core Fuerte ·
  10. Suplementación y Detox · 11. Integración y Mantenimiento

### UI

- Marca existente (negro, neón #cff154, morado #c4b5fd, Oswald uppercase, bordes brutalistas)
  con tono cálido/íntimo: más morado, copy de Gabi en segunda persona, mobile-first.
- Dashboard: bienvenida, barra de progreso (localStorage), 3 bloques de fase con tarjetas de
  lección (número, título, semana, duración, estado ✓/▶/🔒-próximamente), sección "Tus Guías".
- Lección: player Cloudinary (controles, sin autoplay, poster), disclaimer médico, descripción,
  guías de la fase, "Marcar como completada", nav anterior/siguiente, placeholder "Próximamente"
  con marca cuando no hay video.

### PDFs

Copiar de `Oferta/Visuals/**` a `public/guias/` con nombres limpios. Git los ignora (`*.pdf`)
pero el deploy es vía Vercel CLI, que sí los sube (no están en `.vercelignore`).

## Entregable 2: Guiones para Gaby

`Oferta/GUIONES_GABY/` — documento HTML imprimible con marca Gabifit: los 11 guiones completos
de MASTERCLASS_SCRIPTS.md + portada + instrucciones de grabación por video (tono íntimo
hablándole a las chicas, encuadre, luz, vestuario, duración) + disclaimer médico. Convertido a
PDF si hay Chrome headless disponible.

## Manejo de errores

- Código incorrecto → mensaje cálido de error, sin revelar pistas.
- Lección inexistente (id fuera de 1-11) → notFound().
- Video que falla en cargar → el placeholder "Próximamente" es el fallback natural.

## Verificación

1. `npm run build` limpio.
2. Flujo local: código malo rechazado, código bueno entra, cookie persiste.
3. PDF directo sin cookie → redirect; con cookie → descarga.
4. Navegación lección 1→11, marcar completada, progreso en dashboard.
5. Vista móvil (375px) revisada con screenshots.
6. Deploy `vercel --prod` + `MASTERCLASS_CODE` env en producción + smoke test en URL real.
