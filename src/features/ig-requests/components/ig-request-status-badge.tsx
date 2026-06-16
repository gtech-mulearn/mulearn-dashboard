import { Badge } from "@/components/ui/badge";
import type { IGStatus } from "../schemas";

export function IGRequestStatusBadge({ status }: { status: IGStatus }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  switch (status) {
    case "requested":
      variant = "secondary";
      break;
    case "active":
      variant = "default";
      break;
    case "rejected":
      variant = "destructive";
      break;
    case "cancelled":
      variant = "outline";
      break;
  }

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}
