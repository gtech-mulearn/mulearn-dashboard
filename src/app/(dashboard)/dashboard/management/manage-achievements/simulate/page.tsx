import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { SimulationPanel } from "@/features/achievements/components";

export const metadata = {
  title: "Simulate Achievements | Management",
  description: "Test achievement eligibility for any user.",
};

export default async function SimulatePage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <SimulationPanel />
    </div>
  );
}
