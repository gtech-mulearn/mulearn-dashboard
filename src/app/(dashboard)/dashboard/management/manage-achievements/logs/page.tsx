import { AuditLogsTable } from "@/features/achievements/components";

export const metadata = {
  title: "Audit Logs | MuLearn Dashboard",
  description: "View achievement audit trail.",
};

export default function AuditLogsPage() {
  return (
    <div className="container py-8">
      <AuditLogsTable />
    </div>
  );
}
