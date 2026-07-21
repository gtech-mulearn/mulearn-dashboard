"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StateDisplay } from "@/components/ui/state-display";
import {
  useAddMember,
  useCreateProject,
  useDeleteProject,
  useProjectMembers,
  useProjectsByMuid,
  useRemoveMember,
  useUpdateProject,
} from "../hooks";
import type { Project, ProjectFormValues } from "../schemas";
import { ProjectCard } from "./project-card";
import { ProjectDetailModal } from "./project-detail-modal";
import { ProjectWizard } from "./project-wizard";

interface ProjectsTabProps {
  muid: string;
  ownerMuid: string;
  currentUserId: string | null;
  isOwnProfile: boolean;
}

export function ProjectsTab({
  muid,
  ownerMuid,
  currentUserId,
  isOwnProfile,
}: ProjectsTabProps) {
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useProjectsByMuid(muid);
  const create = useCreateProject(muid);
  const update = useUpdateProject(muid);
  const del = useDeleteProject(muid);

  const [showWizard, setShowWizard] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [detailId, setDetailId] = useState<string | undefined>();
  const [detailCanEdit, setDetailCanEdit] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | undefined>();

  const { data: editingMembers = [] } = useProjectMembers(editing?.id ?? "");
  const addMember = useAddMember(editing?.id ?? "");
  const removeMember = useRemoveMember(editing?.id ?? "");

  const handleSubmit = async (
    values: ProjectFormValues,
    files: { logo?: File; images?: File[] },
  ) => {
    if (editing) {
      const result = await update.mutateAsync({
        id: editing.id,
        values,
        logo: files.logo,
        images: files.images,
      });
      toast.success("Project updated");
      return result;
    }
    const result = await create.mutateAsync({
      values,
      logo: files.logo,
      images: files.images,
    });
    toast.success("Project created");
    return result;
  };

  const handleDelete = (p: Project) => {
    setPendingDelete(p);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete.id);
      toast.success("Deleted");
    } catch {
      // Handled by useDeleteProject's onError toast.
    } finally {
      setPendingDelete(undefined);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  if (isError)
    return (
      <div className="rounded-2xl bg-destructive/5 p-8 text-center">
        <p className="text-destructive">Failed to load projects</p>
        <Button onClick={() => refetch()} className="mt-2">
          Try Again
        </Button>
      </div>
    );

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Projects ({projects?.length ?? 0})
        </h3>
        {isOwnProfile && (
          <Button
            onClick={() => {
              setEditing(undefined);
              setShowWizard(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </div>

      {!projects || projects.length === 0 ? (
        <StateDisplay
          variant="no-results"
          size="sm"
          description={
            isOwnProfile
              ? "No projects yet. Create your first one."
              : "This user hasn't shared any projects."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              canEdit={isOwnProfile && p.created_by_id === currentUserId}
              currentUserId={currentUserId}
              onOpen={() => {
                setDetailId(p.id);
                setDetailCanEdit(
                  isOwnProfile && p.created_by_id === currentUserId,
                );
              }}
              onEdit={() => {
                setEditing(p);
                setShowWizard(true);
              }}
              onDelete={() => handleDelete(p)}
            />
          ))}
        </div>
      )}

      <ProjectWizard
        key={editing?.id ?? "new"}
        open={showWizard}
        onOpenChange={(o) => {
          setShowWizard(o);
          if (!o) setEditing(undefined);
        }}
        project={editing}
        ownerMuid={ownerMuid}
        members={editingMembers}
        onSubmit={handleSubmit}
        onAddLinkedMember={
          editing
            ? async (m) => {
                try {
                  await addMember.mutateAsync({ muid: m });
                  toast.success("Member added");
                } catch {
                  // Handled by useAddMember's onError toast.
                }
              }
            : undefined
        }
        onAddExternalMember={
          editing
            ? async (name) => {
                try {
                  await addMember.mutateAsync({ external_name: name });
                  toast.success("External added");
                } catch {
                  // Handled by useAddMember's onError toast.
                }
              }
            : undefined
        }
        onRemoveMember={
          editing
            ? async (id) => {
                try {
                  await removeMember.mutateAsync(id);
                } catch {
                  // Handled by useRemoveMember's onError toast.
                }
              }
            : undefined
        }
      />

      {detailId && (
        <ProjectDetailModal
          open={!!detailId}
          onOpenChange={(o) => {
            if (!o) setDetailId(undefined);
          }}
          projectId={detailId}
          currentUserId={currentUserId}
          canEdit={detailCanEdit}
          onEdit={() => {
            const p = projects?.find((proj) => proj.id === detailId);
            if (p) {
              setEditing(p);
              setDetailId(undefined);
              setShowWizard(true);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(undefined);
        }}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="This action cannot be undone. The project and all its data will be permanently removed."
        onConfirm={confirmDelete}
        isPending={del.isPending}
        variant="destructive"
        confirmLabel="Delete Project"
      />
    </div>
  );
}
