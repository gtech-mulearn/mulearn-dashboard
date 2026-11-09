/**
 * Register or edit a connected app.
 *
 * 📍 src/features/connected-apps/components/client-form.tsx
 *
 * Checks mirror the authserver's, so most mistakes show before submitting; the
 * authserver's own field errors are mapped back onto the same fields.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  type Control,
  useFieldArray,
  useForm,
  useFormState,
} from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";
import { getApiResponseError } from "@/hooks/use-get-error";
import { type ClientFormValues, clientFormSchema } from "../schemas";
import { serverFieldErrors } from "./app-parts";

type UriField = "redirect_uris" | "post_logout_redirect_uris";

function UriListField({
  control,
  name,
  title,
  itemLabel,
  description,
  addLabel,
}: {
  control: Control<ClientFormValues>;
  name: UriField;
  title: string;
  itemLabel: string;
  description: string;
  addLabel: string;
}) {
  const { fields, append, remove } = useFieldArray({ control, name });
  // useFormState (not getFieldState) so this re-renders when the error appears.
  const { errors } = useFormState({ control, name });
  const rootError = errors[name] as
    | { root?: { message?: string }; message?: string }
    | undefined;
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{title}</legend>
      <p className="text-xs text-muted-foreground">{description}</p>
      {fields.map((row, index) => (
        <FormField
          key={row.id}
          control={control}
          name={`${name}.${index}.value`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    {...field}
                    aria-label={`${itemLabel} ${index + 1}`}
                    placeholder="https://app.example.org/auth/callback"
                    className="font-mono text-sm"
                    spellCheck={false}
                  />
                </FormControl>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${itemLabel} ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      {(rootError?.root?.message || rootError?.message) && (
        <p className="text-sm text-destructive">
          {rootError?.root?.message ?? rootError?.message}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ value: "" })}
      >
        <Plus className="mr-1 h-4 w-4" />
        {addLabel}
      </Button>
    </fieldset>
  );
}

interface ClientFormProps {
  mode: "create" | "edit";
  defaultValues: ClientFormValues;
  submitLabel: string;
  submitting: boolean;
  /** Throw (e.g. the mutation's ApiError) to have the server's reasons shown on the form. */
  onSubmit: (values: ClientFormValues) => Promise<void>;
}

export function ClientForm({
  mode,
  defaultValues,
  submitLabel,
  submitting,
  onSubmit,
}: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });
  const [general, setGeneral] = useState<string | null>(null);
  const creating = mode === "create";

  async function submit(values: ClientFormValues) {
    setGeneral(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const fields = serverFieldErrors(error);
      let placed = false;
      for (const [key, message] of Object.entries(fields)) {
        if (
          key === "name" ||
          key === "client_id" ||
          key === "client_type" ||
          key === "skip_authorization"
        ) {
          form.setError(key, { message });
          placed = true;
        } else if (
          key === "redirect_uris" ||
          key === "post_logout_redirect_uris"
        ) {
          // The authserver reports list-level problems; UriListField shows them under the list.
          form.setError(key, { message });
          placed = true;
        }
      }
      setGeneral(
        fields.non_field ??
          (placed
            ? null
            : getApiResponseError(error, {
                fallback: "Couldn't save the app.",
              })),
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="µFIFA (prod)" maxLength={255} />
              </FormControl>
              <FormDescription>
                Shown to people on the consent screen. Include the environment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {creating && (
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="mufifa-prod"
                    maxLength={36}
                    className="font-mono"
                    spellCheck={false}
                  />
                </FormControl>
                <FormDescription>
                  Permanent: it can't be changed or reused later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {creating && (
          <FormField
            control={form.control}
            name="client_type"
            render={({ field }) => (
              <FormItem>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Type</legend>
                  {(
                    [
                      [
                        "confidential",
                        "Confidential",
                        "It has a server that can keep a secret, like most web apps.",
                      ],
                      [
                        "public",
                        "Public",
                        "A browser-only or mobile app. No secret; it proves itself with PKCE.",
                      ],
                    ] as const
                  ).map(([value, title, text]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        className="mt-1"
                      />
                      <span className="text-sm">
                        <span className="font-medium">{title}</span>
                        <span className="block text-muted-foreground">
                          {text}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="skip_authorization"
          render={({ field }) => (
            <FormItem className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-1">
                <FormLabel>First-party app</FormLabel>
                <FormDescription>
                  Skips the consent screen and may ask for access to the µLearn
                  API. Only for apps µLearn itself runs. Partner apps get name
                  and email only, after the person agrees.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <UriListField
          control={form.control}
          name="redirect_uris"
          title="Redirect URIs"
          itemLabel="Redirect URI"
          description="Where µLearn sends people back after sign-in. Matched exactly: https://, an app link (mulearn://), or http://localhost in development."
          addLabel="Add redirect URI"
        />
        <UriListField
          control={form.control}
          name="post_logout_redirect_uris"
          title="Sign-out return URIs (optional)"
          itemLabel="Sign-out return URI"
          description="Where people may land after signing out of µLearn from this app."
          addLabel="Add sign-out URI"
        />

        {general && (
          <Alert variant="destructive">
            <AlertDescription>{general}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
