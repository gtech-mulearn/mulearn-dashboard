"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useDeleteOpportunity,
  useOpportunities,
} from "../hooks/use-opportunities";
import type { Opportunity } from "../schemas";
import { OpportunityFormDialog } from "./opportunity-form-dialog";

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  CLOSED: "outline",
  ARCHIVED: "outline",
};

function OpportunityTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: {
  items: Opportunity[] | undefined;
  isLoading: boolean;
  onEdit: (o: Opportunity) => void;
  onDelete: (o: Opportunity) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <StateDisplay variant="no-results" size="sm" className="min-h-50" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ends At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-medium">
              {o.title}
              {o.ig_name && (
                <p className="text-xs text-muted-foreground">{o.ig_name}</p>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{o.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_BADGE[o.status] ?? "secondary"}>
                {o.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {o.ends_at ? new Date(o.ends_at).toLocaleDateString() : "—"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(o)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(o)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function OpportunitiesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpportunity, setEditOpportunity] = useState<Opportunity | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);

  const { data: open, isLoading: openLoading } = useOpportunities({
    status: "PUBLISHED",
  });
  const { data: all, isLoading: allLoading } = useOpportunities({});
  const { mutate: deleteOpp, isPending: isDeleting } = useDeleteOpportunity();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Button>
        </div>

        <Tabs defaultValue="published">
          <TabsList>
            <TabsTrigger value="published">
              Published
              {open && open.data.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {open.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-4">
            <OpportunityTable
              items={open?.data}
              isLoading={openLoading}
              onEdit={setEditOpportunity}
              onDelete={setDeleteTarget}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <OpportunityTable
              items={all?.data}
              isLoading={allLoading}
              onEdit={setEditOpportunity}
              onDelete={setDeleteTarget}
            />
          </TabsContent>
        </Tabs>

        <OpportunityFormDialog open={createOpen} onOpenChange={setCreateOpen} />

        <OpportunityFormDialog
          opportunity={editOpportunity ?? undefined}
          open={!!editOpportunity}
          onOpenChange={(v) => !v && setEditOpportunity(null)}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          title="Delete Opportunity"
          description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
          onConfirm={() => {
            if (deleteTarget) {
              deleteOpp(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }
          }}
          isPending={isDeleting}
          confirmLabel="Delete"
        />
      </div>
    </TooltipProvider>
  );
}
