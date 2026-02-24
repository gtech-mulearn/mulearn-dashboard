/**
 * Dashboard Sidebar Component
 *
 * 📍 src/components/dashboard/sidebar.tsx
 *
 * Config-driven sidebar navigation with RBAC integration.
 * Items are sourced from nav-config.ts and filtered by useFilteredNav().
 * Adding a nav item requires only editing nav-config.ts.
 */

"use client";

import { ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { authStore } from "@/lib/auth";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarExpanded, toggleSidebar } = useUIStore();
  const { mainItems, managementItems, bottomItems } = useFilteredNav();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isCollapsed = !isSidebarExpanded;

  const handleLogout = useCallback(() => {
    authStore.clearTokens();
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

  /** Shared nav link renderer */
  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        aria-current={isActive(item.href) ? "page" : undefined}
        className={cn(
          "flex items-center rounded-xl transition-all py-2.5",
          isActive(item.href)
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          // Base (Mobile/Expanded)
          "justify-start gap-3 px-3",
          // Desktop Collapsed override
          isCollapsed && "lg:justify-center lg:px-0",
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span
          className={cn(
            "text-sm font-medium whitespace-nowrap",
            isCollapsed && "lg:hidden",
          )}
        >
          {item.title}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-background border-b border-border z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
            type="button"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
          <Link href="/dashboard">
            <Image
              src="/logo.webp"
              alt="μLearn"
              width={100}
              height={32}
              priority
              style={{ height: "auto" }}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50 cursor-default"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-background border-r border-border z-50 flex flex-col transition-all duration-300 overflow-hidden",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          isMobileOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-border h-16">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.webp"
                alt="μLearn"
                width={100}
                height={32}
                priority
              />
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors",
              isCollapsed && "mx-auto",
            )}
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border h-16">
          <Link href="/dashboard">
            <Image
              src="/logo.webp"
              alt="μLearn"
              width={100}
              height={32}
              priority
              style={{ height: "auto" }}
            />
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            type="button"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav
          aria-label="Main navigation"
          className={cn(
            "flex-1 space-y-1 overflow-y-auto",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          {mainItems.map(renderNavItem)}

          {/* Management Section (only renders if user has management items) */}
          {managementItems.length > 0 && (
            <>
              <div className="pt-4 pb-1">
                {!isCollapsed && (
                  <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Management
                  </span>
                )}
                {isCollapsed && <div className="border-t border-border mx-2" />}
              </div>
              {managementItems.map(renderNavItem)}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div
          className={cn(
            "border-t border-border space-y-1",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          {bottomItems.map(renderNavItem)}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-xl text-destructive hover:bg-destructive/10 transition-all py-2.5",
              // Base (Mobile/Expanded)
              "justify-start gap-3 px-3",
              // Desktop Collapsed override
              isCollapsed && "lg:justify-center lg:px-0",
            )}
            type="button"
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap",
                isCollapsed && "lg:hidden",
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
