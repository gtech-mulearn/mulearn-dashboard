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
} from "@/features/auth";
import {
  useCollegeSearch,
  useCompanies,
  useCreateOrganization,
  useDepartmentSearch,
  useRoles,
  useSelectOrganization,
} from "@/features/onboarding";
import { authStore } from "@/lib/auth";

interface RegisterClientProps {
  redirectUri?: string;
  referralId?: string;
  email?: string;
  fullName?: string;
  initialTempToken?: string | null;
}

type RegistrationStep = "basic" | "role" | "details";

export function RegisterClient({
  redirectUri,
  referralId,
  email,
  fullName,
  initialTempToken,
}: RegisterClientProps) {
  const router = useRouter();

  const [tempToken] = useState<string | null>(initialTempToken || null);

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
  const [collegeSearch, setCollegeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const colleges = useCollegeSearch(collegeSearch);
  const departments = useDepartmentSearch(departmentSearch);
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
    // Mentor-specific
    mentorType?: "ig" | "company";
    isFreelancer?: boolean;
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
    } catch {
      // Handled by useRegister/useCompanyRegister/useCreateOrganization/
      // useSelectOrganization's own onError toasts.
    }
  };

  // ─── Company signup ──────────────────────────────────────────

  async function handleCompanySignup(values: CompanyDetailsValues) {
    if (!basicData || !values.companyName || !values.companyDescription) return;

    if (!values.verificationDocument && !values.verification_document_url) {
      toast.error("Please upload a verification document.");
      return;
    }

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
        ...(isGoogleSignup ? {} : { password: basicData.password }),
        role: roleId,
      },
      referral: referralId ? { muid: referralId } : undefined,
      ...(isGoogleSignup && tempToken ? { tempToken } : {}),
    });

    // Helper to normalize URLs to valid http(s):// strings for Django URLValidator
    const normalizeUrl = (url?: string | null): string | undefined => {
      if (!url || typeof url !== "string") return undefined;
      const trimmed = url.trim();
      if (!trimmed || /^(data|blob):/i.test(trimmed)) return undefined;
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    // 2. Prepare verification document URL
    let verificationDocUrl = normalizeUrl(values.verification_document_url);
    if (!verificationDocUrl && values.verificationDocument instanceof File) {
      verificationDocUrl = `https://mulearn.org/documents/${encodeURIComponent(values.verificationDocument.name)}`;
    }

    if (!verificationDocUrl) {
      toast.error(
        "Please provide a valid Verification Document URL or upload a file.",
      );
      return;
    }

    // 3. Logo URL
    const logoUrl = normalizeUrl(values.logo);

    // 4. Gallery URLs
    const galleryUrls: string[] = Array.isArray(values.gallery)
      ? values.gallery
          .map((g) => normalizeUrl(g))
          .filter((g): g is string => typeof g === "string" && g.length > 0)
      : [];

    // 5. Register the company
    await companyRegister.mutateAsync({
      name: values.companyName,
      description: values.companyDescription,
      verification_document_url: verificationDocUrl,
      logo: logoUrl || undefined,
      short_pitch: values.shortPitch || undefined,
      industry_sector: values.industrySector || undefined,
      website_link: normalizeUrl(values.websiteLink) || undefined,
      email: values.email || undefined,
      location: values.location || undefined,
      district_id: values.districtId || undefined,
      state_id: values.stateId || undefined,
      country_id: values.countryId || undefined,
      legal_name: values.legalName || undefined,
      registration_number: values.registrationNumber || undefined,
      tax_id: values.taxId || undefined,
      company_size: values.companySize || undefined,
      linkedin_url: normalizeUrl(values.linkedinUrl) || undefined,
      founded_year: values.foundedYear || undefined,
      remote_policy: values.remotePolicy || undefined,
      culture_text: values.cultureText || undefined,
      tech_stack:
        values.techStack && values.techStack.length > 0
          ? values.techStack
          : undefined,
      perks: values.perks || undefined,
      testimonials: values.testimonials || undefined,
      gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
    });

    toast.success(
      "Company registration submitted! Awaiting admin verification.",
    );

    await authStore.clearTempToken();
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
    mentorType?: "ig" | "company";
    isFreelancer?: boolean;
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
    // Tracks whether a branch-specific success toast already fired below, so
    // the shared "Account created successfully!" toast at the end doesn't
    // duplicate it for the custom-org/college submission paths.
    let orgSubmittedForReview = false;

    if (selectedRole === "student" || selectedRole === "enabler") {
      if (selectedRole === "student" && values.organizationType === "Company") {
        if (values.organization === "others" && values.customOrganization) {
          await createOrganization.mutateAsync({
            title: values.customOrganization,
            org_type: "Company",
          });
          toast.success("Organization submitted for review!");
          orgSubmittedForReview = true;
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
          orgSubmittedForReview = true;
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

    // 4. Handle org linking for mentor + build prefill URL params.
    //    URL params replace the old localStorage approach so commits pass the
    //    Husky no-localStorage rule. The params are relayed through
    //    interests-client.tsx and consumed by MentorOnboardingForm.
    let mentorTier = "";
    let mentorCompany = "";
    let mentorOrgId = "";

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
        orgSubmittedForReview = true;
      } else if (values.organization) {
        await selectOrganization.mutateAsync({
          organization: values.organization,
          department: values.department ?? null,
          graduation_year: values.graduationYear ?? null,
          is_student: false,
        });
      }

      // Build URL prefill params — resolve tier, company name, and org UUID.
      mentorTier =
        values.isFreelancer || values.mentorType === "ig"
          ? "IG_MENTOR"
          : "COMPANY_MENTOR";

      // Resolve company display name and org UUID:
      //  • custom entry → typed text (no UUID yet, pending admin review)
      //  • existing company selected → look up title + use the ID as the UUID
      if (values.organization === "others" && values.customOrganization) {
        mentorCompany = values.customOrganization;
      } else if (values.organization) {
        mentorOrgId = values.organization;
        mentorCompany =
          companies.data?.find((c) => c.id === values.organization)?.title ??
          "";
      }
    }

    if (!orgSubmittedForReview) {
      toast.success("Account created successfully!");
    }

    await authStore.clearTempToken();

    // 5. Navigate to interests onboarding → role-based dashboard redirect
    //    happens inside interests-client.tsx after domains are selected.
    //    encodeURIComponent is required: a ruri can carry its own query string
    //    (e.g. dashboard/connect-discord?code=…) which would otherwise be
    //    parsed as sibling params here and lost.
    //
    //    Mentor prefill data (tier, company, org_id) is forwarded as URL params
    //    instead of localStorage so commits pass the Husky no-localStorage rule.
    const mentorParams = new URLSearchParams();
    if (mentorTier) mentorParams.set("mentor_tier", mentorTier);
    if (mentorCompany) mentorParams.set("mentor_company", mentorCompany);
    if (mentorOrgId) mentorParams.set("mentor_org_id", mentorOrgId);
    const mentorQuery = mentorParams.toString();

    const redirectPath = redirectUri
      ? `/onboarding/interests?ruri=${encodeURIComponent(redirectUri)}${
          mentorQuery ? `&${mentorQuery}` : ""
        }`
      : mentorQuery
        ? `/onboarding/interests?${mentorQuery}`
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
        onBack={isGoogleSignup ? undefined : handleBackToBasic}
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
        isLoadingColleges={colleges.isFetching}
        isLoadingDepartments={departments.isFetching}
        isLoadingCompanies={companies.isLoading}
        onCollegeSearchChange={setCollegeSearch}
        onDepartmentSearchChange={setDepartmentSearch}
      />
    );
  }

  return null;
}
