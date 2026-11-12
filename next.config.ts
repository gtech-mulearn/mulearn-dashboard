import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json") as { version: string };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_SHA: process.env.COMMIT_REF ?? "dev",
  },
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mulearn.org",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "dev.mulearn.org",
      },
      {
        protocol: "https",
        hostname: "s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3-ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.madhyamam.com",
      },
      {
        protocol: "https",
        hostname: "app.mulearn.org",
      },
      {
        protocol: "https",
        hostname: "staging.app.mulearn.org",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self' blob: data:; " +
              "connect-src 'self' blob: data: https:; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' blob: data: https: *; " +
              "media-src 'self' blob: data: https: *; " +
              "font-src 'self' data: https:; " +
              "object-src 'none'; " +
              "frame-src 'self' blob: data: https:; " +
              "frame-ancestors 'none'; " +
              "worker-src 'self' blob: data:; " +
              "child-src 'self' blob: data:; " +
              "upgrade-insecure-requests;",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
  // Older notifications stored links to pages that moved (or never existed
  // in this app). skipTrailingSlashRedirect is on, so each source is listed
  // with and without the trailing slash the backend wrote.
  async redirects() {
    const moved: [string, string][] = [
      ["/interest-groups/:id", "/dashboard/interest-groups/:id"],
      ["/events/:id", "/dashboard/events/:id"],
      ["/dashboard/mentor/list", "/dashboard/management/mentor-verification"],
      [
        "/dashboard/mentor/applications",
        "/dashboard/management/mentor-verification",
      ],
      [
        "/dashboard/mentor/applications/:id",
        "/dashboard/management/mentor-verification",
      ],
      ["/dashboard/company/mentor/list", "/dashboard/company/mentors"],
      ["/dashboard/mentor/status", "/dashboard"],
    ];
    return moved.flatMap(([source, destination]) => [
      { source, destination, permanent: false },
      { source: `${source}/`, destination, permanent: false },
    ]);
  },
};

export default nextConfig;
