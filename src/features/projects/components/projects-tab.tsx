"use client";
import { Folder, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ProjectFormModal } from "./project-form-modal";

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

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [detailId, setDetailId] = useState<string | undefined>();

  const { data: editingMembers = [] } = useProjectMembers(editing?.id ?? "");
  const addMember = useAddMember(editing?.id ?? "");
  const removeMember = useRemoveMember(editing?.id ?? "");

  const handleSubmit = async (
    values: ProjectFormValues,
    files: { logo?: File; images?: File[] },
  ) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          values,
          logo: files.logo,
          images: files.images,
        });
        toast.success("Project updated");
      } else {
        await create.mutateAsync({
          values,
          logo: files.logo,
          images: files.images,
        });
        toast.success("Project created");
      }
      setEditing(undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await del.mutateAsync(p.id);
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
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
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="mt-3 text-muted-foreground">
            {isOwnProfile
              ? "No projects yet. Create your first one."
              : "This user hasn't shared any projects."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              canEdit={isOwnProfile && p.created_by_id === currentUserId}
              onOpen={() => setDetailId(p.id)}
              onEdit={() => {
                setEditing(p);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(p)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        open={showForm}
        onOpenChange={(o) => {
          setShowForm(o);
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
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
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
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                }
              }
            : undefined
        }
        onRemoveMember={
          editing
            ? async (id) => {
                try {
                  await removeMember.mutateAsync(id);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
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
        />
      )}
    </div>
  );
}
