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
};

export default nextConfig;
