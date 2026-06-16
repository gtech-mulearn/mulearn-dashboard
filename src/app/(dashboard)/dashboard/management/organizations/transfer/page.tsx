import { TransferView } from "@/features/organizations";

export const metadata = {
  title: "Organization Transfer | Management | MuLearn Dashboard",
  description:
    "Transfer or merge organizations. Destructive — source is permanently deleted.",
};

export default function OrgTransferPage() {
  return <TransferView />;
}
