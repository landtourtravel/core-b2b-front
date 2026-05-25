import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@land-tour/ui", "@land-tour/shared"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // next-auth v5 / @auth/core usa preact internamente para sus páginas built-in.
  // Como usamos página de login personalizada, excluimos el módulo del bundle.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'preact/jsx-runtime': false,
      'preact-render-to-string': false,
    };
    return config;
  },
};

export default nextConfig;
