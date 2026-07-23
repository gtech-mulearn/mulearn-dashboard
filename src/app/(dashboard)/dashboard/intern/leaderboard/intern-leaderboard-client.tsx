"use client";

import { ArrowUpDown, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserInfo, useUserProfile } from "@/features/auth";
import {
  isCurrentLeaderboardUser,
  useLeaderboard,
  useLeaderboardMe,
} from "@/features/intern";

function Medal({ rank }: { rank: number }) {
  const gradientId = `intern-medal-grad-${rank}`;

  const getGradientStops = () => {
    if (rank === 1) {
      return (
        <>
          <stop offset="0%" stopColor="var(--warning)" />
          <stop
            offset="100%"
            stopColor="color-mix(in srgb, var(--warning) 60%, var(--foreground))"
          />
        </>
      );
    }
    if (rank === 2) {
      return (
        <>
          <stop
            offset="0%"
            stopColor="color-mix(in srgb, var(--foreground) 40%, var(--background))"
          />
          <stop
            offset="100%"
            stopColor="color-mix(in srgb, var(--foreground) 10%, var(--background))"
          />
        </>
      );
    }
    return (
      <>
        <stop offset="0%" stopColor="var(--chart-5)" />
        <stop
          offset="100%"
          stopColor="color-mix(in srgb, var(--chart-5) 60%, var(--foreground))"
        />
      </>
    );
  };

  return (
    <svg
      className="w-10 h-10 md:w-14 md:h-14 drop-shadow-md relative z-25"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Medal for rank {rank}</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {getGradientStops()}
        </linearGradient>
      </defs>

      <path
        d="M22 30L14 54L25 50L32 30"
        fill="var(--destructive)"
        opacity="0.95"
      />
      <path
        d="M42 30L50 54L39 50L32 30"
        fill="var(--brand-blue)"
        opacity="0.95"
      />
      <path
        d="M18 30L14 54L18 52.5L22 30"
        fill="color-mix(in srgb, var(--destructive) 40%, var(--background))"
        opacity="0.6"
      />
      <path
        d="M46 30L50 54L46 52.5L42 30"
        fill="color-mix(in srgb, var(--brand-blue) 40%, var(--background))"
        opacity="0.6"
      />
      <circle
        cx="32"
        cy="30"
        r="17"
        fill="color-mix(in srgb, var(--foreground) 15%, transparent)"
      />
      <circle
        cx="32"
        cy="30"
        r="15"
        fill={`url(#${gradientId})`}
        stroke="var(--background)"
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="30"
        r="11"
        stroke="var(--background)"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.5"
      />
      <text
        x="32"
        y="35"
        textAnchor="middle"
        fill="var(--primary)"
        fontSize="14"
        fontWeight="900"
        fontFamily="sans-serif"
      >
        {rank}
      </text>
    </svg>
  );
}

export function LeaderboardPageClient() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { data: userInfo } = useUserInfo();
  const { data: profile } = useUserProfile();
  const { data: meRank } = useLeaderboardMe();
  const leaderboardIdentity = useMemo(
    () => ({
      profileId: profile?.id,
      muids: [profile?.muid, userInfo?.muid],
    }),
    [profile?.id, profile?.muid, userInfo?.muid],
  );

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

  const getPodiumUser = (index: number) => {
    const activePodium = (podiumData?.data || []).filter(
      (item) => item.status !== "INACTIVE",
    );
    const item = activePodium[index];
    const isCurrentUser = item
      ? isCurrentLeaderboardUser(item, leaderboardIdentity)
      : false;

    return {
      id: item?.user_id || "",
      rank: item?.rank || index + 1,
      name: isCurrentUser ? "You" : item?.full_name || "N/A",
      points: item?.score || 0,
      avatar: item?.full_name
        ? item.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
        : "??",
      profilePic: isCurrentUser
        ? (profile?.profile_pic ?? userInfo?.profile_pic ?? item?.profile_pic)
        : item?.profile_pic,
      link: item?.muid
        ? `/profile/${encodeURIComponent(item.muid)}`
        : undefined,
    };
  };

  const top1 = getPodiumUser(0);
  const top2 = getPodiumUser(1);
  const top3 = getPodiumUser(2);

  if (isPodiumLoading || isBoardLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const listRows = (boardData?.data || [])
    .filter((item) => item.status !== "INACTIVE")
    .map((item) => {
      const isCurrentUser = isCurrentLeaderboardUser(item, leaderboardIdentity);
      return {
        id: item.user_id,
        muid: item.muid,
        rank: item.rank,
        name: item.full_name,
        actualName: item.full_name,
        points: item.score,
        streak:
          item.daily_streak !== undefined ? String(item.daily_streak) : "-",
        isCurrentUser,
        avatar: item.full_name
          ? item.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
          : "??",
        avatarUrl: isCurrentUser
          ? (profile?.profile_pic ?? userInfo?.profile_pic ?? item.profile_pic)
          : item.profile_pic,
      };
    });

  const _userDisplayName =
    profile?.full_name || userInfo?.full_name || "Alex Doe";
  const userRank = meRank?.rank ?? "-";
  const userScore = meRank?.score ?? 0;

  const tableColumns = [
    {
      column: "rank",
      Label: "Rank",
      isSortable: false,
      width: "w-16",
      wrap: (
        _data: string | import("react").ReactElement,
        _id: string,
        row: Data,
      ) => <span className="text-muted-foreground font-bold">{row.rank}</span>,
    },
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
          {row.isCurrentUser && (
            <Badge variant="outline" className="text-[10px] h-4">
              YOU
            </Badge>
          )}
        </div>
      ),
    },
    {
      column: "points",
      Label: "Score",
      isSortable: true,
      wrap: (data: string | import("react").ReactElement) => (
        <div className="flex items-center gap-1.5">{data}</div>
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

  const renderPodiumCard = (
    user: ReturnType<typeof getPodiumUser>,
    rank: number,
    isCenter?: boolean,
    ringColor?: string,
  ) => {
    const cardContent = (
      <div
        className={`flex flex-col items-center text-center flex-1 ${
          isCenter ? "-translate-y-4 md:-translate-y-6" : ""
        }`}
      >
        <div className="relative mb-4 group">
          <div
            className={`absolute inset-0 rounded-full blur-md scale-110 ${
              rank === 1
                ? "bg-warning/10 dark:bg-warning/20 blur-lg scale-120"
                : rank === 2
                  ? "bg-muted-foreground/5 dark:bg-muted-foreground/10"
                  : "bg-chart-5/5 dark:bg-chart-5/10"
            }`}
          />
          <Avatar
            className={`${
              isCenter
                ? "w-20 h-20 md:w-32 md:h-32"
                : "w-16 h-16 md:w-24 md:h-24"
            } ring-4 ring-offset-2 ring-offset-background ${ringColor} shadow-md relative z-10`}
          >
            <AvatarImage
              src={user.profilePic || undefined}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback
              className={`bg-muted text-muted-foreground font-bold ${
                isCenter ? "text-xl md:text-3xl" : "text-base md:text-xl"
              }`}
            >
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute ${
              isCenter ? "-bottom-4" : "-bottom-3"
            } left-1/2 -translate-x-1/2 z-20`}
          >
            <Medal rank={rank} />
          </div>
        </div>

        <div className="mt-4">
          <h3
            className={`${
              isCenter
                ? "font-extrabold text-sm md:text-base max-w-[120px] md:max-w-[180px]"
                : "font-bold text-xs md:text-sm max-w-[100px] md:max-w-[150px]"
            } text-foreground leading-snug`}
          >
            {user.name}
          </h3>
          <p
            className={`${
              isCenter
                ? "text-xs md:text-sm font-bold text-warning"
                : "text-[10px] md:text-xs text-muted-foreground font-semibold"
            } mt-1`}
          >
            {user.points.toLocaleString()} Points
          </p>
        </div>
      </div>
    );

    if (user.link) {
      return (
        <Link href={user.link} className="group block flex-1">
          {cardContent}
        </Link>
      );
    }
    return <div className="group block flex-1">{cardContent}</div>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
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
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/30 via-card to-background p-6 md:p-10 shadow-sm flex flex-col items-center">
        {/* Background Topo Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-10 dark:opacity-20">
          <svg
            className="absolute -left-10 -bottom-10 w-72 h-72 md:w-96 md:h-96 text-muted-foreground"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
            role="img"
          >
            <title>Decorative background waves left</title>
            <circle cx="10" cy="90" r="30" />
            <circle cx="10" cy="90" r="40" />
            <circle cx="10" cy="90" r="50" />
            <circle cx="10" cy="90" r="60" />
            <circle cx="10" cy="90" r="70" />
            <circle cx="10" cy="90" r="80" />
            <circle cx="10" cy="90" r="90" />
            <circle cx="10" cy="90" r="100" />
          </svg>
          <svg
            className="absolute -right-10 -top-10 w-72 h-72 md:w-96 md:h-96 text-muted-foreground"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
            role="img"
          >
            <title>Decorative background waves right</title>
            <circle cx="90" cy="10" r="30" />
            <circle cx="90" cy="10" r="40" />
            <circle cx="90" cy="10" r="50" />
            <circle cx="90" cy="10" r="60" />
            <circle cx="90" cy="10" r="70" />
            <circle cx="90" cy="10" r="80" />
            <circle cx="90" cy="10" r="90" />
            <circle cx="90" cy="10" r="100" />
          </svg>
        </div>

        {/* Top 3 Badge */}
        <div className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 bg-success/15 dark:bg-success/25 border border-success/30 text-success rounded-full text-xs font-black tracking-wider uppercase mb-8 md:mb-12 shadow-xs">
          <Trophy className="w-3.5 h-3.5" />
          <span>Top 3 Interns</span>
        </div>

        {/* Podium grid */}
        <div className="relative w-full max-w-2xl mx-auto flex items-end justify-center gap-4 md:gap-12 pt-6 pb-2 z-10">
          {/* 2nd Place */}
          {top2 && renderPodiumCard(top2, 2, false, "ring-muted-foreground/30")}

          {/* 1st Place (Center) */}
          {top1 && renderPodiumCard(top1, 1, true, "ring-warning")}

          {/* 3rd Place */}
          {top3 && renderPodiumCard(top3, 3, false, "ring-chart-5/40")}
        </div>
      </div>

      {/* User Status Banner */}
      <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-full py-3 px-8 text-center text-sm font-medium text-brand-blue max-w-2xl mx-auto flex items-center justify-center gap-2 mb-12 animate-pulse">
        You are ranked <span className="font-black">#{userRank}</span> with{" "}
        <span className="font-black">{userScore.toLocaleString()}</span> points
      </div>

      {/* Rankings Table */}
      <div className="space-y-4 leaderboard-table">
        <style>{`
          .leaderboard-table [class*="md:hidden"] div.mb-3 > div > p:first-child {
            display: none;
          }
        `}</style>
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
          slNoCellClassName="text-muted-foreground font-bold hidden"
        >
          <thead>
            <tr>
              {tableColumns.map((column) => (
                <th
                  className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider ${(column as { width?: string }).width || ""} bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]`}
                  key={column.column}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.Label}</span>
                    {column.isSortable && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {}}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArrowUpDown className="size-3" />
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
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
