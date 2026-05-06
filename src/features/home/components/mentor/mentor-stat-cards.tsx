import { CheckCircle2, Clock, Star, Users } from "lucide-react";
import { MOCK_MENTOR_STAT_DELTAS } from "../../constants/mock-mentor";

const CARDS = [
  {
    key: "activeMentees" as const,
    label: "ACTIVE MENTEES",
    icon: Users,
    iconColor: "#6366f1",
    iconBg: "bg-indigo-500/10",
  },
  {
    key: "hoursMentored" as const,
    label: "HOURS MENTORED",
    icon: Clock,
    iconColor: "#10b981",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "avgRating" as const,
    label: "AVG RATING",
    icon: Star,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
  },
  {
    key: "completionRate" as const,
    label: "COMPLETION RATE",
    icon: CheckCircle2,
    iconColor: "#a855f7",
    iconBg: "bg-purple-500/10",
  },
] as const;

export function MentorStatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const data = MOCK_MENTOR_STAT_DELTAS[card.key];
        return (
          <div
            key={card.key}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div
              className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <Icon className="size-5" style={{ color: card.iconColor }} />
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {data.value}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2.5 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {data.delta}
            </p>
          </div>
        );
      })}
    </div>
  );
}
