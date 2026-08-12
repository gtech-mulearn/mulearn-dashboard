import { Crown, Layers, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ActiveIgChapter,
  CampusLead,
  ExecomMember,
  KarmaByCluster,
  LeaderboardEntry,
} from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function SectionCard({
  title,
  icon,
  children,
  fill,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  fill?: boolean;
}) {
  return (
    <Card
      className={`rounded-2xl border-border/60 lc-card-shadow${fill ? " flex h-full flex-col" : ""}`}
    >
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <CardTitle className="text-base font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className={fill ? "flex-1" : undefined}>
        {children}
      </CardContent>
    </Card>
  );
}

export function CampusLeadCard({ lead }: { lead?: CampusLead | null }) {
  if (!lead) return null;
  return (
    <SectionCard title="Campus Lead" icon={<Crown className="size-4" />}>
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage
            src={lead.profile_pic ?? undefined}
            alt={lead.full_name}
          />
          <AvatarFallback>{initials(lead.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {lead.full_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {lead.muid} &middot; {lead.role}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export function ExecomCard({ execom }: { execom?: ExecomMember[] }) {
  if (!execom || execom.length === 0) return null;
  return (
    <SectionCard title="Execom" icon={<Users className="size-4" />}>
      <ul className="space-y-3">
        {execom.map((member) => (
          <li key={member.user_id} className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>{initials(member.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link
                href={`/profile/${member.muid}`}
                target="_blank"
                rel="noreferrer noopener"
                className="truncate block text-sm font-bold text-foreground hover:underline"
              >
                {member.full_name}
              </Link>
              <p className="truncate text-xs font-semibold text-primary">
                {member.role_title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export function TopLeaderboardCard({
  entries,
}: {
  entries?: LeaderboardEntry[];
}) {
  if (!entries || entries.length === 0) return null;
  return (
    <SectionCard
      title="Top 10 Campus Leaderboard"
      icon={<Trophy className="size-4" />}
    >
      <ul className="space-y-2.5">
        {entries.map((entry) => (
          <li key={entry.user_id} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {entry.rank}
            </span>
            <Avatar size="sm">
              <AvatarImage
                src={entry.profile_pic ?? undefined}
                alt={entry.full_name}
              />
              <AvatarFallback>{initials(entry.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {entry.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.muid}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-foreground">
              {entry.karma.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export function ActiveIgChaptersCard({
  chapters,
}: {
  chapters?: ActiveIgChapter[];
}) {
  if (!chapters || chapters.length === 0) return null;
  return (
    <SectionCard
      title="Active IG Chapters"
      icon={<Layers className="size-4" />}
      fill
    >
      <ul className="space-y-3">
        {chapters.map((chapter) => (
          <li
            key={chapter.ig_chapter_id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {chapter.ig_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {chapter.ig_code}
                {chapter.lead ? ` · Lead: ${chapter.lead.full_name}` : ""}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {chapter.member_count} members
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export function KarmaByClusterCard({
  clusters,
}: {
  clusters?: KarmaByCluster;
}) {
  const entries = Object.entries(clusters ?? {});
  if (entries.length === 0) return null;
  const maxKarma = Math.max(...entries.map(([, c]) => c.total_karma), 1);

  return (
    <SectionCard title="Karma by Cluster" icon={<Trophy className="size-4" />}>
      <ul className="space-y-3">
        {entries.map(([cluster, data]) => (
          <li key={cluster}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-foreground">
                {cluster}
              </span>
              <span className="text-muted-foreground">
                {data.total_karma.toLocaleString()} karma &middot;{" "}
                {data.member_count} members
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${(data.total_karma / maxKarma) * 100}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
