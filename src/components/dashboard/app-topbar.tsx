"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { GameProgressBar } from "@/features/mujourney/components/GameProgressBar";
import { ROLES } from "@/lib/auth/roles";

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
  const displaySubtitle =
    isCompany && companyProfile?.name ? "Company" : data?.muid;
  return (
    <header className="fixed top-0 left-0 right-0 z-[50] h-17 bg-background border-b border-border flex items-center px-4 justify-between gap-4">
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

      <div className="flex items-center gap-4">
        {(isLoading || data) && <GameProgressBar />}
        <ThemeToggle />
        {isLoading ? (
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        ) : data ? (
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage
              src={data.profile_pic ?? undefined}
              alt={data.full_name}
            />
            <AvatarFallback className="text-xs font-semibold">
              {getInitials(data.full_name)}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </header>
  );
}
