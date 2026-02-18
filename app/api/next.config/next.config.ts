import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: "@napi-rs/canvas",
    };
    return config;
  },
};

export default nextConfig;
