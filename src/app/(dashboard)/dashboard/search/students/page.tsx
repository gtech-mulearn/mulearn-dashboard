import { AlertCircle } from "lucide-react";
import { StudentsSearchClient } from "@/features/search";

export default function StudentsSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Discover Students
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Let's Find Students
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Connect with students by name, interest groups, or organization
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl bg-card backdrop-blur-sm p-6 shadow-lg border border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-card-foreground">
              Only public profiles are shown. Users can control their privacy
              settings in their profile.
            </p>
          </div>
        </div>

        <StudentsSearchClient />
      </div>
    </div>
  );
}
