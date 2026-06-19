import type { Metadata } from "next";
import UrlShortenerView from "@/features/url-shortener/components/url-shortener-view";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Create and manage shortened URLs.",
};

export default function UrlShortenerPage() {
  return <UrlShortenerView />;
}
