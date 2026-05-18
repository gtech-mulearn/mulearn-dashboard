import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Change Password" };

export default function ChangePasswordPage() {
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
        <ChangePasswordForm />
      </div>
    </section>
  );
}
