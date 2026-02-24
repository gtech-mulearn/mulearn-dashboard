import { ArrowRight, BookOpen, Layers, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterestGroupListItem } from "../schemas";

type InterestGroupsCardProps = {
  groups: InterestGroupListItem[];
  isLoading?: boolean;
  category: string;
};

const imageUrls = [
  { title: "UI UX", image: "/images/ig/1.webp" },
  { title: "Web Development", image: "/images/ig/2.webp" },
  { title: "Cyber Security", image: "/images/ig/3.webp" },
  { title: "Digital Marketing", image: "/images/ig/4.webp" },
  { title: "Game Dev", image: "/images/ig/5.webp" },
  { title: "Cloud And Devops", image: "/images/ig/6.webp" },
  { title: "Product Management", image: "/images/ig/7.webp" },
  {
    title: "Internet Of Things (IOT) And Robotics",
    image: "/images/ig/8.webp",
  },
  { title: "AR VR MR", image: "/images/ig/10.webp" },
];

/** Cycle accent vars for group rows (uses chart palette from globals.css) */
const ROW_ACCENTS = [
  "--primary",
  "--chart-1",
  "--chart-2",
  "--chart-4",
  "--chart-5",
] as const;

export function InterestGroupsCard({
  groups,
  isLoading,
  category,
}: InterestGroupsCardProps) {
  const visibleGroups = groups.slice(0, 5);

  const getImageForGroup = (groupName: string) => {
    const match = imageUrls.find(
      (img) =>
        img.title.toLowerCase().trim() === groupName.toLowerCase().trim(),
    );
    return match ? match.image : "/assets/IG/mobile_dev.jpg";
  };

  return (
    <Card className="card-bg-groups relative h-full gap-0 overflow-hidden rounded-2xl border-none pt-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative SVG bubbles */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-[0.07]"
        fill="none"
        viewBox="0 0 200 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="150"
          cy="80"
          r="60"
          stroke="var(--primary)"
          strokeWidth="2"
        />
        <circle
          cx="170"
          cy="350"
          r="90"
          stroke="var(--chart-2)"
          strokeWidth="1.5"
        />
        <path
          d="M100 200L130 220V260L100 280L70 260V220L100 200Z"
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Header */}
      <CardHeader className="relative z-10 flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-9 items-center justify-center rounded-xl shadow-sm"
            style={{
              background:
                "color-mix(in srgb, var(--primary) 18%, var(--background))",
            }}
          >
            <Layers className="h-5 w-5" style={{ color: "var(--primary)" }} />
          </div>
          <CardTitle className="text-base font-bold tracking-tight text-foreground">
            Interest Groups
          </CardTitle>
        </div>

        <Link
          className="group flex items-center gap-1.5 text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          href="/dashboard/interestgroups"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      {/* Body */}
      <CardContent className="relative z-10 p-5 pt-0">
        {/* Track label */}
        <div className="mb-3 flex items-center gap-2">
          <BookOpen
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: "var(--primary)" }}
          />
          <p className="text-xs text-foreground/70">
            Curated for{" "}
            <span className="font-semibold capitalize text-foreground">
              {category}
            </span>{" "}
            track
          </p>
        </div>

        {/* Loading shimmer */}
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="shimmer h-14 w-full rounded-2xl bg-white/60"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {visibleGroups.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div
              className="rounded-full p-3"
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 14%, var(--background))",
              }}
            >
              <Users className="h-6 w-6" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-sm text-foreground/60">
              No interest groups available yet.
            </p>
          </div>
        )}

        {/* Group list */}
        <div className="space-y-2">
          {visibleGroups.map((group, index) => {
            const accentVar = ROW_ACCENTS[index % ROW_ACCENTS.length];
            const accentColor = `var(${accentVar})`;

            return (
              <Link
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/85 px-3.5 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                href={`/dashboard/interestgroups/${group.id}`}
                key={group.id}
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor: `color-mix(in srgb, ${accentColor} 50%, var(--border))`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, color-mix(in srgb, ${accentColor} 5%, transparent), transparent)`,
                  }}
                />

                <div className="flex items-center gap-3">
                  {/* Image thumbnail */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border transition-transform duration-300 group-hover:scale-105">
                    <Image
                      alt={group.name}
                      className="h-full w-full object-cover"
                      height={40}
                      width={40}
                      src={getImageForGroup(group.name)}
                    />
                  </div>

                  {/* Name + category */}
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                      {group.name}
                    </p>
                    {group.category ? (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {group.category}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                  style={{
                    background: `color-mix(in srgb, ${accentColor} 14%, var(--background))`,
                    color: accentColor,
                  }}
                >
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
