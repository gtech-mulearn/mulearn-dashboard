import { Badge } from "@/components/ui/badge";
import type { PartnerConnection } from "../schemas";

type LinkStatus = NonNullable<PartnerConnection["connection"]>["status"];

const CHIPS: Record<
  LinkStatus,
  {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  }
> = {
  active: { label: "Connected", variant: "success" },
  pending_approval: { label: "Awaiting approval", variant: "warning" },
  consented: { label: "Not finished", variant: "secondary" },
  blocked: { label: "Blocked", variant: "destructive" },
  rejected: { label: "Rejected", variant: "destructive" },
  disconnected: { label: "Disconnected", variant: "secondary" },
};

export function PartnerStatusChip({ status }: { status: LinkStatus | null }) {
  const chip = status
    ? CHIPS[status]
    : { label: "Not connected", variant: "secondary" as const };
  return <Badge variant={chip.variant}>{chip.label}</Badge>;
}
