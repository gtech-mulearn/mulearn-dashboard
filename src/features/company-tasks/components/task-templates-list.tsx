"use client";

import { CheckSquare, Hash, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteTaskTemplate,
  useTaskTemplates,
} from "../hooks/use-company-tasks";
import type { TaskTemplate } from "../types/tasks.types";
import { CreateTaskTemplateModal } from "./create-task-template-modal";

interface TaskTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: TaskTemplate) => void;
}

export function TaskTemplatesModal({
  open,
  onOpenChange,
  onSelect,
}: TaskTemplatesModalProps) {
  const { data: templates = [], isLoading } = useTaskTemplates();
  const { mutateAsync: deleteTemplate } = useDeleteTaskTemplate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete template "${title}"?`))
      return;
    try {
      await deleteTemplate(id);
    } catch {
      // Error is handled in the mutation hook (toast)
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Templates</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pr-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl">Task Templates</DialogTitle>
              <DialogDescription>
                Select a template to create a new task, or manage your existing
                templates.
              </DialogDescription>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-2">
          {templates.length === 0 ? (
            <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10">
              <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-foreground text-lg">
                No templates yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Save repeatable task assignments, coding bounties, and test
                exercises to quickly deploy them across your community.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-6 gap-2"
                variant="default"
              >
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="flex flex-col h-full hover:shadow-md transition-shadow"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div>
                      <CardTitle
                        className="text-lg font-bold line-clamp-1"
                        title={template.title}
                      >
                        {template.title}
                      </CardTitle>
                      {template.hashtag_prefix && (
                        <div className="text-sm text-primary font-medium flex items-center gap-1 mt-1">
                          <Hash className="h-3.5 w-3.5" />
                          {template.hashtag_prefix}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {template.type_title || "ASSIGNMENT"}
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold hover:bg-amber-500/20">
                        {template.karma} Karma
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 pb-4 border-t bg-muted/10 flex items-center justify-between gap-3">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => onSelect(template)}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(template.id, template.title)}
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <CreateTaskTemplateModal
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
