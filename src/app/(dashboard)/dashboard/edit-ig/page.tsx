import type { Metadata } from "next";
import { IGClient } from "@/features/manage-ig";

export const metadata: Metadata = {
  title: "Interest Groups",
  description: "Browse and manage interest groups.",
};

export default function IGPage() {
  return <IGClient />;
}
