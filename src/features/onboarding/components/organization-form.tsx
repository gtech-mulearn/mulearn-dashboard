/**
 * Organization Form Component
 *
 * 📍 src/features/onboarding/components/organization-form.tsx
 *
 * Form for selecting organization (college/company) during onboarding.
 * Matches the mobile-first onboarding UI design.
 */

"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { OptionCard } from "@/components/ui/option-card";
import { ProgressArrow } from "@/components/ui/progress-arrow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { College, Company, Department } from "../schemas";

interface OrganizationFormProps {
  colleges: College[];
  departments: Department[];
  companies: Company[];
  isLoadingColleges?: boolean;
  isLoadingDepartments?: boolean;
  isLoadingCompanies?: boolean;
  /** Server-side college search — called on every keystroke in the college Combobox. */
  onCollegeSearchChange?: (search: string) => void;
  /** Server-side department search — called on every keystroke in the department Combobox. */
  onDepartmentSearchChange?: (search: string) => void;
  onSubmit: (values: {
    organization: string;
    department?: string;
    graduationYear?: number;
    isStudent: boolean;
  }) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

type Step = "type" | "details";

export function OrganizationForm({
  colleges,
  departments,
  companies,
  isLoadingColleges,
  isLoadingDepartments,
  isLoadingCompanies,
  onCollegeSearchChange,
  onDepartmentSearchChange,
  onSubmit,
  onBack,
  isLoading,
}: OrganizationFormProps) {
  const [step, setStep] = useState<Step>("type");
  const [userType, setUserType] = useState<"student" | "professional" | null>(
    null,
  );
  const [organization, setOrganization] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const canProceed = () => {
    if (step === "type") return !!userType;
    if (step === "details") return !!organization;
    return false;
  };

  const handleNext = () => {
    if (step === "type" && userType) {
      setStep("details");
    } else if (step === "details") {
      onSubmit({
        organization,
        department: department || undefined,
        graduationYear: graduationYear
          ? parseInt(graduationYear, 10)
          : undefined,
        isStudent: userType === "student",
      });
    }
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("type");
    } else if (onBack) {
      onBack();
    }
  };

  const progress = step === "type" ? 33 : 66;

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="self-start p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        type="button"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mt-4 mb-8">
        <p className="text-sm text-muted-foreground mb-2">
          Lets bring out the true YOU
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {step === "type"
            ? "Which one feels\nlike you?"
            : userType === "student"
              ? "Where do you\nstudy?"
              : "Where do you\nwork?"}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {step === "type" ? (
          <>
            <OptionCard
              icon="🎓"
              label="Learner"
              selected={userType === "student"}
              onClick={() => setUserType("student")}
            />
            <OptionCard
              icon="💼"
              label="Working Professional"
              selected={userType === "professional"}
              onClick={() => setUserType("professional")}
            />
          </>
        ) : (
          <div className="space-y-5">
            {/* Organization Select */}
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-foreground">
                {userType === "student" ? "College" : "Company"}
              </span>
              {userType === "student" ? (
                <Combobox
                  options={colleges}
                  value={organization}
                  onValueChange={setOrganization}
                  onSearchChange={(value) => {
                    setCollegeSearch(value);
                    onCollegeSearchChange?.(value);
                  }}
                  loading={isLoadingColleges}
                  placeholder="Search your college"
                  emptyText={
                    collegeSearch.trim().length < 2
                      ? "Type your college to search"
                      : "No colleges found."
                  }
                  disabled={isLoading}
                  className="h-12 rounded-xl border-border bg-muted/50 px-4"
                />
              ) : (
                <Select
                  value={organization}
                  onValueChange={setOrganization}
                  disabled={isLoading || isLoadingCompanies}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl border-border bg-muted/50 px-4">
                    <SelectValue placeholder="Select your company" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Additional fields for students */}
            {userType === "student" && (
              <>
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-foreground">
                    Department
                  </span>
                  <Combobox
                    options={departments}
                    value={department}
                    onValueChange={setDepartment}
                    onSearchChange={(value) => {
                      setDepartmentSearch(value);
                      onDepartmentSearchChange?.(value);
                    }}
                    loading={isLoadingDepartments}
                    placeholder="Search your department"
                    emptyText={
                      departmentSearch.trim().length < 2
                        ? "Type your department to search"
                        : "No departments found."
                    }
                    disabled={isLoading}
                    className="h-12 rounded-xl border-border bg-muted/50 px-4"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-foreground">
                    Graduation Year
                  </span>
                  <Select
                    value={graduationYear}
                    onValueChange={setGraduationYear}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full h-12 rounded-xl border-border bg-muted/50 px-4">
                      <SelectValue placeholder="Select graduation year" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduationYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Progress Arrow */}
      <div className="flex justify-center py-8">
        {isLoading ? (
          <div className="w-14 h-14 flex items-center justify-center">
            <Spinner className="w-6 h-6 text-primary" />
          </div>
        ) : (
          <ProgressArrow
            progress={progress}
            onClick={handleNext}
            disabled={!canProceed()}
          />
        )}
      </div>
    </div>
  );
}
