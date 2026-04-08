import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static generation for all routes to avoid Firebase initialization during build
  experimental: {
    staticGenerationRetryCount: 0,
  },
};

export default nextConfig;
