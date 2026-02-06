"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LeaderboardEntry } from "../types/leaderboard.type";

interface PodiumProps {
  entries: LeaderboardEntry[];
}

export function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return "h-48 md:h-64";
    if (rank === 2) return "h-36 md:h-48";
    return "h-32 md:h-40";
  };

  const getRankConfig = (rank: number) => {
    if (rank === 1)
      return {
        bg: "bg-yellow-400",
        text: "text-gray-900",
        accent: "bg-gray-900",
        accentText: "text-yellow-400",
      };
    if (rank === 2)
      return {
        bg: "bg-slate-300",
        text: "text-gray-900",
        accent: "bg-gray-900",
        accentText: "text-slate-300",
      };
    return {
      bg: "bg-orange-400",
      text: "text-gray-900",
      accent: "bg-gray-900",
      accentText: "text-orange-400",
    };
  };

  return (
    <div className="relative mb-8 md:mb-20 px-2 md:px-4">
      <div className="flex items-end justify-center gap-2 md:gap-6">
        {podiumOrder.map((entry, idx) => {
          if (!entry) return null;
          const config = getRankConfig(entry.rank);
          return (
            <div
              key={entry.id}
              className={`flex flex-col items-center transition-all duration-300 hover:translate-y-[-8px] ${idx === 1 ? "order-2" : idx === 0 ? "order-1" : "order-3"}`}
            >
              <div className="mb-2 md:mb-4 relative">
                <div
                  className={`w-16 h-16 md:w-24 md:h-24 ${config.bg} rounded-full flex items-center justify-center relative overflow-hidden group`}
                >
                  <span
                    className={`text-2xl md:text-4xl font-black ${config.text} relative z-10`}
                  >
                    {entry.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="text-center mb-2 md:mb-4 space-y-1 md:space-y-2 w-full max-w-20 md:max-w-36">
                <p className="font-black text-[10px] md:text-base text-foreground truncate uppercase tracking-tight">
                  {entry.name}
                </p>
                <div className="space-y-0.5 md:space-y-1">
                  <div className="flex items-center justify-between text-[8px] md:text-xs font-black">
                    <span className="text-accent">KARMA</span>
                    <span className={config.text}>
                      {entry.karma.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <Card
                className={`w-24 md:w-36 ${getPodiumHeight(entry.rank)} ${config.bg} transition-all duration-300 hover:translate-x-[-2px]`}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-2 md:p-4 relative">
                  <div
                    className={`text-4xl md:text-7xl font-black ${config.text} leading-none mb-1 md:mb-2`}
                  >
                    {entry.rank}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
