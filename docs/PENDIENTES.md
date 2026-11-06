# Qué queda pendiente — Gabifit

Estado a 6 de noviembre de 2026, rama `feature/registro-aprobacion` (que es
desde donde se despliega producción, no desde `main`).

---

## 1. Variables de entorno sin configurar

El código ya las lee; mientras no existan, cada función se queda apagada de
forma segura y no rompe nada.

| Variable | Qué enciende | Si falta |
|---|---|---|
| `HOTMART_COACHING_PRODUCT_ID` | que la compra del coaching active sola el acceso | el coaching sólo se da a mano desde el panel |
| `MAILERLITE_API_TOKEN` | secuencia de correos del lead magnet | el lead se guarda en Firestore, pero no recibe los correos |
| `MAILERLITE_GROUP_ID` | a qué grupo entra la lead | igual que arriba |
| `MAILERLITE_SENDER_EMAIL` / `_NAME` | remitente de esos correos | igual que arriba |
| `LEAD_MAGNET_PDF_URL` | enlace de descarga de la guía | el correo iría sin guía |
| `DISCOVERY_CALL_URL` | botón de agendar llamada | enlace vacío |
| `MASTERCLASS_URL` / `WHATSAPP_URL` | enlaces dentro de los correos | enlaces vacíos |

Se ponen en Vercel (Project → Settings → Environment Variables) y también en
`.env.local` para desarrollo.

---

## 2. Contenido que falta

- **Foto real** de Gabi entrenando a una embarazada para la portada de
  `/mamasaludable` (hoy usa una imagen de relleno). Va en
  `public/assets/embarazo-hero.jpg` y se cambia `HERO_IMAGE_URL`.
- **Certificaciones de Gabi** en esa misma página: hay dos huecos marcados, uno
  para la certificación principal y otro para la especialización pre/postnatal.
- **La frase de Elaine** en la home sale de su propio testimonio transcrito,
  pero conviene que Gabi y ella la aprueben. El testimonio completo está en
  `assets/Elaine Zapata 3.4.txt` por si prefieren otro momento.

---

## 3. Cosas que conviene saber

**Producción se ha desplegado desde la carpeta local con la CLI de Vercel, no
desde git.** Por eso había archivos que estaban arriba y no en el repo (las
portadas de las guías, entre otros). Ya están todos versionados. De aquí en
adelante conviene desplegar desde git para que no se vuelvan a separar.

**El material crudo de video ya no entra al repo.** `assets/*.MOV` son 293 MB de
grabaciones sin editar y están en el `.gitignore`. Hay que respaldar esa
carpeta en otro sitio, porque git ya no la cubre.

**Los videos grandes van a un CDN, no al bundle.** El de María Cristina está en
Cloudinary; el de Elaine y las 11 lecciones del masterclass están en el bucket
de Firebase Storage del proyecto. Sería más ordenado tenerlos todos en el mismo
sitio, pero no hay credenciales de API de Cloudinary en el repo — sólo se ha
subido a mano por su web.

**Las fuentes se sirven desde el repo, no desde Google.** Estaban con
`next/font/google` y el build dejó de compilar — en local y en Vercel por
igual, en fuentes que nadie había tocado. Ahora los woff2 viven en `app/fonts/`
y se cargan con `next/font/local` desde `app/fonts.ts`. Si alguna vez hay que
añadir una familia o un peso, se baja el woff2 ahí y se añade al `src`; no se
vuelve a `next/font/google`.

Para verificar en local: `npm run build`, `npm test` y `npx tsc --noEmit`.
