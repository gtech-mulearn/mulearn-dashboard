"use client";

import { Bell, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteAllDirectNotifications,
  useDeleteDirectNotification,
  useNotifications,
} from "../hooks";
import { NotificationList } from "./notification-list";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>(undefined);

  const { data, isLoading } = useNotifications();
  const { mutate: deleteOne } = useDeleteDirectNotification();
  const { mutate: clearAll, isPending: isClearingAll } =
    useDeleteAllDirectNotifications();

  const now = new Date();
  const activebroadcasts = (data?.broadcasts ?? []).filter(
    (b) => new Date(b.expires_at) > now,
  );

  const unreadCount = (data?.direct.length ?? 0) + activebroadcasts.length;

  function handleDeleteOne(id: string) {
    setDeletingId(id);
    deleteOne(id, { onSettled: () => setDeletingId(undefined) });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="relative rounded-full shrink-0"
          size="icon"
          variant="ghost"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="-right-1 -top-1 absolute h-5 w-5 items-center justify-center rounded-full border-transparent bg-destructive p-0 text-destructive-foreground text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] md:w-80 p-4 z-[70]"
      >
        <Tabs defaultValue="direct">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Notifications</h4>
              <TabsList className="h-7 p-0.5">
                <TabsTrigger value="direct" className="h-6 px-2 text-xs">
                  Direct
                  {(data?.direct.length ?? 0) > 0 && (
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                      {data?.direct.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="broadcasts" className="h-6 px-2 text-xs">
                  Broadcasts
                  {activebroadcasts.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                      {activebroadcasts.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="direct" className="m-0">
              {(data?.direct.length ?? 0) > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs -mt-1"
                  onClick={() => clearAll()}
                  disabled={isClearingAll}
                >
                  {isClearingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Clear all"
                  )}
                </Button>
              )}
            </TabsContent>

            <Separator />

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="direct" className="m-0">
                  <NotificationList
                    type="direct"
                    items={data?.direct ?? []}
                    onDelete={handleDeleteOne}
                    deletingId={deletingId}
                    emptyLabel="No direct notifications"
                  />
                </TabsContent>
                <TabsContent value="broadcasts" className="m-0">
                  <NotificationList
                    type="broadcast"
                    items={activebroadcasts}
                    emptyLabel="No broadcast notifications"
                  />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
