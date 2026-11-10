import { BulkIssuePanel } from "@/features/achievements";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Bulk Issue | Management",
  description: "Bulk issue achievements.",
};

export default async function BulkIssuePage() {
  await requireRole(ADMIN_ROLES);
  return (
    <div className="container py-8">
      <BulkIssuePanel />
    </div>
  );
}
