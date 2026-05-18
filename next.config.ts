import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mulearn.org",
      },
      {
        protocol: "https",
        hostname: "dev.mulearn.org",
      },
      {
        protocol: "https",
        hostname: "s3-ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.madhyamam.com",
      },
    ],
  },
};

export default nextConfig;
