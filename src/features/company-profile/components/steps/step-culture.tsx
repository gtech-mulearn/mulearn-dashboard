"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileEditFormValues } from "../../schemas";

const REMOTE_POLICY_OPTIONS = ["Remote", "Hybrid", "In-office"] as const;

export function StepCulture() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProfileEditFormValues>();

  const remotePolicy = watch("remote_policy");

  const [techInput, setTechInput] = useState("");
  const techStack = useWatch({ name: "tech_stack" }) ?? [];

  function addTech() {
    const val = techInput.trim();
    if (!val || techStack.includes(val) || techStack.length >= 30) return;
    setValue("tech_stack", [...techStack, val], { shouldValidate: true });
    setTechInput("");
  }

  const [perkInput, setPerkInput] = useState("");
  const perks = useWatch({ name: "perks" }) ?? [];

  function addPerk() {
    const val = perkInput.trim();
    if (!val || perks.includes(val) || perks.length >= 30) return;
    setValue("perks", [...perks, val], { shouldValidate: true });
    setPerkInput("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Culture &amp; Brand
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your remote policy, company culture, tech stack, and perks.
        </p>
      </div>

      <div className="space-y-5">
        {/* Remote Policy */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Remote Policy</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                !remotePolicy
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              onClick={() =>
                setValue("remote_policy", null, { shouldValidate: true })
              }
            >
              Not specified
            </button>
            {REMOTE_POLICY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  remotePolicy === opt
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                }`}
                onClick={() =>
                  setValue("remote_policy", opt, { shouldValidate: true })
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Culture Text */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Culture &amp; Values
          </p>
          <Textarea
            {...register("culture_text")}
            className="rounded-xl border-border bg-background"
            placeholder="Describe your company culture, values, and work environment..."
            rows={4}
          />
          {errors.culture_text?.message && (
            <p className="text-xs text-destructive">
              {errors.culture_text.message}
            </p>
          )}
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Tech Stack</p>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTech();
                }
              }}
              className="rounded-xl border-border bg-background"
              placeholder="e.g. React, TypeScript, PostgreSQL"
              disabled={techStack.length >= 30}
            />
            <Button type="button" variant="outline" onClick={addTech}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t: string) => (
              <Badge
                key={t}
                variant="outline"
                className="gap-1 bg-background text-foreground"
              >
                {t}
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "tech_stack",
                      techStack.filter((x: string) => x !== t),
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Perks &amp; Benefits
          </p>
          <div className="flex gap-2">
            <Input
              value={perkInput}
              onChange={(e) => setPerkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPerk();
                }
              }}
              className="rounded-xl border-border bg-background"
              placeholder="e.g. Health insurance, Flexible hours, Stock options"
              disabled={perks.length >= 30}
            />
            <Button type="button" variant="outline" onClick={addPerk}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {perks.map((p: string) => (
              <Badge
                key={p}
                variant="outline"
                className="gap-1 bg-background text-foreground"
              >
                {p}
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "perks",
                      perks.filter((x: string) => x !== p),
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
