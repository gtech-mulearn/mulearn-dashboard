"use client";

import { ChevronRight, Gem, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import Table, { type Data } from "@/components/dashboard/table/Table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo, useUserProfile } from "@/features/auth";
import { useTopLeaderboard } from "@/features/intern";

export function EliteLeaders() {
  const { data: userInfo, isLoading: isUserLoading } = useUserInfo();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: topLeaderboard, isLoading: isTopLoading } = useTopLeaderboard();

  const isLoading = isUserLoading || isProfileLoading || isTopLoading;

  const userDisplayName = useMemo(() => {
    return profile?.full_name || userInfo?.full_name || "Alex Doe";
  }, [profile, userInfo]);

  const topRows = useMemo(() => {
    return (topLeaderboard || []).map((item) => ({
      id: item.user_id,
      rank: item.rank,
      name: item.full_name,
      points: item.score,
    }));
  }, [topLeaderboard]);

  const performerColumns = useMemo(() => {
    return [
      {
        column: "name",
        Label: "Intern",
        isSortable: false,
        wrap: (
          data: string | import("react").ReactElement,
          _id: string,
          row: Data,
        ) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{data}</span>
            {(row.name as string) === userDisplayName && (
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/30 h-4"
              >
                YOU
              </Badge>
            )}
          </div>
        ),
      },
      {
        column: "points",
        Label: "Points",
        isSortable: false,
        wrap: (data: string | import("react").ReactElement) => (
          <div className="flex items-center gap-1 font-mono font-bold">
            <Gem className="w-3.5 h-3.5 text-brand-blue" />
            {data}
          </div>
        ),
      },
    ];
  }, [userDisplayName]);

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden py-0 gap-0 pt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Elite Leaders
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60 tracking-tight">
              Monthly Hall of Fame
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden py-0 gap-0 pt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Elite Leaders
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60 tracking-tight">
            Monthly Hall of Fame
          </CardDescription>
        </div>
        <Link href="/dashboard/intern/leaderboard">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs font-bold uppercase tracking-widest hover:bg-warning/10 hover:text-warning"
          >
            Full Board <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table
          rows={topRows}
          page={1}
          perPage={5}
          columnOrder={performerColumns}
          id={["id"]}
          slNoCellClassName="font-black text-muted-foreground w-12"
        />
      </CardContent>
    </Card>
  );
}
