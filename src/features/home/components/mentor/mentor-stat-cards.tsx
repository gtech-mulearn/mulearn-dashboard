import { CheckCircle2, Clock, ListChecks, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import type { MentorStatCard } from "../../schemas/home.schema";

type Props = {
  statCards: MentorStatCard[];
  isLoading: boolean;
};

const CARDS = [
  {
    key: "active_mentees",
    label: "Active Mentees",
    icon: Users,
    accent: "chart-1" as const,
    description: "mentees total",
  },
  {
    key: "volunteer_hours",
    label: "Hours Mentored",
    icon: Clock,
    accent: "chart-2" as const,
    description: "volunteer hours",
  },
  {
    key: "sessions_conducted",
    label: "Sessions Done",
    icon: CheckCircle2,
    accent: "chart-3" as const,
    description: "all time",
  },
  {
    key: "pending_task_approvals",
    label: "Pending Approvals",
    icon: ListChecks,
    accent: "chart-4" as const,
    description: "tasks awaiting review",
  },
] as const;

export function MentorStatCards({ statCards, isLoading }: Props) {
  function get(key: (typeof CARDS)[number]["key"]): number {
    return statCards.find((c) => c.key === key)?.value ?? 0;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;

        if (isLoading) {
          return (
            <div
              key={card.key}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <Skeleton className="mb-1.5 h-8 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded-md" />
            </div>
          );
        }

        return (
          <StatCard
            key={card.key}
            title={card.label}
            value={get(card.key)}
            icon={<Icon className="size-5" />}
            accent={card.accent}
            description={card.description}
          />
        );
      })}
    </div>
  );
}
