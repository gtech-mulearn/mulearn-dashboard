import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { AchievementHub } from "@/features/achievements/components";

export const metadata = {
  title: "Manage Achievements | Management",
  description: "Admin panel for managing MuLearn achievements.",
};

export default async function ManageAchievementsPage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <AchievementHub />
    </div>
  );
}
