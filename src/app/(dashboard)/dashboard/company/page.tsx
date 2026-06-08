import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ClipboardList } from "lucide-react";
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
      </div>
    </div>
  );
}
