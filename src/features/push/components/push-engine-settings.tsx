"use client";

import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryErrorState } from "@/components/ui/query-error-state";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/hooks/use-permissions";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { usePushConfig, useUpdatePushConfig } from "../hooks";
import { RULE_NAMES } from "../rule-names";
import type {
  PushConfig,
  PushGlobalConfig,
  PushRuleConfig,
  PushVariant,
} from "../types";

const GLOBAL_FIELDS: {
  key: keyof PushGlobalConfig;
  label: string;
  hint: string;
  min: number;
  max: number;
}[] = [
  {
    key: "daily_cap",
    label: "Pushes per person per day",
    hint: "All kinds together",
    min: 0,
    max: 50,
  },
  {
    key: "engagement_daily_cap",
    label: "Reminders per person per day",
    hint: "Streak and come-back nudges",
    min: 0,
    max: 10,
  },
  {
    key: "max_per_minute",
    label: "Sending speed (per minute)",
    hint: "Across the whole platform; big sends queue up",
    min: 60,
    max: 60000,
  },
  {
    key: "default_quiet_start",
    label: "Quiet hours start (hour)",
    hint: "Default for people who haven't set their own",
    min: 0,
    max: 23,
  },
  {
    key: "default_quiet_end",
    label: "Quiet hours end (hour)",
    hint: "0–23, in each person's time zone",
    min: 0,
    max: 23,
  },
  {
    key: "nudge_window_start",
    label: "Reminders from (hour)",
    hint: "Local time",
    min: 0,
    max: 23,
  },
  {
    key: "nudge_window_end",
    label: "Reminders until (hour)",
    hint: "Local time",
    min: 1,
    max: 24,
  },
];

const SAVE_FIRST_HINT = "Save or discard your changes first";

/** Same limits the backend enforces. */
const MAX_VARIANTS = 10;
const MAX_TITLE = 40;
const MAX_BODY = 100;

/** Only these fields may be sent; the backend rejects anything else. */
function cleanVariants(variants: PushVariant[]): PushVariant[] {
  return variants.map((v) => {
    const out: PushVariant = { key: v.key, title: v.title, body: v.body };
    if (v.body_no_tasks !== undefined) out.body_no_tasks = v.body_no_tasks;
    if (v.voice !== undefined) out.voice = v.voice;
    return out;
  });
}

function nextVariantKey(variants: PushVariant[]) {
  const used = new Set(variants.map((v) => v.key));
  let n = variants.length + 1;
  while (used.has(`v${n}`)) n += 1;
  return `v${n}`;
}

/** Numeric rule fields an admin may edit (others, like weight, stay in code). */
const EDITABLE_NUMBERS = [
  "lead_minutes_min",
  "lead_minutes_max",
  "lead_hours",
  "min_streak_days",
  "local_hour_start",
  "local_hour_end",
  "cooldown_hours",
];

/** Copy keys an admin may have saved before versions existed. */
const LEGACY_COPY_KEYS = ["title", "body", "body_with_tasks", "body_default"];

function humanize(key: string) {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function PushEngineSettings() {
  const { data: config, isLoading, isError, error, refetch } = usePushConfig();
  if (isError && !config) {
    return (
      <QueryErrorState
        title="Couldn't load push settings."
        error={error}
        onRetry={() => refetch()}
      />
    );
  }
  if (isLoading || !config) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <SettingsForm config={config} />;
}

function SettingsForm({ config }: { config: PushConfig }) {
  const update = useUpdatePushConfig();
  const { hasRole } = usePermissions();
  const canEdit = hasRole(ADMIN_ROLES);
  const [global, setGlobal] = useState(config.global);
  const [rules, setRules] = useState(config.rules);

  useEffect(() => {
    setGlobal(config.global);
    setRules(config.rules);
  }, [config]);

  const patch = useMemo(() => {
    const g: Partial<PushGlobalConfig> = {};
    for (const f of GLOBAL_FIELDS) {
      if (global[f.key] !== config.global[f.key]) {
        (g as Record<string, unknown>)[f.key] = global[f.key];
      }
    }
    const r: Record<string, Partial<PushRuleConfig>> = {};
    for (const [key, rule] of Object.entries(rules)) {
      const before = config.rules[key];
      const changed: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(rule)) {
        if (field === "variants") {
          const next = cleanVariants(rule.variants ?? []);
          if (
            JSON.stringify(next) !==
            JSON.stringify(cleanVariants(before?.variants ?? []))
          ) {
            changed.variants = next;
          }
          continue;
        }
        if (JSON.stringify(value) !== JSON.stringify(before?.[field])) {
          changed[field] = value;
        }
      }
      if (Object.keys(changed).length)
        r[key] = changed as Partial<PushRuleConfig>;
    }
    return {
      ...(Object.keys(g).length ? { global: g } : {}),
      ...(Object.keys(r).length ? { rules: r } : {}),
    };
  }, [global, rules, config]);

  const dirty = Object.keys(patch).length > 0;
  const types = Object.entries(config.types).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  function setRule(key: string, field: string, value: unknown) {
    setRules((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function setVariant(
    key: string,
    index: number,
    change: Partial<PushVariant>,
  ) {
    setRules((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        variants: (prev[key].variants ?? []).map((v, i) =>
          i === index ? { ...v, ...change } : v,
        ),
      },
    }));
  }

  return (
    <div className="space-y-6">
      {!canEdit && (
        <p className="text-sm text-muted-foreground">
          Only admins can change these.
        </p>
      )}

      {!config.configured && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Push isn't connected on this server</AlertTitle>
          <AlertDescription>
            Nothing is sent until FIREBASE_CREDENTIALS is set on the backend.
            You can still prepare settings and campaigns.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <Label htmlFor="push-kill" className="text-base">
            Pause all pushes
          </Label>
          <p className="text-sm text-muted-foreground">
            Stops every push at once (activity, reminders and campaigns). In-app
            notifications keep working.
          </p>
          {dirty && canEdit && (
            <p className="text-xs text-muted-foreground">{SAVE_FIRST_HINT}</p>
          )}
        </div>
        <Switch
          id="push-kill"
          checked={config.global.kill_switch}
          disabled={!canEdit || update.isPending || dirty}
          onCheckedChange={(on) =>
            update.mutate({ global: { kill_switch: on } })
          }
        />
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Limits</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {GLOBAL_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label htmlFor={`push-g-${f.key}`}>{f.label}</Label>
              <Input
                id={`push-g-${f.key}`}
                type="number"
                min={f.min}
                max={f.max}
                value={String(global[f.key])}
                disabled={!canEdit}
                onChange={(e) =>
                  setGlobal((g) => ({ ...g, [f.key]: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">{f.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="font-semibold">Reminders</h3>
        {Object.entries(rules).map(([key, rule]) => (
          <div key={key} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{RULE_NAMES[key]?.name ?? key}</p>
                <p className="text-sm text-muted-foreground">
                  {RULE_NAMES[key]?.about}
                </p>
              </div>
              <Switch
                aria-label={`${RULE_NAMES[key]?.name ?? key} on`}
                checked={rule.enabled}
                disabled={!canEdit}
                onCheckedChange={(on) => setRule(key, "enabled", on)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {EDITABLE_NUMBERS.filter((f) => typeof rule[f] === "number").map(
                (f) => (
                  <div key={f} className="space-y-1">
                    <Label htmlFor={`push-${key}-${f}`}>{humanize(f)}</Label>
                    <Input
                      id={`push-${key}-${f}`}
                      type="number"
                      value={String(rule[f])}
                      disabled={!canEdit}
                      onChange={(e) => setRule(key, f, Number(e.target.value))}
                    />
                  </div>
                ),
              )}
            </div>
            {LEGACY_COPY_KEYS.some((k) => typeof rule[k] === "string") && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Custom copy saved before versions existed is in use. Saving
                  versions replaces it.
                </AlertDescription>
              </Alert>
            )}
            {rule.variants && (
              <div className="space-y-3">
                {rule.variants.map((v, i) => (
                  <div key={v.key} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{v.key}</span>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove version ${v.key}`}
                          disabled={(rule.variants?.length ?? 0) <= 1}
                          onClick={() =>
                            setRule(
                              key,
                              "variants",
                              (rule.variants ?? []).filter((_, j) => j !== i),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`push-${key}-${v.key}-title`}>
                        {`Title for ${v.key}`}
                      </Label>
                      <Input
                        id={`push-${key}-${v.key}-title`}
                        value={v.title}
                        maxLength={MAX_TITLE}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setVariant(key, i, { title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`push-${key}-${v.key}-body`}>
                        {`Body for ${v.key}`}
                      </Label>
                      <Textarea
                        id={`push-${key}-${v.key}-body`}
                        value={v.body}
                        maxLength={MAX_BODY}
                        rows={2}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setVariant(key, i, { body: e.target.value })
                        }
                      />
                    </div>
                    {key === "COMEBACK" && (
                      <div className="space-y-1">
                        <Label htmlFor={`push-${key}-${v.key}-notasks`}>
                          {`Body with no new tasks for ${v.key}`}
                        </Label>
                        <Textarea
                          id={`push-${key}-${v.key}-notasks`}
                          value={v.body_no_tasks ?? ""}
                          maxLength={MAX_BODY}
                          rows={2}
                          disabled={!canEdit}
                          onChange={(e) =>
                            setVariant(key, i, {
                              body_no_tasks: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={rule.variants.length >= MAX_VARIANTS}
                    onClick={() =>
                      setRule(key, "variants", [
                        ...(rule.variants ?? []),
                        {
                          key: nextVariantKey(rule.variants ?? []),
                          title: "",
                          body: "",
                          ...(key === "COMEBACK" ? { body_no_tasks: "" } : {}),
                        },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-1.5">Add version</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Placeholders in braces, like {"{circle}"} or {"{count}"}, are filled
          in per person. Keep them when you edit the copy.
        </p>
      </section>

      {canEdit && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={!dirty || update.isPending}
            onClick={() => {
              setGlobal(config.global);
              setRules(config.rules);
            }}
          >
            Discard
          </Button>
          <Button
            disabled={!dirty || update.isPending}
            onClick={() => update.mutate(patch)}
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className={update.isPending ? "ml-1.5" : undefined}>
              Save changes
            </span>
          </Button>
        </div>
      )}

      <Separator />

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold">Activity pushes</h3>
          <p className="text-sm text-muted-foreground">
            Which in-app notifications also go to phones. Changes save at once.
          </p>
          {dirty && canEdit && (
            <p className="text-xs text-muted-foreground">{SAVE_FIRST_HINT}</p>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {types.map(([type, on]) => (
            <div
              key={type}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <span className="text-sm font-mono break-all">{type}</span>
              <Switch
                aria-label={`Push for ${type}`}
                checked={on}
                disabled={!canEdit || update.isPending || dirty}
                onCheckedChange={(next) =>
                  update.mutate({ types: { [type]: next } })
                }
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
