"use client";

import { useEffect, useState } from "react";
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
import { useSubmitLeave } from "../hooks/use-intern";

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function LeaveFormDialog({ open, onOpenChange }: LeaveFormDialogProps) {
  const [leaveType, setLeaveType] = useState<"SICK" | "CASUAL" | "EMERGENCY">(
    "CASUAL",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [daysCount, setDaysCount] = useState(0);

  const submitMutation = useSubmitLeave();

  useEffect(() => {
    if (open) {
      const todayStr = getTodayDateString();
      setStartDate(todayStr);
      setEndDate(todayStr);
      setReason("");
      setLeaveType("CASUAL");
    }
  }, [open]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysCount(diffDays > 0 ? diffDays : 0);
    } else {
      setDaysCount(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const todayStr = getTodayDateString();
    if (startDate < todayStr) {
      toast.error("Start date cannot be in the past");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the leave");
      return;
    }

    submitMutation.mutate(
      {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        duration_days: daysCount,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          const todayStr = getTodayDateString();
          setStartDate(todayStr);
          setEndDate(todayStr);
          setReason("");
          setLeaveType("CASUAL");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Apply for Leave
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit a leave request. Your coordinator will review it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 w-full min-w-0">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Leave Type
            </Label>
            <Select
              value={leaveType}
              onValueChange={(val) =>
                setLeaveType(val as "SICK" | "CASUAL" | "EMERGENCY")
              }
            >
              <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/60 font-bold">
                <SelectItem value="CASUAL" className="uppercase text-xs">
                  Casual Leave
                </SelectItem>
                <SelectItem value="SICK" className="uppercase text-xs">
                  Sick Leave
                </SelectItem>
                <SelectItem value="EMERGENCY" className="uppercase text-xs">
                  Emergency Leave
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Start Date
              </Label>
              <Input
                type="date"
                required
                min={getTodayDateString()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 bg-background/50 border-border/40 font-bold text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                End Date
              </Label>
              <Input
                type="date"
                required
                min={startDate || getTodayDateString()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 bg-background/50 border-border/40 font-bold text-xs"
              />
            </div>
          </div>

          {daysCount > 0 && (
            <div className="p-3 bg-muted/30 border border-border/20 rounded-xl flex items-center justify-between text-xs gap-2">
              <span className="font-bold text-muted-foreground uppercase">
                Calculated Duration
              </span>
              <span className="font-black text-brand-blue font-mono">
                {daysCount} {daysCount === 1 ? "Day" : "Days"}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Reason / Notes
            </Label>
            <Textarea
              required
              placeholder="Provide a clear description of the leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border/40 font-semibold focus:ring-brand-blue/30 resize-none p-3 sm:p-4 text-xs"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="trusty"
              disabled={submitMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              {submitMutation.isPending ? "Submitting..." : "Apply Leave"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
