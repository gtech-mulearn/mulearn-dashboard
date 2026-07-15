import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AchievementAnalytics,
  AuditLogsTable,
} from "@/features/achievements/components";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Logs & Analytics | Management",
  description: "View achievement issued logs, audit trail, and statistics.",
};

export default async function LogsPage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="space-y-4">
          <AchievementAnalytics />
        </TabsContent>
        <TabsContent value="audit" className="space-y-4">
          <AuditLogsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
