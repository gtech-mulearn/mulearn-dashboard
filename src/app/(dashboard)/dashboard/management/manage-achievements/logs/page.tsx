import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { AuditLogsTable } from "@/features/achievements/components";

export const metadata = {
  title: "Audit Logs | Management",
  description: "View achievement audit trail.",
};

export default async function AuditLogsPage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <AuditLogsTable />
    </div>
  );
}
