import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@home-os/shared"],
  output: "standalone",
};

export default nextConfig;
