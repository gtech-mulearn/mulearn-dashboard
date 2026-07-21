"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UserResult } from "@/hooks/use-search";
import { useCreateIgChapter, useGlobalIgs } from "../hooks";

const schema = z.object({
  ig: z.string().min(1, "Select an interest group"),
  description: z.string().optional(),
  icon_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  lead: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface IgChapterFormDialogProps {
  trigger: React.ReactNode;
}

export function IgChapterFormDialog({ trigger }: IgChapterFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    muid: string;
    name: string;
  } | null>(null);
  const { data: globalIgs = [], isLoading: isLoadingIgs } = useGlobalIgs();
  const { mutate: create, isPending } = useCreateIgChapter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ig: "", description: "", icon_link: "", lead: "" },
  });

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser({ id: user.id, muid: user.muid, name: user.full_name });
    form.setValue("lead", user.muid);
  };

  const handleClear = () => {
    setSelectedUser(null);
    form.setValue("lead", "");
  };

  const onSubmit = (values: FormValues) => {
    create(
      {
        ig: values.ig,
        description: values.description || undefined,
        icon_link: values.icon_link || undefined,
        lead: values.lead || undefined,
      },
      {
        onSuccess: () => {
          toast.success("IG chapter created");
          setOpen(false);
          form.reset();
          setSelectedUser(null);
        },
        // Error toast handled by useCreateIgChapter's onError.
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create IG Chapter</DialogTitle>
          <DialogDescription>
            Add a new interest group chapter to this campus.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Interest Group</p>
            <Select
              value={form.watch("ig")}
              onValueChange={(val) =>
                form.setValue("ig", val, { shouldValidate: true })
              }
              disabled={isLoadingIgs || isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select IG..." />
              </SelectTrigger>
              <SelectContent position="popper">
                {globalIgs.map((ig) => (
                  <SelectItem key={ig.id} value={ig.id}>
                    {ig.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.ig && (
              <p className="text-xs text-destructive">
                {form.formState.errors.ig.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="chapter-form-description"
              className="text-sm font-medium"
            >
              Description (optional)
            </label>
            <Textarea
              id="chapter-form-description"
              {...form.register("description")}
              placeholder="Brief description of this chapter..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="chapter-form-icon-link"
              className="text-sm font-medium"
            >
              Icon Link (optional)
            </label>
            <Input
              id="chapter-form-icon-link"
              {...form.register("icon_link")}
              placeholder="https://..."
            />
            {form.formState.errors.icon_link && (
              <p className="text-xs text-destructive">
                {form.formState.errors.icon_link.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Lead (optional)</p>
            <MuidSearchInput
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
              onClear={handleClear}
              keepOpen
              placeholder="Search for initial lead..."
              disabled={isPending}
              searchOptions={{
                endpoint: endpoints.campusManage.execomSearch,
                queryParam: "q",
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
