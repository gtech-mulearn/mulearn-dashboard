"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePushCampaignAction, usePushCampaigns } from "../hooks";
import type { PushCampaign, PushCampaignStatus } from "../types";

const STATUS: Record<
  PushCampaignStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  draft: { label: "Draft", variant: "outline" },
  scheduled: { label: "Scheduled", variant: "secondary" },
  sending: { label: "Sending", variant: "default" },
  sent: { label: "Sent", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

function audienceLabel(c: PushCampaign) {
  const { type, ids } = c.audience;
  if (type === "all") return "Everyone";
  const noun = {
    roles: "role",
    igs: "interest group",
    colleges: "college",
    muids: "person",
  }[type];
  return `${ids.length} ${noun}${ids.length === 1 ? "" : "s"}`;
}

function when(c: PushCampaign) {
  const at = c.sent_at ?? c.scheduled_at ?? c.created_at;
  return new Date(at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PushCampaignsTable() {
  const { data: campaigns, isLoading } = usePushCampaigns();
  const action = usePushCampaignAction();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!campaigns?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No push campaigns yet. Create one to reach learners on their phones.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Sent</TableHead>
            <TableHead className="text-right">Skipped</TableHead>
            <TableHead>When</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const busy = action.isPending && action.variables?.id === c.id;
            return (
              <TableRow key={c.id}>
                <TableCell className="max-w-xs">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.body}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {audienceLabel(c)}
                  <p className="text-xs text-muted-foreground">
                    ~{c.target_count.toLocaleString()} phones
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS[c.status].variant}>
                    {STATUS[c.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.sent_count.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.skipped_count.toLocaleString()}
                  {c.failed_count > 0 && (
                    <p className="text-xs text-destructive">
                      {c.failed_count} failed
                    </p>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {when(c)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {(c.status === "draft" || c.status === "scheduled") && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        action.mutate({ id: c.id, action: "send" })
                      }
                    >
                      Send now
                    </Button>
                  )}
                  {(c.status === "draft" ||
                    c.status === "scheduled" ||
                    c.status === "sending") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1"
                      disabled={busy}
                      onClick={() =>
                        action.mutate({ id: c.id, action: "cancel" })
                      }
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
