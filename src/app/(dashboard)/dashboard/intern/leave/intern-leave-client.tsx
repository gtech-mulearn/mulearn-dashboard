"use client";

import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  FileText,
  Home,
  PlaneTakeoff,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelLeave,
  useLeaveBalance,
  useLeaveRequests,
  useSubmitLeave,
} from "@/features/intern";

export function LeaveManagementPageClient() {
  const [activeTab, setActiveTab] = useState("balance");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Inline form state
  const [leaveType, setLeaveType] = useState<
    "SICK" | "CASUAL" | "EMERGENCY" | ""
  >("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const { data: balance, isLoading: isBalanceLoading } = useLeaveBalance();
  const { data: history, isLoading: isHistoryLoading } = useLeaveRequests({
    page: currentPage,
    perPage: perPage,
  });
  const cancelLeaveMutation = useCancelLeave();
  const submitLeaveMutation = useSubmitLeave();

  const handleCancelLeave = (id: string) => {
    cancelLeaveMutation.mutate(id);
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }
    submitLeaveMutation.mutate(
      {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          setLeaveType("");
          setStartDate("");
          setEndDate("");
          setReason("");
        },
      },
    );
  };

  const isLoading = isBalanceLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const balanceCategories = [
    {
      key: "CASUAL",
      title: "Casual Leave",
      desc: "For general personal reasons",
      color: "from-brand-blue/20 to-brand-blue/5",
      borderColor: "border-brand-blue/30",
      textColor: "text-brand-blue",
      icon: PlaneTakeoff,
      balance: balance?.CASUAL,
    },
    {
      key: "SICK",
      title: "Sick Leave",
      desc: "For health and medical recovery",
      color: "from-destructive/20 to-destructive/5",
      borderColor: "border-destructive/30",
      textColor: "text-destructive",
      icon: AlertCircle,
      balance: balance?.SICK,
    },
    {
      key: "EMERGENCY",
      title: "Emergency Leave",
      desc: "Unforeseen urgent situations",
      color: "from-warning/20 to-warning/5",
      borderColor: "border-warning/30",
      textColor: "text-warning",
      icon: AlertTriangle,
      balance: balance?.EMERGENCY,
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="default"
              className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest"
            >
              Leave Desk
            </Badge>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Leave Management
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Track your leave balances, history of requests, and submit new
            leaves.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="bg-muted/30 border border-border/40 p-1 rounded-xl">
          <TabsTrigger
            value="balance"
            className="font-black uppercase text-xs tracking-wider px-6 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Leave Balance
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="font-black uppercase text-xs tracking-wider px-6 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Request History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-6 outline-none">
          {/* Leave balance cards grid */}
          <div className="grid gap-6 sm:grid-cols-3">
            {balanceCategories.map((cat) => {
              const Icon = cat.icon;
              const used = cat.balance?.used ?? 0;

              return (
                <Card
                  key={cat.key}
                  className={`relative overflow-hidden border ${cat.borderColor} bg-gradient-to-br ${cat.color} backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1`}
                >
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 opacity-10 pointer-events-none">
                    <Icon className="w-full h-full text-foreground" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${cat.textColor}`}
                      >
                        {cat.title}
                      </span>
                      <Icon className={`w-4 h-4 ${cat.textColor}`} />
                    </div>
                    <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                      {cat.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 border-t border-border/10 mt-2">
                    <div className="text-xs font-bold text-muted-foreground">
                      USED: {used}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="outline-none">
          {/* Leave request history table */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden shadow-xl">
            <CardHeader className="pb-4 border-b border-border/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Request History
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
                View history of requested leaves and track approval status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 bg-muted/10 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      <th className="p-4 pl-6">Leave Type</th>
                      <th className="p-4">Start Date</th>
                      <th className="p-4">End Date</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Reason / Notes</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {history?.data?.map((req) => {
                      const statusColors = {
                        PENDING: "bg-warning/10 text-warning border-warning/30",
                        APPROVED:
                          "bg-success/10 text-success border-success/30",
                        REJECTED:
                          "bg-destructive/10 text-destructive border-destructive/30",
                        CANCELLED:
                          "bg-muted/35 text-muted-foreground border-border/30",
                      };

                      const isCancelling =
                        cancelLeaveMutation.isPending &&
                        cancelLeaveMutation.variables === req.id;

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-muted/10 transition-colors text-sm font-semibold text-foreground group"
                        >
                          <td className="p-4 pl-6">
                            <Badge
                              variant="outline"
                              className="font-bold px-2 py-0.5 text-xs uppercase"
                            >
                              {req.leave_type}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs">
                            {new Date(req.start_date).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="p-4 text-xs">
                            {new Date(req.end_date).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="p-4 text-xs text-brand-blue font-bold">
                            {req.duration_days
                              ? `${req.duration_days} ${req.duration_days === 1 ? "day" : "days"}`
                              : "-"}
                          </td>
                          <td
                            className="p-4 max-w-xs truncate text-xs text-muted-foreground"
                            title={req.reason}
                          >
                            {req.reason}
                            {req.review_note && (
                              <div className="text-[10px] text-destructive/80 mt-1 font-bold">
                                Reviewer: {req.review_note}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={`font-black tracking-widest text-[9px] px-2 py-0.5 rounded-full ${
                                statusColors[req.status] ||
                                "bg-muted text-muted-foreground"
                              }`}
                            >
                              {req.status}
                            </Badge>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            {req.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelLeave(req.id)}
                                disabled={cancelLeaveMutation.isPending}
                                className="text-xs font-bold uppercase tracking-widest"
                              >
                                {isCancelling ? (
                                  <Spinner className="w-3.5 h-3.5" />
                                ) : (
                                  "Cancel"
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!history?.data || history.data.length === 0) && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-12 text-center text-xs text-muted-foreground italic uppercase tracking-wider"
                        >
                          No leave history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {history?.pagination && history.pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Showing {history.data.length} of {history.pagination.count}{" "}
                    Requests
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!history.pagination.isPrev}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="text-[10px] font-black uppercase tracking-widest border-border/50"
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!history.pagination.isNext}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="text-[10px] font-black uppercase tracking-widest border-border/50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Inline Leave Application Form ───────────────────────────── */}
      {activeTab === "balance" && (
        <div className="pt-4 border-t border-border/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-purple/10 rounded-xl">
              <CalendarDays className="w-5 h-5 text-brand-purple" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest text-foreground">
                Apply for Leave
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Submit a new leave request — your campus lead will review it.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitLeave}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl">
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Leave Type */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Leave Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      required
                      value={leaveType}
                      onValueChange={(v) =>
                        setLeaveType(v as "SICK" | "CASUAL" | "EMERGENCY")
                      }
                    >
                      <SelectTrigger className="w-full bg-background/50 border-border/50 h-10 font-bold focus:ring-brand-purple/30">
                        <SelectValue placeholder="Select leave type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="CASUAL"
                          className="font-bold text-xs"
                        >
                          Casual Leave
                        </SelectItem>
                        <SelectItem value="SICK" className="font-bold text-xs">
                          Sick Leave
                        </SelectItem>
                        <SelectItem
                          value="EMERGENCY"
                          className="font-bold text-xs"
                        >
                          Emergency Leave
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-10 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple/40"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-10 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple/40"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    required
                    placeholder="Briefly explain why you need this leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-brand-purple/30 resize-none p-4"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitLeaveMutation.isPending}
                    className="h-11 px-8 text-sm shadow-[0_8px_16px_rgba(139,92,246,0.25)] bg-brand-purple border-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-full transition-all duration-300 gap-2"
                  >
                    {submitLeaveMutation.isPending ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Leave Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      )}
    </div>
  );
}
