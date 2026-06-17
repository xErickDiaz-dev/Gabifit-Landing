import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // firebase-admin (Node SDK) hace requires dinámicos de sus dependencias
  // (google-gax, grpc, protos) que el bundler no puede seguir. Sin esto, las
  // rutas que lo importan fallan en el runtime serverless de Vercel con
  // "Failed to load external module". Declararlo externo lo deja como require
  // nativo en runtime, con sus node_modules incluidos en la función.
  serverExternalPackages: ["firebase-admin"],
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
