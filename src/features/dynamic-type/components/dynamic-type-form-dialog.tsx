/**
 * Dynamic Type Form Dialog
 *
 * 📍 src/features/dynamic-type/components/dynamic-type-form-dialog.tsx
 *
 * Unified create/edit dialog for both Role and User tab mappings.
 * Replaces the old CreateModal + EditModal pair with a single component.
 *
 * Props:
 *   - mode: "create" | "edit"
 *   - tab:  "role"  | "user"
 *   - For edit mode, pass initialId + initialData for pre-filling.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, UserCircle } from "lucide-react";
import { useEffect } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateDynamicRole,
  useCreateDynamicUser,
  useRoleOptions,
  useTypeOptions,
  useUpdateDynamicRole,
  useUpdateDynamicUser,
} from "../hooks";
import {
  CreateDynamicRoleRequestSchema,
  CreateDynamicUserRequestSchema,
  UpdateDynamicRoleRequestSchema,
  UpdateDynamicUserRequestSchema,
} from "../schemas";
import type {
  CreateDynamicRoleRequest,
  CreateDynamicUserRequest,
  DynamicTypeTab,
  FormDialogMode,
  UpdateDynamicRoleRequest,
  UpdateDynamicUserRequest,
} from "../types";

// ============================================
// Props
// ============================================

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: DynamicTypeTab;
}

interface CreateProps extends BaseProps {
  mode: "create";
}

interface EditRoleProps extends BaseProps {
  mode: "edit";
  tab: "role";
  editId: string;
  initialRole: string;
  initialType: string;
}

interface EditUserProps extends BaseProps {
  mode: "edit";
  tab: "user";
  editId: string;
  initialMuid: string;
  initialType: string;
}

type DynamicTypeFormDialogProps = CreateProps | EditRoleProps | EditUserProps;

function isEditRoleProps(p: DynamicTypeFormDialogProps): p is EditRoleProps {
  return p.mode === "edit" && p.tab === "role" && "editId" in p;
}

function isEditUserProps(p: DynamicTypeFormDialogProps): p is EditUserProps {
  return p.mode === "edit" && p.tab === "user" && "editId" in p;
}

// ============================================
// Internal sub-forms
// ============================================

function CreateRoleForm({ onClose }: { onClose: () => void }) {
  const { data: typeOptions = [], isLoading: typesLoading } = useTypeOptions();
  const { data: roleOptions = [], isLoading: rolesLoading } = useRoleOptions();
  const { mutate: createRole, isPending } = useCreateDynamicRole();

  const form = useForm<CreateDynamicRoleRequest>({
    resolver: zodResolver(CreateDynamicRoleRequestSchema),
    defaultValues: { type: "", role: "" },
  });

  const onSubmit = (data: CreateDynamicRoleRequest) => {
    createRole(data, { onSuccess: onClose });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type selector */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={typesLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role selector */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={rolesLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            Create Mapping
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditRoleForm({
  editId,
  initialRole,
  onClose,
}: {
  editId: string;
  initialRole: string;
  onClose: () => void;
}) {
  const { data: roleOptions = [], isLoading: rolesLoading } = useRoleOptions();
  const { mutate: updateRole, isPending } = useUpdateDynamicRole();

  const form = useForm<UpdateDynamicRoleRequest>({
    resolver: zodResolver(UpdateDynamicRoleRequestSchema),
    defaultValues: { new_role: initialRole },
  });

  useEffect(() => {
    form.reset({ new_role: initialRole });
  }, [initialRole, form]);

  const onSubmit = (data: UpdateDynamicRoleRequest) => {
    updateRole({ id: editId, new_role: data.new_role }, { onSuccess: onClose });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* New role selector */}
        <FormField
          control={form.control}
          name="new_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={rolesLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const { data: typeOptions = [], isLoading: typesLoading } = useTypeOptions();
  const { mutate: createUser, isPending } = useCreateDynamicUser();

  const form = useForm<CreateDynamicUserRequest>({
    resolver: zodResolver(CreateDynamicUserRequestSchema),
    defaultValues: { type: "", user: "" },
  });

  const onSubmit = (data: CreateDynamicUserRequest) => {
    createUser(data, { onSuccess: onClose });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type selector */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={typesLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* MUID / email input */}
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User (MUID or Email)</FormLabel>
              <FormControl>
                <Input placeholder="Enter MUID or email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            Create Mapping
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditUserForm({
  editId,
  initialMuid,
  onClose,
}: {
  editId: string;
  initialMuid: string;
  onClose: () => void;
}) {
  const { mutate: updateUser, isPending } = useUpdateDynamicUser();

  const form = useForm<UpdateDynamicUserRequest>({
    resolver: zodResolver(UpdateDynamicUserRequestSchema),
    defaultValues: { new_user: initialMuid },
  });

  useEffect(() => {
    form.reset({ new_user: initialMuid });
  }, [initialMuid, form]);

  const onSubmit = (data: UpdateDynamicUserRequest) => {
    updateUser({ id: editId, new_user: data.new_user }, { onSuccess: onClose });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* New user (MUID / email) input */}
        <FormField
          control={form.control}
          name="new_user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New User (MUID or Email)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter new MUID or email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// ============================================
// Title helpers
// ============================================

function getDialogTitle(mode: FormDialogMode, tab: DynamicTypeTab): string {
  if (mode === "create") {
    return tab === "role" ? "Create Role Mapping" : "Create User Mapping";
  }
  return tab === "role" ? "Edit Role Mapping" : "Edit User Mapping";
}

function getDialogDescription(
  mode: FormDialogMode,
  tab: DynamicTypeTab,
): string {
  if (mode === "create") {
    return tab === "role"
      ? "Assign a role to a type category."
      : "Assign a user to a type category using their MUID or email.";
  }
  return tab === "role"
    ? "Change the role for this type mapping."
    : "Change the user (MUID or email) for this type mapping.";
}

// ============================================
// Main Dialog
// ============================================

export function DynamicTypeFormDialog(props: DynamicTypeFormDialogProps) {
  const { open, onOpenChange, tab, mode } = props;

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[480px]">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              {tab === "role" ? (
                <Layers className="h-5 w-5 text-primary" />
              ) : (
                <UserCircle className="h-5 w-5 text-primary" />
              )}
            </div>
            {getDialogTitle(mode, tab)}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription(mode, tab)}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 pb-6">
          {/* Render the correct sub-form based on mode + tab */}
          {mode === "create" && tab === "role" && (
            <CreateRoleForm onClose={handleClose} />
          )}
          {mode === "create" && tab === "user" && (
            <CreateUserForm onClose={handleClose} />
          )}
          {isEditRoleProps(props) && (
            <EditRoleForm
              editId={props.editId}
              initialRole={props.initialRole}
              onClose={handleClose}
            />
          )}
          {isEditUserProps(props) && (
            <EditUserForm
              editId={props.editId}
              initialMuid={props.initialMuid}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
