import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",

      },
      {
        protocol: "https",
        hostname: "images.dribbble.com",
        
      },
      {
        protocol: "https",
        hostname: "cdn-images.farfetch-contents.com"
      }
    ],
  },
};

export default nextConfig;
