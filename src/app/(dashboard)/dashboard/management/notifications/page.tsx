import { NotificationManageCard } from "@/features/notification/components/manage/notification-manage-card";

export default function NotificationsManagePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage broadcast notifications sent to users.
        </p>
      </div>
      <NotificationManageCard />
    </div>
  );
}
