"use client";

import { Award, Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIssueVC } from "../hooks";

interface IssueVCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievementId: string;
  achievementName?: string;
  onSuccess?: () => void;
}

export function IssueVCDialog({
  open,
  onOpenChange,
  achievementId,
  achievementName = "Achievement",
  onSuccess,
}: IssueVCDialogProps) {
  const [vcUrl, setVcUrl] = React.useState("");
  const issueVCMutation = useIssueVC();

  const canSubmit = Boolean(vcUrl.trim() && vcUrl.startsWith("http"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    issueVCMutation.mutate(
      { achievementId, vcUrl: vcUrl.trim() },
      {
        onSuccess: () => {
          setVcUrl("");
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  };

  React.useEffect(() => {
    if (!open) {
      setVcUrl("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="issue-vc-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-blue" />
            Issue Verifiable Credential
          </DialogTitle>
          <DialogDescription>
            Associate a generated Qseverse credential URL with this achievement
            log.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">
              Achievement
            </p>
            <p className="font-semibold text-sm">{achievementName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vc-url">Verifiable Credential (VC) URL</Label>
            <Input
              id="vc-url"
              placeholder="https://qseverse.com/vc/..."
              value={vcUrl}
              onChange={(e) => setVcUrl(e.target.value)}
              disabled={issueVCMutation.isPending}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={issueVCMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || issueVCMutation.isPending}
            >
              {issueVCMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Associating...
                </>
              ) : (
                "Associate VC"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
