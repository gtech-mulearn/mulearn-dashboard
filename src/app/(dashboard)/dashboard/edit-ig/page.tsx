import { IGClient } from "@/features/manage-ig";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interest Groups",
  description: "Browse and manage interest groups.",
};

export default function IGPage() {
  return <IGClient />;
}
