import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev.mulearn.org",
      },
      {
        protocol: "https",
        hostname: "s3-ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
