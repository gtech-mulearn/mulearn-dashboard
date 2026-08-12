"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Github as GithubIcon,
  Globe,
  Handshake,
  Instagram,
  Linkedin,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  createCommunityPartner,
  deleteCommunityPartner,
  fetchCommunityPartners,
  updateCommunityPartner,
} from "../api/community-partner.api";
import { useEditInterestGroup } from "../hooks/use-edit-interest-group";
import type {
  CommunityPartner,
  CommunityPartnerWrite,
} from "../schemas/community-partner.schema";

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
    removeCoverImage,
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
  const [_coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [_iconImageFile, setIconImageFile] = useState<File | null>(null);
  const [_coverImageUrl, setCoverImageUrl] = useState(
    group.cover_image ?? null,
  );
  const [_iconImageUrl, setIconImageUrl] = useState(group.icon_image ?? null);

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
    // TODO: Cover image upload disabled — backend conflict
    // if (coverImageFile) {
    //   tasks.push(
    //     uploadCoverImage(group.id, coverImageFile)
    //       .then((url) => {
    //         setCoverImageUrl(url ? `${url}?v=${Date.now()}` : url);
    //         setCoverImageFile(null);
    //       })
    //       .catch(() => {}),
    //   );
    // }
    // TODO: Icon image upload disabled — backend conflict
    // if (iconImageFile) {
    //   tasks.push(
    //     uploadIconImage(group.id, iconImageFile)
    //       .then((url) => {
    //         setIconImageUrl(url ? `${url}?v=${Date.now()}` : url);
    //         setIconImageFile(null);
    //       })
    //       .catch(() => {}),
    //   );
    // }

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

          {/* TODO: Cover image editing disabled — backend conflict */}
          {/* <div className="space-y-2">
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
          </div> */}

          {/* TODO: Icon image editing disabled — backend conflict */}
          {/* <div className="space-y-2">
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
          </div> */}

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

        {/* ── Community Partners ── */}
        <CommunityPartnersEditor igId={group.id} />
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

// ─── Community Partners sub-editor ──────────────────────────────────────────

const EMPTY_PARTNER: CommunityPartnerWrite = {
  name: "",
  logo_key: "",
  description: "",
  linkedin: "",
  github: "",
  website: "",
  instagram: "",
};

function CommunityPartnersEditor({ igId }: { igId: string }) {
  const queryClient = useQueryClient();
  const qKey = ["community-partners", igId];

  // ── Fetch existing partners for this IG ──────────────────────
  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => fetchCommunityPartners({ ig_id: igId }),
  });
  const partners: CommunityPartner[] = data?.data ?? [];

  // ── "New partner" form state ──────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] =
    useState<CommunityPartnerWrite>(EMPTY_PARTNER);

  // ── Editing-in-place state ────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<CommunityPartnerWrite>>(
    {},
  );

  // ── Delete confirm ────────────────────────────────────────────
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ── CREATE mutation ───────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CommunityPartnerWrite) =>
      createCommunityPartner({ ...data, interest_groups: [igId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      setShowAdd(false);
      setNewPartner(EMPTY_PARTNER);
    },
  });

  // ── PATCH mutation ────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CommunityPartnerWrite>;
    }) => updateCommunityPartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      setEditingId(null);
      setEditDraft({});
    },
  });

  // ── DELETE mutation ───────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCommunityPartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      setDeleteTargetId(null);
    },
  });

  // ── Helpers ───────────────────────────────────────────────────
  const startEdit = (partner: CommunityPartner) => {
    setEditingId(partner.id);
    setEditDraft({
      name: partner.name,
      logo_key: partner.logo_key ?? "",
      description: partner.description ?? "",
      linkedin: partner.linkedin ?? "",
      github: partner.github ?? "",
      website: partner.website ?? "",
      instagram: partner.instagram ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = (id: string) => {
    if (!editDraft.name?.trim()) return;
    updateMutation.mutate({ id, data: editDraft });
  };

  return (
    <fieldset className="space-y-4">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Handshake className="h-4 w-4" />
          Community Partners
        </legend>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowAdd((v) => !v)}
          aria-label={
            showAdd ? "Cancel adding partner" : "Add community partner"
          }
        >
          {showAdd ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showAdd ? "Cancel" : "Add"}
        </Button>
      </div>

      {/* ── Add new partner form ── */}
      {showAdd && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-semibold text-primary mb-2">New Partner</p>
          <Input
            value={newPartner.name}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Partner name *"
          />
          <Input
            value={newPartner.logo_key ?? ""}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, logo_key: e.target.value }))
            }
            placeholder="Logo URL"
          />
          <Textarea
            value={newPartner.description ?? ""}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Description"
            className="min-h-16"
          />
          <Input
            value={newPartner.linkedin ?? ""}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, linkedin: e.target.value }))
            }
            placeholder="LinkedIn URL"
          />
          <Input
            value={newPartner.github ?? ""}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, github: e.target.value }))
            }
            placeholder="GitHub URL"
          />
          <Input
            value={newPartner.website ?? ""}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, website: e.target.value }))
            }
            placeholder="Website URL"
          />
          <Input
            value={newPartner.instagram ?? ""}
            onChange={(e) =>
              setNewPartner((p) => ({ ...p, instagram: e.target.value }))
            }
            placeholder="Instagram URL"
          />
          <Button
            type="button"
            size="sm"
            disabled={!newPartner.name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(newPartner)}
          >
            {createMutation.isPending ? "Creating…" : "Create Partner"}
          </Button>
        </div>
      )}

      {/* ── Existing partners list ── */}
      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading partners…</p>
      )}
      {!isLoading && partners.length === 0 && !showAdd && (
        <p className="text-xs text-muted-foreground">
          No community partners linked yet.
        </p>
      )}

      <div className="space-y-2">
        {partners.map((partner) =>
          editingId === partner.id ? (
            // ── Inline edit form ──
            <div
              key={partner.id}
              className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2"
            >
              <Input
                value={editDraft.name ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="Partner name *"
              />
              <Input
                value={editDraft.logo_key ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, logo_key: e.target.value }))
                }
                placeholder="Logo URL"
              />
              <Textarea
                value={editDraft.description ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, description: e.target.value }))
                }
                placeholder="Description"
                className="min-h-16"
              />
              <Input
                value={editDraft.linkedin ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, linkedin: e.target.value }))
                }
                placeholder="LinkedIn URL"
              />
              <Input
                value={editDraft.github ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, github: e.target.value }))
                }
                placeholder="GitHub URL"
              />
              <Input
                value={editDraft.website ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, website: e.target.value }))
                }
                placeholder="Website URL"
              />
              <Input
                value={editDraft.instagram ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, instagram: e.target.value }))
                }
                placeholder="Instagram URL"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!editDraft.name?.trim() || updateMutation.isPending}
                  onClick={() => saveEdit(partner.id)}
                >
                  <Check className="h-3 w-3" />
                  {updateMutation.isPending ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={cancelEdit}
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // ── Read-only partner card ──
            <div
              key={partner.id}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3"
            >
              {partner.logo_key ? (
                // biome-ignore lint/performance/noImgElement: External logo source
                <img
                  src={partner.logo_key}
                  alt={partner.name}
                  className="h-9 w-9 shrink-0 rounded-lg object-contain border border-border/60 bg-background p-0.5"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {partner.name}
                </p>
                {partner.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {partner.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  {partner.website && (
                    <Globe className="h-3 w-3 text-muted-foreground" />
                  )}
                  {partner.linkedin && (
                    <Linkedin className="h-3 w-3 text-muted-foreground" />
                  )}
                  {partner.github && (
                    <GithubIcon className="h-3 w-3 text-muted-foreground" />
                  )}
                  {partner.instagram && (
                    <Instagram className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  aria-label={`Edit ${partner.name}`}
                  onClick={() => startEdit(partner)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  aria-label={`Delete ${partner.name}`}
                  onClick={() => setDeleteTargetId(partner.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Remove community partner?"
        description="This will unlink the partner from this interest group. The partner record itself is deleted."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deleteTargetId && deleteMutation.mutate(deleteTargetId)
        }
      />
    </fieldset>
  );
}
