import type { Metadata } from "next";
import { NotificationManageCard } from "@/features/notification/components/manage/notification-manage-card";
import { PushAdminCard } from "@/features/push";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Manage broadcast and mobile push notifications.",
};

export default async function NotificationsManagePage() {
  await requireRole(ADMIN_ROLES);
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
    </div>
  );
}
