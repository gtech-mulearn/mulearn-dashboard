"use client";

/**
 * Company Public View
 *
 * 📍 src/features/company-jobs/components/profile/company-public-view.tsx
 *
 * Renders the company profile from a public user profile visit (/dashboard/profile/[muid]).
 * Uses UserProfile data from the public profile API as the source of truth for
 * identity fields; mock data fills company-specific gaps.
 *
 * TODO: Replace with fetchPublicCompanyProfile(profile.company_slug) once the backend
 * returns company_slug in the user-profile/{muid}/ response.
 */

import type { UserProfile } from "@/features/profile/schemas";
import {
  MOCK_COMPANY_EXTENDED,
  MOCK_PUBLIC_JOBS,
} from "../../constants/mock-company-profile";
import type { CompanyProfile } from "../../types";
import { CompanyCredibilitySection } from "./company-credibility-section";
import { CompanyCultureSection } from "./company-culture-section";
import { CompanyJobsSection } from "./company-jobs-section";
import { CompanyProfileHeader } from "./company-profile-header";
import { CompanyTestimonialsSection } from "./company-testimonials-section";

interface CompanyPublicViewProps {
  userProfile: UserProfile;
}

export function CompanyPublicView({ userProfile }: CompanyPublicViewProps) {
  // Bridge UserProfile → CompanyProfile shape for the header.
  // Fields not available from UserProfile are left null.
  const companyProfile: CompanyProfile = {
    id: userProfile.id,
    name: userProfile.full_name,
    slug: userProfile.muid,
    status: "active",
    logo: userProfile.profile_pic ?? null,
    description: null, // TODO: pull from company API when slug is available
    industry_sector: null, // TODO: pull from company API
    website_link: null, // TODO: pull from company API
    email: userProfile.email ?? null,
    location: null, // TODO: pull from company API
    company_size: null, // TODO: pull from company API
    linkedin_url: null, // TODO: pull from company API
    created_at: userProfile.joined,
  };

  const mock = MOCK_COMPANY_EXTENDED;

  return (
    <div className="space-y-5">
      <CompanyProfileHeader
        profile={companyProfile}
        activeJobsCount={MOCK_PUBLIC_JOBS.length}
        isOwnProfile={false}
        foundedYear={mock.founded_year}
        remotePolicy={mock.remote_policy}
      />

      <CompanyJobsSection isOwnProfile={false} publicJobs={MOCK_PUBLIC_JOBS} />

      <CompanyCultureSection
        cultureText={mock.culture_text}
        techStack={mock.tech_stack}
        perks={mock.perks}
      />

      <CompanyCredibilitySection
        hireCount={mock.hire_count}
        avgKarmaOfHires={mock.avg_karma_of_hires}
        campusEventsCount={mock.campus_events_count}
        memberSince={userProfile.joined}
      />

      <CompanyTestimonialsSection testimonials={mock.testimonials} />
    </div>
  );
}
