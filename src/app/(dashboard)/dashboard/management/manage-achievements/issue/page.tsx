import { IssueRevokePanel } from "@/features/achievements";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Issue / Revoke Achievement | Management",
  description: "Manually issue or revoke achievements for users.",
};

export default async function IssuePage() {
  await requireRole(ADMIN_ROLES);
  return (
    <div className="container py-8">
      <IssueRevokePanel />
    </div>
  );
}
