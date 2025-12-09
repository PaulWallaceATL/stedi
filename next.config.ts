import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "@clinix": path.join(__dirname, "clinix-ai-billing"),
      },
    },
  },
};

export default nextConfig;
