import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static generation for all routes to avoid Firebase initialization during build
};

export default nextConfig;
