"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyProfile } from "@/features/company-jobs/hooks";
import { GameProgressBar } from "@/features/mujourney/components/GameProgressBar";
import { ROLES } from "@/lib/auth";
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
  const [mounted, setMounted] = useState(false);
  const { data, isLoading } = useUserInfo();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Company accounts: show the company profile (name + logo) in the topbar,
  // not the logged-in creator's personal details. Gated so the company
  // profile is only fetched for users with the Company role.
  const isCompany = data?.roles?.includes(ROLES.COMPANY) ?? false;
  const { profile: companyProfile } = useCompanyProfile({ enabled: isCompany });

  const displayName =
    isCompany && companyProfile?.name ? companyProfile.name : data?.full_name;
  const displayImage =
    isCompany && companyProfile?.logo
      ? companyProfile.logo
      : (data?.profile_pic ?? undefined);
  const displaySubtitle = isCompany ? "Company" : (data?.muid ?? "");

  return (
    <header className="fixed top-0 left-0 right-0 z-[50] h-17 bg-background border-b border-border flex items-center pl-4 pr-2 md:pr-3 justify-between gap-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="rounded-full w-9 h-9 text-muted-foreground" />
        <Link href="/dashboard" className="flex items-center">
          <Image
            src={
              mounted && resolvedTheme === "dark"
                ? "/logo-dark.webp"
                : "/logo.webp"
            }
            alt="μLearn"
            width={100}
            height={32}
            priority
            style={{ height: "auto" }}
            className="h-7 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex">
          <GameProgressBar />
        </div>
        <ThemeToggle />
        {!mounted || isLoading ? (
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
              <AvatarImage src={displayImage} alt={displayName ?? ""} />
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(displayName ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className={cn("hidden sm:flex flex-col leading-tight")}>
              <span className="text-sm font-semibold truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {displaySubtitle}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pr-1">
            <Link
              href="/login"
              className="text-sm font-medium px-3 py-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
