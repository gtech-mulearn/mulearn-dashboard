"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { VersionBadge } from "@/components/ui/version-badge";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { authStore } from "@/lib/auth";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile } = useSidebar();
  const { mainItems, managementItems, bottomItems } = useFilteredNav();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const isCollapsed = state === "collapsed";

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
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.title}
          className={cn(
            "rounded-xl h-auto py-2.5 px-3 gap-3 transition-all",
            active
              ? "!bg-primary !text-primary-foreground !shadow-md hover:!bg-primary hover:!text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Link href={item.linkHref ?? item.href} prefetch={false}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">
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
        variant="floating"
        className="!top-[80px] !bottom-4 !left-4 !h-auto !z-50"
      >
        {isMobile && (
          <SidebarHeader className="px-4 py-5 border-b border-border">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo.webp"
                alt="μLearn"
                width={120}
                height={38}
                priority
                style={{ height: "auto" }}
                className="h-8 w-auto"
              />
            </Link>
          </SidebarHeader>
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
