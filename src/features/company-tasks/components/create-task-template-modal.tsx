"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTaskTemplate,
  useTaskTypes,
} from "../hooks/use-company-tasks";

export interface CreateTaskTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskTemplateModal({
  open,
  onOpenChange,
}: CreateTaskTemplateModalProps) {
  const { mutateAsync: createTemplate, isPending } = useCreateTaskTemplate();
  const { data: taskTypesResponse } = useTaskTypes();

  // Extract task types correctly based on the generic API response format
  // biome-ignore lint/suspicious/noExplicitAny: API shape generic
  const getTypesArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) return res.data;
    if (res.response?.data) return res.response.data;
    return [];
  };
  const taskTypes = getTypesArray(taskTypesResponse);

  const [title, setTitle] = useState("");
  const [hashtagPrefix, setHashtagPrefix] = useState("");
  const [karma, setKarma] = useState("100");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Template title is required");
      return;
    }

    try {
      await createTemplate({
        title: title.trim(),
        hashtag_prefix: hashtagPrefix.trim() || undefined,
        description: description.trim() || undefined,
        karma: Number(karma) || 0,
        type_id: typeId || undefined,
      });

      // Reset and close
      setTitle("");
      setHashtagPrefix("");
      setKarma("100");
      setDescription("");
      setTypeId("");
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Task Template</DialogTitle>
          <DialogDescription>
            Define a reusable blueprint for candidate challenges, micro-tasks,
            or bounty assignments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="t-title">
              Template Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="t-title"
              placeholder="e.g. Build a Responsive Dashboard Widget"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t-hashtag">Hashtag Prefix</Label>
              <Input
                id="t-hashtag"
                placeholder="#frontend-challenge"
                value={hashtagPrefix}
                onChange={(e) => setHashtagPrefix(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-karma">Karma Reward</Label>
              <Input
                id="t-karma"
                type="number"
                min="0"
                step="10"
                value={karma}
                onChange={(e) => setKarma(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-type">Task Type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="t-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type: { id: string; title: string }) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-desc">Default Description</Label>
            <Textarea
              id="t-desc"
              placeholder="Provide the initial starter instructions for the mentor to build upon..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
