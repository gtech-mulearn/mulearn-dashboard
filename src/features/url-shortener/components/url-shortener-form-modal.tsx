"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Link, Loader2, Pencil, Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateShortUrl,
  useUpdateShortUrl,
} from "@/features/url-shortener/hooks/use-short-urls";
import {
  ShortUrlFormSchema,
  type ShortUrlFormValues,
  type ShortUrlItem,
} from "@/features/url-shortener/schemas/shortener.schema";
import { getApiResponseError } from "@/hooks/use-get-error";

interface UrlShortenerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ShortUrlItem | null;
}

export function UrlShortenerFormModal({
  open,
  onOpenChange,
  item,
}: UrlShortenerFormModalProps) {
  const isEdit = !!item;
  const createMutation = useCreateShortUrl();
  const updateMutation = useUpdateShortUrl();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShortUrlFormValues>({
    resolver: zodResolver(ShortUrlFormSchema),
    defaultValues: {
      title: "",
      long_url: "",
      short_url: "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        title: item.title ?? "",
        long_url: item.long_url ?? "",
        short_url: item.short_url ?? "",
      });
    } else {
      reset({ title: "", long_url: "", short_url: "" });
    }
  }, [item, reset]);

  const onSubmit = async (data: ShortUrlFormValues) => {
    try {
      if (isEdit && item) {
        await updateMutation.mutateAsync({ id: item.id, payload: data });
        toast.success("Short URL updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Short URL created successfully");
      }
      onOpenChange(false);
      reset({ title: "", long_url: "", short_url: "" });
    } catch (error) {
      toast.error(
        getApiResponseError(error, {
          fallback: isEdit ? "Failed to update URL" : "Failed to create URL",
        }),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border border-border/60 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
              {isEdit ? (
                <Pencil className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-none">
                {isEdit ? "Edit Short URL" : "Create Short URL"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isEdit
                  ? "Update the details of your short link"
                  : "Generate a short link for any long URL"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Title for your link"
              className="h-10 text-sm"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="long_url"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <ExternalLink className="size-3.5 text-muted-foreground" />
              Destination URL
            </Label>
            <Input
              id="long_url"
              type="url"
              placeholder="https://example.com/very/long/url"
              className="h-10 text-sm"
              {...register("long_url")}
            />
            {errors.long_url && (
              <p className="text-xs text-destructive">
                {errors.long_url.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="short_url"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Link className="size-3.5 text-muted-foreground" />
              Short alias
            </Label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 h-10 text-xs text-muted-foreground bg-muted border border-r-0 border-border rounded-l-md font-mono">
                mulearn.org/r/
              </span>
              <Input
                id="short_url"
                placeholder="short-name"
                className="h-10 text-sm rounded-l-none"
                {...register("short_url")}
              />
            </div>
            {errors.short_url && (
              <p className="text-xs text-destructive">
                {errors.short_url.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="min-w-[110px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create link"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
