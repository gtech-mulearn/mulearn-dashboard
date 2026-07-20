"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserInfo } from "@/features/auth";
import { ROLES } from "@/lib/auth/roles";
import { DiscordConnectDialog } from "@/features/connect";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Spinner } from "../ui/spinner";

export function ConnectAccountsBanner() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const isSidebarExpanded = sidebarState === "expanded";
  const isConnectBannerDismissed = useUIStore(
    (state) => state.isConnectBannerDismissed,
  );
  const dismissConnectBanner = useUIStore(
    (state) => state.dismissConnectBanner,
  );
  const user = useUserInfo();
  const [mounted, setMounted] = useState(false);
  const [isDiscordDialogOpen, setIsDiscordDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ALLOWED_ROUTES = ["/dashboard/profile", "/dashboard/mujourney"];
  const isCompanyRoute = pathname.startsWith("/dashboard/company");
  const isAllowedRoute = ALLOWED_ROUTES.includes(pathname) && !isCompanyRoute;
  if (!mounted || !isAllowedRoute) return null;
  if (isConnectBannerDismissed) return null;
  if (user.isLoading) {
    return <Spinner className="h-8 w-8" />;
  }
  const isCompany = user.data?.roles?.includes(ROLES.COMPANY) ?? false;
  if (isCompany) return null;
  const discordConnected = user.data?.exist_in_guild === true;
  const shouldShow = !discordConnected;
  if (!shouldShow) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none",
          // Offset by the fixed sidebar (which appears at md+) so the banner
          // centers over the content area, not the full viewport (otherwise it
          // sits under/over the sidebar on tablets).
          isSidebarExpanded ? "md:pl-62" : "md:pl-14",
        )}
      >
        <div className="relative flex w-full max-w-xl flex-col items-center gap-6 rounded-4xl bg-background/80 p-5 shadow-lg backdrop-blur lg:flex-row lg:justify-between lg:gap-3 lg:rounded-full lg:p-6 pointer-events-auto">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-sm font-medium">Complete your setup</p>
            <p className="text-xs text-muted-foreground">
              Link your accounts to continue.
            </p>
          </div>
          <div className="flex w-full items-center justify-center gap-2 lg:w-auto">
            {!discordConnected && (
              <Button
                variant="default"
                className="h-9 flex-1 text-xs md:flex-none md:text-sm"
                onClick={() => setIsDiscordDialogOpen(true)}
              >
                Connect Discord
              </Button>
            )}
            <Button
              variant="link"
              size="icon"
              onClick={() => dismissConnectBanner()}
              className="absolute right-3 top-3 h-8 w-8 md:static md:ml-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <DiscordConnectDialog
        open={isDiscordDialogOpen}
        onOpenChange={setIsDiscordDialogOpen}
      />
    </>
  );
}
