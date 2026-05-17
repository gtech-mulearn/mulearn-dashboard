/**
 * Interest Selector Component
 *
 * 📍 src/features/onboarding/components/interest-selector.tsx
 *
 * Direct selection of interests and endgoals (alternative to quiz).
 * Matches the mobile-first onboarding UI design.
 */

"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { OptionCard } from "@/components/ui/option-card";
import { ProgressArrow } from "@/components/ui/progress-arrow";
import { Spinner } from "@/components/ui/spinner";
import { endgoalOptions, pathwayInfo } from "../data/questions";

type PathwayCategory = "coder" | "maker" | "manager" | "creative";

interface InterestSelectorProps {
  onComplete: (pathways: string[], endgoals: string[]) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export function InterestSelector({
  onComplete,
  isLoading,
  onBack,
}: InterestSelectorProps) {
  const [step, setStep] = useState<"pathways" | "endgoals">("pathways");
  const [selectedPathways, setSelectedPathways] = useState<PathwayCategory[]>(
    [],
  );
  const [selectedEndgoals, setSelectedEndgoals] = useState<string[]>([]);

  const togglePathway = (pathway: PathwayCategory) => {
    setSelectedPathways((prev) =>
      prev.includes(pathway)
        ? prev.filter((p) => p !== pathway)
        : [...prev, pathway],
    );
  };

  const toggleEndgoal = (endgoal: string) => {
    setSelectedEndgoals((prev) =>
      prev.includes(endgoal)
        ? prev.filter((e) => e !== endgoal)
        : [...prev, endgoal],
    );
  };

  const handleBack = () => {
    if (step === "endgoals") {
      setStep("pathways");
    } else if (onBack) {
      onBack();
    }
  };

  const handleNext = () => {
    if (step === "pathways" && selectedPathways.length > 0) {
      setStep("endgoals");
    } else if (step === "endgoals" && selectedEndgoals.length > 0) {
      onComplete(selectedPathways, selectedEndgoals);
    }
  };

  const canProceed = () => {
    if (step === "pathways") return selectedPathways.length > 0;
    return selectedEndgoals.length > 0;
  };

  const progress = step === "pathways" ? 50 : 90;

  // Pathway icons
  const pathwayIcons: Record<PathwayCategory, string> = {
    coder: "💻",
    maker: "🛠️",
    manager: "📊",
    creative: "🎨",
  };

  // Endgoal icons
  const endgoalIcons: Record<string, string> = {
    expertise: "🎓",
    impact: "✨",
    entrepreneurship: "💼",
    exploration: "🔍",
  };

  if (step === "endgoals") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-120px)]">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="self-start p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mt-4 mb-8">
          <p className="text-sm text-slate-600 mb-2">
            Lets bring out the true YOU
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            What's your long-
            <br />
            term tech goal?
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {endgoalOptions.map((goal) => (
            <OptionCard
              key={goal.value}
              icon={endgoalIcons[goal.value] || "🎯"}
              label={goal.title}
              selected={selectedEndgoals.includes(goal.value)}
              onClick={() => toggleEndgoal(goal.value)}
            />
          ))}
        </div>

        {/* Progress Arrow */}
        <div className="flex justify-center py-8">
          {isLoading ? (
            <div className="w-14 h-14 flex items-center justify-center">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : (
            <ProgressArrow
              progress={progress}
              onClick={handleNext}
              disabled={!canProceed()}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="self-start p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
        type="button"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mt-4 mb-8">
        <p className="text-sm text-slate-600 mb-2">
          Lets bring out the true YOU
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          Which one feels
          <br />
          like you?
        </h1>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {(Object.keys(pathwayInfo) as PathwayCategory[]).map((pathway) => (
          <OptionCard
            key={pathway}
            icon={pathwayIcons[pathway]}
            label={pathwayInfo[pathway].title}
            selected={selectedPathways.includes(pathway)}
            onClick={() => togglePathway(pathway)}
          />
        ))}
      </div>

      {/* Progress Arrow */}
      <div className="flex justify-center py-8">
        <ProgressArrow
          progress={progress}
          onClick={handleNext}
          disabled={!canProceed()}
        />
      </div>
    </div>
  );
}
