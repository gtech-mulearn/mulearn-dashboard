"use client";

import type { UserProfile } from "@/features/profile/schemas";
import { usePublicCompanyJobs, usePublicCompanyProfile } from "../../hooks";
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
  // Pre-existing: muid used as company slug — backend must match
  const slug = userProfile.muid;
  const {
    data: apiProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = usePublicCompanyProfile(slug);
  const { data: jobsData, isLoading: jobsLoading } = usePublicCompanyJobs(slug);

  if (profileLoading || jobsLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        Failed to load company profile
      </div>
    );
  }

  const companyProfile: CompanyProfile = apiProfile ?? {
    id: userProfile.id,
    name: userProfile.full_name,
    slug: userProfile.muid,
    logo: userProfile.profile_pic ?? null,
    description: null,
    industry_sector: null,
    website_link: null,
    email: userProfile.email ?? null,
    location: null,
    company_size: null,
    linkedin_url: null,
    created_at: userProfile.joined,
  };

  const publicJobs = jobsData?.jobs ?? [];

  return (
    <div className="space-y-5">
      <CompanyProfileHeader
        profile={companyProfile}
        activeJobsCount={jobsData?.pagination.count ?? publicJobs.length}
        isOwnProfile={false}
        foundedYear={apiProfile?.founded_year ?? null}
        remotePolicy={apiProfile?.remote_policy ?? null}
      />

      <CompanyJobsSection isOwnProfile={false} publicJobs={publicJobs} />

      <CompanyCultureSection
        cultureText={apiProfile?.culture_text ?? null}
        techStack={apiProfile?.tech_stack ?? []}
        perks={apiProfile?.perks ?? []}
      />

      <CompanyCredibilitySection
        hireCount={apiProfile?.hire_count ?? 0}
        avgKarmaOfHires={apiProfile?.avg_karma_of_hires ?? 0}
        campusEventsCount={apiProfile?.campus_events_count ?? 0}
        memberSince={userProfile.joined}
      />

      <CompanyTestimonialsSection
        testimonials={apiProfile?.testimonials ?? []}
      />
    </div>
  );
}
