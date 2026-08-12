/**
 * Register Role Details Form Component
 *
 * 📍 src/features/auth/components/register-role-details.tsx
 *
 * Step 3: Role-specific details (conditional fields based on role)
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
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

const REMOTE_POLICY_OPTIONS = [
  { id: "Onsite", title: "Onsite" },
  { id: "Hybrid", title: "Hybrid" },
  { id: "Remote", title: "Remote" },
];

const INDUSTRY_SECTOR_OPTIONS = [
  { id: "Software", title: "Software & Technology" },
  { id: "Financial Services", title: "Financial Services & Fintech" },
  { id: "Healthcare", title: "Healthcare & Life Sciences" },
  { id: "E-Commerce", title: "E-Commerce & Retail" },
  { id: "Education", title: "Education & EdTech" },
  { id: "Manufacturing", title: "Manufacturing & Industrial" },
  {
    id: "Artificial Intelligence",
    title: "Artificial Intelligence & Robotics",
  },
  { id: "Consulting", title: "Consulting & Professional Services" },
  { id: "Media & Entertainment", title: "Media & Entertainment" },
  { id: "Telecommunications", title: "Telecommunications" },
  { id: "Other", title: "Other" },
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
    organization: z.string().optional(),
    customOrganization: z.string().optional(),
    isFreelancer: z.boolean().optional(),
    mentorType: z.enum(["ig", "company"]).optional(),
  })
  .refine(
    (data) => {
      // Non-freelancer must select a company (for both IG mentor and Company mentor)
      if (!data.isFreelancer) {
        return !!data.organization && data.organization.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please select your company",
      path: ["organization"],
    },
  )
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
// collected here. This form collects company-level details across 5 logical steps.
const companyDetailsSchema = z
  .object({
    // Basic Information
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(75, "Max 75 characters"),
    companyDescription: z.string().trim().min(1, "Description is required"),
    shortPitch: z.string().optional(),
    email: z
      .string()
      .email("Invalid email address")
      .or(z.literal(""))
      .optional(),
    websiteLink: z
      .string()
      .url("Please enter a valid URL (e.g. https://example.com)")
      .or(z.literal(""))
      .optional(),
    linkedinUrl: z
      .string()
      .url("Please enter a valid LinkedIn URL")
      .or(z.literal(""))
      .optional(),

    // Legal Information
    legalName: z.string().optional(),
    registrationNumber: z.string().optional(),
    taxId: z.string().optional(),
    verificationDocument: z.custom<File | null | undefined>().optional(),
    verification_document_url: z.string().optional(),

    // Company Details
    industrySector: z.string().optional(),
    companySize: z.string().optional(),
    foundedYear: z.number().optional(),
    location: z.string().optional(),
    countryId: z.string().optional(),
    stateId: z.string().optional(),
    districtId: z.string().optional(),

    // Culture & Hiring
    remotePolicy: z.string().optional(),
    cultureText: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    perks: z.string().optional(),
    testimonials: z.string().optional(),

    // Media
    logo: z.string().optional(),
    logoFile: z.custom<File | null | undefined>().optional(),
    gallery: z.array(z.string()).optional(),
    galleryFiles: z.array(z.custom<File>()).optional(),
  })
  .refine(
    (data) =>
      (data.verification_document_url &&
        data.verification_document_url.trim().length > 0) ||
      data.verificationDocument instanceof File,
    {
      message:
        "Please provide a verification document URL or upload a verification document",
      path: ["verification_document_url"],
    },
  );

type RoleDetailsValues =
  | z.infer<typeof studentDetailsSchema>
  | z.infer<typeof enablerDetailsSchema>
  | z.infer<typeof mentorDetailsSchema>
  | z.infer<typeof companyDetailsSchema>;

export interface CompanyDetailsValues {
  // Basic Information
  companyName?: string;
  companyDescription?: string;
  shortPitch?: string;
  email?: string;
  websiteLink?: string;
  linkedinUrl?: string;

  // Legal Information
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  verificationDocument?: File | null;
  verification_document_url?: string;

  // Company Details
  industrySector?: string;
  companySize?: string;
  foundedYear?: number;
  location?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;

  // Culture & Hiring
  remotePolicy?: string;
  cultureText?: string;
  techStack?: string[];
  perks?: string;
  testimonials?: string;

  // Media
  logo?: string;
  logoFile?: File | null;
  gallery?: string[];
  galleryFiles?: File[];
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
      mentorType?: "ig" | "company";
      isFreelancer?: boolean;
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
        isFreelancer: false,
        mentorType: "ig" as const,
      };
    }
    return {
      companyName: "",
      companyDescription: "",
      shortPitch: "",
      email: "",
      websiteLink: "",
      linkedinUrl: "",
      legalName: "",
      registrationNumber: "",
      taxId: "",
      verificationDocument: null,
      verification_document_url: "",
      industrySector: "",
      companySize: "",
      foundedYear: undefined,
      location: "",
      countryId: "",
      stateId: "",
      districtId: "",
      remotePolicy: "",
      cultureText: "",
      techStack: [],
      perks: "",
      testimonials: "",
      logo: "",
      logoFile: null,
      gallery: [],
      galleryFiles: [],
    };
  };

  const form = useForm<RoleDetailsValues>({
    resolver: zodResolver(
      getSchema(),
    ) as unknown as Resolver<RoleDetailsValues>,
    defaultValues: getDefaultValues(),
  });

  // Track if "Others" is selected
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomOrganization, setShowCustomOrganization] = useState(false);
  const [studentOrgType, setStudentOrgType] = useState<"College" | "Company">(
    "College",
  );

  // Mentor-specific: freelancer toggle & mentor type selection
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [mentorType, setMentorType] = useState<"ig" | "company">("ig");

  // Company stepper state
  const [companyStep, setCompanyStep] = useState(1);
  const COMPANY_STEPS = [
    "Basic Info",
    "Legal Info",
    "Details",
    "Culture",
    "Media",
  ];

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
    // For company, only submit on the final step (step 5) — pressing Enter on earlier
    // steps should advance to the next step, not submit the form.
    if (role === "company" && companyStep < 5) {
      void handleCompanyNext();
      return;
    }
    const payload = values as Parameters<
      RegisterRoleDetailsProps["onSubmit"]
    >[0];
    // Explicitly forward the mentor type selection (from local React state)
    // so that the parent can persist it before routing away.
    if (role === "mentor") {
      payload.mentorType = mentorType;
      payload.isFreelancer = isFreelancer;
    }
    onSubmit(payload);
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
      "companyDescription",
      "shortPitch",
      "email",
      "websiteLink",
      "linkedinUrl",
    ],
    2: [
      "legalName",
      "registrationNumber",
      "taxId",
      "verification_document_url",
      "verificationDocument",
    ],
    3: [
      "industrySector",
      "companySize",
      "foundedYear",
      "location",
      "countryId",
      "stateId",
      "districtId",
    ],
    4: ["remotePolicy", "cultureText", "techStack", "perks", "testimonials"],
    5: ["logo", "logoFile", "gallery", "galleryFiles"],
  };

  const handleCompanyNext = async () => {
    const fields = COMPANY_STEP_FIELDS[companyStep];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setCompanyStep((s) => Math.min(s + 1, 5));
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === companyStep) return;
    if (targetStep > companyStep) {
      for (let s = companyStep; s < targetStep; s++) {
        const fieldsToValidate = COMPANY_STEP_FIELDS[s];
        const validStep = await form.trigger(fieldsToValidate);
        if (!validStep) {
          setCompanyStep(s);
          return;
        }
      }
    }
    setCompanyStep(targetStep);
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
                            emptyText="Type your department to search"
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
            </>
          )}

          {/* Mentor Fields */}
          {role === "mentor" && (
            <>
              {/* Freelancer Toggle */}
              <div className="flex items-center justify-between py-2 my-2">
                <p className="text-sm font-semibold text-foreground">
                  Are you a FREELANCER?
                </p>
                <Switch
                  checked={isFreelancer}
                  onCheckedChange={(checked) => {
                    setIsFreelancer(checked);
                    form.setValue("isFreelancer", checked);
                    if (checked) {
                      // Freelancer → IG mentor only, clear company
                      setMentorType("ig");
                      form.setValue("mentorType", "ig");
                      form.setValue("organization", "");
                      form.setValue("customOrganization", "");
                      setShowCustomOrganization(false);
                    } else {
                      setMentorType("ig");
                      form.setValue("mentorType", "ig");
                    }
                  }}
                  disabled={isLoading}
                />
              </div>

              {/* Mentor Type Cards */}
              <div className="space-y-3">
                {/* IG Mentor card — always visible */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setMentorType("ig");
                    form.setValue("mentorType", "ig");
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                    mentorType === "ig" || isFreelancer
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card shadow-sm hover:border-primary/30"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl shrink-0">👨‍🏫</span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-base font-medium ${
                        mentorType === "ig" || isFreelancer
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      IG Mentor
                    </span>
                    <span
                      className={`block text-xs mt-0.5 leading-snug ${
                        mentorType === "ig" || isFreelancer
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      I guide and support learners independently through
                      interest groups.
                    </span>
                  </span>
                  {(mentorType === "ig" || isFreelancer) && (
                    <span className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                </button>

                {/* Company Mentor card — hidden when freelancer */}
                {!isFreelancer && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setMentorType("company");
                      form.setValue("mentorType", "company");
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                      mentorType === "company"
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-card shadow-sm hover:border-primary/30"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-2xl shrink-0">🏢</span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-base font-medium ${
                          mentorType === "company"
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        Company Mentor
                      </span>
                      <span
                        className={`block text-xs mt-0.5 leading-snug ${
                          mentorType === "company"
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        I mentor as a company employee. I&apos;ll select my
                        company during setup.
                      </span>
                    </span>
                    {mentorType === "company" && (
                      <span className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center shrink-0">
                        <svg
                          className="w-3 h-3 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Company combobox — visible for all mentors when toggle is off */}
              {!isFreelancer && (
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
                            value={
                              showCustomOrganization ? "others" : field.value
                            }
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
            </>
          )}

          {/* Company Fields — Stepper */}
          {/* Company Fields */}
          {role === "company" && (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-2 overflow-x-auto pb-1">
                {COMPANY_STEPS.map((label, i) => {
                  const stepNum = i + 1;
                  const isActive = companyStep === stepNum;
                  const isDone = companyStep > stepNum;
                  return (
                    <div
                      key={label}
                      className="flex items-center flex-1 min-w-16 last:flex-none"
                    >
                      <button
                        type="button"
                        onClick={() => handleStepClick(stepNum)}
                        className="flex flex-col items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1 w-full"
                        aria-label={`Go to step ${stepNum}: ${label}`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
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
                          className={`text-[10px] text-center line-clamp-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}
                        >
                          {label}
                        </span>
                      </button>
                      {i < COMPANY_STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 mx-1 mb-4 transition-colors ${isDone ? "bg-primary" : "bg-border"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Basic Information */}
              {companyStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Company Name{" "}
                          <span className="text-destructive">*</span>
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
                    name="companyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Description{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your company, mission, and core offerings"
                            className="min-h-24 rounded-xl border-border bg-muted/50 p-3 text-sm"
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
                          <Textarea
                            placeholder="A concise elevator pitch under 150 words"
                            className="min-h-20 rounded-xl border-border bg-muted/50 p-3 text-sm"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Company Email{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="hr@acme.com"
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
                          Website Link{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://acme.com"
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
                          LinkedIn URL{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/company/acme"
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

              {/* Step 2: Legal Information */}
              {companyStep === 2 && (
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
                            placeholder="Official registered legal name (e.g. Acme Corp Pvt Ltd)"
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
                            placeholder="e.g., CIN / RoC / Registration number"
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
                            placeholder="e.g., GSTIN000 / PAN"
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
                    name="verification_document_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Verification Document URL{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://drive.google.com/... or document URL"
                            className="h-12 rounded-xl border-border bg-muted/50 px-4"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Provide a direct or cloud link (Google Drive, Cloud
                          storage, etc.) to your Certificate of Incorporation or
                          GST Certificate.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verificationDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Or Upload Verification Document
                        </FormLabel>
                        <FormControl>
                          <FileUpload
                            value={field.value ?? null}
                            onChange={(file) => {
                              field.onChange(file);
                              if (
                                file &&
                                !form.getValues("verification_document_url")
                              ) {
                                form.setValue(
                                  "verification_document_url",
                                  `https://mulearn.org/documents/${encodeURIComponent(file.name)}`,
                                  { shouldValidate: true },
                                );
                              }
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSizeMB={10}
                            disabled={isLoading}
                            placeholder="Upload verification document (PDF, JPG, PNG)"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Upload certificate of incorporation, GST certificate,
                          or official company registration document (PDF, JPG,
                          PNG up to 10MB).
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 3: Company Details */}
              {companyStep === 3 && (
                <>
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
                          <Combobox
                            options={INDUSTRY_SECTOR_OPTIONS}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select industry sector"
                            searchPlaceholder="Search sector..."
                            disabled={isLoading}
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
                            placeholder="Select company size (e.g. 51-200)"
                            searchPlaceholder="Search..."
                            disabled={isLoading}
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
                            min={1800}
                            max={new Date().getFullYear()}
                            placeholder="e.g., 2015"
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
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            placeholder="City / Headquarters (e.g., Bengaluru)"
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

              {/* Step 4: Culture & Hiring */}
              {companyStep === 4 && (
                <>
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
                          <Combobox
                            options={REMOTE_POLICY_OPTIONS}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select remote policy (Onsite, Hybrid, Remote)"
                            searchPlaceholder="Search policy..."
                            disabled={isLoading}
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
                          <Textarea
                            placeholder="Describe your company culture, team values, and working style..."
                            className="min-h-24 rounded-xl border-border bg-muted/50 p-3 text-sm"
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
                    name="techStack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Tech Stack{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Type skill (e.g. Python, React, Kubernetes) and press Enter"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Press Enter or comma to add technologies your team
                          uses.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="perks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Perks & Benefits{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Health insurance, stock options, flexible hours, annual offsites..."
                            className="min-h-20 rounded-xl border-border bg-muted/50 p-3 text-sm"
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
                    name="testimonials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Testimonials{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="&quot;Great place to grow and build scalable systems&quot; — Alumnus"
                            className="min-h-20 rounded-xl border-border bg-muted/50 p-3 text-sm"
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

              {/* Step 5: Media */}
              {companyStep === 5 && (
                <>
                  <FormField
                    control={form.control}
                    name="logoFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Company Logo{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value ?? null}
                            onChange={(file) => field.onChange(file)}
                            disabled={isLoading}
                            maxSizeMB={5}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Upload company logo (PNG, JPG, WebP up to 5MB).
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="galleryFiles"
                    render={({ field }) => {
                      const files: File[] = field.value || [];
                      const handleAddFiles = (
                        e: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        const selected = Array.from(e.target.files || []);
                        const validImages = selected.filter((file) => {
                          if (!file.type.startsWith("image/")) {
                            toast.error(`${file.name} is not an image.`);
                            return false;
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error(
                              `${file.name} is too large (max 10MB).`,
                            );
                            return false;
                          }
                          return true;
                        });
                        field.onChange([...files, ...validImages]);
                        if (e.target) e.target.value = "";
                      };

                      const handleRemoveFile = (targetFile: File) => {
                        field.onChange(files.filter((f) => f !== targetFile));
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center justify-between">
                            <span>Gallery Images</span>
                            <span className="text-muted-foreground">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {files.map((file) => {
                                    const previewUrl =
                                      URL.createObjectURL(file);
                                    const fileKey = `${file.name}-${file.lastModified}-${file.size}`;
                                    return (
                                      <div
                                        key={fileKey}
                                        className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
                                      >
                                        <Image
                                          src={previewUrl}
                                          alt={file.name}
                                          fill
                                          unoptimized
                                          className="object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveFile(file)}
                                          disabled={isLoading}
                                          className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow"
                                          aria-label={`Remove ${file.name}`}
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="absolute bottom-1 left-1 right-1 text-[10px] bg-background/80 px-1 py-0.5 rounded truncate">
                                          {file.name}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              <div>
                                <label
                                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
                                    isLoading
                                      ? "opacity-50 cursor-not-allowed border-muted"
                                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                                  }`}
                                >
                                  <div className="flex flex-col items-center gap-1.5 text-center">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                      {files.length > 0
                                        ? "Add more images"
                                        : "Upload gallery photos"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      PNG, JPG, WebP up to 10MB each
                                    </span>
                                  </div>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    disabled={isLoading}
                                    className="hidden"
                                    onChange={handleAddFiles}
                                  />
                                </label>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
              {companyStep < 5 ? (
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
