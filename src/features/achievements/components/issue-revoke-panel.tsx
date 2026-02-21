"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useManualIssue,
  useRevokeAchievement,
} from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";

export function IssueRevokePanel() {
  const { data: achievements = [] } = useAchievements();
  const issueMutation = useManualIssue();
  const revokeMutation = useRevokeAchievement();

  const [muid, setMuid] = React.useState("");
  const [achievementId, setAchievementId] = React.useState("");
  const [revokeReason, setRevokeReason] = React.useState("");
  const [showRevokeReason, setShowRevokeReason] = React.useState(false);

  const canSubmit = Boolean(muid.trim() && achievementId);
  const isIssuePending = issueMutation.isPending;
  const isRevokePending = revokeMutation.isPending;

  const handleIssue = () => {
    if (!canSubmit) return;
    issueMutation.mutate(
      { muid: muid.trim(), achievement_id: achievementId },
      {
        onSuccess: () => {
          setMuid("");
          setAchievementId("");
        },
      },
    );
  };

  const handleRevoke = () => {
    if (!canSubmit) return;
    revokeMutation.mutate(
      {
        muid: muid.trim(),
        achievement_id: achievementId,
        reason: revokeReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setMuid("");
          setAchievementId("");
          setRevokeReason("");
          setShowRevokeReason(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6" data-testid="issue-revoke-panel">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Issue / Revoke</h2>
        <p className="text-sm text-muted-foreground">
          Manually issue or revoke achievements for a specific user.
        </p>
      </div>

      <div className="max-w-md space-y-4 rounded-xl border p-6">
        {/* MUID Input */}
        <div className="space-y-2">
          <Label htmlFor="muid-input">User MUID</Label>
          <Input
            id="muid-input"
            placeholder="Enter user MUID..."
            value={muid}
            onChange={(e) => setMuid(e.target.value)}
            data-testid="issue-muid-input"
          />
        </div>

        {/* Achievement Select */}
        <div className="space-y-2">
          <Label>Achievement</Label>
          <Select value={achievementId} onValueChange={setAchievementId}>
            <SelectTrigger data-testid="issue-achievement-select">
              <SelectValue placeholder="Select an achievement" />
            </SelectTrigger>
            <SelectContent>
              {achievements.map((a: any) => (
                <SelectItem key={a.id} value={a.id}>
                  <div className="flex items-center gap-2">
                    <span>{a.name}</span>
                    {!a.is_active && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Revoke reason (toggle) */}
        {showRevokeReason && (
          <div className="space-y-2">
            <Label htmlFor="revoke-reason">Reason for Revocation</Label>
            <Textarea
              id="revoke-reason"
              placeholder="Optional reason..."
              rows={2}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              data-testid="revoke-reason-input"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleIssue}
            disabled={!canSubmit || isIssuePending || isRevokePending}
            className="flex-1"
            data-testid="issue-btn"
          >
            {isIssuePending ? "Issuing..." : "Issue"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (showRevokeReason) {
                handleRevoke();
              } else {
                setShowRevokeReason(true);
              }
            }}
            disabled={!canSubmit || isRevokePending || isIssuePending}
            className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            data-testid="revoke-btn"
          >
            {isRevokePending
              ? "Revoking..."
              : showRevokeReason
                ? "Confirm Revoke"
                : "Revoke"}
          </Button>
        </div>

        {showRevokeReason && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => {
              setShowRevokeReason(false);
              setRevokeReason("");
            }}
          >
            Cancel revoke
          </Button>
        )}
      </div>
    </div>
  );
}
