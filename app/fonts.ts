// Fuentes servidas desde el propio proyecto (app/fonts/*.woff2).
//
// Antes se pedían a Google con next/font/google. Eso dejó de compilar: el
// loader de Next revienta al resolver los archivos de Google y el build falla
// entero, igual en local que en Vercel, en fuentes que nadie había tocado. Con
// los woff2 dentro del repo el build no depende de que Google conteste, y de
// paso el navegador se ahorra la conexión a fonts.gstatic.com.
//
// De cada familia se incluyen los cortes `latin` y `latin-ext`. El navegador
// usa el primero que tenga el glifo, así que el acentuado del español entra
// por latin y lo demás por latin-ext.
import localFont from "next/font/local";

export const oswald = localFont({
  src: [
    { path: "./fonts/oswald-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/oswald-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-oswald",
  display: "swap",
});

export const robotoMono = localFont({
  src: [
    { path: "./fonts/roboto-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/roboto-mono-latin-ext-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/roboto-mono-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/roboto-mono-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-latin-ext-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/space-grotesk-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const caveat = localFont({
  src: [
    { path: "./fonts/caveat-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/caveat-latin-ext-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/caveat-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/caveat-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
});

// Fraunces es variable: un archivo cubre de 100 a 900, con su cursiva aparte.
export const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-latin.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-latin-ext.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-italic-latin.woff2", weight: "100 900", style: "italic" },
    { path: "./fonts/fraunces-italic-latin-ext.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});
