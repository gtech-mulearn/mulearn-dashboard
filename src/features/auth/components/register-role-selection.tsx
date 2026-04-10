/**
 * Register Role Selection Component
 *
 * 📍 src/features/auth/components/register-role-selection.tsx
 *
 * Step 2: Role selection (Student, Mentor, Enabler, Company)
 */

"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";

export type Role = "student" | "mentor" | "enabler" | "company";

interface RegisterRoleSelectionProps {
  onSubmit: (role: Role) => void;
  onBack?: () => void;
  isLoading?: boolean;
  defaultValue?: Role;
}

export function RegisterRoleSelection({
  onSubmit,
  onBack,
  isLoading,
  defaultValue,
}: RegisterRoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    defaultValue || null,
  );

  const handleSubmit = () => {
    if (selectedRole) {
      onSubmit(selectedRole);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="self-start p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-foreground">
          Tell us about yourself
        </h1>
        <p className="text-sm text-muted-foreground">
          Select your role to continue
        </p>
      </div>

      {/* Role Options */}
      <div className="space-y-4">
        <OptionCard
          icon="🎓"
          label="Student"
          selected={selectedRole === "student"}
          onClick={() => setSelectedRole("student")}
          disabled={isLoading}
        />
        <OptionCard
          icon="👨‍🏫"
          label="Mentor"
          selected={selectedRole === "mentor"}
          onClick={() => setSelectedRole("mentor")}
          disabled={isLoading}
        />
        <OptionCard
          icon="🤝"
          label="Enabler"
          selected={selectedRole === "enabler"}
          onClick={() => setSelectedRole("enabler")}
          disabled={isLoading}
        />
        <OptionCard
          icon="🏢"
          label="Company"
          selected={selectedRole === "company"}
          onClick={() => setSelectedRole("company")}
          disabled={isLoading}
        />
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedRole || isLoading}
        className="w-full mt-6"
      >
        Continue
      </Button>
    </div>
  );
}
