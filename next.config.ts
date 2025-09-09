import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  swcMinify: true,
  webpack(config) {
    config.resolve.modules.push(__dirname);
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@services": path.resolve(__dirname, "src/services"),
    };
    return config;
  },
};

export default nextConfig;
