import { RulesTable } from "@/features/achievements";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Achievement Rules | Management",
  description: "Manage achievement unlock rules.",
};

export default async function RulesPage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <RulesTable />
    </div>
  );
}
