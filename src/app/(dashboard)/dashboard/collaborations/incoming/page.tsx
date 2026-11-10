import type { Metadata } from "next";
import { IncomingCollaborationsClient } from "@/features/company-jobs/components/collaborations/incoming-collaborations-client";

export const metadata: Metadata = {
  title: "Collaboration invites",
  description:
    "Answer companies' collaboration invites for your campus or interest group.",
};

export default function IncomingCollaborationsPage() {
  return <IncomingCollaborationsClient />;
}
