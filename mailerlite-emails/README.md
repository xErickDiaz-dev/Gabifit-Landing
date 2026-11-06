# MailerLite Setup — Manual Steps (10–15 min)

La automation **"Mama Saludable - Lead Magnet"** está creada via API con todo lo programable. Lo que la API de MailerLite **NO permite** es cargar el body del email — solo lo puedes hacer en el UI. Esta guía es para resolver eso lo más rápido posible.

**Automation URL:**
https://dashboard.mailerlite.com/automations/187003137066796081/edit

---

## Estado actual (lo que YA está cargado via API)

✅ 5 emails con sus subjects + sender (`Gabi <gabifitxlpp@gmail.com>`)
✅ 4 delays de 48 horas
✅ Sender + reply-to configurados

## Lo que falta (3 cosas manuales)

### 1. Arreglar el orden de los steps (1 min con drag)

El orden actual quedó desordenado por una race condition de MailerLite. Estado actual:

```
1. ✅ Email 1 — PDF entrega
2. ❌ Delay 48h           ← OK aquí
3. ❌ Delay 48h           ← BORRA ESTE (extra)
4. ✅ Email 2 — Por qué no dieta
5. ❌ Delay 48h           ← OK aquí
6. ✅ Email 3 — Historia de Karla
7. ❌ FALTA UN DELAY AQUÍ
8. ✅ Email 4 — Masterclass $97
9. ✅ Delay 48h
10. ✅ Email 5 — Cierre + 1:1
```

Debe quedar así:
```
Email 1 → Delay 48h → Email 2 → Delay 48h → Email 3 → Delay 48h → Email 4 → Delay 48h → Email 5
```

**Cómo arreglarlo en el UI:**
- Borra el delay duplicado entre Email 1 y Email 2
- Agrega un delay nuevo entre Email 3 y Email 4 (click el `+` → Time delay → 48 hours)

### 2. Pegar el body de cada email (5 × ~1 min = 5 min)

Para cada email del 1 al 5:

1. En MailerLite UI, click el step del email
2. Click **"Design email"**
3. Si te ofrece editor: escoge **"Custom HTML"** (si está paywalled, escoge "Rich text" o el visual)
4. Abre el archivo correspondiente:
   - `email-1.html` → para el step "Email 1 — PDF entrega"
   - `email-2.html` → para el step "Email 2 — Por qué no dieta"
   - `email-3.html` → para el step "Email 3 — Historia de Karla"
   - `email-4.html` → para el step "Email 4 — Masterclass $97 ★"
   - `email-5.html` → para el step "Email 5 — Cierre + 1:1"
5. Abre el archivo HTML en tu navegador (doble click)
6. Click derecho en la página → **View page source** (Ctrl+U)
7. Copia TODO entre `<body>` y `</body>` (sin incluir las tags `<body>` mismas)
8. Pega en el editor de MailerLite → **Save**

**Tip:** Si MailerLite usa "Rich text editor" porque Custom HTML está paywalled, abre el archivo .html en el navegador, selecciona todo el contenido renderizado (Ctrl+A), copia (Ctrl+C), y pega en el rich text editor. El formato se mantiene 90%.

### 3. Agregar el trigger + activar (30 segundos)

- Click **"Add first trigger"** arriba
- Escoge **"When subscriber joins a group"**
- Selecciona el grupo: **Mama Saludable**
- Save
- Toggle **"Activate"** (esquina superior derecha verde)

---

## Después de los pasos

Smoke test:
1. Ve a `gabifitrd.com/mamasaludable` (después de deployar)
2. Llena el form con un correo nuevo tuyo
3. Verifica:
   - Aparece en MailerLite → Subscribers → grupo "Mama Saludable"
   - Recibes Email 1 con el PDF en <1 min
   - El link del PDF funciona

## Si necesitas regenerar la automation

```bash
cd Landing-GABI
MAILERLITE_API_TOKEN=xxx MAILERLITE_GROUP_ID=187001413609456960 node scripts/setup-mailerlite-automation.mjs
```

Esto borra la automation existente y la recrea limpia. Después tienes que volver a hacer los 3 pasos manuales.
