/**
 * Register Client Component
 *
 * 📍 src/app/(auth)/register/register-client.tsx
 *
 * Orchestrates the 3-step signup flow:
 *   Step 1 — Basic info (name, email, password)
 *   Step 2 — Role selection
 *   Step 3 — Role-specific details
 *
 * Routing after signup:
 *   Company  → POST /api/v1/dashboard/company/create/  → /dashboard  (own verification flow)
 *   Student/Mentor/Enabler → POST /api/v1/register/ → /onboarding/interests → role-based /dashboard
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import {
  type CompanyDetailsValues,
  RegisterForm,
  RegisterRoleDetails,
  RegisterRoleSelection,
  type Role,
  useCompanyRegister,
  useRegister,
} from "@/features/auth";
import {
  useColleges,
  useCompanies,
  useCreateOrganization,
  useDepartments,
  useRoles,
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

  // Mutations
  const register = useRegister();
  const companyRegister = useCompanyRegister();
  const createOrganization = useCreateOrganization();

  // Reference data
  const colleges = useColleges();
  const departments = useDepartments();
  const companies = useCompanies();
  const roles = useRoles(); // for resolving role title → DB UUID

  // ─── Step handlers ──────────────────────────────────────────

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

  // ─── Details submit: diverges by role ───────────────────────

  const handleDetailsSubmit = async (values: {
    // Student / Enabler
    college?: string;
    customCollege?: string;
    // Student / Mentor (College type)
    department?: string;
    graduationYear?: number;
    // Mentor
    organization?: string;
    customOrganization?: string;
    organizationType?: "College" | "Company";
    // Company
    companyName?: string;
    companyDescription?: string;
    industrySector?: string;
    websiteLink?: string;
    pocPhone?: string;
    companyLocation?: string;
  }) => {
    if (!basicData || !selectedRole) return;

    try {
      // ── Company: dedicated endpoint, no role UUID needed ─────
      if (selectedRole === "company") {
        await handleCompanySignup(values);
        return;
      }

      // ── Student / Mentor / Enabler: generic register endpoint ─
      await handleGenericSignup(values);
    } catch (error) {
      console.error("[Registration] Error:", error);
      const message =
        error instanceof ApiError
          ? error.message
          : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  // ─── Company signup ──────────────────────────────────────────

  async function handleCompanySignup(values: CompanyDetailsValues) {
    if (!basicData || !values.companyName) return;

    await companyRegister.mutateAsync({
      name: values.companyName,
      poc_name: basicData.fullName,
      poc_email: basicData.email,
      password: basicData.password,
      poc_phone: values.pocPhone || undefined,
      description: values.companyDescription || undefined,
      industry_sector: values.industrySector || undefined,
      website_link: values.websiteLink || undefined,
      linkedin_url: values.linkedinUrl || undefined,
      company_size: values.companySize || undefined,
      district_id: values.districtId || undefined,
      legal_name: values.legalName || undefined,
      registration_number: values.registrationNumber || undefined,
      tax_id: values.taxId || undefined,
      verification_document_url: values.verificationDocumentUrl || undefined,
    });

    toast.success(
      "Company registration submitted! Awaiting admin verification.",
    );

    // Company users skip interests onboarding — go straight to dashboard.
    // Their dashboard will show the pending verification status.
    router.push("/dashboard");
  }

  // ─── Student / Mentor / Enabler signup ──────────────────────

  async function handleGenericSignup(values: {
    college?: string;
    customCollege?: string;
    department?: string;
    graduationYear?: number;
    organization?: string;
    customOrganization?: string;
    organizationType?: "College" | "Company";
  }) {
    if (!basicData || !selectedRole) return;

    // 1. Resolve role title → DB UUID
    //    Title mapping: "student" → "Student", "mentor" → "Mentor", "enabler" → "Enabler"
    const roleTitle =
      selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
    const roleId = roles.getRoleId(roleTitle);

    if (!roleId) {
      throw new Error(
        `Role list has not loaded yet or "${roleTitle}" not found. Please try again.`,
      );
    }

    // 2. Resolve organization for student / enabler (custom college creation)
    let collegeId = values.college;

    if (
      values.college === "others" &&
      values.customCollege &&
      (selectedRole === "student" || selectedRole === "enabler")
    ) {
      const payload: {
        title: string;
        org_type: "College" | "Company";
        department?: string;
        graduation_year?: string;
      } = { title: values.customCollege, org_type: "College" };

      if (selectedRole === "student") {
        if (values.department) payload.department = values.department;
        if (values.graduationYear)
          payload.graduation_year = values.graduationYear.toString();
      }

      const createResponse = await createOrganization.mutateAsync(payload);
      collegeId = createResponse.response?.id || values.customCollege;
      toast.success("College created successfully!");
    }

    // 3. Resolve organization for mentor (custom org creation)
    let organizationId = values.organization;

    if (
      values.organization === "others" &&
      values.customOrganization &&
      selectedRole === "mentor"
    ) {
      const orgType = values.organizationType || "Company";
      const orgPayload: {
        title: string;
        org_type: "College" | "Company";
        department?: string;
        graduation_year?: string;
      } = { title: values.customOrganization, org_type: orgType };

      if (orgType === "College") {
        if (values.department) orgPayload.department = values.department;
        if (values.graduationYear)
          orgPayload.graduation_year = values.graduationYear.toString();
      }

      const createResponse = await createOrganization.mutateAsync(orgPayload);
      organizationId = createResponse.response?.id || values.customOrganization;
      toast.success("Organization created successfully!");
    }

    // 4. Determine final organization ID
    const finalOrganization =
      selectedRole === "student" || selectedRole === "enabler"
        ? collegeId
        : organizationId;

    // 5. Register the user — role UUID goes inside the `user` object
    const result = await register.mutateAsync({
      user: {
        full_name: basicData.fullName,
        email: basicData.email,
        password: basicData.password,
        role: roleId,
      },
      referral: referralId ? { muid: referralId } : undefined,
      organization: finalOrganization,
      department: values.department,
      graduation_year: values.graduationYear,
    });

    toast.success("Account created successfully!");

    // 6. Navigate to interests onboarding → role-based dashboard redirect
    //    happens inside interests-client.tsx after domains are selected.
    const redirectPath = redirectUri
      ? `/onboarding/interests?ruri=${redirectUri}`
      : "/onboarding/interests";
    router.push(redirectPath);

    return result;
  }

  // ─── Back handlers ───────────────────────────────────────────

  const handleBackToBasic = () => setStep("basic");
  const handleBackToRole = () => setStep("role");

  // ─── Loading state ───────────────────────────────────────────

  const isLoading =
    register.isPending ||
    companyRegister.isPending ||
    createOrganization.isPending;

  // ─── Render ──────────────────────────────────────────────────

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
