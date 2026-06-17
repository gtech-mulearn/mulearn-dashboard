"use client";

import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteBroadcast } from "../../hooks";
import type { AdminBroadcast } from "../../schemas";
import { TARGET_TYPE_LABELS, type TargetType } from "../../schemas";

interface BroadcastTableProps {
  broadcasts: AdminBroadcast[];
  isLoading: boolean;
  onEdit: (broadcast: AdminBroadcast) => void;
  onCreateClick: () => void;
}

export function BroadcastTable({
  broadcasts,
  isLoading,
  onEdit,
  onCreateClick,
}: BroadcastTableProps) {
  const {
    mutate: deleteBroadcast,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteBroadcast();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {["sk-1", "sk-2", "sk-3"].map((id) => (
          <Skeleton key={id} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Plus className="h-10 w-10" />
        <p className="text-sm">No broadcasts yet</p>
        <Button size="sm" onClick={onCreateClick}>
          Create broadcast
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead className="hidden lg:table-cell">Target</TableHead>
          <TableHead className="hidden sm:table-cell">Expires</TableHead>
          <TableHead className="hidden lg:table-cell">Created by</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {broadcasts.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-medium max-w-[160px] truncate">
              {b.title}
            </TableCell>
            <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
              {b.description}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-sm">
              <div className="flex flex-col gap-0.5">
                <Badge variant="outline" className="w-fit text-xs">
                  {TARGET_TYPE_LABELS[b.target_type as TargetType] ??
                    b.target_type}
                </Badge>
                {b.target_type !== "global" && (
                  <span className="text-xs text-muted-foreground">
                    {b.target_details.name}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
              {format(new Date(b.expires_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
              {b.created_by_name}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(b)}
                  aria-label="Edit broadcast"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteBroadcast(b.id)}
                  disabled={isDeleting && deletingId === b.id}
                  aria-label="Delete broadcast"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
