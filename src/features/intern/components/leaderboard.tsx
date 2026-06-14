"use client";

import { ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserInfo, useUserProfile } from "@/features/auth";
import { useLeaderboardMe, useTopLeaderboard } from "@/features/intern";
import { cn } from "@/lib/utils";

export function EliteLeaders() {
  const { data: userInfo, isLoading: isUserLoading } = useUserInfo();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: topLeaderboard, isLoading: isTopLoading } = useTopLeaderboard();
  const { data: meRank, isLoading: isMeLoading } = useLeaderboardMe();

  const isLoading =
    isUserLoading || isProfileLoading || isTopLoading || isMeLoading;

  const userDisplayName = useMemo(() => {
    return profile?.full_name || userInfo?.full_name || "Alex Doe";
  }, [profile, userInfo]);

  const allRows = useMemo(() => {
    return (topLeaderboard || []).map((item) => ({
      id: item.user_id,
      rank: item.rank,
      name: item.full_name,
      points: item.score,
    }));
  }, [topLeaderboard]);

  const topRows = useMemo(() => {
    if (isLoading || !userDisplayName) return [];

    const isMe = (row: { id: string; name: string }) => {
      return (
        (profile?.id && row.id === profile.id) ||
        (userDisplayName && row.name === userDisplayName)
      );
    };

    const userInTop3 = allRows.slice(0, 3).some((row) => isMe(row));

    if (userInTop3) {
      // User is in the top 3, show the top 4
      return allRows.slice(0, 4);
    } else {
      // User is not in the top 3, show top 3 and append the user as 4th row
      const result = allRows.slice(0, 3);
      let userRow = allRows.find((row) => isMe(row));
      if (!userRow) {
        userRow = {
          id: profile?.id || userInfo?.muid || "me",
          rank: meRank?.rank ?? 0,
          name: userDisplayName,
          points: meRank?.score ?? 0,
        };
      }
      result.push(userRow);
      return result;
    }
  }, [allRows, profile, userInfo, userDisplayName, meRank, isLoading]);

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden pt-6">
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
    <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden pt-6">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
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
            variant="outline"
            className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
          >
            Full Board <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 border-b border-border/20 hover:bg-transparent">
              <TableHead className="font-black uppercase text-[9px] tracking-[0.3em] w-12 text-center text-muted-foreground">
                Rank
              </TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-[0.3em] text-muted-foreground">
                Intern
              </TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-[0.3em] text-right pr-6 text-muted-foreground w-24">
                Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topRows.map((row, index) => {
              const isCurrentUser =
                (profile?.id && row.id === profile.id) ||
                (userDisplayName && row.name === userDisplayName);
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b border-border/10 transition-all",
                    isCurrentUser
                      ? "bg-brand-blue/10 hover:bg-brand-blue/20"
                      : "odd:bg-muted/30 even:bg-transparent hover:bg-muted/20",
                  )}
                >
                  <TableCell className="font-black text-muted-foreground/60 text-xs text-center py-3">
                    {row.rank || index + 1}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs text-foreground truncate max-w-[120px] sm:max-w-none inline-block align-bottom",
                          isCurrentUser ? "font-bold" : "font-medium",
                        )}
                      >
                        {row.name}
                      </span>
                      {isCurrentUser && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black tracking-wide bg-primary/10 text-primary border-primary/30 h-4 px-1"
                        >
                          YOU
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right pr-6">
                    <div className="flex items-center justify-end gap-1 font-bold text-xs text-foreground">
                      {row.points}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {topRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-xs text-muted-foreground italic uppercase tracking-wider"
                >
                  No elite leaders this month
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
