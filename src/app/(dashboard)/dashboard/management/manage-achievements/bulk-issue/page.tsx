import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { IssuedLogsTable } from "@/features/achievements/components";

export const metadata = {
  title: "Bulk Issue | Management",
  description: "Bulk issue achievements and view issued logs.",
};

export default async function BulkIssuePage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <IssuedLogsTable />
    </div>
  );
}
