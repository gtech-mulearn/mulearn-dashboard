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
      // TEMPORARY (FIFA break block): the proxy rewrites every request to
      // /break, but Next re-sets Cache-Control on the page response and wins
      // over the header the proxy sets. Pinning it here is the only place the
      // CDN is guaranteed to see no-store — without it Netlify can keep serving
      // the break page after it lifts at 10:00 IST. Delete with the rest of it.
      {
        source: "/break",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
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
};

export default nextConfig;
