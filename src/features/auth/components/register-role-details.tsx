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
import { useEffect, useRef, useState } from "react";
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
import type {
  College,
  Company,
  Department,
} from "@/features/onboarding/schemas";
import type { Role } from "./register-role-selection";

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
const companyDetailsSchema = z.object({
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
  companyDescription: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  industrySector: z.string().min(1, "Please enter the industry sector"),
  websiteLink: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  companyEmail: z.string().email("Please enter a valid email address"),
  companyLocation: z.string().min(3, "Location must be at least 3 characters"),
});

type RoleDetailsValues =
  | z.infer<typeof studentDetailsSchema>
  | z.infer<typeof enablerDetailsSchema>
  | z.infer<typeof mentorDetailsSchema>
  | z.infer<typeof companyDetailsSchema>;

interface RegisterRoleDetailsProps {
  role: Role;
  onSubmit: (values: {
    college?: string;
    customCollege?: string;
    department?: string;
    graduationYear?: number;
    organization?: string;
    customOrganization?: string;
    organizationType?: "College" | "Company";
    companyName?: string;
    companyDescription?: string;
    industrySector?: string;
    websiteLink?: string;
    companyEmail?: string;
    companyLocation?: string;
  }) => void;
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
      websiteLink: "",
      companyEmail: "",
      companyLocation: "",
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

          {/* Company Fields */}
          {role === "company" && (
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
                      Description
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
                      Industry Sector
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
                name="websiteLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Website Link{" "}
                      <span className="text-gray-400">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.example.com"
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
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Company Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@company.com"
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
                name="companyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Kochi, Kerala"
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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            Complete Registration
          </Button>
        </form>
      </Form>
    </div>
  );
}
