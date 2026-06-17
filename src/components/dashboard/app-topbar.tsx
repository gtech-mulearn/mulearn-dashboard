"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo } from "@/features/auth/hooks/use-session";
// import { NotificationPopover } from "@/features/notification/components/notification-popover";
import { ROLES } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function AppTopbar() {
  const { data, isLoading } = useUserInfo();

  const isStudent = data?.roles.includes(ROLES.STUDENT) ?? false;

  return (
    <header className="fixed top-4 left-4 right-4 z-[40] h-14 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-md flex items-center px-3 justify-between gap-4">
      {/* Left: trigger + logo */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="rounded-full w-9 h-9 text-muted-foreground" />
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo.webp"
            alt="μLearn"
            width={100}
            height={32}
            priority
            style={{ height: "auto" }}
            className="h-7 w-auto"
          />
        </Link>
      </div>

      {/* Right: notification (student only) + theme + avatar + user info */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* {isStudent && <NotificationPopover />} */}

        {isLoading ? (
          <div className="flex items-center gap-2 pr-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="hidden sm:flex flex-col gap-1">
              <Skeleton className="w-20 h-3 rounded" />
              <Skeleton className="w-14 h-2.5 rounded" />
            </div>
          </div>
        ) : data ? (
          <div className="flex items-center gap-2 pr-1">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage
                src={data.profile_pic ?? undefined}
                alt={data.full_name}
              />
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(data.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className={cn("hidden sm:flex flex-col leading-tight")}>
              <span className="text-sm font-semibold truncate max-w-[120px]">
                {data.full_name}
              </span>
              <span className="text-xs text-muted-foreground">{data.muid}</span>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
