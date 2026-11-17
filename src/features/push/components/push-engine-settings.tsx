"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePushConfig, useUpdatePushConfig } from "../hooks";
import type { PushConfig, PushGlobalConfig, PushRuleConfig } from "../types";

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

const RULE_NAMES: Record<string, { name: string; about: string }> = {
  MEETING_SOON: {
    name: "Circle meeting soon",
    about: "1–2 hours before a meeting of the person's circle.",
  },
  EVENT_SOON: {
    name: "Event coming up",
    about: "Within a day of an event they marked interested.",
  },
  STREAK_RESCUE: {
    name: "Keep the streak",
    about: "Evening, when a 2+ day karma streak would break today.",
  },
  COMEBACK: {
    name: "Come back",
    about:
      "After 3, 7, 14 and 30 days away, with the new tasks in their groups.",
  },
};

/** Rule fields an admin may edit (others, like weight, stay in code). */
const EDITABLE_TEXT = ["title", "body", "body_with_tasks", "body_default"];
const EDITABLE_NUMBERS = [
  "lead_minutes_min",
  "lead_minutes_max",
  "lead_hours",
  "min_streak_days",
  "local_hour_start",
  "local_hour_end",
  "cooldown_hours",
];

function humanize(key: string) {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function PushEngineSettings() {
  const { data: config, isLoading } = usePushConfig();
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

  return (
    <div className="space-y-6">
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
        </div>
        <Switch
          id="push-kill"
          checked={config.global.kill_switch}
          disabled={update.isPending}
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
                      onChange={(e) => setRule(key, f, Number(e.target.value))}
                    />
                  </div>
                ),
              )}
            </div>
            {EDITABLE_TEXT.filter((f) => typeof rule[f] === "string").map(
              (f) => (
                <div key={f} className="space-y-1">
                  <Label htmlFor={`push-${key}-${f}`}>{humanize(f)}</Label>
                  <Input
                    id={`push-${key}-${f}`}
                    value={String(rule[f])}
                    onChange={(e) => setRule(key, f, e.target.value)}
                  />
                </div>
              ),
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Placeholders in braces, like {"{circle}"} or {"{count}"}, are filled
          in per person. Keep them when you edit the copy.
        </p>
      </section>

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

      <Separator />

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold">Activity pushes</h3>
          <p className="text-sm text-muted-foreground">
            Which in-app notifications also go to phones. Changes save at once.
          </p>
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
                disabled={update.isPending}
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
