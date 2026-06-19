import type { Metadata } from "next";
import { IGDetail } from "@/features/manage-ig";

export const metadata: Metadata = {
  title: "Interest Group Details",
  description: "View and edit interest group details.",
};

export default async function IGDetailPage() {
  return <IGDetail />;
}
