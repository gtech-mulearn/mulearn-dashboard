"use client";

import { Plus, Trash2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import type { InterestGroupDetail } from "@/features/interest-groups/schemas";
import {
  IG_COVER_IMAGE_ASPECT,
  IG_ICON_IMAGE_ASPECT,
  IG_IMAGE_MAX_MB,
} from "../constants/ig-images.constants";
import { useEditInterestGroup } from "../hooks/use-edit-interest-group";

// ─── Types ──────────────────────────────────────────────────

interface EditInterestGroupFormProps {
  group: InterestGroupDetail;
  onSuccess?: () => void;
}

interface BlogEntry {
  title: string;
  url: string;
}

interface PersonToFollow {
  name: string;
  twitter?: string | null;
  designation?: string | null;
}

// ─── Helpers ────────────────────────────────────────────────

/** Extract muid strings from the various API shapes */
function toMuidArray(
  raw:
    | InterestGroupDetail["leads"]
    | InterestGroupDetail["mentors"]
    | InterestGroupDetail["thinktank"],
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "muid" in item && item.muid)
          return item.muid;
        return null;
      })
      .filter(Boolean) as string[];
  }
  return [];
}

const CATEGORIES = [
  "maker",
  "coder",
  "creative",
  "manager",
  "others",
  "hardware",
] as const;

// ─── Component ──────────────────────────────────────────────

export function EditInterestGroupForm({
  group,
  onSuccess,
}: EditInterestGroupFormProps) {
  const {
    editInterestGroup,
    isPending,
    uploadCoverImage,
    removeCoverImage,
    uploadIconImage,
    removeIconImage,
    isRemovingCoverImage,
    isRemovingIconImage,
    isUploadingCoverImage,
    isUploadingIconImage,
  } = useEditInterestGroup();

  // ── Simple text fields ─────────────────────────────────
  const [name, setName] = useState(group.name || "");
  const [about, setAbout] = useState(group.about || "");
  const [resource, setResource] = useState(group.resource || "");
  const [officeHours, setOfficeHours] = useState(group.office_hours || "");
  const [code, setCode] = useState(group.code || "");
  const [category, setCategory] = useState(group.category || "others");

  // ── Cover / icon images — replaced/removed via standalone endpoints,
  // never sent as part of the PATCH payload below ──────────
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [iconImageFile, setIconImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(group.cover_image ?? null);
  const [iconImageUrl, setIconImageUrl] = useState(group.icon_image ?? null);

  // ── Array (tag) fields ─────────────────────────────────
  const [prerequisites, setPrerequisites] = useState<string[]>(
    group.prerequisites || [],
  );
  const [careerOpportunities, setCareerOpportunities] = useState<string[]>(
    group.career_opportunities || [],
  );

  // ── Complex array fields ───────────────────────────────
  const [topBlogs, setTopBlogs] = useState<BlogEntry[]>(group.top_blogs || []);
  const [peopleToFollow, setPeopleToFollow] = useState<PersonToFollow[]>(
    group.people_to_follow || [],
  );

  // Leads, Mentors & Think Tank — plain arrays of muid strings
  const [leads, setLeads] = useState<string[]>(toMuidArray(group.leads));
  const [mentors, setMentors] = useState<string[]>(toMuidArray(group.mentors));
  const [thinktank, setThinktank] = useState<string[]>(
    toMuidArray(group.thinktank),
  );

  // ── Helpers for complex arrays ─────────────────────────

  const addBlog = useCallback(() => {
    setTopBlogs((prev) => [...prev, { title: "", url: "" }]);
  }, []);

  const updateBlog = useCallback(
    (index: number, field: keyof BlogEntry, value: string) => {
      setTopBlogs((prev) =>
        prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
      );
    },
    [],
  );

  const removeBlog = useCallback((index: number) => {
    setTopBlogs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addPerson = useCallback(() => {
    setPeopleToFollow((prev) => [
      ...prev,
      { name: "", twitter: "", designation: "" },
    ]);
  }, []);

  const updatePerson = useCallback(
    (index: number, field: keyof PersonToFollow, value: string) => {
      setPeopleToFollow((prev) =>
        prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const removePerson = useCallback((index: number) => {
    setPeopleToFollow((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Submit ─────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, unknown> = {};

    if (name !== (group.name || "")) payload.name = name;
    if (about !== (group.about || "")) payload.about = about || null;
    if (resource !== (group.resource || ""))
      payload.resource = resource || null;
    if (officeHours !== (group.office_hours || ""))
      payload.office_hours = officeHours || null;
    if (code !== (group.code || "")) payload.code = code;
    if (category !== (group.category || "others")) payload.category = category;

    if (
      JSON.stringify(prerequisites) !==
      JSON.stringify(group.prerequisites || [])
    )
      payload.prerequisites = prerequisites;
    if (
      JSON.stringify(careerOpportunities) !==
      JSON.stringify(group.career_opportunities || [])
    )
      payload.career_opportunities = careerOpportunities;
    if (JSON.stringify(topBlogs) !== JSON.stringify(group.top_blogs || []))
      payload.top_blogs = topBlogs;
    if (
      JSON.stringify(peopleToFollow) !==
      JSON.stringify(group.people_to_follow || [])
    )
      payload.people_to_follow = peopleToFollow;

    // Leads/mentors — send as array of { muid } objects
    const origLeadMuids = toMuidArray(group.leads);
    if (JSON.stringify(leads) !== JSON.stringify(origLeadMuids)) {
      payload.leads = leads.length > 0 ? leads.map((m) => ({ muid: m })) : [];
    }

    const origMentorMuids = toMuidArray(group.mentors);
    if (JSON.stringify(mentors) !== JSON.stringify(origMentorMuids)) {
      payload.mentors =
        mentors.length > 0 ? mentors.map((m) => ({ muid: m })) : [];
    }

    const origThinktankMuids = toMuidArray(group.thinktank);
    if (JSON.stringify(thinktank) !== JSON.stringify(origThinktankMuids)) {
      payload.thinktank =
        thinktank.length > 0 ? thinktank.map((m) => ({ muid: m })) : [];
    }

    // Run the metadata PATCH and the standalone image uploads independently —
    // a failure in one must not stop the others from firing (each mutation
    // already reports its own error toast).
    const tasks: Promise<void>[] = [];

    if (Object.keys(payload).length > 0) {
      tasks.push(
        editInterestGroup({ id: group.id, data: payload }).catch(() => {}),
      );
    }
    if (coverImageFile) {
      tasks.push(
        uploadCoverImage(group.id, coverImageFile)
          .then((url) => {
            setCoverImageUrl(url ? `${url}?v=${Date.now()}` : url);
            setCoverImageFile(null);
          })
          .catch(() => {}),
      );
    }
    if (iconImageFile) {
      tasks.push(
        uploadIconImage(group.id, iconImageFile)
          .then((url) => {
            setIconImageUrl(url ? `${url}?v=${Date.now()}` : url);
            setIconImageFile(null);
          })
          .catch(() => {}),
      );
    }

    await Promise.all(tasks);

    onSuccess?.();
  };

  const [removeImageTarget, setRemoveImageTarget] = useState<
    "cover" | "icon" | null
  >(null);

  const confirmRemoveImage = async () => {
    if (removeImageTarget === "cover") {
      await removeCoverImage(group.id);
      setCoverImageUrl(null);
      setCoverImageFile(null);
    } else if (removeImageTarget === "icon") {
      await removeIconImage(group.id);
      setIconImageUrl(null);
      setIconImageFile(null);
    }
    setRemoveImageTarget(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <SheetHeader className="border-b border-border/50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-xl">Edit Interest Group</SheetTitle>
            <SheetDescription>
              Update the details for <strong>{group.name}</strong>. Only changed
              fields will be saved.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close form"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {/* ── Basic Info ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Basic Information
          </legend>

          <div className="space-y-2">
            <Label htmlFor="ig-name">Name</Label>
            <Input
              id="ig-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Interest group name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ig-code">Code</Label>
            <Input
              id="ig-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. WEB"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cover image</Label>
            <ImageUpload
              value={coverImageFile}
              onChange={setCoverImageFile}
              currentUrl={coverImageUrl}
              maxSizeMB={IG_IMAGE_MAX_MB}
              aspectRatio={IG_COVER_IMAGE_ASPECT}
              disabled={isRemovingCoverImage}
            />
            {coverImageUrl && !coverImageFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setRemoveImageTarget("cover")}
                disabled={isRemovingCoverImage}
              >
                {isRemovingCoverImage ? "Removing…" : "Remove cover image"}
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Icon image</Label>
            <ImageUpload
              value={iconImageFile}
              onChange={setIconImageFile}
              currentUrl={iconImageUrl}
              maxSizeMB={IG_IMAGE_MAX_MB}
              aspectRatio={IG_ICON_IMAGE_ASPECT}
              cropShape="round"
              disabled={isRemovingIconImage}
            />
            {iconImageUrl && !iconImageFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setRemoveImageTarget("icon")}
                disabled={isRemovingIconImage}
              >
                {isRemovingIconImage ? "Removing…" : "Remove icon image"}
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ig-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ig-about">About</Label>
            <Textarea
              id="ig-about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe this interest group…"
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ig-resource">Resource URL</Label>
            <Input
              id="ig-resource"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ig-office-hours">Office Hours</Label>
            <Input
              id="ig-office-hours"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              placeholder="e.g. Mon & Wed 4-5 PM"
            />
          </div>
        </fieldset>

        {/* ── Tag Fields ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Lists
          </legend>

          <div className="space-y-2">
            <Label>Prerequisites</Label>
            <TagInput
              value={prerequisites}
              onChange={setPrerequisites}
              placeholder="Add prerequisite and press Enter…"
            />
          </div>

          <div className="space-y-2">
            <Label>Career Opportunities</Label>
            <TagInput
              value={careerOpportunities}
              onChange={setCareerOpportunities}
              placeholder="Add career path and press Enter…"
            />
          </div>
        </fieldset>

        {/* ── Top Blogs ── */}
        <fieldset className="space-y-4">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Top Blogs
            </legend>
            <Button
              type="button"
              onClick={addBlog}
              aria-label="Add blog"
              variant="secondary"
              size="sm"
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {topBlogs.map((blog, i) => (
            <div
              key={blog.title}
              className="flex gap-2 items-start rounded-xl border border-border/50 bg-muted/20 p-3"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={blog.title}
                  onChange={(e) => updateBlog(i, "title", e.target.value)}
                  placeholder="Blog title"
                />
                <Input
                  value={blog.url}
                  onChange={(e) => updateBlog(i, "url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button
                type="button"
                onClick={() => removeBlog(i)}
                aria-label="Remove blog"
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </fieldset>

        {/* ── People to Follow ── */}
        <fieldset className="space-y-4">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              People to Follow
            </legend>
            <Button
              type="button"
              onClick={addPerson}
              aria-label="Add person"
              variant="secondary"
              size="sm"
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {peopleToFollow.map((person, i) => (
            <div
              key={person.name}
              className="flex gap-2 items-start rounded-xl border border-border/50 bg-muted/20 p-3"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={person.name}
                  onChange={(e) => updatePerson(i, "name", e.target.value)}
                  placeholder="Name"
                />
                <Input
                  value={person.designation || ""}
                  onChange={(e) =>
                    updatePerson(i, "designation", e.target.value)
                  }
                  placeholder="Designation"
                />
                <Input
                  value={person.twitter || ""}
                  onChange={(e) => updatePerson(i, "twitter", e.target.value)}
                  placeholder="@twitter_handle"
                />
              </div>
              <Button
                type="button"
                onClick={() => removePerson(i)}
                aria-label="Remove person"
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Leads
          </legend>
          <MuidSearchInput
            value={leads}
            onChange={setLeads}
            placeholder="Search users by muid…"
          />
        </fieldset>

        {/* ── Mentors (MUID only) ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Mentors
          </legend>
          <MuidSearchInput
            value={mentors}
            onChange={setMentors}
            placeholder="Search users by muid…"
          />
        </fieldset>

        {/* ── Think Tank (MUID only) ── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Think Tank
          </legend>
          <MuidSearchInput
            value={thinktank}
            onChange={setThinktank}
            placeholder="Search users by muid…"
          />
        </fieldset>
      </div>

      <SheetFooter className="border-t border-border/50 pt-4">
        <SheetClose asChild>
          <Button type="button" variant="outline" aria-label="Cancel">
            Cancel
          </Button>
        </SheetClose>
        <Button
          type="submit"
          disabled={isPending || isUploadingCoverImage || isUploadingIconImage}
          aria-label={
            isPending || isUploadingCoverImage || isUploadingIconImage
              ? "Saving changes"
              : "Save changes"
          }
        >
          {isPending || isUploadingCoverImage || isUploadingIconImage
            ? "Saving…"
            : "Save Changes"}
        </Button>
      </SheetFooter>

      <ConfirmDialog
        open={removeImageTarget !== null}
        onOpenChange={(open) => !open && setRemoveImageTarget(null)}
        title={
          removeImageTarget === "cover"
            ? "Remove cover image?"
            : "Remove icon image?"
        }
        description={`This will remove the interest group's ${removeImageTarget} image.`}
        confirmLabel="Remove"
        isPending={
          removeImageTarget === "cover"
            ? isRemovingCoverImage
            : isRemovingIconImage
        }
        onConfirm={confirmRemoveImage}
      />
    </form>
  );
}
