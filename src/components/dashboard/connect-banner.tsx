"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQsverseInfo, useUserInfo } from "@/features/connect";
import { Spinner } from "../ui/spinner";

export function ConnectAccountsBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const user = useUserInfo();
  const qsverse = useQsverseInfo();
  const ALLOWED_ROUTES = ["/dashboard/profile", "/dashboard/mujourney"];
  const isAllowedRoute = ALLOWED_ROUTES.includes(pathname);
  if (!isAllowedRoute) return null;
  if (dismissed) return null;
  if (user.isLoading || qsverse.isLoading)
    return <Spinner className="h-8 w-8" />;
  const discordConnected = user.data?.exist_in_guild === true;
  const qsverseConnected = (qsverse.data?.dids?.length ?? 0) > 0;
  const shouldShow = !discordConnected || !qsverseConnected;
  if (!shouldShow) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="relative flex w-full max-w-xl flex-col items-center gap-6 rounded-4xl bg-background/80 p-5 shadow-lg backdrop-blur lg:flex-row lg:justify-between lg:gap-3 lg:rounded-full lg:p-6">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-sm font-medium">Complete your setup</p>
          <p className="text-xs text-muted-foreground">
            Link your accounts to continue.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 lg:w-auto">
          {!discordConnected && (
            <Button
              asChild
              variant="default"
              className="h-9 flex-1 text-xs md:flex-none md:text-sm"
            >
              <Link href="/settings/integrations">Connect Discord</Link>
            </Button>
          )}
          {!qsverseConnected && (
            <Button
              asChild
              variant="inverted"
              className="h-9 flex-1 text-xs md:flex-none md:text-sm"
            >
              <Link href="/settings/integrations">Connect Qsverse</Link>
            </Button>
          )}
          <Button
            variant="blue"
            size="icon"
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-3 h-8 w-8 md:static md:ml-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
