"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import type { UserResult } from "@/hooks/use-search";
import { useTransferLeadRole } from "../hooks";

const schema = z.object({
  muid: z.string().min(1, "Select a member"),
});
type FormValues = z.infer<typeof schema>;

interface TransferLeadDialogProps {
  trigger: React.ReactNode;
}

export function TransferLeadDialog({ trigger }: TransferLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingMuid, setPendingMuid] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    muid: string;
    name: string;
  } | null>(null);
  const { mutate: transfer, isPending } = useTransferLeadRole();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { muid: "" },
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
    setPendingMuid(values.muid);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!pendingMuid) return;
    transfer(pendingMuid, {
      onSuccess: () => {
        toast.success("Campus lead role transferred");
        setOpen(false);
        setConfirmOpen(false);
        form.reset();
        setSelectedUser(null);
      },
      onError: () => {
        toast.error("Failed to transfer campus lead role");
        setConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Campus Lead</DialogTitle>
            <DialogDescription>
              Search for the member who will become the new campus lead. This
              action removes your current campus lead role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Are you absolutely sure?"
        description="This will transfer the Campus Lead role to the selected member. You will lose campus management access immediately."
        confirmLabel={isPending ? "Transferring..." : "Yes, transfer"}
        onConfirm={handleConfirm}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
