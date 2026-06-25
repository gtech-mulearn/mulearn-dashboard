"use client";

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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { COMPLEXITY_OPTIONS, type TaskForm } from "./assign-task-dialog";

interface EditTaskDialogProps {
  editTask: { id: string } | null;
  form: TaskForm;
  editFormCategories: string[];
  createFormCategories: string[];
  selectedUserGuild: string | null;
  isPending: boolean;
  onClose: () => void;
  onFormChange: (form: TaskForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditTaskDialog({
  editTask,
  form,
  editFormCategories,
  createFormCategories,
  selectedUserGuild,
  isPending,
  onClose,
  onFormChange,
  onSubmit,
}: EditTaskDialogProps) {
  return (
    <Dialog open={!!editTask} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card backdrop-blur-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-widest">
            Edit Task
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Update task details. Assignee changes are not supported via edit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col min-h-0 w-full">
          <div className="space-y-5 pt-2 my-2 pr-1 max-h-[60vh] overflow-y-auto w-full min-w-0">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Title
              </Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  onFormChange({ ...form, title: e.target.value })
                }
                className="h-10 bg-background/50 border-border/50 font-bold rounded-xl focus-visible:ring-brand-blue"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  onFormChange({ ...form, description: e.target.value })
                }
                className="min-h-[140px] max-h-[220px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none rounded-xl focus-visible:ring-brand-blue"
              />
            </div>

            {/* Guild & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Guild
                </Label>
                <Input
                  value={form.team ? form.team.replace(/_/g, " ") : ""}
                  readOnly
                  disabled
                  className="h-10 bg-muted/40 border-border/40 font-bold text-xs uppercase cursor-not-allowed select-none rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => onFormChange({ ...form, category: v })}
                >
                  <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60 rounded-xl"
                  >
                    {(selectedUserGuild
                      ? createFormCategories
                      : editFormCategories
                    ).map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="font-bold text-xs uppercase"
                      >
                        {cat.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Complexity, Karma & Deadline Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Complexity
                </Label>
                <Select
                  value={form.complexity}
                  onValueChange={(v) =>
                    onFormChange({
                      ...form,
                      complexity: v as (typeof COMPLEXITY_OPTIONS)[number],
                    })
                  }
                >
                  <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="rounded-xl">
                    {COMPLEXITY_OPTIONS.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="font-bold text-xs uppercase"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Karma
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={form.karma}
                  onChange={(e) =>
                    onFormChange({ ...form, karma: e.target.value })
                  }
                  className="h-10 bg-background/50 border-border/50 font-bold rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Deadline
                </Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    onFormChange({ ...form, deadline: e.target.value })
                  }
                  className="h-10 bg-background/50 border-border/50 font-bold rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-bold gap-2"
            >
              {isPending ? (
                <>
                  <Spinner className="w-4 h-4" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
