import type { Metadata } from "next";
import { KarmaVoucherPage } from "@/features/karma-voucher";

export const metadata: Metadata = {
  title: "Karma Voucher",
  description: "Manage karma point vouchers and distribution.",
};

export default function Page() {
  return <KarmaVoucherPage />;
}
