import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { PodiumProps } from "@/features/leaderboard";

export function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return "h-48 md:h-66";
    if (rank === 2) return "h-36 md:h-50";
    return "h-32 md:h-42";
  };

  const getRankConfig = (rank: number) => {
    if (rank === 1)
      return {
        bg: "bg-chart-4",
        text: "text-primary-foreground",
      };
    if (rank === 2)
      return {
        bg: "bg-muted",
        text: "text-primary-foreground",
      };
    return {
      bg: "bg-chart-5",
      text: "text-primary-foreground",
    };
  };

  return (
    <div className="relative mb-8 md:mb-20 px-2 md:px-4">
      <div className="flex items-end justify-center gap-6 md:gap-16">
        {podiumOrder.map((entry, idx) => {
          if (!entry) return null;
          const config = getRankConfig(entry.rank);
          return (
            <div
              key={entry.id}
              className={`flex flex-col items-center transition-all duration-300 hover:translate-y-[-8px] ${
                idx === 1 ? "order-2" : idx === 0 ? "order-1" : "order-3"
              }`}
            >
              <div className="mb-2 md:mb-4 relative">
                <Avatar
                  className={`w-16 h-16 md:w-24 md:h-24 ${config.bg} ring-4 ring-primary`}
                >
                  <AvatarImage
                    src={entry.profile_pic}
                    alt={entry.name}
                    className="object-cover"
                  />
                  <AvatarFallback
                    className={`font-black ${config.text} ${config.bg} text-2xl md:text-4xl`}
                  >
                    {entry.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center mb-2 md:mb-4 space-y-1 md:space-y-2 w-full max-w-20 md:max-w-36">
                <p className="font-black text-[10px] md:text-base text-foreground uppercase tracking-tight">
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
                className={`w-25 md:w-47 ${getPodiumHeight(entry.rank)} ${config.bg} transition-all duration-300 hover:translate-x-[-2px]`}
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
