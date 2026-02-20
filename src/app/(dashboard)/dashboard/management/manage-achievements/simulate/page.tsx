import { SimulationPanel } from "@/features/achievements/components";

export const metadata = {
  title: "Simulate Achievements | MuLearn Dashboard",
  description: "Test achievement eligibility for any user.",
};

export default function SimulatePage() {
  return (
    <div className="container py-8">
      <SimulationPanel />
    </div>
  );
}
