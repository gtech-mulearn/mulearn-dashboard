"use client";

import {
  Facebook,
  Github,
  Globe,
  GraduationCap,
  Instagram,
  Link2,
  Linkedin,
  MapPin,
  MessageSquare,
  Twitter,
  Zap,
  Youtube,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampusInfo, useWeeklyKarma } from "../hooks";
import type { CampusDashboardProps } from "../types";
import { StatsCards, WeeklyKarmaCard } from ".";

const SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: Twitter,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    id: "discord",
    label: "Discord",
    icon: MessageSquare,
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Github,
    color: "text-foreground",
    bg: "bg-muted",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "other",
    label: "Other",
    icon: Link2,
    color: "text-warning",
    bg: "bg-warning/10",
  },
] as const;

export const CampusView = ({ id }: CampusDashboardProps) => {
  const { data: info, isLoading: isInfoLoading } = useCampusInfo(id);
  const { data: weeklyData = [], isLoading: isWeeklyLoading } =
    useWeeklyKarma(id);

  if (isInfoLoading || isWeeklyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons don't have stable IDs
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="text-destructive p-4 rounded-full mb-4">
          <Zap className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">Campus Not Found</h2>
        <p className="text-muted-foreground mt-2">
          We couldn't find any information for the campus with ID: {id}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
        {/* Subtle Decorative Gradient background */}
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-brand-purple/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -z-10 h-48 w-48 rounded-full bg-brand-blue/5 blur-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {info.college_name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 text-sm text-muted-foreground border border-border">
                <MapPin className="size-4 text-brand-blue" />
                <span className="font-medium">{info.campus_zone}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 text-sm text-muted-foreground border border-border">
                <GraduationCap className="size-4 text-brand-purple" />
                <span className="font-medium">Level {info.campus_level}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 text-sm text-muted-foreground border border-border">
                <Zap className="size-4 text-warning" />
                <span className="font-medium">{info.campus_code}</span>
              </div>
            </div>
          </div>

          {/* Social Links integration */}
          {info.social_links && info.social_links.length > 0 && (
            <div className="flex flex-col gap-2.5 sm:self-start lg:self-center border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Connect with Campus
              </span>
              <div className="flex flex-wrap gap-2">
                {info.social_links.map((link) => {
                  const platformConfig = SOCIAL_PLATFORMS.find(
                    (p) => p.id === link.platform.toLowerCase(),
                  ) || {
                    label: link.platform,
                    icon: Link2,
                    color: "text-muted-foreground",
                    bg: "bg-muted",
                  };

                  const IconComponent = platformConfig.icon;

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={platformConfig.label}
                      aria-label={platformConfig.label}
                      className={`flex items-center justify-center size-10 rounded-xl border border-border/80 transition-all duration-200 hover:scale-[1.08] cursor-pointer shadow-sm ${platformConfig.bg} hover:border-foreground/20`}
                    >
                      <IconComponent
                        className={`size-5 ${platformConfig.color}`}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <StatsCards info={info} />
        <WeeklyKarmaCard
          data={weeklyData.map((d) => ({
            date: d.date,
            value: d.value,
          }))}
        />
      </div>
    </div>
  );
};
