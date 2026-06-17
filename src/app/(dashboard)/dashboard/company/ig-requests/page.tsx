import { IGRequestsPage } from "@/features/ig-requests";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IG Requests",
  description: "Manage interest group requests for your company.",
};

export default function Page() {
  return <IGRequestsPage />;
}
