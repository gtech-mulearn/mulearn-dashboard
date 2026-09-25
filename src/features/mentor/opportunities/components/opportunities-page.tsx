"use client";

import { Pencil, Plus, Search, Send, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
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
  useCloseOpportunity,
  useDeleteOpportunity,
  useOpportunities,
  usePublishOpportunity,
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

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function OpportunityTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onClose,
  isPublishing,
  isClosing,
}: {
  items: Opportunity[] | undefined;
  isLoading: boolean;
  onEdit: (o: Opportunity) => void;
  onDelete: (o: Opportunity) => void;
  onPublish: (o: Opportunity) => void;
  onClose: (o: Opportunity) => void;
  isPublishing: boolean;
  isClosing: boolean;
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
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {o.status === "DRAFT" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success hover:bg-success/10 hover:text-success dark:hover:bg-success/20"
                        onClick={() => onPublish(o)}
                        disabled={isPublishing}
                        aria-label="Publish"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Publish Opportunity</TooltipContent>
                  </Tooltip>
                ) : o.status === "PUBLISHED" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-warning hover:bg-warning/10 hover:text-warning dark:hover:bg-warning/20"
                        onClick={() => onClose(o)}
                        disabled={isClosing}
                        aria-label="Close"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Close Opportunity</TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="h-8 w-8 shrink-0" />
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue dark:hover:bg-brand-blue/20"
                      onClick={() => onEdit(o)}
                      aria-label="Edit Opportunity"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Opportunity</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(o)}
                      aria-label="Archive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Archive Opportunity</TooltipContent>
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

  const [search, setSearch] = useState("");
  const [publishedPage, setPublishedPage] = useState(1);
  const [closedPage, setClosedPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [allPage, setAllPage] = useState(1);

  const {
    data: published,
    isLoading: publishedLoading,
    error: publishedError,
  } = useOpportunities({
    page: publishedPage,
    search: search || undefined,
  });

  const {
    data: closed,
    isLoading: closedLoading,
    error: closedError,
  } = useOpportunities({
    page: closedPage,
    search: search || undefined,
  });

  const {
    data: archived,
    isLoading: archivedLoading,
    error: archivedError,
  } = useOpportunities({
    page: archivedPage,
    search: search || undefined,
  });

  const {
    data: all,
    isLoading: allLoading,
    error: allError,
  } = useOpportunities({
    page: allPage,
    search: search || undefined,
  });

  const { mutate: deleteOpp, isPending: isDeleting } = useDeleteOpportunity();
  const { mutate: publishOpp, isPending: isPublishing } =
    usePublishOpportunity();
  const { mutate: closeOpp, isPending: isClosing } = useCloseOpportunity();

  const publishedItems = published?.data.filter(
    (o) => o.status === "PUBLISHED",
  );
  const closedItems = closed?.data.filter((o) => o.status === "CLOSED");
  const archivedItems = archived?.data.filter((o) => o.status === "ARCHIVED");

  useEffect(() => {
    if (publishedError) {
      toast.error("Failed to load published opportunities.");
    }
  }, [publishedError]);

  useEffect(() => {
    if (closedError) {
      toast.error("Failed to load closed opportunities.");
    }
  }, [closedError]);

  useEffect(() => {
    if (archivedError) {
      toast.error("Failed to load archived opportunities.");
    }
  }, [archivedError]);

  useEffect(() => {
    if (allError) {
      toast.error("Failed to load opportunities.");
    }
  }, [allError]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search opportunities..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPublishedPage(1);
                  setClosedPage(1);
                  setArchivedPage(1);
                  setAllPage(1);
                }}
              />
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Opportunity
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="published">
              Published
              {publishedItems && publishedItems.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {publishedItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-4">
            <OpportunityTable
              items={publishedItems}
              isLoading={publishedLoading}
              onEdit={setEditOpportunity}
              onDelete={setDeleteTarget}
              onPublish={(o) => publishOpp(o.id)}
              onClose={(o) => closeOpp(o.id)}
              isPublishing={isPublishing}
              isClosing={isClosing}
            />
            <TablePagination
              currentPage={publishedPage}
              totalPages={published?.totalPages ?? 1}
              onPageChange={setPublishedPage}
            />
          </TabsContent>

          <TabsContent value="closed" className="mt-4">
            <OpportunityTable
              items={closedItems}
              isLoading={closedLoading}
              onEdit={setEditOpportunity}
              onDelete={setDeleteTarget}
              onPublish={(o) => publishOpp(o.id)}
              onClose={(o) => closeOpp(o.id)}
              isPublishing={isPublishing}
              isClosing={isClosing}
            />
            <TablePagination
              currentPage={closedPage}
              totalPages={closed?.totalPages ?? 1}
              onPageChange={setClosedPage}
            />
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <OpportunityTable
              items={archivedItems}
              isLoading={archivedLoading}
              onEdit={setEditOpportunity}
              onDelete={setDeleteTarget}
              onPublish={(o) => publishOpp(o.id)}
              onClose={(o) => closeOpp(o.id)}
              isPublishing={isPublishing}
              isClosing={isClosing}
            />
            <TablePagination
              currentPage={archivedPage}
              totalPages={archived?.totalPages ?? 1}
              onPageChange={setArchivedPage}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <OpportunityTable
              items={all?.data}
              isLoading={allLoading}
              onEdit={setEditOpportunity}
              onDelete={setDeleteTarget}
              onPublish={(o) => publishOpp(o.id)}
              onClose={(o) => closeOpp(o.id)}
              isPublishing={isPublishing}
              isClosing={isClosing}
            />
            <TablePagination
              currentPage={allPage}
              totalPages={all?.totalPages ?? 1}
              onPageChange={setAllPage}
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
          title="Archive Opportunity"
          description={`Archive "${deleteTarget?.title}"? This opportunity will be moved to ARCHIVED.`}
          onConfirm={() => {
            if (deleteTarget) {
              deleteOpp(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }
          }}
          isPending={isDeleting}
          confirmLabel="Archive"
        />
      </div>
    </TooltipProvider>
  );
}
