import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Permitir acceso desde dispositivos móviles en la red local */
  allowedDevOrigins: [
    "192.168.1.229",
    "192.168.1.229:3000",
    "localhost",
    "localhost:3000",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
