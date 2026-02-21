import { RulesTable } from "@/features/achievements/components";

export const metadata = {
  title: "Achievement Rules | MuLearn Dashboard",
  description: "Manage achievement unlock rules.",
};

export default function RulesPage() {
  return (
    <div className="container py-8">
      <RulesTable />
    </div>
  );
}
