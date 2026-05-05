import { Award, Eye, Globe, Users } from "lucide-react";
import { MOCK_COMPANY_STAT_CARDS } from "../../constants/mock-company";

const CARDS = [
  {
    key: "jobViews" as const,
    label: "JOB VIEWS",
    icon: Eye,
    iconColor: "#6366f1",
    iconBg: "bg-indigo-500/10",
  },
  {
    key: "applications" as const,
    label: "APPLICATIONS",
    icon: Users,
    iconColor: "#a855f7",
    iconBg: "bg-purple-500/10",
  },
  {
    key: "talentPool" as const,
    label: "TALENT POOL",
    icon: Globe,
    iconColor: "#10b981",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "avgKarma" as const,
    label: "AVG KARMA",
    icon: Award,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
  },
] as const;

const DELTA_STYLES = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
} as const;

export function CompanyStatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const data = MOCK_COMPANY_STAT_CARDS[card.key];
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
            <p
              className={`mt-2.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${DELTA_STYLES[data.deltaColor]}`}
            >
              {data.delta}
            </p>
          </div>
        );
      })}
    </div>
  );
}
