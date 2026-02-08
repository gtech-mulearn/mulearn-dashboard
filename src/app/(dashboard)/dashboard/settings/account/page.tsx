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

export default function ChangePasswordPage() {
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
    const res = await changePasswordMutation.mutateAsync({
      current_password: values.current_password,
      password: values.password,
    });
    if (!res.hasError) reset();
  }

  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="border-muted bg-background flex w-full max-w-xl flex-col items-center gap-y-8 rounded-md border px-6 py-16 shadow-md">
        <div className="flex flex-col items-center gap-y-4 text-center">
          <h1 className="text-3xl font-semibold">Change Password</h1>
          <p className="text-muted-foreground max-w-md">
            Enter your current password, then a new password, and confirm it to
            change.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
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
            <div className="relative">
              <Input
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
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
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
      </div>
    </section>
  );
}
