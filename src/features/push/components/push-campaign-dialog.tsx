"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePushCampaign, useSendTestPush } from "../hooks";
import type { PushAudienceType } from "../types";

/** App screens a campaign can open (mulearn-app route paths). */
const LINKS = [
  { value: "none", label: "Just open the app" },
  { value: "/tasks", label: "Tasks" },
  { value: "/events", label: "Events" },
  { value: "/circles", label: "Learning circles" },
  { value: "/interest-groups", label: "Interest groups" },
  { value: "/weekly-twitches", label: "Weekly Twitches" },
  { value: "/opportunities", label: "Jobs & internships" },
  { value: "/projects", label: "Projects" },
  { value: "/problem-statements", label: "Problem statements" },
  { value: "/leaderboard", label: "Leaderboard" },
  { value: "custom", label: "Another app path…" },
] as const;

const AUDIENCES: { value: PushAudienceType; label: string; hint: string }[] = [
  { value: "all", label: "Everyone with the app", hint: "" },
  {
    value: "roles",
    label: "People with a role",
    hint: "Role titles, comma separated, e.g. Student, Mentor, Campus Lead",
  },
  {
    value: "igs",
    label: "Interest group members",
    hint: "Interest group ids, comma separated",
  },
  {
    value: "colleges",
    label: "Members of a college",
    hint: "College (organization) ids, comma separated",
  },
  {
    value: "muids",
    label: "Specific people",
    hint: "muids, comma separated (up to 5000), e.g. for a pilot group",
  },
];

const TITLE_MAX = 100;
const BODY_MAX = 240;

export function PushCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState<string>("none");
  const [customLink, setCustomLink] = useState("");
  const [audience, setAudience] = useState<PushAudienceType>("all");
  const [ids, setIds] = useState("");
  const [schedule, setSchedule] = useState("");
  const [quiet, setQuiet] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const create = useCreatePushCampaign();
  const test = useSendTestPush();

  const route =
    link === "none" ? undefined : link === "custom" ? customLink.trim() : link;

  function reset() {
    setTitle("");
    setBody("");
    setLink("none");
    setCustomLink("");
    setAudience("all");
    setIds("");
    setSchedule("");
    setQuiet(true);
    setError(null);
  }

  function validate(): string | null {
    if (!title.trim()) return "Add a title.";
    if (!body.trim()) return "Add a message.";
    if (route !== undefined && !route.startsWith("/"))
      return "An app path starts with /, e.g. /events.";
    if (audience !== "all" && parseIds(ids).length === 0)
      return "Add at least one value for this audience.";
    if (schedule && new Date(schedule).getTime() < Date.now())
      return "Pick a time in the future, or leave it empty to save a draft.";
    return null;
  }

  function submit() {
    const problem = validate();
    setError(problem);
    if (problem) return;
    create.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        route,
        audience: {
          type: audience,
          ids: audience === "all" ? [] : parseIds(ids),
        },
        scheduled_at: schedule ? new Date(schedule).toISOString() : undefined,
        respect_quiet_hours: quiet,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  }

  function sendTest() {
    if (!title.trim() || !body.trim()) {
      setError("Add a title and a message to test them.");
      return;
    }
    setError(null);
    test.mutate({ title: title.trim(), body: body.trim(), route });
  }

  const hint = AUDIENCES.find((a) => a.value === audience)?.hint;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New push campaign</DialogTitle>
          <DialogDescription>
            Sent to phones in batches, at most one per person per send, and
            never during their quiet hours unless you turn that off.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="push-title">Title</Label>
            <Input
              id="push-title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hackathon registrations close tonight"
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/{TITLE_MAX}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="push-body">Message</Label>
            <Textarea
              id="push-body"
              value={body}
              maxLength={BODY_MAX}
              rows={3}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Teams of 2–4. Register in the app before 11:59 PM."
            />
            <p className="text-xs text-muted-foreground text-right">
              {body.length}/{BODY_MAX}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="push-link">Opens</Label>
            <Select value={link} onValueChange={setLink}>
              <SelectTrigger id="push-link" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINKS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {link === "custom" && (
              <Input
                id="push-link-custom"
                value={customLink}
                onChange={(e) => setCustomLink(e.target.value)}
                placeholder="/events/<event id>"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="push-audience">Send to</Label>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as PushAudienceType)}
            >
              <SelectTrigger id="push-audience" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {audience !== "all" && (
              <>
                <Textarea
                  id="push-audience-ids"
                  value={ids}
                  rows={2}
                  onChange={(e) => setIds(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{hint}</p>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="push-schedule">Send at (optional)</Label>
            <Input
              id="push-schedule"
              type="datetime-local"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Empty saves a draft you can send from the list.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="push-quiet">Respect quiet hours</Label>
              <p className="text-xs text-muted-foreground">
                People in their quiet hours are skipped.
              </p>
            </div>
            <Switch
              id="push-quiet"
              checked={quiet}
              onCheckedChange={setQuiet}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={sendTest}
            disabled={test.isPending}
          >
            {test.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-1.5">Send test to me</span>
          </Button>
          <Button type="button" onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className={create.isPending ? "ml-1.5" : undefined}>
              {schedule ? "Schedule" : "Save draft"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parseIds(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}
