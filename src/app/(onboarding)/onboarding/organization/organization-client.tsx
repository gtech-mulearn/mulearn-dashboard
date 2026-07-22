/**
 * Organization Client Component
 *
 * 📍 src/app/(onboarding)/onboarding/organization/organization-client.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  OrganizationForm,
  useCollegeSearch,
  useCompanies,
  useDepartmentSearch,
  useSelectOrganization,
} from "@/features/onboarding";

interface OrganizationClientProps {
  redirectUri?: string;
}

export function OrganizationClient({ redirectUri }: OrganizationClientProps) {
  const router = useRouter();

  const [collegeSearch, setCollegeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const colleges = useCollegeSearch(collegeSearch);
  const departments = useDepartmentSearch(departmentSearch);
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
    } catch {
      // Handled by useSelectOrganization's onError toast.
    }
  };

  return (
    <OrganizationForm
      colleges={colleges.data ?? []}
      departments={departments.data ?? []}
      companies={companies.data ?? []}
      isLoadingColleges={colleges.isFetching}
      isLoadingDepartments={departments.isFetching}
      isLoadingCompanies={companies.isLoading}
      onCollegeSearchChange={setCollegeSearch}
      onDepartmentSearchChange={setDepartmentSearch}
      onSubmit={handleSubmit}
      isLoading={selectOrganization.isPending}
    />
  );
}
