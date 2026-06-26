"use client";

import { Plus, Search } from "lucide-react";
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

export const COMPLEXITY_OPTIONS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type TaskForm = {
  title: string;
  description: string;
  category: string;
  complexity: (typeof COMPLEXITY_OPTIONS)[number];
  karma: string;
  assigned_to: string;
  assigneeName: string;
  assigneeMuid: string;
  team: string;
  deadline: string;
};

interface InternOption {
  id: string;
  full_name: string;
  muid: string;
  guild?: string;
  role?: string;
}

interface AssignTaskDialogProps {
  open: boolean;
  form: TaskForm;
  assigneeQuery: string;
  isAssigneeFocused: boolean;
  isInternsLoading: boolean;
  filteredAssignees: InternOption[];
  createFormCategories: string[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: TaskForm) => void;
  onAssigneeQueryChange: (query: string) => void;
  onAssigneeFocusChange: (focused: boolean) => void;
  onAssigneeSelect: (user: InternOption) => void;
  onClearAssignee: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssignTaskDialog({
  open,
  form,
  assigneeQuery,
  isAssigneeFocused,
  isInternsLoading,
  filteredAssignees,
  createFormCategories,
  isPending,
  onOpenChange,
  onFormChange,
  onAssigneeQueryChange,
  onAssigneeFocusChange,
  onAssigneeSelect,
  onClearAssignee,
  onSubmit,
}: AssignTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card backdrop-blur-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-widest">
            Assign New Task
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Fill in the task details and assign it to an intern.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col min-h-0 w-full">
          <div className="space-y-5 pt-2 my-2 pr-1 max-h-[60vh] overflow-y-auto w-full min-w-0">
            {/* Assign To */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Assign To (MUID or Name){" "}
                <span className="text-destructive">*</span>
              </Label>
              {form.assigned_to ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20 rounded-2xl shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-base font-black text-brand-blue shrink-0 shadow-inner">
                      {form.assigneeName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-foreground truncate">
                        {form.assigneeName}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-blue/60" />
                        {form.assigneeMuid}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClearAssignee}
                    className="text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0 px-3.5 h-9 rounded-xl transition-all duration-200"
                  >
                    Change Intern
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Search intern by name or MUID..."
                    value={assigneeQuery}
                    onChange={(e) => onAssigneeQueryChange(e.target.value)}
                    onFocus={() => onAssigneeFocusChange(true)}
                    onBlur={() => {
                      setTimeout(() => onAssigneeFocusChange(false), 200);
                    }}
                    className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
                  />
                  {isInternsLoading && (
                    <Spinner className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue" />
                  )}
                  {isAssigneeFocused && filteredAssignees.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
                      {filteredAssignees.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onAssigneeSelect(user);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-blue/5 text-left transition-colors border-b border-border/10 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-black text-brand-blue">
                            {user.full_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {user.full_name}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              @{user.muid}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Build authentication module"
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
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                required
                placeholder="Detailed description of what needs to be done"
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
                  placeholder="Select intern to populate Guild"
                  readOnly
                  disabled
                  className="h-10 bg-muted/40 border-border/40 font-bold text-xs uppercase cursor-not-allowed select-none rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => onFormChange({ ...form, category: v })}
                  disabled={!form.team}
                >
                  <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase rounded-xl">
                    <SelectValue
                      placeholder={
                        form.team ? "Select Category" : "Select Intern First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60 rounded-xl"
                  >
                    {createFormCategories.map((cat) => (
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
              onClick={() => onOpenChange(false)}
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
                  <Spinner className="w-4 h-4" /> Assigning...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
