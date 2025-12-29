/**
 * Dashboard Sidebar Component
 *
 * 📍 src/components/dashboard/sidebar.tsx
 *
 * Responsive sidebar navigation for dashboard.
 * Collapsible on mobile, expandable on desktop.
 */

"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Map as MapIcon,
  Menu,
  Rocket,
  Search,
  Settings,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authStore } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    title: "μJourney",
    href: "/dashboard/mujourney",
    icon: <MapIcon className="w-5 h-5" />,
  },
  {
    title: "Interest Groups",
    href: "/dashboard/interest-groups",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Learning Circle",
    href: "/dashboard/learning-circle",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    title: "Search",
    href: "/dashboard/search",
    icon: <Search className="w-5 h-5" />,
  },
  {
    title: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    title: "Launchpad",
    href: "/dashboard/launchpad",
    icon: <Rocket className="w-5 h-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    authStore.clearTokens();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
        type="button"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="lg:hidden fixed inset-0 bg-black/50 z-40 cursor-default"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300",
          // Desktop
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile
          isMobileOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
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
          {isCollapsed && (
            <Link href="/dashboard" className="mx-auto">
              <Image
                src="/logo.webp"
                alt="μLearn"
                width={40}
                height={32}
                priority
                className="object-contain"
              />
            </Link>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                isActive(item.href)
                  ? "bg-[#0961F5] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                isActive(item.href)
                  ? "bg-[#0961F5] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            type="button"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
