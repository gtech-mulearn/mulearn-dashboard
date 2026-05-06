import { Briefcase, Layers, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MOCK_QUICK_ACTION_COUNTS } from "../constants/mock-stats";

const QUICK_ACTIONS = [
  {
    id: "mujourney",
    label: "µJourney",
    sub: "Track your progress",
    href: "/dashboard/mujourney",
    icon: Zap,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "claim-karma",
    label: "Claim Karma",
    sub: "Submit your tasks",
    href: "/dashboard/mujourney",
    icon: Layers,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    id: "my-circles",
    label: "My Circles",
    sub: `${MOCK_QUICK_ACTION_COUNTS.myCircles} active circles`,
    href: "/dashboard/learning-circle",
    icon: Users,
    iconBg: "bg-brand-purple/10",
    iconColor: "text-brand-purple",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    sub: `You're ranked #${MOCK_QUICK_ACTION_COUNTS.leaderboardRank}`,
    href: "/dashboard/leaderboard",
    icon: Trophy,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    id: "jobs-board",
    label: "Jobs Board",
    sub: `${MOCK_QUICK_ACTION_COUNTS.jobOpenings} new openings`,
    href: "/dashboard/company/jobs",
    icon: Briefcase,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
] as const;

export function QuickActionRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {QUICK_ACTIONS.map(
        ({ id, label, sub, href, icon: Icon, iconBg, iconColor }) => (
          <Link key={id} href={href}>
            <Card className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className={`size-4 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {label}
                </p>
                <p className="truncate text-xs text-muted-foreground">{sub}</p>
              </div>
            </Card>
          </Link>
        ),
      )}
    </div>
  );
}
