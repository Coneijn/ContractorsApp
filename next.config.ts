import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        // Bucket fijo (contractorsapp-bucket en us-east-2). Se deja explícito
        // en vez de leerlo de env: el build de Docker no tiene las variables
        // de AWS y un hostname `undefined` rompería el optimizador.
        protocol: 'https',
        hostname: 'contractorsapp-bucket.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/uploads/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
