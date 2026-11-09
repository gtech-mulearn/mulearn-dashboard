/**
 * Register an app, then show its credentials exactly once.
 *
 * 📍 src/features/connected-apps/components/register-app-page.tsx
 */

"use client";

import { ChevronLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSecurityPosture } from "@/features/sign-in-security";
import { useRegisterConnectedApp } from "../hooks";
import {
  EMPTY_CLIENT_FORM,
  type RegisteredApp,
  toCreatePayload,
} from "../schemas";
import { APPS_BASE, CopyButton } from "./app-parts";
import { ClientForm } from "./client-form";

function CredentialsPanel({
  result,
  onDone,
}: {
  result: RegisteredApp;
  onDone: () => void;
}) {
  const { data: posture } = useSecurityPosture();
  const [stored, setStored] = useState(false);
  const secret = result.client_secret;
  const env = [
    `OIDC_ISSUER=${posture?.issuer ?? "<µLearn sign-in address>"}`,
    `OIDC_CLIENT_ID=${result.client.client_id}`,
    ...(secret ? [`OIDC_CLIENT_SECRET=${secret}`] : []),
  ].join("\n");

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {result.client.name} is registered
          </h2>
          <p className="text-sm text-muted-foreground">
            Give these to the app's developers.
          </p>
        </div>
      </div>

      {secret ? (
        <Alert>
          <AlertTitle>Copy the secret now. It's shown only once.</AlertTitle>
          <AlertDescription>
            µLearn keeps only a scrambled copy, so nobody can show it again. If
            it's lost, register the app again under a new client ID.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription>
            This app has no client secret: it proves itself with PKCE on every
            sign-in.
          </AlertDescription>
        </Alert>
      )}

      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-muted-foreground">Client ID</dt>
          <dd className="flex items-center gap-1">
            <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
              {result.client.client_id}
            </code>
            <CopyButton value={result.client.client_id} label="Client ID" />
          </dd>
        </div>
        {secret && (
          <div>
            <dt className="text-sm text-muted-foreground">Client secret</dt>
            <dd className="flex items-center gap-1">
              <code className="break-all rounded bg-muted px-2 py-1 font-mono text-sm">
                {secret}
              </code>
              <CopyButton value={secret} label="Client secret" />
            </dd>
          </div>
        )}
        <div>
          <dt className="flex items-center justify-between text-sm text-muted-foreground">
            Environment for the app
            <CopyButton value={env} label="Environment" />
          </dt>
          <dd>
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs">
              {env}
            </pre>
          </dd>
        </div>
      </dl>

      {secret && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="secret-stored"
            checked={stored}
            onCheckedChange={(v) => setStored(v === true)}
          />
          <Label htmlFor="secret-stored">
            I've stored the secret somewhere safe
          </Label>
        </div>
      )}
      <Button onClick={onDone} disabled={Boolean(secret) && !stored}>
        Done
      </Button>
    </div>
  );
}

export function RegisterAppPage() {
  const router = useRouter();
  const register = useRegisterConnectedApp();
  const [result, setResult] = useState<RegisteredApp | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <Link
        href={APPS_BASE}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Connected apps
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register an app</h1>
        <p className="mt-1 text-muted-foreground">
          Lets the app send people to "Sign in with µLearn" and receive their
          name and email once they agree.
        </p>
      </div>

      {result ? (
        <CredentialsPanel
          result={result}
          onDone={() =>
            router.push(
              `${APPS_BASE}/${encodeURIComponent(result.client.client_id)}`,
            )
          }
        />
      ) : (
        <div className="rounded-xl border bg-card p-6">
          <ClientForm
            mode="create"
            defaultValues={EMPTY_CLIENT_FORM}
            submitLabel="Register app"
            submitting={register.isPending}
            onSubmit={async (values) => {
              setResult(await register.mutateAsync(toCreatePayload(values)));
            }}
          />
        </div>
      )}
    </div>
  );
}
