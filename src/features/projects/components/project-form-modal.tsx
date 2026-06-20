"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Project,
  ProjectFormSchema,
  type ProjectFormValues,
  type ProjectMember,
  type ProjectStatus,
} from "../schemas";
import { MemberList } from "./member-list";
import { ProjectLinksEditor } from "./project-links-editor";
import { ProjectMemberPicker } from "./project-member-picker";
import { ProjectSkillPicker } from "./project-skill-picker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  ownerMuid: string;
  members?: ProjectMember[];
  onSubmit: (
    values: ProjectFormValues,
    files: { logo?: File; images?: File[] },
  ) => Promise<void>;
  onAddLinkedMember?: (muid: string) => Promise<void>;
  onAddExternalMember?: (name: string) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
}

export function ProjectFormModal({
  open,
  onOpenChange,
  project,
  ownerMuid,
  members = [],
  onSubmit,
  onAddLinkedMember,
  onAddExternalMember,
  onRemoveMember,
}: Props) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      status: (project?.status ?? "published") as ProjectStatus,
      links: project?.links.map((l) => ({ label: l.label, url: l.url })) ?? [],
      skill_ids: project?.skills.map((s) => s.id) ?? [],
    },
  });
  const [logo, setLogo] = useState<File>();
  const [images, setImages] = useState<File[]>([]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values, { logo, images });
    onOpenChange(false);
    form.reset();
  });

  const linkedMemberMuids = members
    .filter((m) => m.is_linked && m.muid)
    .map((m) => m.muid as string);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 max-w-2xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col min-h-0">
          <div className="overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <MarkdownEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe your project using Markdown…"
                    rows={8}
                    error={form.formState.errors.description?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        Draft (only you can see)
                      </SelectItem>
                      <SelectItem value="published">
                        Published (visible on profile)
                      </SelectItem>
                      <SelectItem value="archived">
                        Archived (hidden, kept for reference)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0])}
              />
            </div>

            <div>
              <Label>Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files ?? []))}
              />
            </div>

            <div>
              <Label>Links</Label>
              <Controller
                control={form.control}
                name="links"
                render={({ field }) => (
                  <ProjectLinksEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div>
              <Label>Skills</Label>
              <Controller
                control={form.control}
                name="skill_ids"
                render={({ field }) => (
                  <ProjectSkillPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {project && (onAddLinkedMember || onAddExternalMember) && (
              <div className="space-y-2">
                <Label>Team Members</Label>
                <MemberList
                  members={members}
                  onRemove={
                    onRemoveMember
                      ? (id) => {
                          void onRemoveMember(id);
                        }
                      : undefined
                  }
                />
                <ProjectMemberPicker
                  excludeMuids={[ownerMuid, ...linkedMemberMuids]}
                  onPickLinked={
                    onAddLinkedMember
                      ? (muid) => {
                          void onAddLinkedMember(muid);
                        }
                      : () => {}
                  }
                  onPickExternal={
                    onAddExternalMember
                      ? (name) => {
                          void onAddExternalMember(name);
                        }
                      : () => {}
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 px-6 py-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {project ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
