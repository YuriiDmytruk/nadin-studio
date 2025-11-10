import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Allow up to 100MB for image uploads (supports multiple images)
    },
  },
};

export default nextConfig;
