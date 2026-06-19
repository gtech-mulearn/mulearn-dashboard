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
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="self-start -ml-2"
          type="button"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
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
          label="Learner"
          description="I'm a learner exploring and building skills across diverse domains while earning karma through meaningful contributions"
          selected={selectedRole === "student"}
          onClick={() => setSelectedRole("student")}
          disabled={isLoading}
        />
        <OptionCard
          icon="👨‍🏫"
          label="Mentor"
          description="I guide and support learners. Company employees can choose this option and select their company during setup."
          selected={selectedRole === "mentor"}
          onClick={() => setSelectedRole("mentor")}
          disabled={isLoading}
        />
        <OptionCard
          icon="🤝"
          label="Enabler"
          description="I represent an institution or organisation supporting the uLearn community."
          selected={selectedRole === "enabler"}
          onClick={() => setSelectedRole("enabler")}
          disabled={isLoading}
        />
        <OptionCard
          icon="🏢"
          label="Company"
          description="I'm registering my company for the first time as the Point of Contact (POC). Employees should choose Mentor."
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
