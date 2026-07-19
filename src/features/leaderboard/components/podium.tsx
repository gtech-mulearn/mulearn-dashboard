import { Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PodiumProps } from "@/features/leaderboard";

function CardWrapper({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return href ? (
    <Link href={href} className="group block flex-1">
      {children}
    </Link>
  ) : (
    <div className="group block flex-1">{children}</div>
  );
}

function Medal({ rank }: { rank: number }) {
  const gradientId = `medal-grad-${rank}`;

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

      {/* Ribbon Left */}
      <path
        d="M22 30L14 54L25 50L32 30"
        fill="var(--destructive)"
        opacity="0.95"
      />
      {/* Ribbon Right */}
      <path
        d="M42 30L50 54L39 50L32 30"
        fill="var(--brand-blue)"
        opacity="0.95"
      />

      {/* Ribbon inner highlights */}
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

      {/* Medal Shadow behind circle */}
      <circle
        cx="32"
        cy="30"
        r="17"
        fill="color-mix(in srgb, var(--foreground) 15%, transparent)"
      />

      {/* Medal Circle */}
      <circle
        cx="32"
        cy="30"
        r="15"
        fill={`url(#${gradientId})`}
        stroke="var(--background)"
        strokeWidth="2.5"
      />
      {/* Medal Inner Ring */}
      <circle
        cx="32"
        cy="30"
        r="11"
        stroke="var(--background)"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.5"
      />

      {/* Medal Rank Number */}
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

export function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  const first = top3.find((e) => e.rank === 1) || top3[0];
  const second = top3.find((e) => e.rank === 2) || top3[1];
  const third = top3.find((e) => e.rank === 3) || top3[2];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/30 via-card to-background p-6 md:p-10 shadow-sm flex flex-col items-center">
      {/* Background Topo Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-10 dark:opacity-20">
        {/* Left Waves */}
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
        {/* Right Waves */}
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

      {/* Top 3 Leaders Badge */}
      <div className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 bg-success/15 dark:bg-success/25 border border-success/30 text-success rounded-full text-xs font-black tracking-wider uppercase mb-8 md:mb-12 shadow-xs">
        <Trophy className="w-3.5 h-3.5" />
        <span>Top 3 Learners</span>
      </div>

      {/* Podium grid */}
      <div className="relative w-full max-w-2xl mx-auto flex items-end justify-center gap-4 md:gap-12 pt-6 pb-2 z-10">
        {/* 2nd Place */}
        {second && (
          <CardWrapper href={second.link}>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="relative mb-4 group">
                <div className="absolute inset-0 rounded-full bg-muted-foreground/5 dark:bg-muted-foreground/10 blur-md scale-110" />
                <Avatar className="w-16 h-16 md:w-24 md:h-24 ring-4 ring-offset-2 ring-offset-background ring-muted-foreground/30 shadow-md relative z-10">
                  <AvatarImage
                    src={second.profile_pic}
                    alt={second.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-base md:text-xl">
                    {second.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Medal Overlay */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                  <Medal rank={2} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-xs md:text-sm text-foreground leading-snug max-w-[100px] md:max-w-[150px]">
                  {second.name}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground font-semibold mt-1">
                  {second.karma.toLocaleString()} Karma
                </p>
              </div>
            </div>
          </CardWrapper>
        )}

        {/* 1st Place (Center) */}
        {first && (
          <CardWrapper href={first.link}>
            <div className="flex flex-col items-center text-center flex-1 -translate-y-4 md:-translate-y-6">
              <div className="relative mb-4 group">
                <div className="absolute inset-0 rounded-full bg-warning/10 dark:bg-warning/20 blur-lg scale-120" />
                <Avatar className="w-20 h-20 md:w-32 md:h-32 ring-4 ring-offset-2 ring-offset-background ring-warning shadow-lg relative z-10">
                  <AvatarImage
                    src={first.profile_pic}
                    alt={first.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xl md:text-3xl">
                    {first.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Medal Overlay */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                  <Medal rank={1} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-extrabold text-sm md:text-base text-foreground leading-snug max-w-[120px] md:max-w-[180px]">
                  {first.name}
                </h3>
                <p className="text-xs md:text-sm font-bold text-warning mt-1">
                  {first.karma.toLocaleString()} Karma
                </p>
              </div>
            </div>
          </CardWrapper>
        )}

        {/* 3rd Place */}
        {third && (
          <CardWrapper href={third.link}>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="relative mb-4 group">
                <div className="absolute inset-0 rounded-full bg-chart-5/5 dark:bg-chart-5/10 blur-md scale-110" />
                <Avatar className="w-16 h-16 md:w-24 md:h-24 ring-4 ring-offset-2 ring-offset-background ring-chart-5/40 shadow-md relative z-10">
                  <AvatarImage
                    src={third.profile_pic}
                    alt={third.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-base md:text-xl">
                    {third.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Medal Overlay */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                  <Medal rank={3} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-xs md:text-sm text-foreground leading-snug max-w-[100px] md:max-w-[150px]">
                  {third.name}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground font-semibold mt-1">
                  {third.karma.toLocaleString()} Karma
                </p>
              </div>
            </div>
          </CardWrapper>
        )}
      </div>
    </div>
  );
}
