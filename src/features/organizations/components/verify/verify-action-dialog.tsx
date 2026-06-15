"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { useOrgsList } from "../../hooks/use-organizations";
import { useVerifyOrganization } from "../../hooks/use-verification";
import type { UnverifiedOrgItem } from "../../schemas/verification.schema";

interface VerifyActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  org: UnverifiedOrgItem | null;
}

export function VerifyActionDialog({
  isOpen,
  onClose,
  org,
}: VerifyActionDialogProps) {
  const [orgId, setOrgId] = useState("");
  const mutation = useVerifyOrganization();

  // Fetch all organizations of the matching type to populate dropdown
  const { data: orgsData, isLoading: isLoadingOrgs } = useOrgsList({
    pageIndex: 1,
    perPage: 1000,
    search: "",
    sortBy: "title",
    org_type: org?.org_type || "College",
    enabled: isOpen && !!org,
  });

  // Map to format required by Combobox
  const orgOptions =
    orgsData?.data?.map((o) => ({
      id: o.id,
      title: `${o.title} (${o.code})`,
    })) || [];

  const handleAction = (verified: boolean) => {
    if (!org) return;
    if (!orgId.trim()) {
      toast.error("Please select a destination Organization");
      return;
    }
    mutation.mutate(
      { uorgId: org.id, data: { verified, org_id: orgId.trim() } },
      {
        onSuccess: () => {
          toast.success(
            verified
              ? "Organization approved successfully"
              : "Organization rejected successfully",
          );
          setOrgId("");
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setOrgId("");
    onClose();
  };

  if (!org) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Organization Request</DialogTitle>
          <DialogDescription>
            Approve or reject this unverified organization submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Org details */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-base">{org.title}</span>
              <Badge variant="outline">{org.org_type}</Badge>
            </div>
            {org.department && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Department:</span>{" "}
                {org.department}
              </p>
            )}
            {org.graduation_year && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  Graduation Year:
                </span>{" "}
                {org.graduation_year}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Submitted by:</span>{" "}
              {org.created_by}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Submitted at:</span>{" "}
              {new Date(org.created_at).toLocaleString()}
            </p>
          </div>

          {/* Org select dropdown */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="verify-org-id" className="font-medium">
              Destination Organization{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={orgOptions}
              value={orgId}
              onValueChange={setOrgId}
              placeholder={
                isLoadingOrgs
                  ? "Loading organizations..."
                  : "Select destination organization"
              }
              searchPlaceholder="Search organizations..."
              emptyText="No matching organizations found."
              disabled={isLoadingOrgs || mutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Select the actual Organization record to map this submission to.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleAction(false)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Rejecting…" : "Reject"}
          </Button>
          <Button
            type="button"
            onClick={() => handleAction(true)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Approving…" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
