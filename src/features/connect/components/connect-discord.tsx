import { env } from "config/env";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useUserInfo } from "@/features/connect";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DiscordConnectDialog({ open, onOpenChange }: Props) {
  const userInfo = useUserInfo();
  const isRefreshing = userInfo.isFetching;
  const handleRefreshConnection = async () => {
    try {
      const response = await userInfo.refetch();
      const existInGuild = response?.data?.exist_in_guild;
      if (existInGuild === true) {
        toast.success("Discord connected successfully!");
        onOpenChange(false);
        return;
      }
      toast.error(
        "Discord is not connected. Please connect your Discord and try again.",
      );
    } catch {
      toast.error("Failed to check Discord connection status.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect your Discord</DialogTitle>
          <DialogDescription>
            To proceed with task submissions, you need to connect your Discord
            account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="font-medium">Steps to connect:</p>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>Join the µLearn Discord server</li>
            <li>Verify your account (if required)</li>
            <li>Come back here and click “Refresh Status”</li>
          </ol>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link
              href={env.NEXT_PUBLIC_DISCORD_AUTH_URL}
              target="_blank"
              rel="noreferrer"
            >
              Connect Discord
            </Link>
          </Button>

          <Button
            variant="default"
            onClick={handleRefreshConnection}
            disabled={isRefreshing}
          >
            {isRefreshing && <Spinner className="mr-2 h-4 w-4" />}
            Refresh Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
