"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddParticipant,
  useParticipants,
  useRemoveParticipant,
} from "../hooks/use-sessions";
import {
  AddParticipantFormSchema,
  type AddParticipantFormValues,
  type Session,
} from "../schemas";

const ROLE_LABELS: Record<string, string> = {
  MENTOR: "Mentor",
  CO_MENTOR: "Co-Mentor",
  MENTEE: "Mentee",
};
const STATUS_LABELS: Record<string, string> = {
  INVITED: "Invited",
  ATTENDED: "Attended",
  ABSENT: "Absent",
};

interface SessionParticipantsDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionParticipantsDialog({
  session,
  open,
  onOpenChange,
}: SessionParticipantsDialogProps) {
  const sessionId = session?.id ?? "";
  const { data: participants, isLoading } = useParticipants(sessionId);
  const { mutate: addP, isPending: isAdding } = useAddParticipant(sessionId);
  const { mutate: removeP, isPending: isRemoving } =
    useRemoveParticipant(sessionId);

  const [removeTarget, setRemoveTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  const form = useForm<AddParticipantFormValues>({
    resolver: zodResolver(AddParticipantFormSchema),
    defaultValues: {
      user: "",
      participant_role: "MENTEE",
    },
  });

  function onAddSubmit(values: AddParticipantFormValues) {
    addP(values, { onSuccess: () => form.reset() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Participants — {session?.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !participants || participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[120px] gap-2 text-muted-foreground">
            <p className="text-sm">No participants yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => (
                <TableRow key={p.user_id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ROLE_LABELS[p.participant_role] ?? p.participant_role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.attendance_status === "ATTENDED"
                          ? "default"
                          : p.attendance_status === "ABSENT"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {p.attendance_status
                        ? (STATUS_LABELS[p.attendance_status] ??
                          p.attendance_status)
                        : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setRemoveTarget({
                          userId: p.user_id,
                          name: p.full_name,
                        })
                      }
                      disabled={isRemoving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Separator />

        <p className="text-sm font-medium">Add Participant</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddSubmit)}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User MUID / ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user ID or MUID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participant_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MENTEE">Mentee</SelectItem>
                      <SelectItem value="CO_MENTOR">Co-Mentor</SelectItem>
                      <SelectItem value="MENTOR">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isAdding} className="self-end">
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </form>
        </Form>
      </DialogContent>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Remove Participant"
        description={`Remove ${removeTarget?.name} from this session?`}
        onConfirm={() => {
          if (removeTarget) {
            removeP(removeTarget.userId, {
              onSuccess: () => setRemoveTarget(null),
            });
          }
        }}
        isPending={isRemoving}
        confirmLabel="Remove"
      />
    </Dialog>
  );
}
