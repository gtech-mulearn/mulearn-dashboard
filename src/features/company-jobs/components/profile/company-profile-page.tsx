"use client";

/**
 * Company Profile Page — Own Profile View
 *
 * 📍 src/features/company-jobs/components/profile/company-profile-page.tsx
 *
 * Full-page assembler for a company's own authenticated profile.
 * Renders real API data for profile + jobs; uses MOCK_COMPANY_EXTENDED
 * for fields not yet returned by the backend.
 *
 * Rendered at /dashboard/profile when the logged-in user has ROLES.COMPANY.
 */

import Loader from "@/app/loading";
import { useCompanyProfile } from "../../hooks/use-company-profile";
import { useJobs } from "../../hooks/use-jobs";
import { CompanyCredibilitySection } from "./company-credibility-section";
import { CompanyCultureSection } from "./company-culture-section";
import { CompanyJobsSection } from "./company-jobs-section";
import { CompanyProfileHeader } from "./company-profile-header";
import { CompanyTestimonialsSection } from "./company-testimonials-section";

export function CompanyProfilePage() {
  const { profile, isLoading: isLoadingProfile } = useCompanyProfile();
  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({
    pageIndex: 1,
    perPage: 50,
  });

  if (isLoadingProfile) return <Loader />;
  if (!profile) return null;

  const allJobs = jobsData?.jobs ?? [];
  const activeJobs = allJobs.filter((j) => j.status === "Active");

  return (
    <div className="space-y-5">
      <CompanyProfileHeader
        profile={profile}
        activeJobsCount={activeJobs.length}
        isOwnProfile
        foundedYear={profile.founded_year ?? null}
        remotePolicy={profile.remote_policy ?? null}
      />

      <CompanyJobsSection isOwnProfile ownJobs={isLoadingJobs ? [] : allJobs} />

      <CompanyCultureSection
        cultureText={profile.culture_text ?? null}
        techStack={profile.tech_stack ?? []}
        perks={profile.perks ?? []}
      />

      <CompanyCredibilitySection
        hireCount={profile.hire_count ?? 0}
        avgKarmaOfHires={profile.avg_karma_of_hires ?? 0}
        campusEventsCount={profile.campus_events_count ?? 0}
        memberSince={profile.created_at}
      />

      <CompanyTestimonialsSection testimonials={profile.testimonials ?? []} />
    </div>
  );
}
