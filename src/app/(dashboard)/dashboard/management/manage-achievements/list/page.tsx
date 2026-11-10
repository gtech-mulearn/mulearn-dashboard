import { AchievementsTable } from "@/features/achievements";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Achievement List | Management",
  description: "Create, edit, and delete achievements.",
};

export default async function AchievementsListPage() {
  await requireRole(ADMIN_ROLES);
  return (
    <div className="container py-8">
      <AchievementsTable />
    </div>
  );
}
