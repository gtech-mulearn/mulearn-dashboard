import type { Metadata } from "next";
import { ActivityLogCard } from "@/features/notification/components/manage/activity-log-card";
import { NotificationManageCard } from "@/features/notification/components/manage/notification-manage-card";
import { PushAdminCard } from "@/features/push/components/push-admin-card";
import { MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Manage broadcast and mobile push notifications.",
};

export default async function NotificationsManagePage() {
  await requireRole(MANAGEMENT_ROLES);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Announcements in the app, and pushes to learners' phones.
        </p>
      </div>
      <NotificationManageCard />
      <PushAdminCard />
      <ActivityLogCard />
    </div>
  );
}
