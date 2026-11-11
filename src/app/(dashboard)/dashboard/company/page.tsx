import {
  BarChart2,
  Briefcase,
  Calendar,
  ClipboardList,
  Handshake,
  HeartHandshake,
  Layers,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Company Dashboard | μLearn",
  description:
    "Manage your Company Jobs, Tasks, Collaborations, and Community Engagement",
};

export default function CompanyDashboardPage() {
  const companyFeatures = [
    {
      title: "Manage Jobs & Gigs",
      description:
        "Post job opportunities, gigs, and internships. Review applications and move candidates through your hiring funnel.",
      href: "/dashboard/company/jobs",
      icon: Briefcase,
      action: "View Jobs →",
    },
    {
      title: "Task Management",
      description:
        "Create and monitor tasks submitted by your company. Track admin approval status and community karma engagement.",
      href: "/dashboard/company/tasks",
      icon: ClipboardList,
      action: "View Tasks →",
    },
    {
      title: "Mentor Management",
      description:
        "Nominate and manage company mentors to support your community tasks, challenges, and domain learning tracks.",
      href: "/dashboard/company/mentors",
      icon: Users,
      action: "View Mentors →",
    },
    {
      title: "Analytics & Insights",
      description:
        "Track job view rates, gig funnel stages, candidate conversion indexes, and ecosystem talent distribution.",
      href: "/dashboard/company/analytics",
      icon: BarChart2,
      action: "View Analytics →",
    },
    {
      title: "Co-Admin Management",
      description:
        "Invite colleagues, assign administrative roles, manage permissions, and track active company co-administrators.",
      href: "/dashboard/company/admin",
      icon: ShieldCheck,
      action: "Manage Admins →",
    },
    {
      title: "Impact & Feedback",
      description:
        "Track verified campus placements, total karma awarded, publish public impact reports, and read candidate reviews.",
      href: "/dashboard/company/feedback",
      icon: HeartHandshake,
      action: "View Impact →",
    },
    {
      title: "Collaborations",
      description:
        "Partner with other industry organizations on hackathons, joint hiring drives, and cross-company task sponsorships.",
      href: "/dashboard/company/collaborations",
      icon: Handshake,
      action: "View Collaborations →",
    },
    {
      title: "Interest Group Sponsorships",
      description:
        "Sponsor specialized interest groups to sponsor tasks, host AMAs, and build direct pipelines with top student talent.",
      href: "/dashboard/company/ig-sponsorship",
      icon: Zap,
      action: "View Sponsorships →",
    },
    {
      title: "Templates Management",
      description:
        "Save and reuse standardized blueprints for coding challenges, micro-task assignments, and event schedules.",
      href: "/dashboard/company/event-templates",
      icon: Layers,
      action: "View Templates →",
    },
    {
      title: "Manage Events",
      description:
        "Create and manage company events, track interest, and connect with attendees from the community.",
      href: "/dashboard/manage-events",
      icon: Calendar,
      action: "View Events →",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Company Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your job postings, track applicant progress, partner on
          collaborations, and sponsor community learning tracks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companyFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <Link key={feat.href} href={feat.href} className="block group">
              <Card className="h-full transition-colors hover:bg-muted/50 flex flex-col justify-between">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feat.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {feat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-semibold text-primary flex items-center">
                    {feat.action}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
