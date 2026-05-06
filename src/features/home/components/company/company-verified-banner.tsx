import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { CompanyOnboardingStatus } from "@/features/auth/schemas";

type CompanyVerifiedBannerProps = {
  status?: CompanyOnboardingStatus;
  companyName?: string;
};

export function CompanyVerifiedBanner({
  status,
  companyName,
}: CompanyVerifiedBannerProps) {
  const isVerified =
    status?.verified === true ||
    status?.is_verified === true ||
    status?.status === "approved";

  if (!isVerified) return null;

  const name = companyName ?? "Your Company";

  return (
    <output className="flex items-center justify-between rounded-2xl bg-indigo-950 px-5 py-3">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="size-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-100">
          {name} <span className="text-indigo-300">is verified</span>
        </span>
        <span className="text-sm text-indigo-400">
          You can post jobs and access the talent pool.
        </span>
      </div>
      <Link
        href="/dashboard/company/profile"
        className="text-sm font-medium text-indigo-200 transition-colors hover:text-white"
      >
        Manage profile
      </Link>
    </output>
  );
}
