/**
 * Issue VC Modal Component
 *
 * 📍 src/features/profile/components/issue-vc-modal.tsx
 *
 * Modal for issuing or viewing Verifiable Credentials.
 * Handles DID selection, VC issuance, and displaying issued VCs.
 */

"use client";

import { Check, ExternalLink, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useConnectedDIDs, useIssueVCMutation } from "../hooks";
import type {
  UserAchievement,
  VCCredentialInfo,
  VCSubjectInfo,
} from "../schemas";

interface IssueVCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: UserAchievement;
  muid: string;
  userName: string;
  userEmail?: string;
  isOwnProfile: boolean;
  onSuccess?: () => void;
}

export function IssueVCModal({
  open,
  onOpenChange,
  achievement,
  muid,
  userName,
  userEmail,
  onSuccess,
}: IssueVCModalProps) {
  const {
    data: didsData,
    isLoading: isLoadingDIDs,
    refetch: refetchDIDs,
  } = useConnectedDIDs(muid);

  const issueVCMutation = useIssueVCMutation();

  const [overrideDID, setOverrideDID] = useState<string | null>(null);

  const { achievement: achievementData, is_issued, vc_url } = achievement;
  const availableDIDs = didsData?.dids || [];
  const selectedDID = overrideDID ?? availableDIDs[0] ?? "";
  const issuedCredential =
    issueVCMutation.data && issueVCMutation.data.length > 0
      ? issueVCMutation.data[0]
      : null;

  const handleIssueVC = () => {
    if (!selectedDID) return;

    const subjectInfo: VCSubjectInfo = {
      type: "Badge",
      did: selectedDID,
      name: userName,
      email: userEmail,
    };

    const credentialInfo: VCCredentialInfo = {
      course_name: achievementData.achievement_name,
      name: achievementData.achievement_name,
      tags: achievementData.tags,
      description: achievementData.description || "",
    };

    const templateId = achievementData.template_id || "";

    issueVCMutation.mutate(
      {
        subjectInfo,
        credentialInfo,
        templateId,
        achievementId: achievement.id,
      },
      { onSuccess: () => onSuccess?.() },
    );
  };

  const renderContent = () => {
    // Viewing already issued VC
    if (is_issued && vc_url && !issuedCredential) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg bg-success/10 p-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-success">
              <Check className="h-5 w-5" />
              <span className="font-medium">Credential Issued</span>
            </div>
            <p className="text-sm text-success/80">
              Scan the QR code to add it to your wallet.
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src={vc_url}
              alt="Verifiable Credential QR"
              width={250}
              height={250}
              className="rounded-lg border"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
              {achievementData.achievement_name}
            </span>
            {achievementData.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Newly issued credential
    if (issuedCredential) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg bg-success/10 p-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-success">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                Credential Issued Successfully!
              </span>
            </div>
            <p className="text-sm text-success/80">
              Scan the QR code to add it to your wallet.
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src={issuedCredential.message}
              alt="Verifiable Credential QR"
              width={250}
              height={250}
              className="rounded-lg border"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
              {issuedCredential.subject_info.course_name}
            </span>
            <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              {issuedCredential.subject_info.type}
            </span>
          </div>
        </div>
      );
    }

    // Loading DIDs
    if (isLoadingDIDs) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner className="h-8 w-8" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading your DIDs...
          </p>
        </div>
      );
    }

    // No DIDs linked
    if (availableDIDs.length === 0) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg bg-warning/10 p-4">
            <p className="mb-2 font-medium text-warning">No DID Linked Yet</p>
            <p className="text-sm text-warning/80">
              To issue a Verifiable Credential, you need to link your DID first.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm font-medium text-foreground">
              How to link your DID:
            </p>
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>Download the QSeverse app from App Store or Play Store</li>
              <li>Log in with your MuLearn account</li>
              <li>Your DID will be automatically linked</li>
            </ol>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://apps.apple.com/us/app/qs-passport/id6477819506"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                App Store
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://play.google.com/store/apps/details?id=com.qseverse.passport"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Play Store
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchDIDs()}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    // DID selection and issue form
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-brand-blue/10 p-4">
          <p className="text-sm text-brand-blue">
            <strong>{achievementData.achievement_name}</strong>
          </p>
          {achievementData.description && (
            <p className="mt-1 text-xs text-brand-blue/70">
              {achievementData.description}
            </p>
          )}
        </div>

        {availableDIDs.length > 1 ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Select DID to issue credential to:
            </Label>
            <div className="space-y-2">
              {availableDIDs.map((did, index) => (
                <label
                  key={did}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="did-selection"
                    value={did}
                    checked={selectedDID === did}
                    onChange={(e) => setOverrideDID(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-ring"
                  />
                  <span className="text-xs break-all">
                    DID {index + 1}: {did.slice(0, 30)}...
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Your DID:
            </p>
            <p className="mt-1 text-xs text-muted-foreground break-all">
              {availableDIDs[0]}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Your name ({userName}) and DID will be included in the credential.
        </p>
      </div>
    );
  };

  const renderFooter = () => {
    // Already issued or just issued - show close button
    if (is_issued || issuedCredential) {
      return (
        <Button variant="secondary" onClick={() => handleOpenChange(false)}>
          Close
        </Button>
      );
    }

    // No DIDs - show only close
    if (availableDIDs.length === 0) {
      return (
        <Button variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
      );
    }

    // Issue form
    return (
      <>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleIssueVC}
          disabled={issueVCMutation.isPending || !selectedDID}
        >
          {issueVCMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
          Issue VC
        </Button>
      </>
    );
  };

  const getTitle = () => {
    if (is_issued && !issuedCredential) return "View Credential";
    if (issuedCredential) return "Credential Issued";
    if (availableDIDs.length === 0) return "Link Your DID";
    return "Issue Verifiable Credential";
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOverrideDID(null);
      issueVCMutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4">{renderContent()}</div>

        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          {renderFooter()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
