import { TransferView } from "@/features/organizations";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Organization Transfer | Management",
  description:
    "Transfer or merge organizations. Destructive -- source is permanently deleted.",
};

export default async function OrgTransferPage() {
  await requireRole([ROLES.ADMIN]);
  return <TransferView />;
}
