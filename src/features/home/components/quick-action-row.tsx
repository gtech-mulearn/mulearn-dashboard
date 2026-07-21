import { CalendarDays, FolderKanban, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type QuickActionRowProps = {
  circleCount: number;
  jobCount: number;
};

export function QuickActionRow({
  circleCount,
  jobCount: _jobCount,
}: QuickActionRowProps) {
  const actions = [
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
      id: "my-circles",
      label: "My Circles",
      sub: `${circleCount} active circle${circleCount !== 1 ? "s" : ""}`,
      href: "/dashboard/learning-circle",
      icon: Users,
      iconBg: "bg-brand-purple/10",
      iconColor: "text-brand-purple",
    },
    {
      id: "events",
      label: "Events",
      sub: "Discover upcoming events",
      href: "/dashboard/events",
      icon: CalendarDays,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      id: "projects",
      label: "Projects",
      sub: "Explore open projects",
      href: "/dashboard/projects",
      icon: FolderKanban,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    // {
    //   id: "jobs-board",
    //   label: "Jobs Board",
    //   sub: `${jobCount} new openings`,
    //   href: "/dashboard/jobs",
    //   icon: Briefcase,
    //   iconBg: "bg-destructive/10",
    //   iconColor: "text-destructive",
    // },
    // {
    //   id: "find-mentors",
    //   label: "Find Mentors",
    //   sub: "Connect with experts",
    //   href: "/dashboard/search/mentors",
    //   icon: Search,
    //   iconBg: "bg-brand-blue/10",
    //   iconColor: "text-brand-blue",
    // },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map(
        ({ id, label, sub, href, icon: Icon, iconBg, iconColor }) => (
          <Link key={id} href={href}>
            <Card className="flex flex-col items-center text-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className={`size-4 ${iconColor}`} />
              </div>
              <div className="min-w-0 w-full text-center">
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
