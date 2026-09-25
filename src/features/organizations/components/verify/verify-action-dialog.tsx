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
import { Label } from "@/components/ui/label";
import { useOrgsList } from "../../hooks/use-organizations";
import { useVerifyOrganization } from "../../hooks/use-verification";
import {
  toVerifyOrgPayload,
  type UnverifiedOrgItem,
} from "../../schemas/verification.schema";

export type OrgRequestDialogMode = "view" | "approve" | "reject";

const COPY: Record<
  OrgRequestDialogMode,
  { title: string; description: string }
> = {
  view: {
    title: "Organization Request",
    description: "Details submitted with this organization request.",
  },
  approve: {
    title: "Approve Organization Request",
    description:
      "Map this request to the existing Organization it refers to. The submitter is linked to that organization.",
  },
  reject: {
    title: "Reject Organization Request",
    description:
      "Closes the request without linking the submitter to any organization.",
  },
};

interface VerifyActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  org: UnverifiedOrgItem | null;
  mode: OrgRequestDialogMode;
}

export function VerifyActionDialog({
  isOpen,
  onClose,
  org,
  mode,
}: VerifyActionDialogProps) {
  const [orgId, setOrgId] = useState("");
  const mutation = useVerifyOrganization();

  // Only an approval needs the destination list.
  const { data: orgsData, isLoading: isLoadingOrgs } = useOrgsList({
    pageIndex: 1,
    perPage: 1000,
    search: "",
    sortBy: "title",
    org_type: org?.org_type || "College",
    enabled: isOpen && !!org && mode === "approve",
  });

  const orgOptions =
    orgsData?.data?.map((o) => ({
      id: o.id,
      title: `${o.title} (${o.code})`,
    })) || [];

  const handleClose = () => {
    setOrgId("");
    onClose();
  };

  const submit = (action: "approve" | "reject") => {
    if (!org) return;
    if (action === "approve" && !orgId.trim()) {
      toast.error("Please select a destination Organization");
      return;
    }
    mutation.mutate(
      { uorgId: org.id, data: toVerifyOrgPayload(action, orgId) },
      {
        onSuccess: () => {
          toast.success(
            action === "approve"
              ? "Organization approved successfully"
              : "Organization rejected successfully",
          );
          handleClose();
        },
      },
    );
  };

  if (!org) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{COPY[mode].title}</DialogTitle>
          <DialogDescription>{COPY[mode].description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
            {org.created_by_muid && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">MuID:</span>{" "}
                {org.created_by_muid}
              </p>
            )}
            {org.created_by_email && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span>{" "}
                {org.created_by_email}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Submitted at:</span>{" "}
              {new Date(org.created_at).toLocaleString()}
            </p>
          </div>

          {mode === "approve" && (
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
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode === "reject" && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => submit("reject")}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Rejecting…" : "Reject"}
            </Button>
          )}
          {mode === "approve" && (
            <Button
              type="button"
              onClick={() => submit("approve")}
              disabled={mutation.isPending || !orgId.trim()}
            >
              {mutation.isPending ? "Approving…" : "Approve"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
