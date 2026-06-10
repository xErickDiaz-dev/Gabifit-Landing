import type { Metadata } from "next";
import { Caveat, Fraunces } from "next/font/google";
import "./portal.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tu Masterclass | Gabifit",
  description:
    "Área de miembros del Programa Gabifit Post-Parto — 8 semanas para recuperar tu figura, tu energía y tu identidad.",
  robots: { index: false, follow: false },
};

export default function MasterclassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`portal ${fraunces.variable} ${caveat.variable}`}>
      {children}
    </div>
  );
}
