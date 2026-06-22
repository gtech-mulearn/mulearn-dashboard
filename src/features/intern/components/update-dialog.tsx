"use client";

import { Crown } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateIntern } from "@/features/intern";

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intern: {
    id: string;
    name: string;
    guild: string;
    status: string;
    role?: "INTERN" | "INTERN_LEAD" | "Intern" | "Intern Lead";
  } | null;
  guildOptions: string[];
}

export function UpdateDialog({
  open,
  onOpenChange,
  intern,
  guildOptions,
}: UpdateDialogProps) {
  const [updateGuild, setUpdateGuild] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateRole, setUpdateRole] = useState<"INTERN" | "INTERN_LEAD">(
    "INTERN",
  );

  const statusColorClass: Record<string, string> = {
    ACTIVE: "text-success",
    AT_RISK: "text-warning",
    INACTIVE: "text-muted-foreground",
  };

  const updateMutation = useUpdateIntern(intern?.id || "");

  useEffect(() => {
    if (intern) {
      setUpdateGuild(intern.guild || "");
      setUpdateStatus(intern.status || "ACTIVE");
      const normalizedRole =
        intern.role === "Intern Lead" || intern.role === "INTERN_LEAD"
          ? "INTERN_LEAD"
          : "INTERN";
      setUpdateRole(normalizedRole);
    }
  }, [intern]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intern) return;

    updateMutation.mutate(
      {
        guild: updateGuild,
        status: updateStatus,
        role: updateRole === "INTERN_LEAD" ? "Intern Lead" : "Intern",
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Edit Intern
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the guild, status, and role for {intern?.name}. Temporary "On
            Leave" status is managed automatically via approved leave requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full min-w-0">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Intern Name
            </Label>
            <div className="h-10 px-3 py-2 rounded-md border border-border/40 bg-muted/20 text-sm font-bold text-muted-foreground uppercase flex items-center">
              {intern?.name}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Guild
            </Label>
            <Select value={updateGuild} onValueChange={setUpdateGuild}>
              <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                <SelectValue placeholder="Select Guild" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-card/95 backdrop-blur-xl border-border/60"
              >
                {guildOptions.map((g) => (
                  <SelectItem
                    key={g}
                    value={g}
                    className="font-bold uppercase text-xs"
                  >
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </Label>
            <Select value={updateStatus} onValueChange={setUpdateStatus}>
              <SelectTrigger
                className={`w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 ${statusColorClass[updateStatus] ?? ""}`}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-card/95 backdrop-blur-xl border-border/60"
              >
                <SelectItem
                  value="ACTIVE"
                  className="font-bold uppercase text-xs text-success"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="AT_RISK"
                  className="font-bold uppercase text-xs text-warning"
                >
                  At Risk
                </SelectItem>
                <SelectItem
                  value="INACTIVE"
                  className="font-bold uppercase text-xs text-muted-foreground"
                >
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
              <Crown className="w-3 h-3 text-amber-500" />
              Role
            </Label>
            <Select
              value={updateRole}
              onValueChange={(v) =>
                setUpdateRole(v as "INTERN" | "INTERN_LEAD")
              }
            >
              <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-card/95 backdrop-blur-xl border-border/60"
              >
                <SelectItem
                  value="INTERN"
                  className="font-bold uppercase text-xs"
                >
                  Intern
                </SelectItem>
                <SelectItem
                  value="INTERN_LEAD"
                  className="font-bold uppercase text-xs text-amber-500"
                >
                  ⭐ Intern Lead
                </SelectItem>
              </SelectContent>
            </Select>
            {updateRole === "INTERN_LEAD" && (
              <p className="text-[10px] text-amber-500/80 font-semibold">
                Intern Lead can upload daily guild minutes.
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={updateMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
