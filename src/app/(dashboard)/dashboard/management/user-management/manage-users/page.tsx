"use client";

import { ManageUsersPage } from "@/features/manage-users";
import { usePermissions } from "@/hooks/use-permissions";

export default function Page() {
  const { can, dynamicTypes, isLoading } = usePermissions();
  const hasDynamicAccess = dynamicTypes.some(
    (type) =>
      type.toLowerCase() === "user_management" ||
      type.toLowerCase() === "user management",
  );

  if (isLoading) return null;
  if (!can("users:list") && !hasDynamicAccess) {
    return (
      <section className="bg-card border-border rounded-lg border p-6">
        <p className="text-muted-foreground text-sm">
          You do not have permission to view this page.
        </p>
      </section>
    );
  }

  return <ManageUsersPage />;
}
