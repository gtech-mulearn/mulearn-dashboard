import { IssueRevokePanel } from "@/features/achievements/components";

export const metadata = {
  title: "Issue / Revoke Achievement | MuLearn Dashboard",
  description: "Manually issue or revoke achievements for users.",
};

export default function IssuePage() {
  return (
    <div className="container py-8">
      <IssueRevokePanel />
    </div>
  );
}
