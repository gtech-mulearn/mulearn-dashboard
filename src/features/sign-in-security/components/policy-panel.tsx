/**
 * Lockout policy: how many failed sign-ins lock an account, and for how long.
 *
 * 📍 src/features/sign-in-security/components/policy-panel.tsx
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useSigninPolicy, useUpdateSigninPolicy } from "../hooks";
import {
  type PolicyWithBounds,
  policyFormSchema,
  type SigninPolicy,
} from "../schemas";

function PolicyForm({ data }: { data: PolicyWithBounds }) {
  const schema = useMemo(() => policyFormSchema(data.bounds), [data.bounds]);
  const form = useForm<SigninPolicy>({
    resolver: zodResolver(schema),
    defaultValues: data.policy,
  });
  const update = useUpdateSigninPolicy();
  const [aMin, aMax] = data.bounds.attempts_limit;
  const [bMin, bMax] = data.bounds.block_minutes;

  const numberField = (
    name: keyof SigninPolicy,
    label: string,
    hint: string,
    min: number,
    max: number,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={Number.isNaN(field.value) ? "" : field.value}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? Number.NaN : e.target.valueAsNumber,
                )
              }
            />
          </FormControl>
          <FormDescription>{hint}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => update.mutate(v))}
        noValidate
        className="space-y-4"
      >
        {numberField(
          "attempts_limit",
          "Failed attempts before lockout",
          `${aMin}–${aMax}, counted in a row.`,
          aMin,
          aMax,
        )}
        {numberField(
          "block_minutes",
          "Lockout length (minutes)",
          `${bMin}–${bMax} minutes.`,
          bMin,
          bMax,
        )}
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save policy"}
        </Button>
      </form>
    </Form>
  );
}

export function PolicyPanel() {
  const { data, isLoading, error } = useSigninPolicy();
  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Lockout policy</h2>
        <p className="text-sm text-muted-foreground">
          Applies to every way of signing in: password, one-time code and the
          auth pages.
        </p>
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : error || !data ? (
        <p className="text-sm text-destructive">
          {getApiResponseError(error, {
            fallback: "Couldn't load the policy.",
          })}
        </p>
      ) : (
        <PolicyForm
          key={`${data.policy.attempts_limit}-${data.policy.block_minutes}`}
          data={data}
        />
      )}
    </section>
  );
}
