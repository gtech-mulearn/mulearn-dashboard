import { BarChart2, Briefcase, ClipboardList } from "lucide-react";
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
  description: "Manage your Company Jobs and Tasks",
};

export default function CompanyDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Company Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your job postings, track applicant progress, and create tasks
          for the community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/company/jobs" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Manage Jobs</CardTitle>
              <CardDescription>
                Post new job opportunities, review applications, and move
                candidates through your hiring funnel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-primary flex items-center">
                View Jobs →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/company/tasks" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Manage Tasks</CardTitle>
              <CardDescription>
                Create and monitor tasks submitted by your company. Track admin
                approval status and community engagement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-primary flex items-center">
                View Tasks →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/company/mentors" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                  role="img"
                >
                  <title>Mentors Icon</title>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <CardTitle>Manage Mentors</CardTitle>
              <CardDescription>
                Nominate new company mentors to support your community tasks and
                initiatives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-primary flex items-center">
                View Mentors →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/company/analytics" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Analytics & Performance</CardTitle>
              <CardDescription>
                Track job view rates, gig funnel stages, conversion indexes, and
                view ecosystem talent distribution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-primary flex items-center">
                View Analytics →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/manage-events" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                  role="img"
                >
                  <title>Events Icon</title>
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <CardTitle>Manage Events</CardTitle>
              <CardDescription>
                Create and manage company events, track interest, and connect
                with attendees from the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-primary flex items-center">
                View Events →
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
