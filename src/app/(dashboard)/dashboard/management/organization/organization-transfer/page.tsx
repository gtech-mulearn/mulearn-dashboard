import TransferView from "@/features/organizations/components/transfer/transfer-view";

export const metadata = {
  title: "Organization Transfer | Management | MuLearn Dashboard",
  description:
    "Transfer or merge organizations. Destructive — source is permanently deleted.",
};

export default function Page() {
  return <TransferView />;
}
