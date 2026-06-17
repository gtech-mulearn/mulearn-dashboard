import { IGDetail } from "@/features/manage-ig";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interest Group Details",
  description: "View and edit interest group details.",
};

export default async function IGDetailPage() {
  return <IGDetail />;
}
