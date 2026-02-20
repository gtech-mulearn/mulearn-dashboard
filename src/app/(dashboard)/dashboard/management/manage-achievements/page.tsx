import { AchievementHub } from "@/features/achievements/components";

export const metadata = {
  title: "Manage Achievements | MuLearn Dashboard",
  description: "Admin panel for managing MuLearn achievements.",
};

export default function ManageAchievementsPage() {
  return (
    <div className="container py-8">
      <AchievementHub />
    </div>
  );
}
