/**
 * Mock Company Profile — Extended Fields
 *
 * 📍 src/features/company-jobs/constants/mock-company-profile.ts
 *
 * Placeholder data for API fields not yet returned by the backend.
 * Remove each field as the backend ships it.
 *
 * Tracked backend issues:
 *   - founded_year, remote_policy, culture_text, tech_stack, perks → #company-profile-extended
 *   - gallery → #company-gallery-model
 *   - testimonials → #company-testimonials-model
 *   - hire_count, alumni_count, avg_karma_of_hires → #company-hire-tracking
 */

export type RemotePolicy = "Remote" | "Hybrid" | "In-office";

export interface MockTestimonial {
  id: string;
  quote: string;
  author_name: string;
  author_level: string;
  author_ig: string;
  author_avatar: string | null;
}

export interface MockPublicJob {
  id: string;
  title: string;
  job_type: "Full-Time" | "Internship" | "Part-Time" | "Contract" | "Freelance";
  location: string;
  salary_range: string;
  tags: string[];
  posted_days_ago: number;
}

export interface MockCompanyExtended {
  founded_year: number | null;
  remote_policy: RemotePolicy;
  culture_text: string;
  tech_stack: string[];
  perks: string[];
  twitter_url: string | null;
  gallery: string[];
  hire_count: number;
  alumni_count: number;
  avg_karma_of_hires: number;
  campus_events_count: number;
  testimonials: MockTestimonial[];
}

export const MOCK_COMPANY_EXTENDED: MockCompanyExtended = {
  founded_year: 2019,
  remote_policy: "Hybrid",
  culture_text:
    "We ship fast and learn faster. Our team obsesses over developer experience — every tool we build, we use ourselves. That means every decision is real and every improvement matters to us directly.",
  tech_stack: [
    "React",
    "Next.js",
    "Python",
    "Django",
    "PostgreSQL",
    "Redis",
    "AWS",
    "Figma",
  ],
  perks: [
    "Flexible Hours",
    "₹30k Learning Budget / year",
    "MacBook Pro",
    "Health Insurance",
    "Remote Friendly",
    "ESOPs",
  ],
  twitter_url: null,
  gallery: [],
  hire_count: 12,
  alumni_count: 18,
  avg_karma_of_hires: 6200,
  campus_events_count: 3,
  testimonials: [
    {
      id: "t1",
      quote:
        "muLearn connected me at exactly the right time. The karma system gave the team confidence in my skills before the first interview.",
      author_name: "Rahul K.",
      author_level: "Level 4",
      author_ig: "Web Development",
      author_avatar: null,
    },
    {
      id: "t2",
      quote:
        "Got my first internship through muLearn Jobs. The karma filtering meant I reached companies that actually wanted my profile.",
      author_name: "Priyanka S.",
      author_level: "Level 3",
      author_ig: "UI/UX Design",
      author_avatar: null,
    },
    {
      id: "t3",
      quote:
        "From learner to full-time in 6 months. My karma score opened doors I didn't know existed.",
      author_name: "Arjun M.",
      author_level: "Level 5",
      author_ig: "Cloud & DevOps",
      author_avatar: null,
    },
  ],
};

// Shown on the public company profile view — the real jobs API requires auth.
// Replace with publicCompanyProfile.active_jobs once the backend includes it.
export const MOCK_PUBLIC_JOBS: MockPublicJob[] = [
  {
    id: "mock-1",
    title: "Frontend Developer Intern",
    job_type: "Internship",
    location: "Bengaluru / Remote",
    salary_range: "₹8,000–12,000/mo",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    posted_days_ago: 3,
  },
  {
    id: "mock-2",
    title: "Full-Stack Engineer",
    job_type: "Full-Time",
    location: "Bengaluru",
    salary_range: "₹8–15 LPA",
    tags: ["Next.js", "Django", "PostgreSQL"],
    posted_days_ago: 7,
  },
  {
    id: "mock-3",
    title: "Product Design Contract",
    job_type: "Contract",
    location: "Remote",
    salary_range: "₹2,000/day",
    tags: ["Figma", "UX Research"],
    posted_days_ago: 1,
  },
];
