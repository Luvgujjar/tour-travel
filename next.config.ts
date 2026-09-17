import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from another device on the local network.
  allowedDevOrigins: ["192.168.29.90"],
  images: {
    // Unsplash's imgix CDN resizes and serves AVIF/WebP itself.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
