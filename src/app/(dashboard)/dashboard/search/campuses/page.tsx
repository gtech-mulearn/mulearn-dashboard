import { CampusesSearchClient } from "@/features/search";

export default function CampusesSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            Explore Campuses
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Let's Find Campuses
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Discover campuses by name, code, zone, or location
          </p>
        </div>

        <CampusesSearchClient />
      </div>
    </div>
  );
}
