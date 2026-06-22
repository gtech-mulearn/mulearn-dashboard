import { Activity, Trophy, Users, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { CampusInfo } from "../types";

export const StatsCards = ({ info }: { info: CampusInfo }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Karma"
        value={info.total_karma.toLocaleString()}
        description="accumulated over time"
        accent="chart-4"
        icon={<Zap className="size-5" />}
      />
      <StatCard
        title="Rank"
        value={`#${info.rank}`}
        description="among all campuses"
        accent="chart-1"
        icon={<Trophy className="size-5" />}
      />
      <StatCard
        title="Total Members"
        value={info.total_members}
        description="registered on µLearn"
        accent="chart-2"
        icon={<Users className="size-5" />}
      />
      <StatCard
        title="Active Members"
        value={info.active_members}
        description="active in last 30 days"
        accent="chart-3"
        icon={<Activity className="size-5" />}
      />
    </div>
  );
};
