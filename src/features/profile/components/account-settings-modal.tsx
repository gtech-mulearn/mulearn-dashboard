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

  const handleLogout = () => {
    // Clear all tokens
    authStore.clearTokens();

    // Clear all cached query data
    queryClient.clear();

    toast.success("Logged out successfully");
    onOpenChange(false);
    router.push("/login");
  };

  const handleChangePassword = () => {
    onOpenChange(false);
    router.push("/dashboard/settings");
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
    {
      id: "privacy",
      icon: Shield,
      label: "Privacy Settings",
      description: "Manage your data and privacy",
      onClick: () => toast.info("Coming soon"),
      variant: "default" as const,
    },
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
                  ? "text-red-600 hover:bg-red-50"
                  : item.variant === "warning"
                    ? "text-amber-600 hover:bg-amber-50"
                    : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  item.variant === "danger"
                    ? "bg-red-100"
                    : item.variant === "warning"
                      ? "bg-amber-100"
                      : "bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{item.label}</p>
                <p
                  className={`text-xs ${
                    item.variant === "danger"
                      ? "text-red-400"
                      : item.variant === "warning"
                        ? "text-amber-400"
                        : "text-gray-400"
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
