import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['fastly.picsum.photos',
      's3.mazzakotrip.com'],
  },
};

export default nextConfig;
