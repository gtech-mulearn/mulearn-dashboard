import { CheckCircle2, Clock, ListChecks, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type MentorStatCardsProps = {
  totalMentees: number;
  hoursMentored: number;
  sessionsConducted: number;
  pendingApprovals: number;
  isLoading: boolean;
};

const CARDS = [
  {
    key: "totalMentees" as const,
    label: "ACTIVE MENTEES",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    subLabel: "mentees total",
  },
  {
    key: "hoursMentored" as const,
    label: "HOURS MENTORED",
    icon: Clock,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    subLabel: "volunteer hours",
  },
  {
    key: "sessionsConducted" as const,
    label: "SESSIONS DONE",
    icon: CheckCircle2,
    iconColor: "text-brand-purple",
    iconBg: "bg-brand-purple/10",
    subLabel: "all time",
  },
  {
    key: "pendingApprovals" as const,
    label: "PENDING APPROVALS",
    icon: ListChecks,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    subLabel: "tasks awaiting review",
  },
] as const;

export function MentorStatCards({
  totalMentees,
  hoursMentored,
  sessionsConducted,
  pendingApprovals,
  isLoading,
}: MentorStatCardsProps) {
  const values: Record<(typeof CARDS)[number]["key"], number> = {
    totalMentees,
    hoursMentored,
    sessionsConducted,
    pendingApprovals,
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div
              className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <Icon className={`size-5 ${card.iconColor}`} />
            </div>
            {isLoading ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-20 rounded-md" />
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {values[card.key]}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {card.subLabel}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
