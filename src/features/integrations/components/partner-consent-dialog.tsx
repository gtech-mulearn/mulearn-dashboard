"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmailVerifyPanel,
  formatCountdown,
  useCountdown,
  useEmailVerificationStatus,
} from "@/features/email-verification";
import { cn } from "@/lib/utils";
import { partnerKeys } from "../hooks/query-keys";
import type { LaunchState } from "../hooks/use-partner-launch";
import type { PartnerMeta } from "../providers";
import type { ConsentDocument, PartnerConnection } from "../schemas";
import { ContinueToPartner, LaunchStatus } from "./launch-status";
import { SharedDataTable } from "./shared-data-table";

interface PartnerConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: PartnerMeta;
  connection: PartnerConnection;
  launchState: LaunchState;
  /** True when authorizing signs straight in; false when the partner reviews the account first. */
  opensPartner: boolean;
  onAuthorize: (consentVersion: string) => void;
  onRetry?: () => void;
}

const OWNER: Record<string, string> = {
  company: "your company's",
  college: "your college's",
};

/**
 * Spec B §3.9 and D5: one step. Once the partner answers, consent is saved, so
 * the form gives way to what happens next and never asks again.
 */
export function PartnerConsentDialog({
  open,
  onOpenChange,
  meta,
  connection,
  launchState,
  opensPartner,
  onAuthorize,
  onRetry,
}: PartnerConsentDialogProps) {
  const document = connection.consent?.document;
  if (!document) return null;
  const done = () => onOpenChange(false);

  let body: ReactNode;
  if (launchState.phase === "pending") {
    body = (
      <PendingView
        meta={meta}
        accountType={connection.account_type}
        pendingUrl={launchState.pendingUrl}
        onDone={done}
      />
    );
  } else if (launchState.phase === "ready") {
    body = (
      <ReadyView
        meta={meta}
        url={launchState.url}
        expiresIn={launchState.expiresIn}
        blocked={launchState.blocked}
        onDone={done}
        onRetry={onRetry}
      />
    );
  } else {
    body = (
      <ConsentForm
        meta={meta}
        connection={connection}
        document={document}
        launchState={launchState}
        opensPartner={opensPartner}
        onAuthorize={onAuthorize}
        onCancel={done}
      />
    );
  }

  const isForm =
    launchState.phase !== "pending" && launchState.phase !== "ready";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0",
          isForm ? "sm:max-w-lg lg:max-w-4xl" : "sm:max-w-md",
        )}
      >
        {body}
      </DialogContent>
    </Dialog>
  );
}

function PartnerHeader({
  meta,
  title,
  description,
}: {
  meta: PartnerMeta;
  title: string;
  description: string;
}) {
  return (
    <DialogHeader className="px-6 pt-6 pb-4">
      <div className="mb-1 flex items-center justify-center gap-3 sm:justify-start">
        <Image src="/logo.webp" alt="µLearn" width={72} height={24} />
        <ArrowLeftRight
          className="h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <meta.Logo className="h-6 w-auto" />
      </div>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
}

function ConsentForm({
  meta,
  connection,
  document,
  launchState,
  opensPartner,
  onAuthorize,
  onCancel,
}: {
  meta: PartnerMeta;
  connection: PartnerConnection;
  document: ConsentDocument;
  launchState: LaunchState;
  opensPartner: boolean;
  onAuthorize: (consentVersion: string) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: emailStatus } = useEmailVerificationStatus();
  const [agreed, setAgreed] = useState(false);
  const checkboxId = useId();
  const verified = emailStatus?.verified ?? connection.email_verified ?? false;
  const working = launchState.phase === "working";

  return (
    <>
      <PartnerHeader
        meta={meta}
        title={document.title}
        description={document.subtitle}
      />

      {/* Only this part scrolls, so the consent and its buttons stay in view. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-4">
            {verified ? null : (
              <section className="space-y-2 rounded-xl border border-warning/30 bg-warning/10 p-3">
                <p className="text-sm font-medium">
                  Verify your email to continue
                </p>
                {emailStatus?.email ? (
                  <EmailVerifyPanel
                    email={emailStatus.email}
                    onVerified={() =>
                      queryClient.invalidateQueries({
                        queryKey: partnerKeys.all,
                      })
                    }
                  />
                ) : null}
              </section>
            )}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                µLearn will share with {meta.name}
              </h3>
              <SharedDataTable rows={connection.shared_data_preview ?? []} />
            </section>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{document.purpose}</p>
            {document.notes.length > 0 ? (
              <ul className="space-y-2">
                {document.notes.map((note) => (
                  <li key={note} className="flex gap-2 text-sm">
                    <Info
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {document.sections.length > 0 ? (
              <div className="divide-y rounded-xl border">
                {document.sections.map((section) => (
                  <details key={section.title} className="group px-3 py-2.5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      {section.title}
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {section.body}
                    </p>
                  </details>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-3 border-t px-6 py-4">
        <LaunchStatus state={launchState} partnerName={meta.name} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex items-start gap-3">
            <Checkbox
              id={checkboxId}
              checked={agreed}
              disabled={!verified || working}
              onCheckedChange={(value) => setAgreed(value === true)}
              className="mt-0.5"
            />
            <label htmlFor={checkboxId} className="text-sm leading-relaxed">
              <ConsentSentence
                label={document.checkbox_label}
                termsUrl={document.terms_url}
                privacyUrl={document.privacy_url}
              />
            </label>
          </div>
          <DialogFooter className="lg:shrink-0">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!agreed || !verified || working}
              onClick={() => onAuthorize(document.version)}
            >
              {working ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {opensPartner ? (
                <>
                  Authorize &amp; open {meta.name}
                  <ExternalLink
                    className="ml-1 h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </>
              ) : (
                "Authorize & connect"
              )}
            </Button>
          </DialogFooter>
        </div>
      </div>
    </>
  );
}

function PendingView({
  meta,
  accountType,
  pendingUrl,
  onDone,
}: {
  meta: PartnerMeta;
  accountType: string;
  pendingUrl: string | null;
  onDone: () => void;
}) {
  const owner = OWNER[accountType] ?? "your";
  const reviewed = OWNER[accountType]
    ? `new ${accountType} accounts`
    : "new accounts";
  return (
    <>
      <PartnerHeader
        meta={meta}
        title={`Sent to ${meta.name} for review`}
        description={`Your consent is saved and ${owner} details were shared with ${meta.name}.`}
      />
      <div className="px-6 pb-6">
        <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
          <Clock
            className="mt-0.5 h-4 w-4 shrink-0 text-warning"
            aria-hidden="true"
          />
          <p>
            {meta.name} reviews {reviewed}. Once they approve, you can open{" "}
            {meta.name} straight from µLearn.
          </p>
        </div>
      </div>
      <DialogFooter className="border-t px-6 py-4">
        {pendingUrl ? (
          <Button asChild variant="outline">
            <a href={pendingUrl} target="_blank" rel="noopener noreferrer">
              View on {meta.name}
              <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        ) : null}
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
}

function ReadyView({
  meta,
  url,
  expiresIn,
  blocked,
  onDone,
  onRetry,
}: {
  meta: PartnerMeta;
  url: string;
  expiresIn: number;
  blocked: boolean;
  onDone: () => void;
  onRetry?: () => void;
}) {
  const { remaining } = useCountdown(expiresIn);
  const expired = remaining === 0;
  return (
    <>
      <PartnerHeader
        meta={meta}
        title={`${meta.name} is ready`}
        description={
          blocked
            ? `Your browser blocked the new tab, so open ${meta.name} from here.`
            : `Your consent is saved. Continue to sign in to ${meta.name}.`
        }
      />
      <p className="px-6 pb-6 text-sm text-muted-foreground">
        {expired
          ? "The sign-in link expired."
          : `The sign-in link works once, for ${formatCountdown(remaining)}.`}
      </p>
      <DialogFooter className="border-t px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Done
        </Button>
        {expired ? (
          onRetry ? (
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
          ) : null
        ) : (
          <ContinueToPartner
            url={url}
            partnerName={meta.name}
            onContinue={onDone}
            size="default"
          />
        )}
      </DialogFooter>
    </>
  );
}

function ConsentSentence({
  label,
  termsUrl,
  privacyUrl,
}: {
  label: string;
  termsUrl: string;
  privacyUrl: string;
}) {
  const match = label.match(
    /^([\s\S]*)\{terms\}([\s\S]*)\{privacy\}([\s\S]*)$/,
  );
  const link = (href: string, text: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {text}
    </a>
  );
  if (!match) return <>{label}</>;
  return (
    <>
      {match[1]}
      {link(termsUrl, "Terms")}
      {match[2]}
      {link(privacyUrl, "Privacy Policy")}
      {match[3]}
    </>
  );
}
