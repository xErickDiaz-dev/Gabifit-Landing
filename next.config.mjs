import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Incluye los PDFs protegidos en el bundle de la función que los sirve,
  // para que readFile los encuentre en producción (Vercel).
  outputFileTracingIncludes: {
    "/api/guias/[file]": ["./protected/guias/**"],
  },
};

export default nextConfig;
