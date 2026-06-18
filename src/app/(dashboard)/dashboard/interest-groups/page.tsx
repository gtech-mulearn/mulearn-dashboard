/**
 * Interest Groups Page
 *
 *  src/app/(dashboard)/dashboard/interest-groups/page.tsx
 *
 * Discover and explore all available interest groups.
 */

import type { Metadata } from "next";
import { InterestGroupsClient } from "@/features/interest-groups";

export const metadata: Metadata = {
  title: "Interest Groups",
  description: "Discover and explore all available interest groups.",
};

export default function InterestGroupsPage() {
  return <InterestGroupsClient />;
}
