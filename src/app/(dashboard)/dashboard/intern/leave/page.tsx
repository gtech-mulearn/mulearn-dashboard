"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Loader2,
  PlaneTakeoff,
  Plus,
  UserCheck,
  X,
  XCircle,
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
import {
  LeaveFormDialog,
  useCancelLeave,
  useLeaveBalance,
  useLeaveRequests,
} from "@/features/intern";

export default function LeaveManagementPage() {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { data: balance, isLoading: isBalanceLoading } = useLeaveBalance();
  const { data: history, isLoading: isHistoryLoading } = useLeaveRequests({
    page: currentPage,
    perPage: perPage,
  });
  const cancelLeaveMutation = useCancelLeave();

  const handleCancelLeave = (id: string) => {
    cancelLeaveMutation.mutate(id);
  };

  const isLoading = isBalanceLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Categories helper to display balances beautifully
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
      key: "WFH",
      title: "Work From Home",
      desc: "Remote work days allowed",
      color: "from-brand-purple/20 to-brand-purple/5",
      borderColor: "border-brand-purple/30",
      textColor: "text-brand-purple",
      icon: Home,
      balance: balance?.WFH,
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
            <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
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
        <div>
          <Button
            onClick={() => setIsLeaveOpen(true)}
            className="font-bold bg-brand-purple hover:bg-brand-purple/90 text-white rounded-full px-6 py-3 text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Leave balance cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {balanceCategories.map((cat) => {
          const Icon = cat.icon;
          const limit = cat.balance?.limit ?? "∞";
          const used = cat.balance?.used ?? 0;
          const remaining = cat.balance?.remaining ?? "∞";

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
                <CardTitle className="text-2xl font-black tracking-tight text-foreground mt-1">
                  {remaining}{" "}
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Remaining
                  </span>
                </CardTitle>
                <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  {cat.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 border-t border-border/10 mt-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>USED: {used}</span>
                  <span>LIMIT: {limit}</span>
                </div>
                {typeof limit === "number" && (
                  <div className="mt-2 h-1.5 w-full bg-muted/30 overflow-hidden rounded-full p-[1px]">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        cat.key === "SICK"
                          ? "from-destructive to-destructive/85"
                          : cat.key === "CASUAL"
                            ? "from-brand-blue to-brand-blue/80"
                            : cat.key === "WFH"
                              ? "from-brand-purple to-brand-purple/80"
                              : "from-warning to-warning/80"
                      } rounded-full`}
                      style={{
                        width: `${Math.min(100, (used / limit) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                    APPROVED: "bg-success/10 text-success border-success/30",
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
                          className="font-bold border-muted-foreground/20 px-2 py-0.5 text-xs uppercase"
                        >
                          {req.leave_type}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {new Date(req.start_date).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {new Date(req.end_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-mono text-xs text-brand-blue font-bold">
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
                            variant="ghost"
                            onClick={() => handleCancelLeave(req.id)}
                            disabled={cancelLeaveMutation.isPending}
                            className="text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-3 rounded-lg"
                          >
                            {isCancelling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                  className="text-[10px] font-black uppercase tracking-widest border-border/50 rounded-xl"
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!history.pagination.isNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="text-[10px] font-black uppercase tracking-widest border-border/50 rounded-xl"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave form dialog trigger */}
      <LeaveFormDialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen} />
    </div>
  );
}
