"use client";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useInterestGroupsList, useKarmaFeed } from "../hooks";
import { HeroCard } from "./hero-card";
import { InterestGroupsCard } from "./interest-groups-card";
import { KarmaEarnersCard } from "./karma-earners-card";
import { LearningCirclesCard } from "./learning-circles-card";

export function HomePage() {
  const { data: userInfo } = useUserInfo();
  const { data: interestGroups, isLoading: loadingGroups } =
    useInterestGroupsList();
  const { data: karmaFeed, isLoading: loadingKarma } = useKarmaFeed();
  const displayName = userInfo?.full_name?.split(" ")[0] ?? "Learner";
  const selectedDomain = userInfo?.user_domains?.[0]?.toLowerCase();

  const imageMap: { [key: string]: { src: string; alt: string } } = {
    coder: { src: "/images/dashboard/coder.webp", alt: "Coding illustration" },
    maker: { src: "/images/dashboard/maker.webp", alt: "Maker illustration" },
    creative: {
      src: "/images/dashboard/creative.webp",
      alt: "Creative illustration",
    },
    manager: {
      src: "/images/dashboard/manager.webp",
      alt: "Manager illustration",
    },
  };

  const defaultImage = {
    src: "/images/dashboard/dpm.webp",
    alt: "General illustration",
  };
  const { src, alt } = selectedDomain
    ? imageMap[selectedDomain] || defaultImage
    : defaultImage;

  const currentIgsData: Record<string, string[]> = {
    creative: [
      "46fe1fb7-7b04-4ebe-837d-120bc16d0e0a",
      "2de0ee0c-ddc3-4f02-bf93-b6bd2d0625c3",
    ],
    maker: [
      "d379d82b-e116-4b67-8128-670916e6bb42",
      "2de0ee0c-ddc3-4f02-bf93-b6bd2d0625c3",
    ],
    coder: [
      "9b8aaf7f-16a0-4a66-ae53-79b8c25e5faa",
      "3a74725e-a05a-418b-a275-39d68ad9a416",
      "1be43a3a-bcfb-4ef1-b77a-959b01bcb782",
      "85fdd535-08d2-4619-9da7-944e21365de9",
      "1719d19a-0206-4161-9c6f-0a7dba44d4e5",
    ],
    manager: [
      "5bf2bdfe-5c22-48ab-9572-9e9836c70e79",
      "04d29c15-4de4-4b43-ad63-0f4760c62919",
    ],
  };

  const filteredInterestGroups =
    selectedDomain && currentIgsData[selectedDomain]
      ? (interestGroups ?? []).filter((group) =>
          currentIgsData[selectedDomain].includes(group.id),
        )
      : (interestGroups ?? []);

  return (
    <div className="space-y-8 p-1">
      <HeroCard name={displayName} src={src} alt={alt} />
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <LearningCirclesCard />
          <InterestGroupsCard
            groups={filteredInterestGroups}
            isLoading={loadingGroups}
            category={selectedDomain ?? "member"}
          />
        </div>
        <div className="flex flex-col gap-8">
          <KarmaEarnersCard data={karmaFeed} isLoading={loadingKarma} />
        </div>
      </div>
    </div>
  );
}
