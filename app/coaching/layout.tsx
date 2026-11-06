import type { Metadata } from "next";
import { Caveat, Fraunces } from "next/font/google";
import "../masterclass/portal.css";

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
  title: "Tu Coaching | Gabifit",
  description: "Tu plan personalizado con Gabi — rutina, comidas, hábitos y progreso.",
  robots: { index: false, follow: false },
};

export default function CoachingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`portal ${fraunces.variable} ${caveat.variable}`}>{children}</div>
  );
}
