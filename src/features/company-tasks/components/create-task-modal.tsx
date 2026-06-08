"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCompanyTask, useTaskTypes } from "../hooks/use-company-tasks";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const { data: taskTypesResponse } = useTaskTypes();
  const taskTypes = taskTypesResponse?.data || [];
  const { mutate: createTask, isPending } = useCreateCompanyTask();

  const [title, setTitle] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [karma, setKarma] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !hashtag.trim() || !karma || !description.trim())
      return;

    createTask(
      {
        title: title.trim(),
        hashtag: hashtag.trim(),
        karma: Number(karma),
        type: type.trim() || undefined,
        description: description.trim(),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTitle("");
          setHashtag("");
          setKarma("");
          setType("");
          setDescription("");
        },
      },
    );
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Company Task</DialogTitle>
          <DialogDescription>
            Submit a new task for community engagement. It will be reviewed by
            an admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                min="0"
                placeholder="150"
                value={karma}
                onChange={(e) => setKarma(e.target.value)}
                disabled={isPending}
                required
              />
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
                  {taskTypes.map((t: any) => (
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
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
