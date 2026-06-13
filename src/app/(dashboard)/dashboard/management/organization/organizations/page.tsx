import { OrganizationsTable } from "@/features/organizations";

export const metadata = {
  title: "Organizations | Management",
  description:
    "Create and manage organization profiles — Colleges, Companies, Communities, and Schools.",
};

export default function OrganizationsPage() {
  return <OrganizationsTable />;
}
