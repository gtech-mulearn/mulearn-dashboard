"use client";

import { env } from "config/env";
import { CheckCircle2, Copy, Instagram, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserInfo } from "@/features/auth";
import { connectDiscord } from "@/features/connect";
import { getApiResponseError } from "@/hooks/use-get-error";

export function ConnectDiscordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("code");
  const firstFetch = useRef(true);

  const {
    data: userInfo,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useUserInfo();
  const [discordStatus, setDiscordStatus] = useState<
    "idle" | "connecting" | "connected" | "failed"
  >(token ? "connecting" : "idle");
  const [isCopied, setIsCopied] = useState(false);

  // Exchanging code for token
  useEffect(() => {
    if (token && firstFetch.current) {
      firstFetch.current = false;
      connectDiscord(token)
        .then(() => {
          setDiscordStatus("connected");
          toast.success("Discord account connected successfully!");
          refetchUser();
          setTimeout(() => {
            const a = document.createElement("a");
            a.href = "https://discord.gg/gtech-mulearn-771670169691881483";
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.click();
          }, 3000);
        })
        .catch((error) => {
          setDiscordStatus("failed");
          toast.error(
            getApiResponseError(error, {
              fallback: "Failed to connect Discord account.",
            }),
          );
        });
    }
  }, [token, refetchUser]);

  const handleCopyMuid = () => {
    if (userInfo?.muid) {
      navigator.clipboard.writeText(userInfo.muid);
      setIsCopied(true);
      toast.success("µID copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Loading state for user info
  if (isUserLoading && discordStatus === "idle") {
    return (
      <div className="flex min-h-[60dvh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10 text-brand-blue" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  // Connecting state
  if (discordStatus === "connecting") {
    return (
      <div className="flex min-h-[60dvh] w-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 bg-card text-card-foreground border border-border rounded-3xl shadow-lg">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-xl animate-pulse" />
            <Spinner className="h-16 w-16 text-brand-blue relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Connecting to Discord
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we link your µLearn profile with Discord. This
              will only take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Connected state
  if (discordStatus === "connected") {
    return (
      <div className="flex min-h-[60dvh] w-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 bg-card text-card-foreground border border-border rounded-3xl shadow-lg">
          <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Connection Successful!
            </h2>
            <p className="text-muted-foreground text-sm">
              Your account has been connected. You will be redirected to the
              µLearn Discord server shortly. If not, please click below.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() =>
                window.open(
                  "https://discord.gg/gtech-mulearn-771670169691881483",
                  "_blank",
                )
              }
              className="w-full bg-success text-primary-foreground hover:opacity-90 font-semibold rounded-full py-6"
            >
              Open Discord Server
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/profile")}
              className="w-full font-semibold rounded-full py-6"
            >
              Go to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Connection Failed state
  if (discordStatus === "failed") {
    return (
      <div className="flex min-h-[60dvh] w-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 bg-card text-card-foreground border border-border rounded-3xl shadow-lg">
          <div className="h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
            <XCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Connection Failed
            </h2>
            <p className="text-muted-foreground text-sm">
              We encountered an error while connecting your account to Discord.
              This can happen if the link has expired or there was a network
              glitch.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => setDiscordStatus("idle")}
              className="w-full bg-brand-blue text-primary-foreground hover:opacity-95 font-semibold rounded-full py-6"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/profile")}
              className="w-full font-semibold rounded-full py-6"
            >
              Go back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadyConnected = userInfo?.exist_in_guild === true;

  return (
    <div className="flex flex-col items-center gap-8 w-full px-4 mx-auto py-6 sm:py-10">
      <div className="w-full flex flex-col md:flex-row items-stretch justify-between bg-card text-card-foreground border border-border rounded-[24px] overflow-hidden shadow-sm">
        {/* Left - Connect Action */}
        <div className="flex-1 flex flex-col justify-center items-start p-8 sm:p-12 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {isAlreadyConnected
                ? "Discord Connected"
                : "Join Community using your µID"}
            </h1>
            <p className="max-w-md text-muted-foreground leading-relaxed text-sm sm:text-base">
              {isAlreadyConnected
                ? "Your account is successfully linked with our Discord server. You have access to all channels, tasks, and discussions."
                : "To access our Discord server and submit tasks, you need to connect your µLearn account with Discord."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full pt-2">
            {userInfo?.muid && (
              <Button
                variant="ghost"
                onClick={handleCopyMuid}
                className="flex items-center gap-2"
              >
                {isCopied ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-foreground" />
                )}
                {isCopied ? "Copied!" : userInfo.muid}
              </Button>
            )}

            {isAlreadyConnected ? (
              <Button
                onClick={() =>
                  window.open(
                    "https://discord.gg/gtech-mulearn-771670169691881483",
                    "_blank",
                  )
                }
                className="font-semibold"
              >
                Open Discord Server
              </Button>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = env.NEXT_PUBLIC_DISCORD_AUTH_URL;
                }}
                className="font-semibold flex items-center gap-2"
              >
                {/* Custom Discord Icon SVG */}
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 127.14 96.36"
                  aria-hidden="true"
                >
                  <title>Discord</title>
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c1.87-1.37,3.65-2.83,5.32-4.36a75.14,75.14,0,0,0,67.23,0c1.67,1.53,3.45,3,5.32,4.36a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,123.51,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
                Join Community
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://www.instagram.com/mulearn.official/",
                  "_blank",
                )
              }
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4 text-brand-purple" />
              Follow Us
            </Button>
          </div>
        </div>

        {/* Right - Graphical Info panel */}
        <div className="hidden md:flex flex-col justify-center items-center p-8 bg-muted/30 border-l border-border w-[350px]">
          <div className="w-full max-w-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground">
              Community Guidelines
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-muted-foreground">
                <div className="h-6 w-6 shrink-0 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  Keep your Discord profile linked with your correct µID to
                  automatically receive points.
                </div>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground">
                <div className="h-6 w-6 shrink-0 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  Access dedicated channels for technical assistance,
                  discussions, and local meetups.
                </div>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground">
                <div className="h-6 w-6 shrink-0 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  Participate in weekly sessions, events and complete tasks to
                  claim your Karma points.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Onboarding Flow steps */}
      {!isAlreadyConnected && (
        <div className="w-full space-y-6 pt-4">
          <h2 className="text-2xl font-bold text-foreground">
            Onboarding Flow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-muted-foreground/30 font-extrabold text-3xl">
                  01
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Accept Invite
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click the Join button to launch Discord and accept our server
                  invitation.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-muted-foreground/30 font-extrabold text-3xl">
                  02
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Select Aaronchettan
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Look for our helper bot "Aaronchettan" on the server or in
                  your DMs.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-muted-foreground/30 font-extrabold text-3xl">
                  03
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Link your µID
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Inside the DM chat with Aaronchettan, click the "Connect µID"
                  button.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-muted-foreground/30 font-extrabold text-3xl">
                  04
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Verify & Onboard
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter your copied µID (e.g., username@mulearn) in the prompt
                  to complete connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
