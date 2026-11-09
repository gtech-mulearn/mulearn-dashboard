"use client";

import { BadgeCheck, MailWarning } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmailVerificationStatus } from "../hooks";
import { ChangeEmailDialog } from "./change-email-dialog";
import { EmailVerifyDialog } from "./email-verify-dialog";

/** Account settings: the email, whether it's verified, verify and change it. */
export function EmailVerificationCard() {
  const {
    data: status,
    isLoading,
    isError,
    refetch,
  } = useEmailVerificationStatus();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (isError || !status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-6">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your email settings.
          </p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email address</CardTitle>
        <CardDescription>
          Used to sign in and for account notices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-all font-medium">{status.email}</span>
          {status.verified ? (
            <Badge variant="success" className="gap-1">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1">
              <MailWarning className="h-3.5 w-3.5" aria-hidden="true" /> Not
              verified
            </Badge>
          )}
        </div>
        {status.verified ? null : (
          <p className="text-sm text-muted-foreground">
            Verify your email to use features that share it with partner apps.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {status.verified ? null : (
            <Button type="button" onClick={() => setVerifyOpen(true)}>
              Verify email
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setChangeOpen(true)}
          >
            Change email
          </Button>
        </div>
      </CardContent>
      <EmailVerifyDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        email={status.email}
      />
      <ChangeEmailDialog
        open={changeOpen}
        onOpenChange={setChangeOpen}
        currentEmail={status.email}
        hasPassword={status.has_password}
      />
    </Card>
  );
}
