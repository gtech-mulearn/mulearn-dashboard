"use client";

import { Trophy } from "lucide-react";
import {
  formatDateOnly,
  formatReviewMonth,
  MonthlyReviewForm,
  useMonthlyReviewPrefill,
} from "@/features/intern";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  NONE: { label: "Not submitted", className: "text-warning" },
  PENDING: { label: "Pending", className: "text-warning" },
  APPROVED: { label: "Approved", className: "text-success" },
  REJECTED: { label: "Rejected", className: "text-destructive" },
};

export function MonthlyReviewPageClient() {
  const { data: prefill } = useMonthlyReviewPrefill();

  const status = STATUS_LABEL[prefill?.existing_review?.status ?? "NONE"];

  return (
    <div className="w-full space-y-8">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        data-tour-id="page:intern-monthly-review:header"
      >
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            Monthly Review
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            {prefill ? (
              <>
                {formatReviewMonth(prefill)} · window{" "}
                <strong className="text-foreground">
                  {formatDateOnly(prefill.opens_on)} –{" "}
                  {formatDateOnly(prefill.closes_on)}
                </strong>{" "}
                (IST)
              </>
            ) : (
              "Reflect on your month during the last 2 and first 2 days of each month."
            )}
          </p>
        </div>

        {prefill && (
          <div
            className="flex items-center gap-3 bg-card/40 backdrop-blur-md border border-border/40 p-4 rounded-2xl shadow-xl"
            data-tour-id="page:intern-monthly-review:status"
          >
            <div className="p-2 bg-brand-blue/10 rounded-xl">
              <Trophy className="w-6 h-6 text-brand-blue" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <span className="text-sm font-black text-brand-blue uppercase tracking-widest leading-none">
                {formatReviewMonth(prefill)}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                Status:{" "}
                <span className={`font-black ${status.className}`}>
                  {status.label}
                </span>
                {" · "}
                {prefill.window_open ? (
                  <span className="text-success font-black">Window open</span>
                ) : (
                  <span className="font-black">
                    Opens {formatDateOnly(prefill.opens_on)}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className="max-w-4xl mx-auto"
        data-tour-id="page:intern-monthly-review:form"
      >
        <MonthlyReviewForm />
      </div>
    </div>
  );
}
