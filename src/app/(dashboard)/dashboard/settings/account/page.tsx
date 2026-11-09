import { EmailVerificationCard } from "@/features/email-verification";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Account settings" };

export default function AccountSettingsPage() {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Account settings</h1>
        <p className="text-muted-foreground">
          Manage your email address and password.
        </p>
      </header>

      <EmailVerificationCard />

      <div className="border-muted bg-background flex w-full flex-col items-center gap-y-8 rounded-md border px-6 py-10 shadow-md">
        <div className="flex flex-col items-center gap-y-2 text-center">
          <h2 className="text-2xl font-semibold">Change password</h2>
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
