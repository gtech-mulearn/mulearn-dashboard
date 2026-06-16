import { VerifyOrgsView } from "@/features/organizations";

export const metadata = {
  title: "Organization Verification | Management | MuLearn Dashboard",
  description:
    "Review and approve or reject unverified organization submissions.",
};

export default function VerifyOrgsPage() {
  return <VerifyOrgsView />;
}
