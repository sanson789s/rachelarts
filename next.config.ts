import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/rachelarts',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
