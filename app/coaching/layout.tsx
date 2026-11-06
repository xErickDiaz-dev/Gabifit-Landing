import type { Metadata } from "next";
import { caveat, fraunces } from "../fonts";
import "../masterclass/portal.css";

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
