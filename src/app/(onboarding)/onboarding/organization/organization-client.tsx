/**
 * Organization Client Component
 *
 * 📍 src/app/(onboarding)/onboarding/organization/organization-client.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  OrganizationForm,
  useColleges,
  useCompanies,
  useDepartments,
  useSelectOrganization,
} from "@/features/onboarding";

interface OrganizationClientProps {
  redirectUri?: string;
}

export function OrganizationClient({ redirectUri }: OrganizationClientProps) {
  const router = useRouter();

  const colleges = useColleges();
  const departments = useDepartments();
  const companies = useCompanies();
  const selectOrganization = useSelectOrganization();

  const handleSubmit = async (values: {
    organization: string;
    department?: string;
    graduationYear?: number;
    isStudent: boolean;
  }) => {
    try {
      await selectOrganization.mutateAsync({
        organization: values.organization,
        department: values.department || null,
        graduation_year: values.graduationYear || null,
        is_student: values.isStudent,
      });

      toast.success("Organization saved!");

      // Navigate to interests/pathway selection
      const nextPath = redirectUri
        ? `/onboarding/interests?ruri=${redirectUri}`
        : "/onboarding/interests";
      router.push(nextPath);
    } catch (error) {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to save organization. Please try again.",
        }),
      );
    }
  };

  return (
    <OrganizationForm
      colleges={colleges.data ?? []}
      departments={departments.data ?? []}
      companies={companies.data ?? []}
      isLoadingColleges={colleges.isLoading}
      isLoadingDepartments={departments.isLoading}
      isLoadingCompanies={companies.isLoading}
      onSubmit={handleSubmit}
      isLoading={selectOrganization.isPending}
    />
  );
}
