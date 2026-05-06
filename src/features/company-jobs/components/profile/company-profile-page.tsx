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
import { MOCK_COMPANY_EXTENDED } from "../../constants/mock-company-profile";
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

  // Mock fields — remove as backend ships them (#company-profile-extended)
  const mock = MOCK_COMPANY_EXTENDED;

  return (
    <div className="space-y-5">
      <CompanyProfileHeader
        profile={profile}
        activeJobsCount={activeJobs.length}
        isOwnProfile
        foundedYear={mock.founded_year}
        remotePolicy={mock.remote_policy}
      />

      <CompanyJobsSection isOwnProfile ownJobs={isLoadingJobs ? [] : allJobs} />

      <CompanyCultureSection
        cultureText={mock.culture_text}
        techStack={mock.tech_stack}
        perks={mock.perks}
      />

      <CompanyCredibilitySection
        hireCount={mock.hire_count}
        avgKarmaOfHires={mock.avg_karma_of_hires}
        campusEventsCount={mock.campus_events_count}
        memberSince={profile.created_at}
      />

      <CompanyTestimonialsSection testimonials={mock.testimonials} />
    </div>
  );
}
