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

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUserProfile } from "@/features/profile/hooks/use-profile";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { authStore } from "@/lib/auth";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
  /** Function to check if an item or its children are active */
  checkActive: (item: NavItem) => boolean;
  userLevel: number;
  level?: number;
}

function SidebarItem({
  item,
  isActive,
  isCollapsed,
  onCloseMobile,
  checkActive,
  userLevel,
  level = 0,
}: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(isActive);
  const hasChildren = item.children && item.children.length > 0;
  const isLocked = item.requiredLevel ? userLevel < item.requiredLevel : false;
  const Icon = isLocked ? Lock : item.icon;

  // Sync open state with active state (e.g. when navigating)
  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const toggle = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      toast.error(`Feature Locked!`, {
        description: `You need to reach Level ${item.requiredLevel} to access ${item.title}. Keep earning karma!`,
      });
      return;
    }

    if (item.isUnderConstruction) {
      e.preventDefault();
      e.stopPropagation();
      toast.info("This feature is coming soon!", {
        description: `We're still working on ${item.title}. Stay tuned!`,
      });
      return;
    }

    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center rounded-xl transition-all py-2.5 cursor-pointer relative",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        // Base (Mobile/Expanded)
        "justify-start gap-3 px-3",
        // Desktop Collapsed override
        isCollapsed && "lg:justify-center lg:px-0",
        // Indentation for nested items
        !isCollapsed && level > 0 && "ml-4",
        // Under Construction / Locked dimming
        (item.isUnderConstruction || isLocked) && "opacity-70 grayscale-[0.3]",
        isLocked && "cursor-not-allowed",
      )}
      title={isCollapsed ? item.title : undefined}
    >
      <Icon
        className={cn(
          "shrink-0",
          level > 0 ? "w-4 h-4" : "w-5 h-5",
          hasChildren && !isCollapsed && "ml-0.5",
          isLocked && "text-muted-foreground",
        )}
      />
      <div className="flex items-center gap-2 overflow-hidden">
        <span
          className={cn(
            "text-sm font-medium whitespace-nowrap transition-all duration-300",
            isCollapsed
              ? "lg:w-0 lg:opacity-0 lg:pointer-events-none"
              : "w-auto opacity-100",
            level > 0 && "text-[13px]",
            isLocked && "text-muted-foreground",
          )}
        >
          {item.title}
        </span>
        {isLocked && !isCollapsed && (
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-tighter">
            Lvl {item.requiredLevel}
          </span>
        )}
        {item.isUnderConstruction && !isLocked && !isCollapsed && (
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 uppercase tracking-tighter">
            Soon
          </span>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <ChevronDown
          className={cn(
            "ml-auto w-4 h-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      )}
    </div>
  );

  return (
    <div className="w-full">
      {hasChildren || item.isUnderConstruction || isLocked ? (
        <button
          type="button"
          onClick={toggle}
          className="w-full text-left outline-none bg-transparent border-none p-0 block"
        >
          {content}
        </button>
      ) : (
        <Link href={item.href} onClick={onCloseMobile} className="block w-full">
          {content}
        </Link>
      )}

      {/* Children rendering */}
      <AnimatePresence initial={false}>
        {hasChildren && isOpen && !isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1 ml-2 border-l border-border/50 pl-2">
              {item.children?.map((child) => (
                <SidebarItem
                  key={child.id}
                  item={child}
                  isActive={checkActive(child)}
                  isCollapsed={isCollapsed}
                  onCloseMobile={onCloseMobile}
                  checkActive={checkActive}
                  userLevel={userLevel}
                  level={level + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarExpanded, toggleSidebar } = useUIStore();
  const { mainItems, managementItems, bottomItems } = useFilteredNav();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: profile } = useUserProfile();

  const isCollapsed = !isSidebarExpanded;

  // Extract level number (e.g., "Level 7" -> 7)
  const userLevel = profile?.level
    ? Number(profile.level.replace(/\D/g, ""))
    : 1;

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") return pathname === "/dashboard";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  /** Check if a nav item or any of its children are active */
  const isActiveItem = useCallback(
    (item: NavItem): boolean => {
      if (isActive(item.href)) return true;
      if (item.children) {
        return item.children.some((child) => isActiveItem(child));
      }
      return false;
    },
    [isActive],
  );

  const handleLogout = useCallback(() => {
    authStore.clearTokens();
    useUIStore.getState().resetUI();
    toast.success("Logged out successfully");
    router.replace("/login");
  }, [router]);

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
            "flex-1 space-y-1 overflow-y-auto scrollbar-none",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          {mainItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isActiveItem(item)}
              isCollapsed={isCollapsed}
              onCloseMobile={() => setIsMobileOpen(false)}
              checkActive={isActiveItem}
              userLevel={userLevel}
            />
          ))}

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
              {managementItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isActive={isActiveItem(item)}
                  isCollapsed={isCollapsed}
                  onCloseMobile={() => setIsMobileOpen(false)}
                  checkActive={isActiveItem}
                  userLevel={userLevel}
                />
              ))}
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
          {bottomItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isActiveItem(item)}
              isCollapsed={isCollapsed}
              onCloseMobile={() => setIsMobileOpen(false)}
              checkActive={isActiveItem}
              userLevel={userLevel}
            />
          ))}

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
