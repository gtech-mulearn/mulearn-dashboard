import { AchievementsTable } from "@/features/achievements/components";

export const metadata = {
  title: "Achievement List | MuLearn Dashboard",
  description: "Create, edit, and delete achievements.",
};

export default function AchievementsListPage() {
  return (
    <div className="container py-8">
      <AchievementsTable />
    </div>
  );
}
