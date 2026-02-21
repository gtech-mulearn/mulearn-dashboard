import { IssuedLogsTable } from "@/features/achievements/components";

export const metadata = {
  title: "Bulk Issue | MuLearn Dashboard",
  description: "Bulk issue achievements and view issued logs.",
};

export default function BulkIssuePage() {
  return (
    <div className="container py-8">
      <IssuedLogsTable />
    </div>
  );
}
