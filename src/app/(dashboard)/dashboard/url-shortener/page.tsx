import UrlShortenerView from "@/features/url-shortner/components/urlshortner-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Create and manage shortened URLs.",
};

export default function UrlShortenerPage() {
  return <UrlShortenerView />;
}
