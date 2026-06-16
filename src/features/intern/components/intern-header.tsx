"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo, useUserProfile } from "@/features/auth";
import { useInternOverview } from "@/features/intern";

export function InternHeader() {
  const { data: userInfo, isLoading: isUserLoading } = useUserInfo();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: overview, isLoading: isOverviewLoading } = useInternOverview();

  const isLoading = isUserLoading || isProfileLoading || isOverviewLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  const userDisplayName =
    profile?.full_name || userInfo?.full_name || "Alex Doe";
  const userStatus = overview?.status || "ACTIVE";
  const userLevel = profile?.level || "1";
  const profilePic = profile?.profile_pic || null;

  const initials = userDisplayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-16 h-16 rounded-2xl border-2 border-brand-blue/30 shadow-lg">
            {profilePic && (
              <AvatarImage
                src={profilePic}
                alt={userDisplayName}
                className="rounded-2xl object-cover"
              />
            )}
            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Welcome back, {userDisplayName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {userLevel}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard/intern/leave">
          <Button
            variant="outline"
            className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            Leave Desk
          </Button>
        </Link>
        <Badge
          variant="outline"
          className="px-4 py-1.5 text-sm font-bold border-success/30 text-success bg-success/5 rounded-full"
        >
          <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
          {userStatus}
        </Badge>
      </div>
    </div>
  );
}
