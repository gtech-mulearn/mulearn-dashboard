/**
 * Pathway Quiz Component
 *
 * 📍 src/features/onboarding/components/pathway-quiz.tsx
 *
 * PathFinder quiz to recommend learning pathways based on answers.
 * Matches the mobile-first onboarding UI design.
 */

"use client";

import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { ProgressArrow } from "@/components/ui/progress-arrow";
import { Spinner } from "@/components/ui/spinner";
import { pathfinderQuestions, pathwayInfo } from "../data/questions";

type PathwayCategory = "coder" | "maker" | "manager" | "creative";

interface PathwayQuizProps {
  onComplete: (selectedPathways: string[]) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export function PathwayQuiz({
  onComplete,
  isLoading,
  onBack,
}: PathwayQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<PathwayCategory[]>([]);
  const [selectedOption, setSelectedOption] = useState<PathwayCategory | null>(
    null,
  );
  const [showResults, setShowResults] = useState(false);

  // Shuffle questions on mount (stable per session)
  const shuffledQuestions = useMemo(() => {
    return [...pathfinderQuestions].sort(() => Math.random() - 0.5);
  }, []);

  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;

  const handleSelectOption = (category: PathwayCategory) => {
    setSelectedOption(category);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedOption(answers[answers.length - 1] || null);
      setAnswers((prev) => prev.slice(0, -1));
    } else if (onBack) {
      onBack();
    }
  };

  const getRecommendedPathways = (): PathwayCategory[] => {
    const counts: Record<PathwayCategory, number> = {
      coder: 0,
      maker: 0,
      manager: 0,
      creative: 0,
    };

    for (const answer of answers) {
      counts[answer]++;
    }

    // Sort by count and return top 2
    return (Object.entries(counts) as [PathwayCategory, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([category]) => category);
  };

  const handleConfirmPathways = () => {
    const pathways = getRecommendedPathways();
    onComplete(pathways);
  };

  // Results screen
  if (showResults) {
    const recommended = getRecommendedPathways();

    return (
      <div className="flex flex-col items-center text-center py-8 space-y-8">
        {/* Celebration icon */}
        <div className="text-6xl">🎉</div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to the
            <br />
            community!
          </h1>
          <p className="text-muted-foreground">
            You're officially one of us. Let's build something amazing together.
          </p>
        </div>

        {/* Recommended pathways */}
        <div className="w-full space-y-3">
          <p className="text-sm text-muted-foreground">
            Your recommended paths:
          </p>
          {recommended.map((pathway) => (
            <div
              key={pathway}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <h3 className="font-semibold capitalize text-card-foreground">
                {pathwayInfo[pathway].title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {pathwayInfo[pathway].includes.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="w-full pt-4">
          <Button
            variant="default"
            className="w-full"
            onClick={handleConfirmPathways}
            disabled={isLoading}
          >
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            Begin your journey
          </Button>
        </div>
      </div>
    );
  }

  const question = shuffledQuestions[currentQuestion];

  // Question icons mapping
  const optionIcons: Record<PathwayCategory, string> = {
    coder: "💻",
    maker: "🛠️",
    manager: "📊",
    creative: "🎨",
  };

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
          {question.question}
        </h1>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {question.options.map((option) => (
          <OptionCard
            key={option.text}
            icon={optionIcons[option.category]}
            label={option.text}
            selected={selectedOption === option.category}
            onClick={() => handleSelectOption(option.category)}
          />
        ))}
      </div>

      {/* Progress Arrow */}
      <div className="flex justify-center py-8">
        <ProgressArrow
          progress={progress}
          onClick={handleNext}
          disabled={!selectedOption}
        />
      </div>
    </div>
  );
}
