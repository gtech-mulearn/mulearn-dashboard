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
    organizationType: z.enum(["College", "Company"]),
    // College fields
    college: z.string().optional(),
    customCollege: z.string().optional(),
    department: z.string().optional(),
    graduationYear: z.number().optional(),
    // Organization fields
    organization: z.string().optional(),
    customOrganization: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.organizationType === "College") {
        return !!data.college && data.college.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please select your college",
      path: ["college"],
    },
  )
  .refine(
    (data) => {
      if (data.organizationType === "College" && data.college === "others") {
        return !!data.customCollege && data.customCollege.trim().length >= 3;
      }
      return true;
    },
    {
      message: "College name must be at least 3 characters",
      path: ["customCollege"],
    },
  )
  .refine(
    (data) => {
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
      if (data.organizationType === "College") {
        return (
          !!data.graduationYear &&
          data.graduationYear >= 2020 &&
          data.graduationYear <= 2040
        );
      }
      return true;
    },
    {
      message: "Year of pass must be between 2020 and 2040",
      path: ["graduationYear"],
    },
  )
  .refine(
    (data) => {
      if (data.organizationType === "Company") {
        return !!data.organization && data.organization.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please select your organization",
      path: ["organization"],
    },
  )
  .refine(
    (data) => {
      if (
        data.organizationType === "Company" &&
        data.organization === "others"
      ) {
        return (
          !!data.customOrganization &&
          data.customOrganization.trim().length >= 3
        );
      }
      return true;
    },
    {
      message: "Organization name must be at least 3 characters",
      path: ["customOrganization"],
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
    organization: z.string().min(1, "Please select your company"),
    customOrganization: z.string().optional(),
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
      message: "Company name must be at least 3 characters",
      path: ["customOrganization"],
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
  companyDescription: z.string().min(1, "Description is required"),
  logo: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  shortPitch: z.string().optional(),
  industrySector: z.string().optional(),
  companySize: z.string().optional(),
  // Contact & Online Presence
  websiteLink: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  linkedinUrl: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .or(z.literal(""))
    .optional(),
  // Location
  location: z.string().optional(),
  countryId: z.string().optional(),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  // Legal Information
  legalName: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  foundedYear: z.number().optional(),
  remotePolicy: z.string().optional(),
  cultureText: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  testimonials: z.array(z.unknown()).optional(),
  gallery: z.array(z.unknown()).optional(),
});

type RoleDetailsValues =
  | z.infer<typeof studentDetailsSchema>
  | z.infer<typeof enablerDetailsSchema>
  | z.infer<typeof mentorDetailsSchema>
  | z.infer<typeof companyDetailsSchema>;

export interface CompanyDetailsValues {
  companyName?: string;
  companyDescription?: string;
  logo?: string;
  shortPitch?: string;
  industrySector?: string;
  companySize?: string;
  websiteLink?: string;
  email?: string;
  linkedinUrl?: string;
  location?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  foundedYear?: number;
  remotePolicy?: string;
  cultureText?: string;
  techStack?: string[];
  perks?: string[];
  testimonials?: unknown[];
  gallery?: unknown[];
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
      role?: string;
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
  onCollegeSearchChange?: (search: string) => void;
  onDepartmentSearchChange?: (search: string) => void;
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
  onCollegeSearchChange,
  onDepartmentSearchChange,
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
        organizationType: "College" as const,
        college: "",
        customCollege: "",
        department: "",
        graduationYear: undefined as number | undefined,
        organization: "",
        customOrganization: "",
      };
    }
    if (role === "enabler") {
      return { college: "", customCollege: "" };
    }
    if (role === "mentor") {
      return {
        organization: "",
        customOrganization: "",
      };
    }
    return {
      companyName: "",
      companyDescription: "",
      logo: "",
      shortPitch: "",
      industrySector: "",
      companySize: "",
      websiteLink: "",
      email: "",
      linkedinUrl: "",
      location: "",
      countryId: "",
      stateId: "",
      districtId: "",
      legalName: "",
      registrationNumber: "",
      taxId: "",
      foundedYear: undefined,
      remotePolicy: "",
      cultureText: "",
      techStack: [],
      perks: [],
      testimonials: [],
      gallery: [],
    };
  };

  const form = useForm<RoleDetailsValues>({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  // Track if "Others" is selected
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomOrganization, setShowCustomOrganization] = useState(false);
  const [studentOrgType, setStudentOrgType] = useState<"College" | "Company">(
    "College",
  );

  // Company stepper state
  const [companyStep, setCompanyStep] = useState(1);
  const COMPANY_STEPS = ["Basic Info", "Contact", "Location", "Legal Info"];

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
        return "Learner";
      case "mentor":
        return "Mentor";
      case "enabler":
        return "Enabler";
      case "company":
        return "Company";
    }
  };

  // Fields collected on each step of the company stepper — validated with
  // form.trigger before the user is allowed to advance.
  const COMPANY_STEP_FIELDS: Record<number, (keyof CompanyDetailsValues)[]> = {
    1: [
      "companyName",
      "logo",
      "companyDescription",
      "shortPitch",
      "industrySector",
      "companySize",
    ],
    2: ["email", "websiteLink", "linkedinUrl"],
    3: ["location", "countryId", "stateId", "districtId"],
    4: [
      "legalName",
      "registrationNumber",
      "taxId",
      "foundedYear",
      "remotePolicy",
      "cultureText",
    ],
  };

  const handleCompanyNext = async () => {
    const fields = COMPANY_STEP_FIELDS[companyStep];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setCompanyStep((s) => Math.min(s + 1, 4));
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
                            setStudentOrgType("College");
                          }}
                          className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                            studentOrgType === "College"
                              ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                              : "border-border bg-muted text-muted-foreground hover:border-border/80"
                          }`}
                          disabled={isLoading}
                        >
                          College
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange("Company");
                            setStudentOrgType("Company");
                          }}
                          className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                            studentOrgType === "Company"
                              ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                              : "border-border bg-muted text-muted-foreground hover:border-border/80"
                          }`}
                          disabled={isLoading}
                        >
                          Organization
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {studentOrgType === "College" ? (
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
                            disabled={isLoading}
                            onSearchChange={onCollegeSearchChange}
                            loading={isLoadingColleges}
                            emptyText="Type your college to search"
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
                              className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                            disabled={isLoading}
                            onSearchChange={onDepartmentSearchChange}
                            loading={isLoadingDepartments}
                            emptyText="Type at least 2 characters to search"
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
                          Year of Pass
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2025"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Organization Name
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={companies}
                            value={
                              showCustomOrganization ? "others" : field.value
                            }
                            onValueChange={(value) => {
                              field.onChange(value);
                              setShowCustomOrganization(false);
                              form.setValue("customOrganization", "");
                            }}
                            placeholder="Select your organization"
                            searchPlaceholder="Search organizations..."
                            disabled={isLoading || isLoadingCompanies}
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
                            Organization Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your organization name"
                              className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                        disabled={isLoading}
                        onSearchChange={onCollegeSearchChange}
                        loading={isLoadingColleges}
                        emptyText="Type at least 2 characters to search"
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
                          className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Company
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={companies}
                        value={showCustomOrganization ? "others" : field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomOrganization(false);
                          form.setValue("customOrganization", "");
                        }}
                        placeholder="Select your company"
                        searchPlaceholder="Search companies..."
                        disabled={isLoading || isLoadingCompanies}
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
                        Company Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company name"
                          className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDone ? "✓" : stepNum}
                        </div>
                        <span
                          className={`text-[10px] whitespace-nowrap ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}
                        >
                          {label}
                        </span>
                      </div>
                      {i < COMPANY_STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 mx-1 mb-4 transition-colors ${isDone ? "bg-primary" : "bg-border"}`}
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
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Logo URL{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/logo.png"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of your company"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                    name="shortPitch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Short Pitch{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="A short pitch under 150 words"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Technology, Healthcare, Finance"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Contact Email{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@acme.com"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/company/..."
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Location{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Kochi, Kerala"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Country{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Official registered legal name"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., CIN / RoC number"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., GSTIN / PAN"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Founded Year{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2018"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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

                  <FormField
                    control={form.control}
                    name="remotePolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Remote Policy{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Hybrid, Fully Remote"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                    name="cultureText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Culture Text{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., We move fast and care deeply."
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
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
                  key="next-btn"
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
                  key="submit-btn"
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
