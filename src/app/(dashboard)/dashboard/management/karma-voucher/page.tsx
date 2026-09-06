import type { Metadata } from "next";
import { KarmaVoucherPage } from "@/features/karma-voucher";
import { FELLOW_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Karma Voucher",
  description: "Manage karma point vouchers and distribution.",
};

export default async function Page() {
  await requireRole(FELLOW_MANAGEMENT_ROLES);
  return <KarmaVoucherPage />;
}
