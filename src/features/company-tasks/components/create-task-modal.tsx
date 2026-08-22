"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CompanyTaskFormSchema } from "@/features/company-jobs";
import { ProjectSkillPicker } from "@/features/projects";
import {
  useCreateCompanyTask,
  useTaskLevels,
  useTaskTypes,
  useUpdateCompanyTask,
} from "../hooks/use-company-tasks";
import type { CompanyTask, TaskTemplate } from "../types/tasks.types";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: CompanyTask | null;
  templateToUse?: TaskTemplate | null;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  taskToEdit,
  templateToUse,
}: CreateTaskModalProps) {
  const { data: taskTypesResponse } = useTaskTypes();
  const { data: taskLevelsResponse } = useTaskLevels();

  // biome-ignore lint/suspicious/noExplicitAny: API type
  const taskTypes = (taskTypesResponse as any)?.data || [];
  const taskLevels = Array.isArray(taskLevelsResponse)
    ? taskLevelsResponse
    : [];

  const { mutate: createTask, isPending: isCreating } = useCreateCompanyTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateCompanyTask();

  const isPending = isCreating || isUpdating;

  const [title, setTitle] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [karma, setKarma] = useState("");
  const [karmaError, setKarmaError] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [usageCount, setUsageCount] = useState("1");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const validateKarmaValue = (val: string): string => {
    if (!val.trim()) {
      return "Karma Points are required.";
    }
    if (Number.isNaN(Number(val))) {
      return "Karma Points must be a valid number.";
    }
    const result = CompanyTaskFormSchema.shape.karma.safeParse(val);
    if (!result.success) {
      return result.error.issues[0]?.message || "Karma Points are invalid.";
    }
    return "";
  };

  useEffect(() => {
    if (open) {
      setKarmaError("");
      if (taskToEdit) {
        setTitle(taskToEdit.title || "");
        setHashtag(taskToEdit.hashtag || "");
        setKarma(taskToEdit.karma?.toString() || "");

        // The API returns the type title (e.g. "Task"), but the Select needs the type ID.
        // So we find the matching type from the taskTypes list.
        if (taskTypes.length > 0) {
          const matchingType = taskTypes.find(
            (t: { id: string; title: string }) =>
              t.title === taskToEdit.type || t.id === taskToEdit.type,
          );
          setType(matchingType ? matchingType.id : "");
        }

        if (taskLevels.length > 0) {
          const matchingLevel = taskLevels.find(
            (l: { id: string; name: string }) =>
              l.name === taskToEdit.level || l.id === taskToEdit.level,
          );
          setLevel(matchingLevel ? matchingLevel.id : "");
        }

        setUsageCount(taskToEdit.usage_count?.toString() || "1");
        setSkills(taskToEdit.skills?.map((s) => s.id) || []);
        setDescription(taskToEdit.description || "");
      } else if (templateToUse) {
        setTitle(templateToUse.title || "");
        setHashtag(templateToUse.hashtag_prefix || "");
        setKarma(templateToUse.karma?.toString() || "");
        setType(templateToUse.type_id || "");
        setDescription(templateToUse.description || "");
        setUsageCount("1");
        setLevel("");
        setSkills([]);
      } else {
        setTitle("");
        setHashtag("");
        setKarma("");
        setType("");
        setDescription("");
        setUsageCount("1");
        setLevel("");
        setSkills([]);
      }
    }
  }, [open, taskToEdit, templateToUse, taskTypes, taskLevels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateKarmaValue(karma);
    if (err) {
      setKarmaError(err);
      return;
    }
    if (
      !title.trim() ||
      !hashtag.trim() ||
      !karma ||
      !description.trim() ||
      !level.trim()
    )
      return;

    if (taskToEdit) {
      const updatePayload = {
        title: title.trim(),
        hashtag: hashtag.trim(),
        karma: Number(karma),
        type_id: type.trim() || undefined,
        description: description.trim(),
        level_id: level.trim() || undefined,
        skill_ids: skills.length > 0 ? skills : undefined,
      };

      updateTask(
        { taskId: taskToEdit.id, payload: updatePayload },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        },
      );
    } else {
      const createPayload = {
        title: title.trim(),
        hashtag: hashtag.trim(),
        karma: Number(karma),
        type: type.trim() || undefined,
        description: description.trim(),
        usage_count: usageCount ? Number(usageCount) : undefined,
        level: level.trim() || undefined,
        skill_ids: skills.length > 0 ? skills : undefined,
      };

      createTask(createPayload, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[425px]">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>
            {taskToEdit ? "Edit Company Task" : "Create Company Task"}
          </DialogTitle>
          <DialogDescription>
            {taskToEdit
              ? "Update your task. Note: Updating will revert its status back to pending."
              : "Submit a new task for community engagement. It will be reviewed by an admin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium">
                Task Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="task-title"
                placeholder="e.g., Build a REST API with Django"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="task-hashtag" className="text-sm font-medium">
                  Hashtag <span className="text-destructive">*</span>
                </label>
                <Input
                  id="task-hashtag"
                  placeholder="#techcorp-api"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-karma" className="text-sm font-medium">
                  Karma Points <span className="text-destructive">*</span>
                </label>
                <Input
                  id="task-karma"
                  type="number"
                  min="1"
                  max="9999"
                  placeholder="150"
                  value={karma}
                  onChange={(e) => {
                    setKarma(e.target.value);
                    if (karmaError) {
                      setKarmaError(validateKarmaValue(e.target.value));
                    }
                  }}
                  onBlur={() => {
                    setKarmaError(validateKarmaValue(karma));
                  }}
                  disabled={isPending}
                  required
                />
                {karmaError && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {karmaError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="task-type" className="text-sm font-medium">
                  Task Type <span className="text-destructive">*</span>
                </label>
                <Select
                  value={type}
                  onValueChange={setType}
                  disabled={isPending || !taskTypes.length}
                >
                  <SelectTrigger id="task-type">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((t: { id: string; title: string }) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="task-usage-count"
                  className="text-sm font-medium"
                >
                  Usage Count
                </label>
                <Input
                  id="task-usage-count"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={usageCount}
                  onChange={(e) => setUsageCount(e.target.value)}
                  disabled={isPending || !!taskToEdit}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-level" className="text-sm font-medium">
                  Level <span className="text-destructive">*</span>
                </label>
                <Select
                  value={level}
                  onValueChange={setLevel}
                  disabled={isPending || !taskLevels.length}
                >
                  <SelectTrigger id="task-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskLevels.map((l: { id: string; name: string }) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="task-skills" className="text-sm font-medium">
                  Skills
                </label>
                <ProjectSkillPicker value={skills} onChange={setSkills} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="task-desc" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="task-desc"
                placeholder="Provide clear instructions for the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter className="shrink-0 px-6 py-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Submitting..."
                : taskToEdit
                  ? "Save Changes"
                  : "Submit Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
