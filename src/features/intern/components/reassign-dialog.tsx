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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReassignInterns } from "../hooks/use-manage-interns";
import { getISTDateString } from "../utils/intern-helpers";
import { useManageTeamOptions } from "./team-filter-select";

/** Admin only: move selected interns (user ids) to another team. */
export function ReassignDialog({
  userIds,
  open,
  onOpenChange,
  onDone,
}: {
  userIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const { teams } = useManageTeamOptions();
  const reassign = useReassignInterns();
  const [teamId, setTeamId] = useState("");
  const [endDate, setEndDate] = useState("");
  const today = getISTDateString();

  useEffect(() => {
    if (open) {
      setTeamId("");
      setEndDate("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md border-border/40 bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-widest">
            Reassign {userIds.length} Intern{userIds.length === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ends their current membership and starts a new one in the chosen
            team, ending on the date below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest">
              Team <span className="text-destructive">*</span>
            </Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams
                  .filter((t) => t.is_active)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="reassign-end-date"
              className="text-[10px] font-black uppercase tracking-widest"
            >
              Planned end date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reassign-end-date"
              type="date"
              min={today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reassign.isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={!teamId || !endDate || reassign.isPending}
            onClick={() =>
              reassign.mutate(
                { user_ids: userIds, team_id: teamId, end_date: endDate },
                { onSuccess: onDone },
              )
            }
          >
            {reassign.isPending ? "Moving..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
