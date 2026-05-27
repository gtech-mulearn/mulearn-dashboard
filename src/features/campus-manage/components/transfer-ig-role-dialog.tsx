"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserResult } from "@/hooks/use-search";
import { ApiError } from "@/api";
import { useIgCodes, useTransferIgRole } from "../hooks";

const schema = z.object({
  muid: z.string().min(1, "Select a member"),
  igCode: z.string().min(1, "Select an IG"),
});
type FormValues = z.infer<typeof schema>;

interface TransferIgRoleDialogProps {
  trigger: React.ReactNode;
  defaultIgCode?: string;
}

export function TransferIgRoleDialog({
  trigger,
  defaultIgCode,
}: TransferIgRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    muid: string;
    name: string;
  } | null>(null);
  const { data: igCodes = [], isLoading: isLoadingCodes } = useIgCodes();
  const { mutate: transfer, isPending } = useTransferIgRole();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { muid: "", igCode: defaultIgCode ?? "" },
  });

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser({ muid: user.muid, name: user.full_name });
    form.setValue("muid", user.muid, { shouldValidate: true });
  };

  const handleClear = () => {
    setSelectedUser(null);
    form.setValue("muid", "", { shouldValidate: false });
  };

  const onSubmit = (values: FormValues) => {
    transfer(
      { muid: values.muid, igCode: values.igCode },
      {
        onSuccess: () => {
          toast.success("IG lead role transferred");
          setOpen(false);
          form.reset({ muid: "", igCode: defaultIgCode ?? "" });
          setSelectedUser(null);
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Failed to transfer IG lead role",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer IG Lead Role</DialogTitle>
          <DialogDescription>
            Select the member to become the new IG lead and the interest group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Interest Group</p>
            <Select
              value={form.watch("igCode")}
              onValueChange={(val) =>
                form.setValue("igCode", val, { shouldValidate: true })
              }
              disabled={isLoadingCodes || isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select IG..." />
              </SelectTrigger>
              <SelectContent>
                {igCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.igCode && (
              <p className="text-xs text-destructive">
                {form.formState.errors.igCode.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">New IG Lead</p>
            <MuidSearchInput
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
              onClear={handleClear}
              keepOpen
              placeholder="Search by name or MUID..."
              disabled={isPending}
            />
            {form.formState.errors.muid && (
              <p className="text-xs text-destructive">
                {form.formState.errors.muid.message}
              </p>
            )}
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
              {isPending ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
