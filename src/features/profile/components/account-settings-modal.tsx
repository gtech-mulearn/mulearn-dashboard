/**
 * Account Settings Modal
 *
 * 📍 src/features/profile/components/account-settings-modal.tsx
 *
 * Modal dialog for account settings (change password, logout, etc).
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authStore } from "@/lib/auth";
import { useUIStore } from "@/stores/ui-store";

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsModal({
  open,
  onOpenChange,
}: AccountSettingsModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await authStore.clearTokens();

    // Reset UI state
    useUIStore.getState().resetUI();

    // Clear all cached query data
    queryClient.clear();

    toast.success("Logged out successfully");
    onOpenChange(false);
    router.push("/login");
  };

  const handleChangePassword = () => {
    onOpenChange(false);
    router.push("/dashboard/settings/account");
  };

  const settingsItems = [
    {
      id: "password",
      icon: KeyRound,
      label: "Change Password",
      description: "Update your account password",
      onClick: handleChangePassword,
      variant: "default" as const,
    },
    // {
    //   id: "privacy",
    //   icon: Shield,
    //   label: "Privacy Settings",
    //   description: "Manage your data and privacy",
    //   onClick: () => toast.info("Coming soon"),
    //   variant: "default" as const,
    // },
    {
      id: "logout",
      icon: LogOut,
      label: "Sign Out",
      description: "Sign out of your account",
      onClick: handleLogout,
      variant: "warning" as const,
    },
    {
      id: "delete",
      icon: Trash2,
      label: "Delete Account",
      description: "Permanently delete your account",
      onClick: () => toast.info("Contact support to delete your account"),
      variant: "danger" as const,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                item.variant === "danger"
                  ? "text-destructive hover:bg-destructive/10"
                  : item.variant === "warning"
                    ? "text-warning hover:bg-warning/10"
                    : "text-foreground hover:bg-muted"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  item.variant === "danger"
                    ? "bg-destructive/10"
                    : item.variant === "warning"
                      ? "bg-warning/10"
                      : "bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{item.label}</p>
                <p
                  className={`text-xs ${
                    item.variant === "danger"
                      ? "text-destructive/70"
                      : item.variant === "warning"
                        ? "text-warning/70"
                        : "text-muted-foreground"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
