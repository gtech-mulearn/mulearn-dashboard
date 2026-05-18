"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  type ChangePasswordFormValues,
  ChangePasswordRequestSchema,
  useChangePassword,
} from "@/features/settings";

export function ChangePasswordForm() {
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordRequestSchema),
    defaultValues: {
      current_password: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await changePasswordMutation.mutateAsync({
        current_password: values.current_password,
        password: values.password,
      });
      reset();
    } catch {
      // Error handled by mutation onError
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="space-y-2">
        <label htmlFor="current_password" className="sr-only">
          Current Password
        </label>
        <div className="relative">
          <Input
            id="current_password"
            type={show.current ? "text" : "password"}
            placeholder="Current Password"
            className="pr-10"
            {...register("current_password")}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
            className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
          >
            {show.current ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.current_password?.message && (
          <p className="text-sm text-destructive">
            {errors.current_password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="new_password" className="sr-only">
          New Password
        </label>
        <div className="relative">
          <Input
            id="new_password"
            type={show.next ? "text" : "password"}
            placeholder="New Password"
            className="pr-10"
            {...register("password")}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
            className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
          >
            {show.next ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password?.message && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm_password" className="sr-only">
          Confirm New Password
        </label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={show.confirm ? "text" : "password"}
            placeholder="Confirm New Password"
            className="pr-10"
            {...register("confirm_password")}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
          >
            {show.confirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.confirm_password?.message && (
          <p className="text-sm text-destructive">
            {errors.confirm_password.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={changePasswordMutation.isPending}
      >
        {changePasswordMutation.isPending && (
          <Spinner className="mr-2 h-4 w-4" />
        )}
        Change Password
      </Button>
    </form>
  );
}
