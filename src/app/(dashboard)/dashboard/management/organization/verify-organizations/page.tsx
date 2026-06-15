import VerifyOrgsView from "@/features/organizations/components/verify/verify-orgs-view";

export const metadata = {
  title: "Organization Verification | Management | MuLearn Dashboard",
  description:
    "Review and approve or reject unverified organization submissions.",
};

export default function Page() {
  return <VerifyOrgsView />;
}
