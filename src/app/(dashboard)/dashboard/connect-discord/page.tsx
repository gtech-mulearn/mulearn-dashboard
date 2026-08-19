import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ConnectDiscordClient } from "./connect-discord-client";

export const metadata: Metadata = {
  title: "Connect Discord | µLearn",
  description: "Connect your µLearn account to Discord to join the community.",
};

export default function ConnectDiscordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] w-full items-center justify-center">
          <Spinner className="h-8 w-8 text-brand-blue" />
        </div>
      }
    >
      <ConnectDiscordClient />
    </Suspense>
  );
}
