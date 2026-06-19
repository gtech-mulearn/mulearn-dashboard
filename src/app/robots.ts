import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/dashboard/leaderboard"],
        disallow: [
          "/api/",
          "/dashboard/management/",
          "/dashboard/company/",
          "/dashboard/settings/",
          "/dashboard/profile/",
          "/onboarding/",
        ],
      },
    ],
    sitemap: "https://app.mulearn.org/sitemap.xml",
  };
}
