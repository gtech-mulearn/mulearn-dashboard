"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActivityLog } from "../hooks/use-mentees";

interface ActivityLogSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function humanizeAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ActivityLogSheet({
  open,
  onOpenChange,
}: ActivityLogSheetProps) {
  const { data, isLoading } = useActivityLog();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>Activity Log</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <p className="text-sm">No activity recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Subject / IG</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">
                        {humanizeAction(item.action_type)}
                      </Badge>
                      {item.remarks && (
                        <p className="mt-1 max-w-[240px] truncate text-xs text-muted-foreground">
                          {item.remarks}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.actor_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.subject_name ??
                        item.ig_name ??
                        item.entity_name ??
                        "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
