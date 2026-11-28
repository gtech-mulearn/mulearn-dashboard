"use client";

import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useIsInternAdmin, useUpdateIntern } from "../hooks/use-manage-interns";
import type { TManageInternItem, TUpdateInternPayload } from "../types";
import {
  addDaysToDateString,
  formatTeam,
  getISTDateString,
} from "../utils/intern-helpers";

type TEditableStatus = NonNullable<TUpdateInternPayload["status"]>;

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intern: TManageInternItem | null;
}

const statusColorClass: Record<string, string> = {
  ACTIVE: "text-success",
  AT_RISK: "text-warning",
  INACTIVE: "text-muted-foreground",
};

/**
 * Edit status (+ required reason), lead flag (admin only) and planned end
 * date. Team moves go through Reassign; `ON_LEAVE` comes only from leave.
 */
export function UpdateDialog({
  open,
  onOpenChange,
  intern,
}: UpdateDialogProps) {
  const isAdmin = useIsInternAdmin();
  const updateMutation = useUpdateIntern(intern?.user || "");

  const [status, setStatus] = useState<string>("ACTIVE");
  const [reason, setReason] = useState("");
  const [isLead, setIsLead] = useState(false);
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (intern) {
      setStatus(intern.status);
      setReason("");
      setIsLead(intern.is_lead);
      setEndDate(intern.end_date ?? "");
    }
  }, [intern]);

  if (!intern) return null;

  const onLeave = intern.status === "ON_LEAVE";
  const statusChanged = !onLeave && status !== intern.status;
  const leadChanged = isAdmin && isLead !== intern.is_lead;
  const endChanged = !!endDate && endDate !== (intern.end_date ?? "");
  // Admin: any date from today; Lead: only later than the current end.
  const minEnd =
    !isAdmin && intern.end_date
      ? addDaysToDateString(intern.end_date, 1)
      : getISTDateString();

  const payload: TUpdateInternPayload = {
    ...(statusChanged && {
      status: status as TEditableStatus,
      reason: reason.trim(),
    }),
    ...(leadChanged && { is_lead: isLead }),
    ...(endChanged && { end_date: endDate }),
  };
  const canSave =
    (statusChanged || leadChanged || endChanged) &&
    (!statusChanged || reason.trim().length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    updateMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 rounded-2xl max-h-[calc(100vh-2rem)] flex flex-col">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Edit Intern
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {intern.full_name} · {formatTeam(intern.team)}. Use Reassign to move
            teams. "On Leave" comes from approved leave requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 w-full">
          <div className="space-y-5 pt-2 my-2 pr-1 overflow-y-auto w-full min-w-0 flex-1">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Status
              </Label>
              {onLeave ? (
                <p className="text-xs font-bold text-brand-blue">
                  On leave — status can't be changed until the leave ends.
                </p>
              ) : (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    className={`w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 ${statusColorClass[status] ?? ""}`}
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
              )}
              {intern.status_reason && (
                <p className="text-[10px] text-muted-foreground">
                  Current reason: {intern.status_reason}
                </p>
              )}
            </div>

            {statusChanged && (
              <div className="space-y-2">
                <Label
                  htmlFor="update-intern-reason"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="update-intern-reason"
                  value={reason}
                  maxLength={300}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Missed stand-ups"
                  className="min-h-[70px] text-xs resize-none"
                />
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="update-intern-lead"
                  checked={isLead}
                  disabled={status === "INACTIVE"}
                  onCheckedChange={(v) => setIsLead(v === true)}
                />
                <Label
                  htmlFor="update-intern-lead"
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Crown className="w-3 h-3 text-amber-500" /> Intern Lead
                </Label>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="update-intern-end"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
              >
                Planned end date
              </Label>
              <Input
                id="update-intern-end"
                type="date"
                min={minEnd}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10"
              />
              {!isAdmin && (
                <p className="text-[10px] text-muted-foreground">
                  Leads can only extend the tenure.
                </p>
              )}
            </div>
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
              disabled={!canSave || updateMutation.isPending}
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
