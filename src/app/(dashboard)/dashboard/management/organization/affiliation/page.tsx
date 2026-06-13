import { AffiliationsTable } from "@/features/organizations";

export const metadata = {
  title: "Organization Affiliation | Management",
  description:
    "Manage university and institution affiliations for college organizations.",
};

export default function AffiliationPage() {
  return <AffiliationsTable />;
}
