/**
 * Register Client Component
 *
 * 📍 src/app/(auth)/register/register-client.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import {
  RegisterForm,
  RegisterRoleDetails,
  RegisterRoleSelection,
  useRegister,
  type Role,
} from "@/features/auth";
import {
  useColleges,
  useCompanies,
  useCreateCompany,
  useCreateOrganization,
  useDepartments,
} from "@/features/onboarding";

interface RegisterClientProps {
  redirectUri?: string;
  referralId?: string;
}

type RegistrationStep = "basic" | "role" | "details";

export function RegisterClient({
  redirectUri,
  referralId,
}: RegisterClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<RegistrationStep>("basic");
  const [basicData, setBasicData] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const register = useRegister();
  const createOrganization = useCreateOrganization();
  const createCompany = useCreateCompany();

  // Fetch organization data
  const colleges = useColleges();
  const departments = useDepartments();
  const companies = useCompanies();

  const handleBasicInfoSubmit = (values: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setBasicData(values);
    setStep("role");
  };

  const handleRoleSubmit = (role: Role) => {
    setSelectedRole(role);
    setStep("details");
  };

  const handleDetailsSubmit = async (values: {
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
  }) => {
    if (!basicData || !selectedRole) return;

    try {
      // 1. Handle custom college creation for students/enablers if "Others" is selected
      let collegeId = values.college;

      if (
        values.college === "others" &&
        values.customCollege &&
        (selectedRole === "student" || selectedRole === "enabler")
      ) {
        // Create College-type organization
        const collegePayload: {
          title: string;
          org_type: "College" | "Company";
          department?: string;
          graduation_year?: string;
        } = {
          title: values.customCollege,
          org_type: "College",
        };

        // Add department and graduation_year for students only
        if (selectedRole === "student") {
          if (values.department) {
            collegePayload.department = values.department;
          }
          if (values.graduationYear) {
            collegePayload.graduation_year = values.graduationYear.toString();
          }
        }

        // Create the custom college
        const createResponse =
          await createOrganization.mutateAsync(collegePayload);

        // Use the created college ID or the title as fallback
        collegeId = createResponse.response?.id || values.customCollege;

        toast.success("College created successfully!");
      }

      // 2. Handle custom organization creation for mentor if "Others" is selected
      let organizationId = values.organization;

      if (
        values.organization === "others" &&
        values.customOrganization &&
        selectedRole === "mentor"
      ) {
        // Determine org_type based on organizationType (default to "Company")
        const orgType = values.organizationType || "Company";

        // Build organization payload
        const orgPayload: {
          title: string;
          org_type: "College" | "Company";
          department?: string;
          graduation_year?: string;
        } = {
          title: values.customOrganization,
          org_type: orgType,
        };

        // Add department and graduation_year for College type mentors
        if (orgType === "College") {
          if (values.department) {
            orgPayload.department = values.department;
          }
          if (values.graduationYear) {
            orgPayload.graduation_year = values.graduationYear.toString();
          }
        }

        // Create the custom organization
        const createResponse = await createOrganization.mutateAsync(orgPayload);

        // Use the created organization ID or the title as fallback
        organizationId =
          createResponse.response?.id || values.customOrganization;

        toast.success("Organization created successfully!");
      }

      // 3. Handle company creation for company role
      if (selectedRole === "company" && values.companyName) {
        const companyPayload = {
          name: values.companyName,
          description: values.companyDescription || "",
          industry_sector: values.industrySector || "",
          website_link: values.websiteLink || "",
          email: values.companyEmail || "",
          location: values.companyLocation || "",
        };

        const companyResponse = await createCompany.mutateAsync(companyPayload);

        // Use the created company ID if available
        organizationId = companyResponse.response?.id || values.companyName;

        toast.success("Company created successfully!");
      }

      // 3. Determine final organization ID based on role
      const finalOrganization =
        selectedRole === "student" || selectedRole === "enabler"
          ? collegeId
          : organizationId;

      // 3. Register the user with all data including role and organization
      await register.mutateAsync({
        user: {
          full_name: basicData.fullName,
          email: basicData.email,
          password: basicData.password,
        },
        referral: referralId ? { muid: referralId } : undefined,
        role: selectedRole,
        organization: finalOrganization,
        department: values.department,
        graduation_year: values.graduationYear,
      });

      toast.success("Account created successfully!");

      // Navigate to interests/pathfinder onboarding
      const redirectPath = redirectUri
        ? `/onboarding/interests?ruri=${redirectUri}`
        : "/onboarding/interests";
      router.push(redirectPath);
    } catch (error) {
      console.error("[Registration] Error occurred:", error);
      console.error("[Registration] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });

      const message =
        error instanceof ApiError
          ? error.message
          : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  const handleBackToBasic = () => {
    setStep("basic");
  };

  const handleBackToRole = () => {
    setStep("role");
  };

  const isLoading =
    register.isPending ||
    createOrganization.isPending ||
    createCompany.isPending;

  // Render the appropriate step
  if (step === "basic") {
    return (
      <RegisterForm
        onSubmit={handleBasicInfoSubmit}
        isLoading={isLoading}
        defaultValues={basicData || undefined}
      />
    );
  }

  if (step === "role") {
    return (
      <RegisterRoleSelection
        onSubmit={handleRoleSubmit}
        onBack={handleBackToBasic}
        isLoading={isLoading}
        defaultValue={selectedRole || undefined}
      />
    );
  }

  if (step === "details" && selectedRole) {
    return (
      <RegisterRoleDetails
        role={selectedRole}
        onSubmit={handleDetailsSubmit}
        onBack={handleBackToRole}
        isLoading={isLoading}
        colleges={colleges.data ?? []}
        departments={departments.data ?? []}
        companies={companies.data ?? []}
        isLoadingColleges={colleges.isLoading}
        isLoadingDepartments={departments.isLoading}
        isLoadingCompanies={companies.isLoading}
      />
    );
  }

  return null;
}
