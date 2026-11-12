"use client";

import { type FormEvent, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  extractInterestGroups,
  useInterestGroupsList,
} from "@/features/interest-groups";
import { useCollegeSearch } from "@/features/onboarding";
import { cn } from "@/lib/utils";
import { useCreateCollaboration } from "../../hooks/use-company-collaborations";
import {
  buildCollaborationPayload,
  COLLAB_TARGET_LABELS,
  COLLAB_TYPE_LABELS,
} from "../../lib/collaboration-payload";
import { COLLAB_TARGET_TYPES, COLLAB_TYPES } from "../../schemas/jobs.schema";
import type { CollabTargetType, CollabType } from "../../types";

const TYPE_HINTS: Record<CollabType, string> = {
  EVENT_COHOST: "Run an event together with a campus or interest group.",
  IG_SPONSORSHIP: "Back an interest group's learning activities.",
  CAMPUS_PARTNERSHIP: "Partner with a campus on programmes or hiring.",
  MENTORSHIP_EXCHANGE: "Share mentors with a campus or interest group.",
};

const TITLE_MAX = 200;

type FieldErrors = Partial<Record<"collab_type" | "title" | "target", string>>;

interface Target {
  id: string;
  label: string;
}

function CampusPicker({
  value,
  onChange,
  invalid,
}: {
  value: Target | null;
  onChange: (target: Target) => void;
  invalid: boolean;
}) {
  const [search, setSearch] = useState("");
  const { data: colleges = [], isFetching } = useCollegeSearch(search);
  return (
    <Combobox
      options={colleges}
      value={value?.id}
      selectedLabel={value?.label}
      onValueChange={(id) => {
        const college = colleges.find((c) => c.id === id);
        onChange({ id, label: college?.title ?? value?.label ?? "" });
      }}
      onSearchChange={setSearch}
      loading={isFetching}
      placeholder="Search for a campus…"
      searchPlaceholder="Type a college name"
      className={cn(invalid && "border-destructive")}
    />
  );
}

function InterestGroupPicker({
  value,
  onChange,
  invalid,
}: {
  value: Target | null;
  onChange: (target: Target) => void;
  invalid: boolean;
}) {
  const { data, isLoading } = useInterestGroupsList();
  const options = (data ? extractInterestGroups(data) : []).map((ig) => ({
    id: ig.id,
    title: ig.name,
  }));
  return (
    <Combobox
      options={options}
      value={value?.id}
      selectedLabel={value?.label}
      onValueChange={(id) =>
        onChange({
          id,
          label: options.find((o) => o.id === id)?.title ?? "",
        })
      }
      loading={isLoading}
      placeholder={
        isLoading ? "Loading interest groups…" : "Choose an interest group"
      }
      searchPlaceholder="Search interest groups"
      className={cn(invalid && "border-destructive")}
    />
  );
}

interface CreateCollaborationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Post a collaboration openly (any campus or IG can discover it) or invite
 * one campus/IG directly. The backend allows 5 open or pending posts.
 */
export function CreateCollaborationDialog({
  open,
  onOpenChange,
}: CreateCollaborationDialogProps) {
  const create = useCreateCollaboration();
  const [collabType, setCollabType] = useState<CollabType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inviteSpecific, setInviteSpecific] = useState(false);
  const [targetType, setTargetType] = useState<CollabTargetType>("CAMPUS");
  const [target, setTarget] = useState<Target | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const reset = () => {
    setCollabType(null);
    setTitle("");
    setDescription("");
    setInviteSpecific(false);
    setTargetType("CAMPUS");
    setTarget(null);
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!collabType) next.collab_type = "Choose a collaboration type.";
    if (!title.trim()) next.title = "Add a title.";
    if (inviteSpecific && !target) {
      next.target =
        targetType === "IG" ? "Choose an interest group." : "Choose a campus.";
    }
    setErrors(next);
    if (!collabType || Object.keys(next).length > 0) return;

    // Backend errors (including the 5-post cap) are toasted verbatim by the
    // hook; the dialog stays open so nothing typed is lost.
    create.mutate(
      buildCollaborationPayload({
        collab_type: collabType,
        title,
        description,
        target:
          inviteSpecific && target
            ? { type: targetType, orgId: target.id }
            : null,
      }),
      { onSuccess: () => handleOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New collaboration</DialogTitle>
          <DialogDescription>
            Post it for every campus and interest group to discover, or invite
            one directly. You can have up to 5 open or pending posts at a time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Type</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {COLLAB_TYPES.map((type) => (
                <label
                  key={type}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50",
                    collabType === type && "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="radio"
                    name="collab_type"
                    value={type}
                    checked={collabType === type}
                    onChange={() => {
                      setCollabType(type);
                      setErrors((e) => ({ ...e, collab_type: undefined }));
                    }}
                    className="mt-0.5 accent-primary"
                  />
                  <span>
                    <span className="block font-medium text-foreground">
                      {COLLAB_TYPE_LABELS[type]}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {TYPE_HINTS[type]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {errors.collab_type && (
              <p role="alert" className="text-xs text-destructive">
                {errors.collab_type}
              </p>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="collab-title">Title</Label>
            <Input
              id="collab-title"
              value={title}
              maxLength={TITLE_MAX}
              placeholder="e.g. Co-host a 24-hour hackathon"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "collab-title-error" : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((x) => ({ ...x, title: undefined }));
              }}
            />
            {errors.title && (
              <p
                id="collab-title-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="collab-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="collab-description"
              rows={4}
              value={description}
              placeholder="What do you have in mind? Dates, expectations and what your company brings."
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="collab-invite" className="leading-snug">
                Invite a specific campus or interest group
              </Label>
              <Switch
                id="collab-invite"
                checked={inviteSpecific}
                onCheckedChange={(checked) => {
                  setInviteSpecific(checked);
                  setErrors((e) => ({ ...e, target: undefined }));
                }}
              />
            </div>
            {inviteSpecific && (
              <div className="space-y-3">
                <div
                  role="radiogroup"
                  aria-label="Invite"
                  className="flex gap-2"
                >
                  {COLLAB_TARGET_TYPES.map((type) => (
                    <label
                      key={type}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm",
                        targetType === type && "border-primary bg-primary/5",
                      )}
                    >
                      <input
                        type="radio"
                        name="collab_target_type"
                        value={type}
                        checked={targetType === type}
                        onChange={() => {
                          setTargetType(type);
                          setTarget(null);
                        }}
                        className="accent-primary"
                      />
                      {COLLAB_TARGET_LABELS[type]}
                    </label>
                  ))}
                </div>
                {targetType === "CAMPUS" ? (
                  <CampusPicker
                    value={target}
                    onChange={setTarget}
                    invalid={!!errors.target}
                  />
                ) : (
                  <InterestGroupPicker
                    value={target}
                    onChange={setTarget}
                    invalid={!!errors.target}
                  />
                )}
                {errors.target && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.target}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Their leads get a notification and can accept or decline.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending
                ? "Posting…"
                : inviteSpecific
                  ? "Send invitation"
                  : "Post collaboration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
