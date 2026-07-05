import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StateDisplay } from "@/components/ui/state-display";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <StateDisplay
        variant="not-found"
        action={
          <Button asChild>
            <Link href="/dashboard">Back to Home</Link>
          </Button>
        }
      />
    </div>
  );
}
