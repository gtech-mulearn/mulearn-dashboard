"use client";

import type { UserProfile } from "@/features/profile/schemas";
import { usePublicCompanyJobs, usePublicCompanyProfile } from "../../hooks";
import type { PublicCompanyProfile } from "../../schemas";
import { CompanyCredibilitySection } from "./company-credibility-section";
import { CompanyCultureSection } from "./company-culture-section";
import { CompanyJobsSection } from "./company-jobs-section";
import { CompanyProfileHeader } from "./company-profile-header";
import { CompanyTestimonialsSection } from "./company-testimonials-section";

interface CompanyPublicViewProps {
  userProfile?: UserProfile;
  slug: string;
}

export function CompanyPublicView({
  userProfile,
  slug,
}: CompanyPublicViewProps) {
  const isMuid = slug.includes("@");
  const {
    data: apiProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = usePublicCompanyProfile(slug);
  const { data: jobsData, isLoading: jobsLoading } = usePublicCompanyJobs(slug);

  if (!isMuid && (profileLoading || jobsLoading)) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  if (!isMuid && profileError) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        Failed to load company profile
      </div>
    );
  }

  const companyProfile: PublicCompanyProfile = apiProfile ?? {
    id: userProfile?.id ?? "",
    name: userProfile?.full_name ?? "",
    slug: userProfile?.muid ?? slug,
    logo: userProfile?.profile_pic ?? null,
    description: null,
    industry_sector: null,
    website_link: null,
    email: userProfile?.email ?? null,
    location: null,
    company_size: null,
    linkedin_url: null,
    founded_year: null,
    created_at: userProfile?.joined,
    tech_stack: [],
    perks: [],
    testimonials: [],
    gallery: [],
    hire_count: 0,
    alumni_count: 0,
    avg_karma_of_hires: 0,
    campus_events_count: 0,
  };

  const publicJobs = jobsData?.data ?? [];

  return (
    <div className="space-y-5">
      <CompanyProfileHeader
        profile={companyProfile}
        activeJobsCount={jobsData?.pagination?.count ?? publicJobs.length}
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
        memberSince={userProfile?.joined ?? apiProfile?.created_at}
      />

      <CompanyTestimonialsSection
        testimonials={apiProfile?.testimonials ?? []}
      />
    </div>
  );
}
