/**
 * Interests Client Component
 *
 * 📍 src/app/(onboarding)/onboarding/interests/interests-client.tsx
 *
 * Matches the mobile-first onboarding UI design.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OptionCard } from "@/components/ui/option-card";
import { useUserInfo } from "@/features/auth";
import { authKeys } from "@/features/auth/hooks/query-keys";
import {
  InterestSelector,
  PathwayQuiz,
  useSelectDomains,
  useSelectEndgoals,
} from "@/features/onboarding";
import { getRoleHomePath } from "@/lib/auth";

interface InterestsClientProps {
  redirectUri?: string;
  mode?: "quiz" | "direct";
}

export function InterestsClient({ redirectUri, mode }: InterestsClientProps) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<"quiz" | "direct" | null>(
    mode || null,
  );

  const { data: user, isLoading: isLoadingUser } = useUserInfo();
  const selectDomains = useSelectDomains();
  const selectEndgoals = useSelectEndgoals();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user already has domains selected (suppressed while submitting,
  // so the completion handler owns navigation and honors redirectUri).
  useEffect(() => {
    if (isSubmitting) return;
    if (!isLoadingUser && user?.user_domains && user.user_domains.length > 0) {
      router.replace(getRoleHomePath(user.roles));
    }
  }, [user, isLoadingUser, router, isSubmitting]);

  const getRedirectPath = () => {
    if (redirectUri && redirectUri !== "noredirect") {
      return `/${redirectUri}`;
    }
    // Route to the role-specific home dashboard after onboarding completes.
    // Falls back to "/dashboard" for standard member roles.
    return getRoleHomePath(user?.roles ?? []);
  };

  const handleQuizComplete = async (pathways: string[]) => {
    try {
      setIsSubmitting(true);
      await selectDomains.mutateAsync(pathways);
      await queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
      toast.success("Pathways saved! Welcome to μLearn!");
      router.replace(getRedirectPath());
    } catch {
      // Handled by useSelectDomains's onError toast.
      setIsSubmitting(false);
    }
  };

  const handleDirectComplete = async (
    pathways: string[],
    endgoals: string[],
  ) => {
    try {
      setIsSubmitting(true);
      await selectDomains.mutateAsync(pathways);
      await selectEndgoals.mutateAsync(endgoals);
      await queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
      toast.success("Interests saved! Welcome to μLearn!");
      router.replace(getRedirectPath());
    } catch {
      // Handled by useSelectDomains/useSelectEndgoals's onError toasts.
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
    } else {
      router.back();
    }
  };

  if (selectedMode === "quiz") {
    return (
      <PathwayQuiz
        onComplete={handleQuizComplete}
        isLoading={selectDomains.isPending}
        onBack={() => setSelectedMode(null)}
      />
    );
  }

  if (selectedMode === "direct") {
    return (
      <InterestSelector
        onComplete={handleDirectComplete}
        isLoading={selectDomains.isPending || selectEndgoals.isPending}
        onBack={() => setSelectedMode(null)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="self-start p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        type="button"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mt-4 mb-8">
        <p className="text-sm text-muted-foreground mb-2">
          Lets bring out the true YOU
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          How would you like
          <br />
          to discover your path?
        </h1>
      </div>

      {/* Options */}
      <div className="space-y-4 flex-1">
        <OptionCard
          icon="✨"
          label="Take the PathFinder Quiz"
          selected={false}
          onClick={() => setSelectedMode("quiz")}
        />
        <OptionCard
          icon="📋"
          label="I know what I want"
          selected={false}
          onClick={() => setSelectedMode("direct")}
        />
      </div>
    </div>
  );
}
