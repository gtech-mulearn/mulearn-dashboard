/**
 * Register Role Details Form Component
 *
 * 📍 src/features/auth/components/register-role-details.tsx
 *
 * Step 3: Role-specific details (conditional fields based on role)
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useCountries,
  useDistricts,
  useStates,
} from "@/features/onboarding/hooks";
import type {
  College,
  Company,
  Department,
} from "@/features/onboarding/schemas";
import type { Role } from "./register-role-selection";

const COMPANY_SIZE_OPTIONS = [
  { id: "1-10", title: "1–10 employees" },
  { id: "11-50", title: "11–50 employees" },
  { id: "51-200", title: "51–200 employees" },
  { id: "201-500", title: "201–500 employees" },
  { id: "501-1000", title: "501–1,000 employees" },
  { id: "1000+", title: "1,000+ employees" },
];

// Schema for Student
const studentDetailsSchema = z
  .object({
    college: z.string().min(1, "Please select your college"),
    customCollege: z.string().optional(),
    department: z.string().min(1, "Please select your department"),
    graduationYear: z
      .number()
      .min(2020, "Year must be 2020 or later")
      .max(2040, "Year must be 2040 or earlier"),
  })
  .refine(
    (data) => {
      // If "Others" is selected, custom college must be provided
      if (data.college === "others") {
        return data.customCollege && data.customCollege.trim().length >= 3;
      }
      return true;
    },
    {
      message: "College name must be at least 3 characters",
      path: ["customCollege"],
    },
  );

// Schema for Enabler
const enablerDetailsSchema = z
  .object({
    college: z.string().min(1, "Please select your college"),
    customCollege: z.string().optional(),
  })
  .refine(
    (data) => {
      // If "Others" is selected, custom college must be provided
      if (data.college === "others") {
        return data.customCollege && data.customCollege.trim().length >= 3;
      }
      return true;
    },
    {
      message: "College name must be at least 3 characters",
      path: ["customCollege"],
    },
  );

// Schema for Mentor
const mentorDetailsSchema = z
  .object({
    organizationType: z.enum(["College", "Company"]),
    organization: z.string().min(1, "Please select your organization"),
    customOrganization: z.string().optional(),
    department: z.string().optional(),
    graduationYear: z.number().optional(),
  })
  .refine(
    (data) => {
      // If "Others" is selected, custom organization must be provided
      if (data.organization === "others") {
        return (
          data.customOrganization && data.customOrganization.trim().length >= 3
        );
      }
      return true;
    },
    {
      message: "Organization name must be at least 3 characters",
      path: ["customOrganization"],
    },
  )
  .refine(
    (data) => {
      // If College type is selected, department is required
      if (data.organizationType === "College") {
        return !!data.department && data.department.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please select your department",
      path: ["department"],
    },
  )
  .refine(
    (data) => {
      // If College type is selected, graduation year is required
      if (data.organizationType === "College") {
        return (
          data.graduationYear &&
          data.graduationYear >= 2020 &&
          data.graduationYear <= 2040
        );
      }
      return true;
    },
    {
      message: "Year must be between 2020 and 2040",
      path: ["graduationYear"],
    },
  );

// Schema for Company
// Note: poc_name and poc_email come from Step 1 (basicData); they are NOT
// collected here. This form only collects company-level details.
const companyDetailsSchema = z.object({
  // Basic Info
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(75, "Max 75 characters"),
  companyDescription: z.string().optional(),
  industrySector: z.string().optional(),
  companySize: z.string().optional(),
  // Contact & Online Presence
  websiteLink: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  linkedinUrl: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .or(z.literal(""))
    .optional(),
  pocPhone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Enter a valid phone number (8–15 digits)")
    .or(z.literal(""))
    .optional(),
  // Location (Country → State → District cascade; only districtId sent to API)
  countryId: z.string().optional(),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  // Legal Information
  legalName: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  verificationDocumentUrl: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
});

type RoleDetailsValues =
  | z.infer<typeof studentDetailsSchema>
  | z.infer<typeof enablerDetailsSchema>
  | z.infer<typeof mentorDetailsSchema>
  | z.infer<typeof companyDetailsSchema>;

export interface CompanyDetailsValues {
  companyName?: string;
  companyDescription?: string;
  industrySector?: string;
  companySize?: string;
  websiteLink?: string;
  linkedinUrl?: string;
  pocPhone?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  verificationDocumentUrl?: string;
}

interface RegisterRoleDetailsProps {
  role: Role;
  onSubmit: (
    values: {
      college?: string;
      customCollege?: string;
      department?: string;
      graduationYear?: number;
      organization?: string;
      customOrganization?: string;
      organizationType?: "College" | "Company";
    } & CompanyDetailsValues,
  ) => void;
  onBack?: () => void;
  isLoading?: boolean;
  colleges?: College[];
  departments?: Department[];
  companies?: Company[];
  isLoadingColleges?: boolean;
  isLoadingDepartments?: boolean;
  isLoadingCompanies?: boolean;
}

export function RegisterRoleDetails({
  role,
  onSubmit,
  onBack,
  isLoading,
  colleges = [],
  departments = [],
  companies = [],
  isLoadingColleges = false,
  isLoadingDepartments = false,
  isLoadingCompanies = false,
}: RegisterRoleDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgParam = searchParams.get("org");

  // Determine which schema to use
  const getSchema = () => {
    if (role === "student") return studentDetailsSchema;
    if (role === "enabler") return enablerDetailsSchema;
    if (role === "mentor") return mentorDetailsSchema;
    return companyDetailsSchema;
  };

  const getDefaultValues = () => {
    if (role === "student") {
      return {
        college: "",
        customCollege: "",
        department: "",
        graduationYear: undefined as number | undefined,
      };
    }
    if (role === "enabler") {
      return { college: "", customCollege: "" };
    }
    if (role === "mentor") {
      return {
        organizationType: "Company" as const,
        organization: "",
        customOrganization: "",
        department: "",
        graduationYear: undefined as number | undefined,
      };
    }
    return {
      companyName: "",
      companyDescription: "",
      industrySector: "",
      companySize: "",
      websiteLink: "",
      linkedinUrl: "",
      pocPhone: "",
      countryId: "",
      stateId: "",
      districtId: "",
      legalName: "",
      registrationNumber: "",
      taxId: "",
      verificationDocumentUrl: "",
    };
  };

  const form = useForm<RoleDetailsValues>({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  // Track if "Others" is selected
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomOrganization, setShowCustomOrganization] = useState(false);
  const [mentorOrgType, setMentorOrgType] = useState<"College" | "Company">(
    "Company",
  );

  // Company stepper state
  const [companyStep, setCompanyStep] = useState(1);
  const COMPANY_STEPS = ["Basic Info", "Contact", "Location", "Legal"];

  // Location cascading state (company form only)
  const [selectedCountryId, setSelectedCountryId] = useState<
    string | undefined
  >();
  const [selectedStateId, setSelectedStateId] = useState<string | undefined>();

  const countries = useCountries();
  const states = useStates(role === "company" ? selectedCountryId : undefined);
  const districts = useDistricts(
    role === "company" ? selectedStateId : undefined,
  );

  // Map { id, name } → { id, title } for Combobox
  const countryOptions = useMemo(
    () => countries.data?.map((c) => ({ id: c.id, title: c.name })) ?? [],
    [countries.data],
  );
  const stateOptions = useMemo(
    () => states.data?.map((s) => ({ id: s.id, title: s.name })) ?? [],
    [states.data],
  );
  const districtOptions = useMemo(
    () => districts.data?.map((d) => ({ id: d.id, title: d.name })) ?? [],
    [districts.data],
  );

  // Track if we've already set the organization from URL (to prevent re-setting)
  const hasSetOrgFromUrl = useRef(false);
  const processedOrgParam = useRef<string | null>(null);

  // Handle organization parameter from create page (only once)
  useEffect(() => {
    if (
      orgParam &&
      (role === "mentor" || role === "company") &&
      !hasSetOrgFromUrl.current &&
      processedOrgParam.current !== orgParam
    ) {
      hasSetOrgFromUrl.current = true;
      processedOrgParam.current = orgParam;

      form.setValue("organization", orgParam);
      toast.success("Organization added successfully");

      // Clear the org parameter from URL to prevent it from reappearing
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("org");
      router.replace(currentUrl.pathname + currentUrl.search);
    }
  }, [orgParam, role, router, form.setValue]);

  const handleSubmit = (values: RoleDetailsValues) => {
    // For company, only submit on the final step — pressing Enter on earlier
    // steps should advance to the next step, not submit the form.
    if (role === "company" && companyStep < 4) {
      void handleCompanyNext();
      return;
    }
    onSubmit(values as Parameters<RegisterRoleDetailsProps["onSubmit"]>[0]);
  };

  const getRoleLabel = () => {
    switch (role) {
      case "student":
        return "Student";
      case "mentor":
        return "Mentor";
      case "enabler":
        return "Enabler";
      case "company":
        return "Company";
    }
  };

  const handleCompanyNext = async () => {
    // Only companyName is required — validate it on step 1 before advancing
    if (companyStep === 1) {
      const valid = await form.trigger(
        "companyName" as keyof RoleDetailsValues,
      );
      if (!valid) return;
    }
    setCompanyStep((s) => Math.min(s + 1, 4));
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
          Complete your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          As a {getRoleLabel()}, we need a few more details
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Student Fields */}
          {role === "student" && (
            <>
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      College
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={colleges}
                        value={showCustomCollege ? "others" : field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomCollege(false);
                          form.setValue("customCollege", "");
                        }}
                        placeholder="Select your college"
                        searchPlaceholder="Search colleges..."
                        disabled={isLoading || isLoadingColleges}
                        onCreateNew={(searchTerm) => {
                          field.onChange("others");
                          form.setValue("customCollege", searchTerm);
                          setShowCustomCollege(true);
                        }}
                        createNewText="Others"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomCollege && (
                <FormField
                  control={form.control}
                  name="customCollege"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        College Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your college name"
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Department
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={departments}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select your department"
                        searchPlaceholder="Search departments..."
                        disabled={isLoading || isLoadingDepartments}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Graduation Year
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2025"
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Enabler Fields */}
          {role === "enabler" && (
            <>
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      College
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={colleges}
                        value={showCustomCollege ? "others" : field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomCollege(false);
                          form.setValue("customCollege", "");
                        }}
                        placeholder="Select your college"
                        searchPlaceholder="Search colleges..."
                        disabled={isLoading || isLoadingColleges}
                        onCreateNew={(searchTerm) => {
                          field.onChange("others");
                          form.setValue("customCollege", searchTerm);
                          setShowCustomCollege(true);
                        }}
                        createNewText="Others"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomCollege && (
                <FormField
                  control={form.control}
                  name="customCollege"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        College Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your college name"
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          {/* Mentor Fields */}
          {role === "mentor" && (
            <>
              {/* Organization Type Selection */}
              <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Organization Type
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange("College");
                            setMentorOrgType("College");
                          }}
                          className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                            field.value === "College"
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                          }`}
                          disabled={isLoading}
                        >
                          College
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange("Company");
                            setMentorOrgType("Company");
                          }}
                          className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                            field.value === "Company"
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                          }`}
                          disabled={isLoading}
                        >
                          Company
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organization Selection */}
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {mentorOrgType === "College" ? "College" : "Organization"}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={
                          mentorOrgType === "College" ? colleges : companies
                        }
                        value={showCustomOrganization ? "others" : field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomOrganization(false);
                          form.setValue("customOrganization", "");
                        }}
                        placeholder={`Select your ${mentorOrgType === "College" ? "college" : "organization"}`}
                        searchPlaceholder={`Search ${mentorOrgType === "College" ? "colleges" : "organizations"}...`}
                        disabled={
                          isLoading ||
                          (mentorOrgType === "College"
                            ? isLoadingColleges
                            : isLoadingCompanies)
                        }
                        onCreateNew={(searchTerm) => {
                          field.onChange("others");
                          form.setValue("customOrganization", searchTerm);
                          setShowCustomOrganization(true);
                        }}
                        createNewText="Others"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomOrganization && (
                <FormField
                  control={form.control}
                  name="customOrganization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {mentorOrgType === "College"
                          ? "College Name"
                          : "Organization Name"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter your ${mentorOrgType === "College" ? "college" : "organization"} name`}
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Conditional Fields for College Type */}
              {mentorOrgType === "College" && (
                <>
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Department
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={departments}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select your department"
                            searchPlaceholder="Search departments..."
                            disabled={isLoading || isLoadingDepartments}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Graduation Year
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2026"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            min={2020}
                            max={2040}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : undefined,
                              )
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </>
          )}

          {/* Company Fields — Stepper */}
          {role === "company" && (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-2">
                {COMPANY_STEPS.map((label, i) => {
                  const stepNum = i + 1;
                  const isActive = companyStep === stepNum;
                  const isDone = companyStep > stepNum;
                  return (
                    <div
                      key={label}
                      className="flex items-center flex-1 last:flex-none"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                            isDone
                              ? "bg-primary text-primary-foreground"
                              : isActive
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isDone ? "✓" : stepNum}
                        </div>
                        <span
                          className={`text-[10px] whitespace-nowrap ${isActive ? "text-primary font-medium" : "text-gray-400"}`}
                        >
                          {label}
                        </span>
                      </div>
                      {i < COMPANY_STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 mx-1 mb-4 transition-colors ${isDone ? "bg-primary" : "bg-gray-200"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Basic Info */}
              {companyStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your company name"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Description{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of your company"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industrySector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Industry Sector{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Technology, Healthcare, Finance"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Company Size{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={COMPANY_SIZE_OPTIONS}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select company size"
                            searchPlaceholder="Search..."
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 2: Contact & Online Presence */}
              {companyStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="pocPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Contact Phone{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="websiteLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Website{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          LinkedIn{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/company/..."
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 3: Location */}
              {companyStep === 3 && (
                <>
                  <FormField
                    control={form.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Country{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={countryOptions}
                            value={field.value || ""}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCountryId(value || undefined);
                              form.setValue("stateId", "");
                              form.setValue("districtId", "");
                              setSelectedStateId(undefined);
                            }}
                            placeholder="Select country"
                            searchPlaceholder="Search countries..."
                            disabled={isLoading || countries.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          State{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={stateOptions}
                            value={field.value || ""}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedStateId(value || undefined);
                              form.setValue("districtId", "");
                            }}
                            placeholder={
                              selectedCountryId
                                ? "Select state"
                                : "Select country first"
                            }
                            searchPlaceholder="Search states..."
                            disabled={
                              isLoading ||
                              !selectedCountryId ||
                              states.isLoading
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="districtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          District{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={districtOptions}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder={
                              selectedStateId
                                ? "Select district"
                                : "Select state first"
                            }
                            searchPlaceholder="Search districts..."
                            disabled={
                              isLoading ||
                              !selectedStateId ||
                              districts.isLoading
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 4: Legal Information */}
              {companyStep === 4 && (
                <>
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Legal Name{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Official registered legal name"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Registration Number{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., CIN / RoC number"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Tax ID / GSTIN{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., GSTIN / PAN"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verificationDocumentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Verification Document URL{" "}
                          <span className="text-gray-400">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://drive.google.com/..."
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          {role === "company" ? (
            <div className="flex gap-3 mt-6">
              {companyStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                  onClick={() => setCompanyStep((s) => s - 1)}
                >
                  Back
                </Button>
              )}
              {companyStep < 4 ? (
                <Button
                  type="button"
                  variant="default"
                  className="flex-1"
                  disabled={isLoading}
                  onClick={handleCompanyNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="default"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                  Complete Registration
                </Button>
              )}
            </div>
          ) : (
            <Button
              type="submit"
              variant="default"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              Complete Registration
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
