import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hemmaos/shared"],
  output: "standalone",
};

export default nextConfig;
