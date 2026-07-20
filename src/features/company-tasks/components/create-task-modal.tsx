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
import {
  useCreateCompanyTask,
  useTaskTypes,
  useUpdateCompanyTask,
} from "../hooks/use-company-tasks";
import type { CompanyTask } from "../types/tasks.types";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: CompanyTask | null;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  taskToEdit,
}: CreateTaskModalProps) {
  const { data: taskTypesResponse } = useTaskTypes();
  // biome-ignore lint/suspicious/noExplicitAny: API type
  const taskTypes = (taskTypesResponse as any)?.data || [];
  const { mutate: createTask, isPending: isCreating } = useCreateCompanyTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateCompanyTask();

  const isPending = isCreating || isUpdating;

  const [title, setTitle] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [karma, setKarma] = useState("");
  const [karmaError, setKarmaError] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  const validateKarmaValue = (val: string): string => {
    if (!val.trim()) {
      return "Karma Points are required.";
    }
    const num = Number(val);
    if (isNaN(num)) {
      return "Karma Points must be a valid number.";
    }
    if (!Number.isInteger(num)) {
      return "Karma Points must be a whole number.";
    }
    if (num <= 0) {
      return "Karma Points must be a positive number.";
    }
    if (num > 9999) {
      return "Karma Points cannot exceed the maximum allowed value of 9,999.";
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

        setDescription(taskToEdit.description || "");
      } else {
        setTitle("");
        setHashtag("");
        setKarma("");
        setType("");
        setDescription("");
      }
    }
  }, [open, taskToEdit, taskTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateKarmaValue(karma);
    if (err) {
      setKarmaError(err);
      return;
    }
    if (!title.trim() || !hashtag.trim() || !karma || !description.trim())
      return;

    const payload = {
      title: title.trim(),
      hashtag: hashtag.trim(),
      karma: Number(karma),
      type: type.trim() || undefined,
      description: description.trim(),
    };

    if (taskToEdit) {
      updateTask(
        { taskId: taskToEdit.id, payload },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        },
      );
    } else {
      createTask(payload, {
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
