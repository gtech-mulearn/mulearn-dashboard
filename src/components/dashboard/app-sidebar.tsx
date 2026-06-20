"use client";

import { Lock, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const router = useRouter();
  const { state } = useSidebar();
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
    await authStore.clearTokens();
    useUIStore.getState().resetUI();
    toast.success("Logged out successfully");
    router.replace("/login");
  }, [router]);

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
              ? "!bg-primary !text-primary-foreground !shadow-md hover:!bg-primary hover:!text-primary-foreground"
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

          {!isCollapsed && (
            <div className="px-3 pb-1">
              <VersionBadge />
            </div>
          )}

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
