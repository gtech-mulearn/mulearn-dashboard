import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StateDisplay } from "@/components/ui/state-display";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <StateDisplay
        variant="not-found"
        action={
          <Button asChild>
            <Link href="/dashboard">Go Home</Link>
          </Button>
        }
      />
    </div>
  );
}
