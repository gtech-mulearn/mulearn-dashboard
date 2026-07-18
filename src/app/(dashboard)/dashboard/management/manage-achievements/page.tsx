import { AchievementHub } from "@/features/achievements";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

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
