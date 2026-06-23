"use client";

import { Lock, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { VersionBadge } from "@/components/ui/version-badge";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { useUserProfile } from "@/features/profile";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { authStore } from "@/lib/auth";
import { ROLES } from "@/lib/auth/roles";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const { resolvedTheme } = useTheme();
  const { mainItems, managementItems, bottomItems } = useFilteredNav();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const isCollapsed = state === "collapsed";

  const { data: userProfile } = useUserProfile();
  const isCompany = userProfile?.roles?.includes(ROLES.COMPANY);
  const { profile: companyProfile } = useCompanyProfile({
    enabled: !!isCompany,
  });
  const isCompanyVerified = companyProfile?.status === "verified";

  const handleLogout = useCallback(async () => {
    // Clear cookies server-side first: the HttpOnly refreshToken can't be removed
    // by client js-cookie, and if it lingers the proxy refreshes a new accessToken
    // and bounces /login back to /dashboard.
    await fetch("/api/auth/logout", { method: "POST" });
    await authStore.clearTokens();
    useUIStore.getState().resetUI();
    toast.success("Logged out successfully");
    // Hard redirect so the proxy re-evaluates with the cookies actually gone.
    window.location.href = "/login";
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") return pathname === "/dashboard";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);

    // Determine if this item is a locked company feature
    const isRestrictedCompanyFeature =
      isCompany &&
      !isCompanyVerified &&
      (item.roles?.includes(ROLES.COMPANY) ||
        item.id === "talent-pool" ||
        item.id === "company-jobs" ||
        item.id === "company-tasks" ||
        item.id === "company-mentors" ||
        item.id === "company-ig-requests" ||
        item.id === "company-analytics");

    const Icon = isRestrictedCompanyFeature ? Lock : item.icon;

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={
            isRestrictedCompanyFeature
              ? "Available after company verification"
              : item.title
          }
          className={cn(
            "rounded-xl h-auto py-2.5 px-3 gap-3 transition-all",
            active
              ? "!bg-brand-blue !text-primary-foreground !shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isRestrictedCompanyFeature && "opacity-70",
          )}
        >
          <Link href={item.linkHref ?? item.href} prefetch={false}>
            <Icon
              className={cn(
                "w-5 h-5 shrink-0",
                isRestrictedCompanyFeature && "text-muted-foreground/70",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap flex items-center gap-2",
                isRestrictedCompanyFeature && "text-muted-foreground",
              )}
            >
              {item.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className="!top-[68px] !h-[calc(100svh-68px)] !z-40 *:!rounded-none"
      >
        {isMobile && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src={
                  resolvedTheme === "dark" ? "/logo-dark.webp" : "/logo.webp"
                }
                alt="μLearn"
                width={100}
                height={32}
                priority
                style={{ height: "auto" }}
                className="h-7 w-auto"
              />
            </Link>
            <SidebarTrigger className="rounded-full w-9 h-9 text-muted-foreground" />
          </div>
        )}
        <SidebarContent className={isCollapsed ? "p-2" : "p-3"}>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {mainItems.map(renderNavItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {managementItems.length > 0 && (
            <SidebarGroup className="p-0 pt-2">
              <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {managementItems.map(renderNavItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter
          className={cn(
            "border-t border-border space-y-1",
            isCollapsed ? "p-2" : "p-3",
          )}
        >
          <SidebarMenu className="gap-1">
            {bottomItems.map(renderNavItem)}
          </SidebarMenu>

          <Button
            variant="destructive"
            size="default"
            onClick={() => setIsLogoutDialogOpen(true)}
            aria-label="Logout"
            className={cn("w-full rounded-xl", isCollapsed && "justify-center")}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap",
                isCollapsed && "hidden",
              )}
            >
              Logout
            </span>
          </Button>

          {!isCollapsed && (
            <div className="px-3">
              <VersionBadge />
            </div>
          )}

          {!isCollapsed && (
            <div className="text-center text-[9px] text-muted-foreground">
              © {new Date().getFullYear()} μLearn Foundation. All rights
              reserved.
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Logout"
        description="Are you sure you want to log out?"
        onConfirm={handleLogout}
        confirmLabel="Logout"
      />
    </>
  );
}
