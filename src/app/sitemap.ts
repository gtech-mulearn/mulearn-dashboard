import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://app.mulearn.org";

  const publicRoutes = [
    "",
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard",
    "/dashboard/leaderboard",
    "/dashboard/interest-groups",
    "/dashboard/events",
    "/dashboard/changelog",
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
