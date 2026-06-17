import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { AchievementsTable } from "@/features/achievements/components";

export const metadata = {
  title: "Achievement List | Management",
  description: "Create, edit, and delete achievements.",
};

export default async function AchievementsListPage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <AchievementsTable />
    </div>
  );
}
