"use client";

import { AvailabilityCard } from "./mentor/availability-card";
import { MenteeProgressCard } from "./mentor/mentee-progress-card";
import { MentorHeroCard } from "./mentor/mentor-hero-card";
import { MentorStatCards } from "./mentor/mentor-stat-cards";
import { SessionRequestsCard } from "./mentor/session-requests-card";
import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";

export function MentorHome() {
  return (
    <div className="space-y-5">
      <MentorHeroCard />
      <MentorStatCards />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard />
        <SessionRequestsCard />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <MenteeProgressCard />
        <AvailabilityCard />
      </div>
    </div>
  );
}
