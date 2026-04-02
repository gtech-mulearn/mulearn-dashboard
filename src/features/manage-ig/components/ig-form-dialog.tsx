"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useInterestGroupsAdmin } from "../hooks/use-manage-ig";
import {
  type InterestGroup,
  type InterestGroupCreate,
  InterestGroupCreateSchema,
} from "../schemas";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InterestGroup | null;
  /** When true, restricts fields to lead-editable only and uses PATCH instead of PUT */
  isIGLead?: boolean;
};

type InterestGroupArrayField =
  | string
  | string[]
  | { title: string; url: string }[]
  | { name: string; twitter?: string | null; designation?: string | null }[]
  | { name: string; email?: string | null }[]
  | { name: string; expertise?: string | null; linkedin?: string | null }[]
  | null
  | undefined;

function normalizeArrayField(value: InterestGroupArrayField): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string"
        ? item
        : "name" in item
          ? item.name
          : "title" in item
            ? item.title
            : String(item),
    );
  }
  try {
    if (
      typeof value === "string" &&
      (value.startsWith("[") || value.startsWith("{"))
    ) {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    }
    return value.trim() ? value.split(",").map((s) => s.trim()) : [];
  } catch {
    return value.trim() ? [value] : [];
  }
}

export function InterestGroupFormDialog({
  isOpen,
  onClose,
  initialData,
  isIGLead = false,
}: Props) {
  const {
    createInterestGroup,
    updateInterestGroup,
    partialUpdateInterestGroup,
  } = useInterestGroupsAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InterestGroupCreate>({
    resolver: zodResolver(InterestGroupCreateSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "coder",
      icon: "",
      about: "",
      prerequisites: [],
      career_opportunities: [],
      resource: "",
      top_blogs: [],
      people_to_follow: [],
      leads: [],
      mentors: [],
      thinktank: "",
      office_hours: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        code: initialData.code,
        category: initialData.category as InterestGroupCreate["category"],
        icon: initialData.icon || "",
        about: initialData.about || "",
        prerequisites: normalizeArrayField(initialData.prerequisites),
        career_opportunities: normalizeArrayField(
          initialData.career_opportunities,
        ),
        resource: initialData.resource || "",
        top_blogs: normalizeArrayField(initialData.top_blogs),
        people_to_follow: normalizeArrayField(initialData.people_to_follow),
        leads: normalizeArrayField(initialData.leads),
        mentors: normalizeArrayField(initialData.mentors),
        thinktank: initialData.thinktank || "",
        office_hours: initialData.office_hours || "",
      });
    } else {
      form.reset({
        name: "",
        code: "",
        category: "coder",
        icon: "",
        about: "",
        prerequisites: [],
        career_opportunities: [],
        resource: "",
        top_blogs: [],
        people_to_follow: [],
        leads: [],
        mentors: [],
        thinktank: "",
        office_hours: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: InterestGroupCreate) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        if (isIGLead) {
          // IG Lead: only send lead-editable fields via PATCH
          const { name, code, category, ...leadFields } = data;
          await partialUpdateInterestGroup(initialData.id, leadFields);
        } else {
          await updateInterestGroup(initialData.id, data);
        }
      } else {
        await createInterestGroup(data);
      }
      onClose();
    } catch {
      // Error handled by mutation onError toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const ArrayInput = ({
    label,
    name,
    placeholder,
  }: {
    label: string;
    name: keyof InterestGroupCreate;
    placeholder: string;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              value={
                Array.isArray(field.value)
                  ? (field.value as string[]).join(", ")
                  : String(field.value || "")
              }
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : [],
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData
              ? isIGLead
                ? "Edit Interest Group (IG Lead)"
                : "Edit Interest Group"
              : "Create Interest Group"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? isIGLead
                ? "Update lead-editable fields for this interest group. Core fields are managed by admins."
                : "Update the details of this interest group."
              : "Create a new interest group. This will also auto-create associated roles."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Core Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Name <span className="text-destructive">*</span>
                        {isIGLead && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Web Development"
                          disabled={isIGLead && !!initialData}
                          {...field}
                        />
                      </FormControl>
                      {isIGLead && (
                        <p className="text-xs text-muted-foreground">
                          Admin only
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Code <span className="text-destructive">*</span>
                        {isIGLead && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. WD"
                          disabled={isIGLead && !!initialData}
                          {...field}
                        />
                      </FormControl>
                      {isIGLead && (
                        <p className="text-xs text-muted-foreground">
                          Admin only
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Category <span className="text-destructive">*</span>
                        {isIGLead && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isIGLead && !!initialData}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maker">Maker</SelectItem>
                          <SelectItem value="coder">Coder</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      {isIGLead && (
                        <p className="text-xs text-muted-foreground">
                          Admin only
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Icon URL <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/icon.png"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the interest group and its goals..."
                        className="min-h-20 resize-y"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Learning & Career */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Learning & Career
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ArrayInput
                  label="Prerequisites"
                  name="prerequisites"
                  placeholder="e.g. HTML, CSS, JS"
                />
                <ArrayInput
                  label="Career Opportunities"
                  name="career_opportunities"
                  placeholder="e.g. Frontend Dev, UI Designer"
                />
              </div>
              <FormField
                control={form.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Link to learning resources"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ArrayInput
                label="Top Blogs"
                name="top_blogs"
                placeholder="e.g. CSS-Tricks, Smashing Magazine"
              />
              <ArrayInput
                label="People to Follow"
                name="people_to_follow"
                placeholder="e.g. Dan Abramov, Kent C Dodds"
              />
            </div>

            <Separator />

            {/* Team & Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Team & Schedule
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ArrayInput
                  label="Leads"
                  name="leads"
                  placeholder="e.g. John Doe, Jane Smith"
                />
                <ArrayInput
                  label="Mentors"
                  name="mentors"
                  placeholder="e.g. Prof. Ada, Dr. Turing"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="office_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Hours</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Mon-Fri 6PM-8PM"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thinktank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thinktank URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Link to thinktank"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {initialData ? "Save Changes" : "Create IG"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
