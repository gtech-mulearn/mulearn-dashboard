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
import type { UserResult } from "@/hooks/use-search";
import { useTransferEnablerRole } from "../hooks";

const schema = z.object({
  muid: z.string().min(1, "Select a member"),
});
type FormValues = z.infer<typeof schema>;

interface TransferEnablerDialogProps {
  trigger: React.ReactNode;
}

export function TransferEnablerDialog({ trigger }: TransferEnablerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    muid: string;
    name: string;
  } | null>(null);
  const { mutate: transfer, isPending } = useTransferEnablerRole();

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
    transfer(values.muid, {
      onSuccess: () => {
        toast.success("Lead Enabler role transferred");
        setOpen(false);
        form.reset();
        setSelectedUser(null);
      },
      onError: () => {
        toast.error("Failed to transfer enabler role");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Lead Enabler</DialogTitle>
          <DialogDescription>
            Select the member who will become the new Lead Enabler for this
            campus.
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
