"use client";

import { Gem, Trophy } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUserInfo, useUserProfile } from "@/features/auth";
import { useLeaderboard, useLeaderboardMe } from "@/features/intern";

export default function LeaderboardPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { data: userInfo } = useUserInfo();
  const { data: profile } = useUserProfile();
  const { data: meRank } = useLeaderboardMe();

  // Absolute top 3 for the podium
  const { data: podiumData, isLoading: isPodiumLoading } = useLeaderboard({
    page: 1,
    page_size: 3,
  });

  // Paginated directory of rankings
  const { data: boardData, isLoading: isBoardLoading } = useLeaderboard({
    page,
    page_size: perPage,
    search: searchText || undefined,
  });

  if (isPodiumLoading || isBoardLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const getPodiumUser = (index: number) => {
    const item = podiumData?.data?.[index];
    return {
      name: item?.full_name || "N/A",
      points: item?.score || 0,
      avatar: item?.full_name
        ? item.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
        : "??",
      avatarUrl: item?.user_id
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`
        : undefined,
    };
  };

  const top1 = getPodiumUser(0);
  const top2 = getPodiumUser(1);
  const top3 = getPodiumUser(2);

  const listRows = (boardData?.data || []).map((item) => ({
    id: item.user_id,
    rank: item.rank,
    name: item.full_name,
    points: item.score,
    streak: "-",
    avatar: item.full_name
      ? item.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : "??",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`,
  }));

  const userDisplayName =
    profile?.full_name || userInfo?.full_name || "Alex Doe";
  const userRank = meRank?.rank ?? "-";
  const userScore = meRank?.score ?? 0;

  const tableColumns = [
    {
      column: "name",
      Label: "Username",
      isSortable: false,
      wrap: (
        data: string | import("react").ReactElement,
        _id: string,
        row: Data,
      ) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.avatarUrl as string | undefined} />
            <AvatarFallback className="text-xs">
              {row.avatar as string}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{data}</span>
          {(row.id === profile?.id || row.name === userDisplayName) && (
            <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-[10px] h-4">
              YOU
            </Badge>
          )}
        </div>
      ),
    },
    {
      column: "points",
      Label: "Points",
      isSortable: true,
      wrap: (data: string | import("react").ReactElement) => (
        <div className="flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5 text-brand-blue" />
          {data}
        </div>
      ),
    },
    {
      column: "streak",
      Label: "Streak",
      isSortable: true,
      wrap: (data: string | import("react").ReactElement) => (
        <div className="flex items-center gap-1.5 text-warning">
          <span>🔥</span>
          {data}
        </div>
      ),
    },
  ];

  const others = searchText ? listRows : listRows.filter((row) => row.rank > 3);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-8 h-8 text-warning" />
            Reward Leaderboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Compete with others and earn rewards.
          </p>
        </div>
      </div>

      {/* Podium Section */}
      <div className="relative flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-20 pb-12">
        {/* Rank 2 */}
        <div className="flex flex-col items-center w-full md:w-64 z-10">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.3)]">
              {top2.avatarUrl && <AvatarImage src={top2.avatarUrl} />}
              <AvatarFallback className="bg-slate-800 text-slate-200 text-xl font-bold">
                {top2.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-background">
              2
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {top2.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Score: {top2.points.toLocaleString()}
          </p>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 w-full text-center shadow-xl flex flex-col items-center gap-3 h-48 justify-end transform transition-transform hover:scale-105">
            <div className="p-2 bg-slate-400/10 rounded-lg">
              <Trophy className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Reward
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                <Gem className="w-6 h-6 text-brand-blue" />
                5,000
              </div>
              <p className="text-xs text-muted-foreground">Prize</p>
            </div>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center w-full md:w-72 z-20 -mt-8 md:-mt-12">
          <div className="relative mb-6">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
              👑
            </div>
            <Avatar className="w-32 h-32 border-4 border-warning shadow-[0_0_30px_rgba(255,141,12,0.4)] ring-4 ring-warning/20">
              {top1.avatarUrl && <AvatarImage src={top1.avatarUrl} />}
              <AvatarFallback className="bg-warning/20 text-warning text-2xl font-bold">
                {top1.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-warning text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-background shadow-lg">
              1
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-foreground mb-1">
            {top1.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Score: {top1.points.toLocaleString()}
          </p>
          <div className="bg-gradient-to-b from-card to-warning/5 backdrop-blur-sm border-2 border-warning/30 rounded-2xl p-8 w-full text-center shadow-[0_20px_50px_rgba(255,141,12,0.15)] flex flex-col items-center gap-4 h-64 justify-end relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-warning to-transparent opacity-50" />
            <div className="p-3 bg-warning/10 rounded-xl group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-warning" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-warning font-bold">
                Grand Prize
              </p>
              <div className="flex items-center justify-center gap-2 text-4xl font-black text-foreground tabular-nums">
                <Gem className="w-8 h-8 text-brand-blue" />
                10,000
              </div>
              <p className="text-sm text-muted-foreground">Prize Points</p>
            </div>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center w-full md:w-64 z-10">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-amber-700/50 shadow-[0_0_20px_rgba(180,83,9,0.2)]">
              {top3.avatarUrl && <AvatarImage src={top3.avatarUrl} />}
              <AvatarFallback className="bg-amber-900/20 text-amber-700 text-xl font-bold">
                {top3.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-amber-700/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-background">
              3
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {top3.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Score: {top3.points.toLocaleString()}
          </p>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 w-full text-center shadow-xl flex flex-col items-center gap-3 h-44 justify-end transform transition-transform hover:scale-105">
            <div className="p-2 bg-amber-700/10 rounded-lg">
              <Trophy className="w-6 h-6 text-amber-700" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Reward
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                <Gem className="w-6 h-6 text-brand-blue" />
                2,500
              </div>
              <p className="text-xs text-muted-foreground">Prize</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Banner */}
      <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-full py-3 px-8 text-center text-sm font-medium text-brand-blue max-w-2xl mx-auto flex items-center justify-center gap-2 mb-12 animate-pulse">
        You are ranked <span className="font-black">#{userRank}</span> with{" "}
        <Gem className="w-4 h-4" />{" "}
        <span className="font-black">{userScore.toLocaleString()}</span> points
      </div>

      {/* Rankings Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Rankings</h3>

        <TableTop
          onSearchText={(val) => {
            setSearchText(val);
            setPage(1);
          }}
          onPerPageNumber={(val) => {
            setPerPage(val);
            setPage(1);
          }}
          CSV=""
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          searchPlaceholder="Search users..."
          searchSize="md"
          searchPosition="left"
          searchWrapperClassName="bg-card/40 border-border/40"
        />

        <Table
          rows={others}
          page={page}
          perPage={perPage}
          columnOrder={tableColumns}
          slNoCellClassName="text-muted-foreground font-bold"
          useRowRankAsSerialNo={true}
        >
          <THead
            columnOrder={tableColumns}
            onIconClick={() => {}}
            action={false}
            thClassName="bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]"
          />
          <div className="p-4 border-t border-border/20">
            <Pagination
              currentPage={page}
              totalPages={boardData?.pagination?.totalPages || 1}
              perPage={perPage}
              totalCount={
                boardData?.pagination?.count
                  ? Math.max(
                      0,
                      boardData.pagination.count - (searchText ? 0 : 3),
                    )
                  : 0
              }
              handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
              handleNextClick={() => setPage((p) => p + 1)}
            />
          </div>
        </Table>
      </div>
    </div>
  );
}
