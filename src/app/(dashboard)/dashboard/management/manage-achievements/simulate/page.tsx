import { SimulationPanel } from "@/features/achievements";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Simulate Achievements | Management",
  description: "Test achievement eligibility for any user.",
};

export default async function SimulatePage() {
  await requireRole(ADMIN_ROLES);
  return (
    <div className="container py-8">
      <SimulationPanel />
    </div>
  );
}
