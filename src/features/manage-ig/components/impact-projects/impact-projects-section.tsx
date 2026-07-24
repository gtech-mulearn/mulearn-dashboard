"use client";

import { Loader2, Plus, Rocket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useImpactProjectMutations } from "../../hooks/use-impact-project-mutations";
import { useImpactProjects } from "../../hooks/use-impact-projects";
import type { ImpactProject } from "../../schemas";
import { ImpactProjectCard } from "./impact-project-card";
import { ImpactProjectFormDialog } from "./impact-project-form-dialog";
import { ImpactProjectViewDialog } from "./impact-project-view-dialog";

interface ImpactProjectsSectionProps {
  igId: string;
  canManage?: boolean;
}

export function ImpactProjectsSection({
  igId,
  canManage = false,
}: ImpactProjectsSectionProps) {
  const { data: projects, isLoading, isError } = useImpactProjects(igId);
  const { deleteImpactProject, isDeleting } = useImpactProjectMutations(igId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ImpactProject | null>(null);
  const [viewing, setViewing] = useState<ImpactProject | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ImpactProject | null>(
    null,
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (project: ImpactProject) => {
    setEditing(project);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteImpactProject(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // error surfaced via mutation onError toast
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Impact Projects
        </h3>
        {canManage && (
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={openCreate}
            aria-label="Add impact project"
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      <div className="max-h-[248px] sm:max-h-[264px] overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <Rocket className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn't load impact projects
            </p>
            <p className="text-xs text-muted-foreground">
              Something went wrong. Please try again later.
            </p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <ImpactProjectCard
                key={project.id}
                project={project}
                onView={() => setViewing(project)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="rounded-full bg-muted p-3">
              <Rocket className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No impact projects yet
            </p>
            <p className="text-xs text-muted-foreground">
              {canManage
                ? "Showcase what this community has built."
                : "Check back soon to see what this community has built."}
            </p>
          </div>
        )}
      </div>

      <ImpactProjectViewDialog
        project={viewing}
        canManage={canManage}
        onClose={() => setViewing(null)}
        onEdit={(project) => {
          setViewing(null);
          openEdit(project);
        }}
        onDelete={(project) => {
          setViewing(null);
          setPendingDelete(project);
        }}
      />

      {canManage && (
        <ImpactProjectFormDialog
          igId={igId}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          project={editing}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete impact project?"
        description={`This will permanently remove "${pendingDelete?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        isPending={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
