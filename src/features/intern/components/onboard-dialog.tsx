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
import { Label } from "@/components/ui/label";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardIntern } from "@/features/intern";

interface OnboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildOptions: string[];
}

export function OnboardDialog({
  open,
  onOpenChange,
  guildOptions,
}: OnboardDialogProps) {
  const [onboardUser, setOnboardUser] = useState<any>(null);
  const [onboardGuild, setOnboardGuild] = useState("");
  const [onboardStatus, setOnboardStatus] = useState("ACTIVE");

  const statusColorClass: Record<string, string> = {
    ACTIVE: "text-success",
    AT_RISK: "text-warning",
    ON_LEAVE: "text-brand-blue",
    INACTIVE: "text-muted-foreground",
  };

  const onboardMutation = useOnboardIntern();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardUser) {
      toast.error("Please select a user");
      return;
    }
    if (!onboardGuild) {
      toast.error("Please select a guild");
      return;
    }
    onboardMutation.mutate(
      {
        mu_id: onboardUser.muid,
        user_id: onboardUser.id,
        guild: onboardGuild,
        status: onboardStatus,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setOnboardUser(null);
          setOnboardGuild("");
          setOnboardStatus("ACTIVE");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Onboard Intern
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search for a user by MUID and assign their guild and status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Select User (MUID)
            </Label>
            <MuidSearchInput
              keepOpen
              selectedUser={
                onboardUser
                  ? { muid: onboardUser.muid, name: onboardUser.full_name }
                  : null
              }
              onSelectUser={(user) => setOnboardUser(user)}
              onClear={() => setOnboardUser(null)}
              placeholder="Search by MUID..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Guild
            </Label>
            <Select value={onboardGuild} onValueChange={setOnboardGuild}>
              <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                <SelectValue placeholder="Select Guild" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
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
              Initial Status
            </Label>
            <Select value={onboardStatus} onValueChange={setOnboardStatus}>
              <SelectTrigger
                className={`w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 ${statusColorClass[onboardStatus] ?? ""}`}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
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
                  value="ON_LEAVE"
                  className="font-bold uppercase text-xs text-brand-blue"
                >
                  On Leave
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

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={onboardMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={onboardMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              {onboardMutation.isPending ? "Onboarding..." : "Onboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
