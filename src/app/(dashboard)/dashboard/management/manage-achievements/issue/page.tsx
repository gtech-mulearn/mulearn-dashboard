import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { IssueRevokePanel } from "@/features/achievements/components";

export const metadata = {
  title: "Issue / Revoke Achievement | Management",
  description: "Manually issue or revoke achievements for users.",
};

export default async function IssuePage() {
  await requireRole([ROLES.ADMIN]);
  return (
    <div className="container py-8">
      <IssueRevokePanel />
    </div>
  );
}
