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

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type CompanyDetailsValues,
  RegisterForm,
  RegisterRoleDetails,
  RegisterRoleSelection,
  type Role,
  useCompanyRegister,
  useRegister,
  useGoogleTempTokenStore,
} from "@/features/auth";
import {
  useColleges,
  useCompanies,
  useCreateOrganization,
  useDepartments,
  useRoles,
  useSelectOrganization,
} from "@/features/onboarding";
import { getApiResponseError } from "@/hooks/use-get-error";

interface RegisterClientProps {
  redirectUri?: string;
  referralId?: string;
  email?: string;
  fullName?: string;
}

type RegistrationStep = "basic" | "role" | "details";

export function RegisterClient({
  redirectUri,
  referralId,
  email,
  fullName,
}: RegisterClientProps) {
  const router = useRouter();

  // Read the Google temp token from Zustand store — written there by
  // useGoogleCallback before redirecting. Consumed + deleted immediately
  // so it only lives in memory for the duration of this signup flow.
  const [tempToken] = useState<string | null>(() => {
    const token = useGoogleTempTokenStore.getState().tempToken;
    if (token) useGoogleTempTokenStore.getState().clearTempToken();
    return token;
  });

  // When a tempToken is present the user authenticated via Google.
  // We already know their email + name — skip the basic-info step.
  const isGoogleSignup = !!tempToken;

  const [step, setStep] = useState<RegistrationStep>(
    isGoogleSignup ? "role" : "basic",
  );

  const [basicData, setBasicData] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(() => {
    if (isGoogleSignup || email || fullName) {
      return {
        fullName: fullName || "",
        email: email || "",
        password: "",
      };
    }
    return null;
  });
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const hasClearedParams = useRef(false);
  useEffect(() => {
    if (hasClearedParams.current) return;
    const newParams = new URLSearchParams(searchParams.toString());
    if (newParams.has("email") || newParams.has("fullName")) {
      newParams.delete("email");
      newParams.delete("fullName");
      const queryString = newParams.toString();

      hasClearedParams.current = true;
      router.replace(
        queryString ? `?${queryString}` : window.location.pathname,
        { scroll: false },
      );
    }
  }, [searchParams, router]);

  // Mutations
  const register = useRegister();
  const companyRegister = useCompanyRegister();
  const createOrganization = useCreateOrganization();
  const selectOrganization = useSelectOrganization();

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
    // Student / Mentor (College type) / Student (Company type)
    department?: string;
    graduationYear?: number;
    // Mentor / Student (Company type)
    organization?: string;
    customOrganization?: string;
    organizationType?: "College" | "Company";
    role?: string;
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
      toast.error(
        getApiResponseError(error, {
          fallback: "Registration failed. Please try again.",
        }),
      );
    }
  };

  // ─── Company signup ──────────────────────────────────────────

  async function handleCompanySignup(values: CompanyDetailsValues) {
    if (!basicData || !values.companyName || !values.companyDescription) return;

    const roleId = roles.getRoleId("Company");
    if (!roleId) {
      throw new Error(
        `Role list has not loaded yet or "Company" not found. Please try again.`,
      );
    }

    // 1. Register the user first to get authenticated
    await register.mutateAsync({
      user: {
        full_name: basicData.fullName,
        email: basicData.email,
        password: basicData.password,
        role: roleId,
      },
      referral: referralId ? { muid: referralId } : undefined,
    });

    // 2. Register the company
    await companyRegister.mutateAsync({
      name: values.companyName,
      description: values.companyDescription,
      logo: values.logo || undefined,
      short_pitch: values.shortPitch || undefined,
      industry_sector: values.industrySector || undefined,
      website_link: values.websiteLink || undefined,
      email: values.email || undefined,
      location: values.location || undefined,
      district_id: values.districtId || undefined,
      state_id: values.stateId || undefined,
      country_id: values.countryId || undefined,
      legal_name: values.legalName || undefined,
      registration_number: values.registrationNumber || undefined,
      tax_id: values.taxId || undefined,
      company_size: values.companySize || undefined,
      linkedin_url: values.linkedinUrl || undefined,
      founded_year: values.foundedYear || undefined,
      remote_policy: values.remotePolicy || undefined,
      culture_text: values.cultureText || undefined,
      tech_stack: values.techStack || undefined,
      perks: values.perks || undefined,
      testimonials: values.testimonials || undefined,
      gallery: values.gallery || undefined,
    });

    toast.success(
      "Company registration submitted! Awaiting admin verification.",
    );

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
    role?: string;
  }) {
    if (!basicData || !selectedRole) return;

    // 1. Resolve role title → DB UUID
    const roleTitle =
      selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
    const roleId = roles.getRoleId(roleTitle);

    if (!roleId) {
      throw new Error(
        `Role list has not loaded yet or "${roleTitle}" not found. Please try again.`,
      );
    }

    // 2. Register the user first — useRegister saves tokens after this resolves,
    //    so subsequent authenticated calls (org creation/selection) will have a valid token.
    const result = await register.mutateAsync({
      user: {
        full_name: basicData.fullName,
        email: basicData.email,
        ...(isGoogleSignup ? {} : { password: basicData.password }),
        role: roleId,
      },
      referral: referralId ? { muid: referralId } : undefined,
      ...(isGoogleSignup && tempToken ? { tempToken } : {}),
    });

    // 3. Now authenticated — handle org linking for student / enabler
    if (selectedRole === "student" || selectedRole === "enabler") {
      if (selectedRole === "student" && values.organizationType === "Company") {
        if (values.organization === "others" && values.customOrganization) {
          await createOrganization.mutateAsync({
            title: values.customOrganization,
            org_type: "Company",
          });
          toast.success("Organization submitted for review!");
        } else if (values.organization) {
          await selectOrganization.mutateAsync({
            organization: values.organization,
            department: null,
            graduation_year: null,
            is_student: true,
          });
        }
      } else {
        if (values.college === "others" && values.customCollege) {
          // Submit unverified org for admin review
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

          await createOrganization.mutateAsync(payload);
          toast.success("College submitted for review!");
        } else if (values.college) {
          await selectOrganization.mutateAsync({
            organization: values.college,
            department: values.department ?? null,
            graduation_year: values.graduationYear ?? null,
            is_student: selectedRole === "student",
          });
        }
      }
    }

    // 4. Handle org linking for mentor
    if (selectedRole === "mentor") {
      if (values.organization === "others" && values.customOrganization) {
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

        await createOrganization.mutateAsync(orgPayload);
        toast.success("Organization submitted for review!");
      } else if (values.organization) {
        await selectOrganization.mutateAsync({
          organization: values.organization,
          department: values.department ?? null,
          graduation_year: values.graduationYear ?? null,
          is_student: false,
        });
      }
    }

    toast.success("Account created successfully!");

    // 5. Navigate to interests onboarding → role-based dashboard redirect
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
    createOrganization.isPending ||
    selectOrganization.isPending;

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
